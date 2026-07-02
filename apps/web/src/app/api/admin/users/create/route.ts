import { NextRequest, NextResponse } from 'next/server';
import { requireAdminCapability } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

// Generate a readable temporary password when the admin does not supply one, so
// they get something they can hand to the new tester right away.
function generatePassword(): string {
  const words = ['hedge', 'meadow', 'willow', 'brook', 'clover', 'heather', 'birch', 'fern'];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${w.charAt(0).toUpperCase()}${w.slice(1)}-${n}`;
}

// POST /api/admin/users/create
// Provision a brand-new account from the admin panel: creates the Supabase Auth
// login (email pre-confirmed so they can sign in immediately), a family with the
// chosen tier, and the users row linking the two. Returns a Family-shaped object
// so the admin table can prepend it, plus the password to pass on.
export async function POST(request: NextRequest) {
  const auth = await requireAdminCapability(request, 'write');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const name = (body.name as string | undefined)?.trim();
    const tier = (body.tier as string | undefined) || 'educator';
    const password = (body.password as string | undefined)?.trim() || generatePassword();

    if (!email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!['free', 'family', 'educator'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create the auth login (pre-confirmed, so no email round-trip).
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0] },
    });
    if (authErr || !created?.user) {
      const msg = authErr?.message || 'Could not create the account';
      const status = /already|registered|exists|duplicate/i.test(msg) ? 409 : 400;
      return NextResponse.json({ error: msg }, { status });
    }
    const userId = created.user.id;

    // 2. Create the family with the chosen tier (active, no trial expiry).
    const familyName = name ? `${name}'s family` : `${email.split('@')[0]}'s family`;
    const { data: fam, error: famErr } = await supabase
      .from('families')
      .insert({
        name: familyName,
        country: 'IE',
        subscription_tier: tier,
        subscription_status: 'active',
        onboarding_completed: false,
      })
      .select('id, name, county, country, subscription_tier, subscription_status, onboarding_completed, created_at, updated_at')
      .single();
    if (famErr || !fam) {
      // Roll back the auth user so we do not leave a login with no family.
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Could not create the family record.' }, { status: 500 });
    }

    // 3. Link the user to the family.
    const { error: linkErr } = await supabase.from('users').insert({
      id: userId,
      family_id: fam.id,
      name: name || email.split('@')[0],
      email,
      role: 'owner',
    });
    if (linkErr) {
      await supabase.from('families').delete().eq('id', fam.id);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Could not link the account to the family.' }, { status: 500 });
    }

    logAuditEvent('admin', 'create_user', 'family', fam.id, { email, tier });

    // Shape it like getAllFamilies() rows so the table can render it immediately.
    const familyRow = {
      ...fam,
      email,
      member_count: 1,
      child_count: 0,
      activity_log_count: 0,
    };

    return NextResponse.json({ success: true, family: familyRow, password });
  } catch (error) {
    console.error('POST /api/admin/users/create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
