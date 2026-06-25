import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/signup
// Creates a ready-to-use account (no email-confirmation round-trip) so a family
// can go straight from signing up to The Kitchen Table. The client then signs
// in with the same password. Email verification can be reintroduced later.
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; name?: string; plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';
  const name = body.name?.trim();

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: name || email.split('@')[0],
      ...(body.plan ? { plan: body.plan } : {}),
    },
  });

  if (error) {
    if (/already|registered|exists|duplicate/i.test(error.message)) {
      return NextResponse.json(
        { error: 'An account with that email already exists. Try signing in.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || 'Could not create account' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
