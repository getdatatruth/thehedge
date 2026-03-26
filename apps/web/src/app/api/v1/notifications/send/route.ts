import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

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

  if (['streak_risk', 'day_review', 'week_review', 'month_review'].includes(type)) {
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

      // Calculate streak (count consecutive days with activity logs going back from today)
      const { data: recentLogs } = await supabase
        .from('activity_logs')
        .select('date')
        .eq('family_id', familyId)
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(60);

      let streak = 0;
      if (recentLogs?.length) {
        const uniqueDates = [...new Set(recentLogs.map((l) => l.date))].sort().reverse();
        const todayDate = new Date(today);
        for (let i = 0; i < uniqueDates.length; i++) {
          const expectedDate = new Date(todayDate);
          expectedDate.setDate(todayDate.getDate() - i);
          const expected = expectedDate.toISOString().split('T')[0];
          if (uniqueDates[i] === expected) {
            streak++;
          } else {
            break;
          }
        }
      }
      stats.streak = streak;

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

  return apiSuccess({
    sent: messages.length,
    skipped_by_prefs: skippedByPrefs,
    stored: uniqueNotifications.length,
  });
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
      const streak = (stats?.streak as number) || 0;
      if (streak > 0) {
        return {
          title: `Keep your streak alive!`,
          body: `You're on a ${streak}-day streak! Log an activity before bed to keep it going.`,
        };
      }
      return {
        title: `Start a new streak!`,
        body: `Log an activity today to start building your learning streak.`,
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
      const streak = (stats?.streak as number) || 0;
      const hours = (stats?.weekHours as number) || 0;
      return {
        title: `Your week in review`,
        body: `This week: ${weekCount} ${weekCount === 1 ? 'activity' : 'activities'}, ${hours} ${hours === 1 ? 'hour' : 'hours'}, ${streak}-day streak! Great work, ${userName}.`,
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
