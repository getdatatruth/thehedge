import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple, dependency-free email capture. Posts a notification to the founder via
// the Resend REST API. If RESEND_API_KEY is not configured, the route degrades
// gracefully and tells the caller it is not wired up yet, without crashing.

const NOTIFY_TO = process.env.SUBSCRIBE_NOTIFY_TO || 'adam@ofmm.ie';
const FROM_EMAIL = process.env.EMAIL_FROM || 'The Hedge <hello@thehedge.ie>';

// Pragmatic email check. Not RFC-perfect on purpose; just enough to catch typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isConfigured(key: string | undefined): key is string {
  return Boolean(key) && key !== 're_your-key';
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid request.' },
      { status: 400 }
    );
  }

  const { email, source } = (body ?? {}) as { email?: unknown; source?: unknown };

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
    return NextResponse.json(
      { ok: false, message: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanSource =
    typeof source === 'string' && source.length <= 64 ? source : 'unknown';

  const apiKey = process.env.RESEND_API_KEY;

  // Graceful degrade: no key configured yet. Do not crash, do not pretend it
  // worked. We still 200 so the UI can show a calm message, but we flag it.
  if (!isConfigured(apiKey)) {
    console.warn(
      '[subscribe] RESEND_API_KEY is not configured. Lead not delivered:',
      cleanEmail,
      `(source: ${cleanSource})`
    );
    return NextResponse.json({
      ok: true,
      configured: false,
      message:
        "Thanks. We've noted your interest. Email is not fully wired up yet, so do reach out to hello@thehedge.ie if you don't hear back.",
    });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_TO,
        reply_to: cleanEmail,
        subject: `New Hedge signup: ${cleanEmail}`,
        text: `New email capture from the marketing site.\n\nEmail: ${cleanEmail}\nSource: ${cleanSource}\nTime: ${new Date().toISOString()}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[subscribe] Resend error', res.status, detail);
      return NextResponse.json(
        { ok: false, message: 'We could not save that just now. Please try again shortly.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      message: "You're on the list. Thanks for joining us.",
    });
  } catch (err) {
    console.error('[subscribe] Unexpected error', err);
    return NextResponse.json(
      { ok: false, message: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    );
  }
}
