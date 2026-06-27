import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slotNow, prefAllows, TOUCH_META, type DueTouch, type NotificationPrefs } from '@/lib/notification-schedule';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Runs hourly. For each family with push tokens we work out their LOCAL time and
// send at most one calm touch (morning brief / evening recap / weekend review),
// respecting per-parent opt-ins and never inside quiet hours. Dedupes against an
// already-sent touch of the same type in the last 18 hours.

function authed(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get('authorization');
  return !!secret && auth === `Bearer ${secret}`;
}

function childList(names: string[]): string {
  const n = names.filter(Boolean);
  if (n.length === 0) return 'your family';
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

function content(touch: DueTouch, kids: string) {
  switch (touch) {
    case 'morning_brief':
      return { title: 'Good morning', body: `Here is the day ahead with ${kids}.` };
    case 'evening_recap':
      return { title: 'This evening', body: `A look back at ${kids}'s day, and a gentle peek at tomorrow.` };
    case 'weekend_review':
      return { title: 'Your week with The Hedge', body: `How the week went for ${kids}, and the week ahead.` };
  }
}

async function sendExpo(messages: { to: string; title: string; body: string; sound: string; data: Record<string, unknown> }[]) {
  for (let i = 0; i < messages.length; i += 100) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    } catch (e) {
      console.error('expo push batch failed', e);
    }
  }
}

export async function GET(request: NextRequest) {
  if (!authed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const now = new Date();
  const admin = createAdminClient();

  // Active tokens, with the user's prefs and the family's timezone + children.
  const { data: tokens } = await admin
    .from('push_tokens')
    .select('token, user_id, family_id, users(notification_prefs), families(name, timezone, children(name))')
    .eq('active', true);

  type Row = {
    token: string; user_id: string; family_id: string;
    users: { notification_prefs: NotificationPrefs | null } | { notification_prefs: NotificationPrefs | null }[] | null;
    families: { name: string; timezone: string | null; children: { name: string }[] } | { name: string; timezone: string | null; children: { name: string }[] }[] | null;
  };
  const rows = (tokens || []) as unknown as Row[];

  // Group by family.
  const byFamily = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r.family_id) continue;
    (byFamily.get(r.family_id) || byFamily.set(r.family_id, []).get(r.family_id)!).push(r);
  }

  const pushes: { to: string; title: string; body: string; sound: string; data: Record<string, unknown> }[] = [];
  const inAppRows: { family_id: string; type: string; title: string; body: string; action_url: string }[] = [];
  let evaluated = 0, due = 0, sent = 0, skippedDup = 0;
  const since = new Date(now.getTime() - 18 * 3600 * 1000).toISOString();

  for (const [familyId, frows] of byFamily) {
    evaluated++;
    const fam = (Array.isArray(frows[0].families) ? frows[0].families[0] : frows[0].families) || null;
    const touch = slotNow(fam?.timezone, now);
    if (!touch) continue;
    due++;
    const meta = TOUCH_META[touch];

    // Dedup: already sent this touch type to this family recently?
    const { count } = await admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('type', meta.type)
      .gte('created_at', since);
    if ((count || 0) > 0) { skippedDup++; continue; }

    const kids = childList((fam?.children || []).map((c) => c.name));
    const { title, body } = content(touch, kids);

    // Push to each parent-token in the family whose prefs allow this touch.
    let any = false;
    for (const r of frows) {
      const u = Array.isArray(r.users) ? r.users[0] : r.users;
      if (!prefAllows(u?.notification_prefs, touch)) continue;
      pushes.push({ to: r.token, title, body, sound: 'default', data: { type: meta.type, url: meta.actionUrl } });
      any = true;
    }
    if (any) {
      inAppRows.push({ family_id: familyId, type: meta.type, title, body, action_url: meta.actionUrl });
      sent++;
    }
  }

  if (pushes.length) await sendExpo(pushes);
  if (inAppRows.length) await admin.from('notifications').insert(inAppRows);

  return NextResponse.json({ ran: 'notifications/tick', evaluated, due, sent, skippedDup, pushes: pushes.length, at: now.toISOString() });
}
