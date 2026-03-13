import { NextRequest, NextResponse } from 'next/server';

// Cron-based monitoring endpoint.
// Called by Vercel Cron (or external monitor like BetterUptime/UptimeRobot).
// Checks /api/health and sends alerts if services are degraded or down.
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/monitor", "schedule": "*/5 * * * *" }] }

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const healthRes = await fetch(`${appUrl}/api/health`, {
      cache: 'no-store',
    });

    const health = await healthRes.json();

    // Collect any issues
    const issues: string[] = [];
    for (const service of health.services || []) {
      if (service.status === 'down') {
        issues.push(`DOWN: ${service.name} — ${service.error || 'no details'}`);
      } else if (service.status === 'degraded') {
        issues.push(`DEGRADED: ${service.name} — ${service.error || `${service.latency_ms}ms`}`);
      }
    }

    // If there are issues, attempt to send alerts
    if (issues.length > 0) {
      await sendAlerts(health.status, issues, health.timestamp);
    }

    return NextResponse.json({
      checked_at: new Date().toISOString(),
      overall: health.status,
      issues,
      alerted: issues.length > 0,
    });
  } catch (error) {
    // The health endpoint itself is unreachable — critical failure
    const message = error instanceof Error ? error.message : 'Health endpoint unreachable';
    await sendAlerts('critical', [`CRITICAL: Health endpoint failed — ${message}`], new Date().toISOString());

    return NextResponse.json(
      { error: 'Health check failed', message },
      { status: 500 }
    );
  }
}

async function sendAlerts(status: string, issues: string[], timestamp: string) {
  const subject = `[The Hedge] Platform ${status.toUpperCase()} — ${issues.length} issue(s)`;
  const body = [
    `Platform Status: ${status.toUpperCase()}`,
    `Time: ${timestamp}`,
    '',
    'Issues:',
    ...issues.map((i) => `  • ${i}`),
    '',
    `Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://thehedge.ie'}/admin`,
  ].join('\n');

  // Alert via Resend email if configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'alerts@thehedge.ie',
          to: process.env.ALERT_EMAIL || 'admin@thehedge.ie',
          subject,
          text: body,
        }),
      });
    } catch (e) {
      console.error('Failed to send email alert:', e);
    }
  }

  // Alert via Slack webhook if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: subject,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${subject}*\n\n${issues.map((i) => `• ${i}`).join('\n')}`,
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.error('Failed to send Slack alert:', e);
    }
  }

  // Always log to console for Vercel logs
  console.error(`[MONITOR] ${subject}\n${body}`);
}
