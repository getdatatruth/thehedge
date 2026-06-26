import { NextRequest, NextResponse } from 'next/server';
import { POST as sendNotifications } from '@/app/api/v1/notifications/send/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GET /api/cron/notifications
 *
 * Vercel Cron entry point for the daily push/in-app notification run.
 *
 * Vercel crons always issue a GET with `Authorization: Bearer ${CRON_SECRET}`,
 * but the underlying send endpoint expects a POST with a `{ type }` body. This
 * thin wrapper authenticates the cron and forwards a POST to the send handler.
 *
 * The notification `type` can be overridden with ?type=... ; it defaults to
 * 'morning_plan' so the daily morning run sends the gentle morning idea.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get('type') || 'morning_plan';

  // Build an internal POST request the send handler understands, forwarding
  // the same Authorization header so its own auth check passes.
  const internalRequest = new NextRequest(new URL('/api/v1/notifications/send', request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: authHeader || '',
    },
    body: JSON.stringify({ type }),
  });

  try {
    const response = await sendNotifications(internalRequest);
    const result = await response.json().catch(() => null);
    return NextResponse.json({
      ran: 'notifications',
      type,
      status: response.status,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification run failed';
    console.error('[CRON] notifications failed:', message);
    return NextResponse.json({ error: 'Notification run failed', message }, { status: 500 });
  }
}
