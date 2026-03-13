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
    streak: number;
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
