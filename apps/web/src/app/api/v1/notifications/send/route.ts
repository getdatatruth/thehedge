import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { sendEmail, emailConfigured } from '@/lib/email';
import { rankForChild, ageInYears, type ActivityForWeight } from '@/lib/personalisation';
import { getWeather, getSeason } from '@/lib/weather';

export async function OPTIONS() {
  return apiOptions();
}

type NotificationType =
  | 'morning_plan'
  | 'streak_risk'
  | 'weekly_plan'
  | 'day_review'
  | 'tomorrow_preview'
  | 'week_review'
  | 'month_review'
  | 'activity_reminder'
  | 'achievement';

// Map notification types to the preference keys users can toggle
const TYPE_TO_PREF: Record<NotificationType, string> = {
  morning_plan: 'morning_plan',
  streak_risk: 'streak_risk',
  weekly_plan: 'weekly_plan',
  day_review: 'day_review',
  tomorrow_preview: 'tomorrow_preview',
  week_review: 'week_review',
  month_review: 'month_review',
  activity_reminder: 'activity_reminder',
  achievement: 'achievement',
};

interface PushMessage {
  to: string;
  title: string;
  body: string;
  sound: string;
  data?: Record<string, unknown>;
}

/**
 * Send a batch of push notifications via the Expo Push API.
 * Batches into groups of 100 (Expo's limit per request).
 */
async function sendPushNotifications(messages: PushMessage[]): Promise<void> {
  const BATCH_SIZE = 100;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batch),
      });
    } catch {
      // Log but don't fail the entire batch
      console.error(`Failed to send push notification batch starting at index ${i}`);
    }
  }
}

interface FamilyWithTokens {
  familyId: string;
  familyName: string;
  childrenNames: string[];
  tokens: string[];
  notificationPrefs: Record<string, boolean> | null;
}

/**
 * POST /api/v1/notifications/send
 *
 * Called by a cron job or manually to generate and send push notifications.
 * Secured with a service key in the Authorization header.
 *
 * Body: { type: NotificationType }
 */
export async function POST(request: NextRequest) {
  // Verify service key authorization
  const authHeader = request.headers.get('authorization');
  const serviceKey = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || !serviceKey) {
    return apiError('Unauthorized', 401);
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== serviceKey) {
    return apiError('Invalid service key', 401);
  }

  const body = await request.json();
  const { type } = body as { type: NotificationType };

  const validTypes: NotificationType[] = [
    'morning_plan',
    'streak_risk',
    'weekly_plan',
    'day_review',
    'tomorrow_preview',
    'week_review',
    'month_review',
    'activity_reminder',
    'achievement',
  ];

  if (!type || !validTypes.includes(type)) {
    return apiError(
      `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      422
    );
  }

  const supabase = createAdminClient();

  // Get all active push tokens with user and family data
  const { data: tokenRows, error: tokenError } = await supabase
    .from('push_tokens')
    .select('token, user_id, family_id')
    .eq('active', true);

  if (tokenError || !tokenRows?.length) {
    return apiSuccess({ sent: 0, reason: 'No active push tokens found' });
  }

  // Get unique family IDs
  const familyIds = [...new Set(tokenRows.map((t) => t.family_id).filter(Boolean))];

  if (!familyIds.length) {
    return apiSuccess({ sent: 0, reason: 'No families with tokens' });
  }

  // Fetch family data
  const { data: familiesData } = await supabase
    .from('families')
    .select('id, name')
    .in('id', familyIds);

  // Fetch children data
  const { data: childrenData } = await supabase
    .from('children')
    .select('family_id, name')
    .in('family_id', familyIds);

  // Fetch user notification preferences
  const userIds = [...new Set(tokenRows.map((t) => t.user_id))];
  const { data: usersData } = await supabase
    .from('users')
    .select('id, name, family_id, notification_prefs')
    .in('id', userIds);

  // Build a map of family data
  const familyMap = new Map<string, { name: string; children: string[] }>();
  for (const f of familiesData || []) {
    familyMap.set(f.id, {
      name: f.name,
      children: (childrenData || [])
        .filter((c) => c.family_id === f.id)
        .map((c) => c.name),
    });
  }

  // Build user preferences map
  const userPrefsMap = new Map<string, { name: string; prefs: Record<string, boolean> | null }>();
  for (const u of usersData || []) {
    userPrefsMap.set(u.id, {
      name: u.name,
      prefs: u.notification_prefs as Record<string, boolean> | null,
    });
  }

  // Fetch additional data needed for personalized notifications
  let familyStats: Map<string, Record<string, unknown>> = new Map();

  if (['day_review', 'week_review', 'month_review'].includes(type)) {
    // Get activity log counts for relevant families
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const familyId of familyIds) {
      const stats: Record<string, unknown> = {};

      // Today's logs
      const { count: todayCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('date', today);

      stats.todayCount = todayCount || 0;

      // Week's logs
      const { count: weekCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .gte('date', weekAgo);

      stats.weekCount = weekCount || 0;

      // Get categories covered this week
      const { data: weekLogs } = await supabase
        .from('activity_logs')
        .select('activity_id')
        .eq('family_id', familyId)
        .gte('date', weekAgo);

      if (weekLogs?.length) {
        const activityIds = weekLogs.map((l) => l.activity_id).filter(Boolean);
        if (activityIds.length) {
          const { data: acts } = await supabase
            .from('activities')
            .select('category')
            .in('id', activityIds);
          stats.categories = [...new Set((acts || []).map((a) => a.category))];
        }
      }
      stats.categories = stats.categories || [];

      // Get total hours this week
      const { data: weekDurations } = await supabase
        .from('activity_logs')
        .select('duration_minutes')
        .eq('family_id', familyId)
        .gte('date', weekAgo);

      const totalMinutes = (weekDurations || []).reduce(
        (sum, l) => sum + (l.duration_minutes || 30),
        0
      );
      stats.weekHours = Math.round(totalMinutes / 60);

      familyStats.set(familyId, stats);
    }
  }

  // Get tomorrow's plan data for tomorrow_preview
  let tomorrowPlans: Map<string, string[]> = new Map();
  if (type === 'tomorrow_preview') {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: plans } = await supabase
      .from('daily_plans')
      .select('child_id, blocks')
      .eq('date', tomorrow);

    if (plans?.length) {
      // Get child to family mapping
      const childIds = plans.map((p) => p.child_id);
      const { data: childFamilies } = await supabase
        .from('children')
        .select('id, family_id')
        .in('id', childIds);

      const childToFamily = new Map((childFamilies || []).map((c) => [c.id, c.family_id]));

      for (const plan of plans) {
        const fId = childToFamily.get(plan.child_id);
        if (!fId) continue;
        const blocks = plan.blocks as { title: string }[];
        const titles = blocks.map((b) => b.title).filter(Boolean);
        const existing = tomorrowPlans.get(fId) || [];
        tomorrowPlans.set(fId, [...existing, ...titles]);
      }
    }
  }

  // Get today's plan activity count for morning_plan
  let morningPlanData: Map<string, number> = new Map();
  if (type === 'morning_plan') {
    const today = new Date().toISOString().split('T')[0];
    const { data: plans } = await supabase
      .from('daily_plans')
      .select('child_id, blocks')
      .eq('date', today);

    if (plans?.length) {
      const childIds = plans.map((p) => p.child_id);
      const { data: childFamilies } = await supabase
        .from('children')
        .select('id, family_id')
        .in('id', childIds);

      const childToFamily = new Map((childFamilies || []).map((c) => [c.id, c.family_id]));

      for (const plan of plans) {
        const fId = childToFamily.get(plan.child_id);
        if (!fId) continue;
        const blocks = plan.blocks as unknown[];
        const count = morningPlanData.get(fId) || 0;
        morningPlanData.set(fId, count + blocks.length);
      }
    }
  }

  // Build notification messages
  const messages: PushMessage[] = [];
  let skippedByPrefs = 0;

  for (const tokenRow of tokenRows) {
    const userData = userPrefsMap.get(tokenRow.user_id);
    const userName = userData?.name || 'there';
    const familyId = tokenRow.family_id;
    const familyInfo = familyId ? familyMap.get(familyId) : null;
    const childrenNames = familyInfo?.children || [];

    // Check if user has opted out of this notification type
    const prefKey = TYPE_TO_PREF[type];
    if (userData?.prefs && prefKey in userData.prefs && !userData.prefs[prefKey]) {
      skippedByPrefs++;
      continue;
    }

    const { title, body } = generateContent(type, {
      userName,
      childrenNames,
      stats: familyId ? familyStats.get(familyId) : undefined,
      tomorrowActivities: familyId ? tomorrowPlans.get(familyId) : undefined,
      todayPlanCount: familyId ? morningPlanData.get(familyId) : undefined,
    });

    messages.push({
      to: tokenRow.token,
      title,
      body,
      sound: 'default',
      data: { type },
    });
  }

  // Send all notifications
  if (messages.length > 0) {
    await sendPushNotifications(messages);
  }

  // Also store notifications in the database for in-app viewing
  const notificationRows = [];
  for (const tokenRow of tokenRows) {
    if (!tokenRow.family_id) continue;
    const userData = userPrefsMap.get(tokenRow.user_id);
    const prefKey = TYPE_TO_PREF[type];
    if (userData?.prefs && prefKey in userData.prefs && !userData.prefs[prefKey]) continue;

    const familyInfo = familyMap.get(tokenRow.family_id);
    const { title, body } = generateContent(type, {
      userName: userData?.name || 'there',
      childrenNames: familyInfo?.children || [],
      stats: familyStats.get(tokenRow.family_id),
      tomorrowActivities: tomorrowPlans.get(tokenRow.family_id),
      todayPlanCount: morningPlanData.get(tokenRow.family_id),
    });

    notificationRows.push({
      family_id: tokenRow.family_id,
      type,
      title,
      body,
      read: false,
    });
  }

  // Deduplicate by family_id (one notification per family, not per token)
  const seenFamilies = new Set<string>();
  const uniqueNotifications = notificationRows.filter((n) => {
    if (seenFamilies.has(n.family_id)) return false;
    seenFamilies.add(n.family_id);
    return true;
  });

  if (uniqueNotifications.length > 0) {
    await supabase.from('notifications').insert(uniqueNotifications);
  }

  // The morning run also drives the warm "today's idea" email - the single
  // biggest re-engagement lever. It is fully independent of push: it reads
  // across ALL families (not just those with a push token), honours the email
  // opt-out, and no-ops safely if RESEND_API_KEY is unset.
  let emailSummary: Awaited<ReturnType<typeof sendMorningDigestEmails>> | null = null;
  if (type === 'morning_plan') {
    emailSummary = await sendMorningDigestEmails(supabase);
  }

  return apiSuccess({
    sent: messages.length,
    skipped_by_prefs: skippedByPrefs,
    stored: uniqueNotifications.length,
    email: emailSummary,
  });
}

// ─── Morning "today's idea" email digest ────────────────────────────────────

const APP_DASHBOARD_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/dashboard`
    : 'https://app.thehedge.ie/dashboard';

interface DigestFamily {
  familyId: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
}

interface DigestChild {
  name: string;
  dob: string | null;
  interests: string[];
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/**
 * Compose and send the once-daily morning email for every eligible family.
 *
 * Eligibility: a verified family email + the `morning_idea` notification
 * preference left ON (default ON). Opt-out is honoured strictly - a family that
 * has set `morning_idea: false` is never emailed.
 *
 * Personalisation reuses the same engine the dashboard uses (rankForChild /
 * ageInYears) so the suggested activity is an age + interest fit for the first
 * child, with a light weather-aware framing.
 *
 * Fail-soft: if RESEND_API_KEY is unset, sendEmail no-ops and we report it.
 * Never throws into the cron path.
 */
async function sendMorningDigestEmails(supabase: SupabaseAdmin) {
  const configured = emailConfigured();

  // Pull owner users with an email + their notification prefs. We email the
  // family OWNER (one email per family) to avoid duplicate sends.
  const { data: userRows } = await supabase
    .from('users')
    .select('email, family_id, notification_prefs, role')
    .not('family_id', 'is', null);

  if (!userRows?.length) {
    return { configured, eligible: 0, sent: 0, skipped_opt_out: 0, reason: 'no_users' };
  }

  // One recipient per family: prefer the owner, fall back to the first member.
  const byFamily = new Map<string, (typeof userRows)[number]>();
  for (const u of userRows) {
    if (!u.family_id || !u.email) continue;
    const existing = byFamily.get(u.family_id);
    if (!existing || (u.role === 'owner' && existing.role !== 'owner')) {
      byFamily.set(u.family_id, u);
    }
  }

  let skippedOptOut = 0;
  const recipients: { familyId: string; email: string }[] = [];
  for (const [familyId, u] of byFamily) {
    const prefs = u.notification_prefs as Record<string, boolean> | null;
    // Default ON: only skip when the family has explicitly opted out.
    if (prefs && prefs.morning_idea === false) {
      skippedOptOut++;
      continue;
    }
    recipients.push({ familyId, email: u.email });
  }

  if (recipients.length === 0) {
    return { configured, eligible: 0, sent: 0, skipped_opt_out: skippedOptOut, reason: 'none_eligible' };
  }

  const familyIds = recipients.map((r) => r.familyId);

  // Family location for weather framing.
  const { data: famData } = await supabase
    .from('families')
    .select('id, latitude, longitude')
    .in('id', familyIds);
  const famMap = new Map<string, DigestFamily>();
  for (const f of famData || []) {
    famMap.set(f.id, {
      familyId: f.id,
      email: '',
      latitude: f.latitude,
      longitude: f.longitude,
    });
  }

  // Children for each family (for the personalised pick + greeting).
  const { data: childData } = await supabase
    .from('children')
    .select('family_id, name, date_of_birth, interests')
    .in('family_id', familyIds);
  const childrenByFamily = new Map<string, DigestChild[]>();
  for (const c of childData || []) {
    const list = childrenByFamily.get(c.family_id) || [];
    list.push({
      name: c.name,
      dob: c.date_of_birth as string | null,
      interests: (c.interests as string[]) || [],
    });
    childrenByFamily.set(c.family_id, list);
  }

  // Candidate activity pool: published only. A modest pool is plenty to rank
  // a single warm suggestion per family.
  const { data: activityData } = await supabase
    .from('activities')
    .select('title, slug, description, category, age_min, age_max, location, season, energy_level')
    .eq('published', true)
    .limit(600);

  const activities = (activityData || []) as {
    title: string;
    slug: string;
    description: string;
    category: string;
    age_min: number;
    age_max: number;
    location: string;
    season: string[] | null;
    energy_level: string;
  }[];

  if (activities.length === 0) {
    return { configured, eligible: recipients.length, sent: 0, skipped_opt_out: skippedOptOut, reason: 'no_activities' };
  }

  const season = getSeason();

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const fam = famMap.get(recipient.familyId);
    const children = childrenByFamily.get(recipient.familyId) || [];
    const firstChild = children[0];

    // Weather is best-effort and per-family (cached upstream); a null result
    // simply drops the weather framing.
    const weather = await getWeather(fam?.latitude ?? null, fam?.longitude ?? null);

    const age = firstChild ? ageInYears(firstChild.dob, new Date()) : null;
    const ctx = {
      age,
      childInterests: firstChild?.interests ?? [],
      warmth: {},
      isRaining: weather?.isRaining ?? false,
      season,
    };

    const pool: (ActivityForWeight & (typeof activities)[number])[] = activities.map((a) => ({
      ...a,
      ageMin: a.age_min,
      ageMax: a.age_max,
      energyLevel: a.energy_level,
      season: a.season,
      location: a.location,
      category: a.category,
    }));

    const ranked = rankForChild(pool, ctx);
    const pick = ranked[0];
    if (!pick) {
      continue;
    }

    const childName = firstChild?.name?.trim() || null;
    const { subject, html, text } = buildMorningEmail({
      childName,
      activity: { title: pick.title, description: pick.description, category: pick.category },
      weather: weather
        ? { label: weather.weatherLabel, temperature: weather.temperature, isRaining: weather.isRaining }
        : null,
    });

    const result = await sendEmail({ to: recipient.email, subject, html, text });
    if (result.ok) sent++;
    else if (result.skipped !== 'no_api_key') failed++;
  }

  return {
    configured,
    eligible: recipients.length,
    sent,
    failed,
    skipped_opt_out: skippedOptOut,
  };
}

// Title-case a category enum value for display (e.g. 'life_skills' -> 'Life skills').
function categoryLabel(category: string): string {
  const cleaned = category.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface MorningEmailInput {
  childName: string | null;
  activity: { title: string; description: string; category: string };
  weather: { label: string; temperature: number; isRaining: boolean } | null;
}

/**
 * Build the calm, on-brand morning email. Southern-Irish register, no em
 * dashes, no points or streaks, mobile-friendly, green accent. Returns the
 * subject and both HTML and plain-text bodies.
 */
function buildMorningEmail(input: MorningEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { childName, activity, weather } = input;
  const forWhom = childName ? `for ${childName}` : 'for today';
  const subject = `Good morning - today's idea ${forWhom}`;

  // Gentle weather framing, only when it reads naturally.
  let weatherLine = '';
  if (weather) {
    if (weather.isRaining) {
      weatherLine = `It looks a bit wet out there this morning, so here is something lovely to do indoors.`;
    } else {
      weatherLine = `${weather.label} and around ${weather.temperature}° this morning. A nice day for it.`;
    }
  }

  const greeting = childName
    ? `Good morning. Here is a gentle idea you and ${childName} might enjoy today.`
    : `Good morning. Here is a gentle idea you might enjoy with the children today.`;

  const cat = categoryLabel(activity.category);

  // Plain text version (kept in step with the HTML).
  const text = [
    greeting,
    weatherLine,
    '',
    `Today's idea: ${activity.title}`,
    activity.description,
    `(${cat})`,
    '',
    `Open your dashboard: ${APP_DASHBOARD_URL}`,
    '',
    'No rush at all. If today is not the day, it will keep.',
    '',
    'The Hedge',
  ]
    .filter((l) => l !== null)
    .join('\n');

  const accent = '#55753F';
  const ink = '#1F2A22';
  const muted = '#5B6B5F';
  const bg = '#F2F5F0';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">A gentle idea to try with the children today.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:6px;background:${accent};line-height:6px;font-size:6px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <p style="margin:0 0 4px 0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:${accent};font-weight:600;">The Hedge</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:${ink};font-weight:700;">${escapeHtml(greeting)}</h1>
              ${weatherLine ? `<p style="margin:12px 0 0 0;font-size:15px;line-height:1.5;color:${muted};">${escapeHtml(weatherLine)}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:14px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${accent};font-weight:600;">${escapeHtml(cat)}</p>
                    <p style="margin:0 0 8px 0;font-size:18px;line-height:1.35;color:${ink};font-weight:700;">${escapeHtml(activity.title)}</p>
                    <p style="margin:0;font-size:15px;line-height:1.55;color:${muted};">${escapeHtml(activity.description)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 28px 8px 28px;">
              <a href="${APP_DASHBOARD_URL}" style="display:inline-block;background:${accent};color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:600;padding:14px 28px;border-radius:14px;">Open today in The Hedge</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px 28px;">
              <p style="margin:0;font-size:14px;line-height:1.55;color:${muted};">No rush at all. If today is not the day, it will keep.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 26px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9AA89E;">You are getting this because morning ideas are on. You can turn them off any time in your notification settings.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

// --- Content generation ---

interface ContentContext {
  userName: string;
  childrenNames: string[];
  stats?: Record<string, unknown>;
  tomorrowActivities?: string[];
  todayPlanCount?: number;
}

function generateContent(
  type: NotificationType,
  ctx: ContentContext
): { title: string; body: string } {
  const { userName, childrenNames, stats, tomorrowActivities, todayPlanCount } = ctx;
  const childList = childrenNames.length
    ? childrenNames.join(' & ')
    : 'your children';

  switch (type) {
    case 'morning_plan': {
      const count = todayPlanCount || 0;
      if (count > 0) {
        return {
          title: `Good morning, ${userName}!`,
          body: `You have ${count} ${count === 1 ? 'activity' : 'activities'} planned today for ${childList}. Let's make it a great day.`,
        };
      }
      return {
        title: `Good morning, ${userName}!`,
        body: `No activities planned yet for today. Browse our collection for inspiration for ${childList}.`,
      };
    }

    case 'streak_risk': {
      // No streaks, no guilt. A warm, optional evening nudge with nothing to lose.
      return {
        title: `A gentle nudge for your evening`,
        body: `If you had a learning moment with ${childList} today, you might like to jot it down. No pressure at all.`,
      };
    }

    case 'weekly_plan': {
      return {
        title: `Your weekly plan is ready`,
        body: `Happy Monday, ${userName}! Your plan for the week is ready to review. Tap to see what's in store for ${childList}.`,
      };
    }

    case 'day_review': {
      const todayCount = (stats?.todayCount as number) || 0;
      const categories = (stats?.categories as string[]) || [];
      if (todayCount > 0) {
        const catStr = categories.length
          ? ` covering ${categories.slice(0, 3).join(', ')}`
          : '';
        return {
          title: `Great day!`,
          body: `You logged ${todayCount} ${todayCount === 1 ? 'activity' : 'activities'} today${catStr}. Well done, ${userName}!`,
        };
      }
      return {
        title: `How was your day?`,
        body: `Don't forget to log any activities from today. Even a quick note counts!`,
      };
    }

    case 'tomorrow_preview': {
      const activities = tomorrowActivities || [];
      if (activities.length > 0) {
        const preview = activities.slice(0, 3).join(', ');
        const extra = activities.length > 3 ? ` and ${activities.length - 3} more` : '';
        return {
          title: `Tomorrow's plan`,
          body: `Coming up for ${childList}: ${preview}${extra}.`,
        };
      }
      return {
        title: `Plan tomorrow`,
        body: `No activities planned for tomorrow yet. Set up a plan for ${childList} before bed.`,
      };
    }

    case 'week_review': {
      const weekCount = (stats?.weekCount as number) || 0;
      const hours = (stats?.weekHours as number) || 0;
      return {
        title: `Your week in review`,
        body: `This week you shared ${weekCount} ${weekCount === 1 ? 'activity' : 'activities'} and around ${hours} ${hours === 1 ? 'hour' : 'hours'} of learning with ${childList}. Lovely work, ${userName}.`,
      };
    }

    case 'month_review': {
      return {
        title: `Your monthly review is ready`,
        body: `See ${childList}'s progress and highlights from this month. Tap to view your family's learning journey.`,
      };
    }

    case 'activity_reminder': {
      return {
        title: `Time for an activity!`,
        body: `The afternoon is a great time to try something with ${childList}. Check your plan or browse for ideas.`,
      };
    }

    case 'achievement': {
      return {
        title: `Achievement unlocked!`,
        body: `${userName}, you've earned a new milestone. Tap to see what you've accomplished!`,
      };
    }

    default:
      return {
        title: 'The Hedge',
        body: 'You have a new update waiting for you.',
      };
  }
}
