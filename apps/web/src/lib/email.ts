import { Resend } from 'resend';
import {
  welcomeTemplate,
  activityReminderTemplate,
  weeklySummaryTemplate,
  notificationTemplate,
  passwordResetTemplate,
  accountDeletedTemplate,
  dataExportTemplate,
} from './email-templates';

// ─── Fail-soft transactional mailer (Resend REST API via fetch) ─────────────
//
// A tiny generic send helper built on the Resend REST API with plain fetch (no
// SDK call, no extra moving parts). Unlike the templated helpers below, this is
// deliberately fail-soft: if no RESEND_API_KEY is configured it logs once and
// no-ops, and it NEVER throws into the caller. Used by the morning digest so a
// mail failure can never break the daily cron run.
//
// Required production env (web app, Vercel):
//   RESEND_API_KEY  - the Resend API key (without it, sends are skipped)
//   EMAIL_FROM      - optional; defaults to 'The Hedge <hello@thehedge.ie>'

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Override the default from address for this one send. */
  from?: string;
  /** Optional Reply-To. */
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  /** Resend message id when sent. */
  id?: string;
  /** Reason a send was skipped (for logging; never thrown). */
  skipped?: 'no_api_key' | 'no_recipient';
  error?: string;
}

function defaultFrom(): string {
  return process.env.EMAIL_FROM || 'The Hedge <hello@thehedge.ie>';
}

/** True when a real send is possible (a usable key is present). */
export function emailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return !!key && key !== 're_your-key';
}

/**
 * Send a single email via the Resend REST API.
 *
 * Degrades gracefully and NEVER throws:
 *  - no RESEND_API_KEY  -> logs once, returns { ok: false, skipped: 'no_api_key' }
 *  - no recipient       -> returns { ok: false, skipped: 'no_recipient' }
 *  - transport / API err -> logs, returns { ok: false, error }
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, html, text, from, replyTo } = input;

  const recipients = (Array.isArray(to) ? to : [to])
    .map((r) => (r || '').trim())
    .filter((r): r is string => r.length > 0);

  if (recipients.length === 0) {
    return { ok: false, skipped: 'no_recipient' };
  }

  if (!emailConfigured()) {
    // Quiet in local/preview; visible in production where it signals a real
    // misconfiguration. Never throw.
    console.warn('[email] RESEND_API_KEY not set - email send skipped (no-op).');
    return { ok: false, skipped: 'no_api_key' };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || defaultFrom(),
        to: recipients,
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[email] Resend send failed (${res.status}): ${detail}`);
      return { ok: false, error: `resend_${res.status}` };
    }

    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, id: data?.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('[email] unexpected error sending email:', message);
    return { ok: false, error: message };
  }
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_your-key') {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(key);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'The Hedge <hello@thehedge.ie>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thehedge.ie';

function replaceUrls(html: string): string {
  return html
    .replace(/\{\{app_url\}\}/g, APP_URL)
    .replace(/\{\{unsubscribe_url\}\}/g, `${APP_URL}/settings?tab=notifications`)
    .replace(/\{\{preferences_url\}\}/g, `${APP_URL}/settings?tab=notifications`);
}

export async function sendWelcomeEmail(to: string, familyName: string) {
  const html = replaceUrls(welcomeTemplate(familyName));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to The Hedge, ${familyName}!`,
    html,
  });
}

export async function sendActivityReminder(
  to: string,
  activities: { title: string; category: string; durationMinutes: number; slug: string }[]
) {
  const html = replaceUrls(activityReminderTemplate(activities));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Today's activity ideas from The Hedge",
    html,
  });
}

export async function sendWeeklySummary(
  to: string,
  stats: {
    activitiesCompleted: number;
    totalMinutes: number;
    topCategory: string;
    daysOfLearning: number;
    weekStart: string;
    weekEnd: string;
  }
) {
  const html = replaceUrls(weeklySummaryTemplate(stats));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your week: ${stats.activitiesCompleted} activities, ${stats.totalMinutes} minutes`,
    html,
  });
}

export async function sendPasswordReset(to: string, resetLink: string) {
  // Note: Supabase handles password reset natively, but this wraps it with
  // The Hedge branding for a consistent experience
  const html = replaceUrls(passwordResetTemplate(resetLink));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your password - The Hedge',
    html,
  });
}

export async function sendNotification(
  to: string,
  title: string,
  body: string,
  actionUrl?: string
) {
  const html = replaceUrls(
    notificationTemplate(title, body, actionUrl ? `${APP_URL}${actionUrl}` : undefined)
  );

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${title} - The Hedge`,
    html,
  });
}

export async function sendAccountDeletedEmail(to: string, familyName: string) {
  const html = replaceUrls(accountDeletedTemplate(familyName));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Your account has been deleted - The Hedge',
    html,
  });
}

export async function sendDataExportEmail(to: string, familyName: string) {
  const html = replaceUrls(dataExportTemplate(familyName));

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Your data export is ready - The Hedge',
    html,
  });
}
