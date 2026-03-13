// Shared styles for all email templates
const COLORS = {
  forest: '#2D5016',
  moss: '#4A7C2E',
  parchment: '#F5F0E8',
  linen: '#EDE8DE',
  ink: '#1A1A1A',
  clay: '#6B6B6B',
  terracotta: '#C0532C',
  stone: '#D4CFC5',
};

function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Hedge</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:${COLORS.parchment};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${COLORS.parchment};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.parchment};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.forest};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:300;color:${COLORS.parchment};letter-spacing:1px;">
                The Hedge
              </h1>
              <p style="margin:4px 0 0;font-size:12px;color:${COLORS.parchment};opacity:0.7;letter-spacing:2px;text-transform:uppercase;">
                Family Learning Platform
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:${COLORS.linen};border-top:1px solid ${COLORS.stone};">
              <p style="margin:0;font-size:12px;color:${COLORS.clay};text-align:center;line-height:1.6;">
                The Hedge - Inspired by Ireland's hedge schools<br/>
                <a href="{{unsubscribe_url}}" style="color:${COLORS.moss};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="{{preferences_url}}" style="color:${COLORS.moss};text-decoration:underline;">Email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buttonHtml(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${COLORS.forest};border-radius:4px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:700;color:${COLORS.parchment};text-decoration:none;letter-spacing:0.5px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

export function welcomeTemplate(familyName: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Welcome to The Hedge, ${familyName}!
    </h2>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      We're delighted to have your family join our learning community. The Hedge is inspired by Ireland's
      historic hedge schools -- places where learning happened naturally, outdoors, and with curiosity as the guide.
    </p>
    <h3 style="margin:24px 0 12px;font-size:16px;font-weight:600;color:${COLORS.forest};">
      Getting started
    </h3>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.stone};">
          <strong style="color:${COLORS.ink};">1. Browse activities</strong>
          <p style="margin:4px 0 0;font-size:14px;color:${COLORS.clay};">
            Explore our curated collection of screen-free activities for all ages and interests.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.stone};">
          <strong style="color:${COLORS.ink};">2. Log what you do</strong>
          <p style="margin:4px 0 0;font-size:14px;color:${COLORS.clay};">
            Track activities and build a beautiful timeline of your family's learning journey.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <strong style="color:${COLORS.ink};">3. Ask the AI</strong>
          <p style="margin:4px 0 0;font-size:14px;color:${COLORS.clay};">
            Get personalised activity suggestions based on your children's ages and interests.
          </p>
        </td>
      </tr>
    </table>
    ${buttonHtml('Start exploring', '{{app_url}}/dashboard')}
    <p style="margin:0;font-size:14px;color:${COLORS.clay};line-height:1.6;">
      If you have any questions, just reply to this email. We'd love to hear from you.
    </p>
  `;

  return baseLayout(content, `Welcome to The Hedge, ${familyName}! Let's start exploring.`);
}

export function activityReminderTemplate(
  activities: { title: string; category: string; durationMinutes: number; slug: string }[]
): string {
  const activityRows = activities
    .map(
      (a) => `
      <tr>
        <td style="padding:16px;border-bottom:1px solid ${COLORS.stone};">
          <h4 style="margin:0 0 4px;font-size:16px;color:${COLORS.ink};">${a.title}</h4>
          <p style="margin:0;font-size:13px;color:${COLORS.clay};">
            ${a.category} &middot; ${a.durationMinutes} min
          </p>
          <a href="{{app_url}}/activity/${a.slug}" style="display:inline-block;margin-top:8px;font-size:13px;color:${COLORS.moss};text-decoration:underline;">
            View activity
          </a>
        </td>
      </tr>`
    )
    .join('');

  const content = `
    <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Today's activity ideas
    </h2>
    <p style="margin:0 0 24px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      Here are some activities picked just for your family today.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${COLORS.linen};border-radius:8px;overflow:hidden;">
      ${activityRows}
    </table>
    ${buttonHtml('See all activities', '{{app_url}}/browse')}
  `;

  return baseLayout(content, "Today's activity suggestions from The Hedge");
}

export function weeklySummaryTemplate(stats: {
  activitiesCompleted: number;
  totalMinutes: number;
  topCategory: string;
  streak: number;
  weekStart: string;
  weekEnd: string;
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Your week in review
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.clay};">
      ${stats.weekStart} - ${stats.weekEnd}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:16px;background-color:${COLORS.linen};border-radius:8px 0 0 8px;text-align:center;">
          <p style="margin:0;font-size:32px;font-weight:300;color:${COLORS.forest};">${stats.activitiesCompleted}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${COLORS.clay};text-transform:uppercase;letter-spacing:1px;">Activities</p>
        </td>
        <td width="50%" style="padding:16px;background-color:${COLORS.linen};border-radius:0 8px 8px 0;text-align:center;">
          <p style="margin:0;font-size:32px;font-weight:300;color:${COLORS.forest};">${stats.totalMinutes}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${COLORS.clay};text-transform:uppercase;letter-spacing:1px;">Minutes</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.stone};">
          <span style="font-size:14px;color:${COLORS.clay};">Top category</span>
          <span style="float:right;font-size:14px;font-weight:600;color:${COLORS.ink};">${stats.topCategory}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:14px;color:${COLORS.clay};">Current streak</span>
          <span style="float:right;font-size:14px;font-weight:600;color:${COLORS.ink};">${stats.streak} day${stats.streak !== 1 ? 's' : ''}</span>
        </td>
      </tr>
    </table>
    ${stats.activitiesCompleted > 0
      ? `<p style="margin:0 0 16px;font-size:16px;color:${COLORS.forest};font-style:italic;">
          Great work this week! Keep the momentum going.
        </p>`
      : `<p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};">
          No activities logged this week. Let's find something fun to try!
        </p>`
    }
    ${buttonHtml('View your timeline', '{{app_url}}/timeline')}
  `;

  return baseLayout(content, `Your week: ${stats.activitiesCompleted} activities, ${stats.totalMinutes} minutes`);
}

export function notificationTemplate(
  title: string,
  body: string,
  actionUrl?: string
): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      ${title}
    </h2>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      ${body}
    </p>
    ${actionUrl ? buttonHtml('View details', actionUrl) : ''}
  `;

  return baseLayout(content, title);
}

export function passwordResetTemplate(resetLink: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Reset your password
    </h2>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    ${buttonHtml('Reset password', resetLink)}
    <p style="margin:0;font-size:14px;color:${COLORS.clay};line-height:1.6;">
      If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.
    </p>
  `;

  return baseLayout(content, 'Reset your password for The Hedge');
}

export function accountDeletedTemplate(familyName: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Account deleted
    </h2>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      We've deleted your account and all associated data for the ${familyName} family, as requested.
    </p>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      We're sorry to see you go. If you ever want to come back, you're always welcome.
    </p>
    <p style="margin:0;font-size:14px;color:${COLORS.clay};line-height:1.6;">
      If you didn't request this deletion, please contact us immediately at support@thehedge.ie.
    </p>
  `;

  return baseLayout(content, `Your account has been deleted, ${familyName}`);
}

export function dataExportTemplate(familyName: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:300;color:${COLORS.ink};">
      Your data export is ready
    </h2>
    <p style="margin:0 0 16px;font-size:16px;color:${COLORS.clay};line-height:1.6;">
      Hi ${familyName}, you recently requested an export of all your data from The Hedge.
      Your download should have started automatically. If not, you can request it again from your settings page.
    </p>
    <p style="margin:0;font-size:14px;color:${COLORS.clay};line-height:1.6;">
      This export includes your profile, family details, children, activity logs, education plans, and portfolio entries.
    </p>
  `;

  return baseLayout(content, `Your data export is ready, ${familyName}`);
}
