import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

function generatePassword(): string {
  const words = ['hedge', 'meadow', 'willow', 'brook', 'clover', 'heather', 'birch', 'fern'];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${w.charAt(0).toUpperCase()}${w.slice(1)}-${n}`;
}

// POST /api/admin/users/reset-password
// Reset a member's login password from the admin panel (for a locked-out
// tester). Identify the member by familyId (uses the family's primary member)
// or directly by email. Returns the new temporary password to pass on.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const familyId = body.familyId as string | undefined;
    let email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = (body.password as string | undefined)?.trim() || generatePassword();

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Resolve the target user id from the public.users table (email or family).
    let query = supabase.from('users').select('id, email');
    if (email) query = query.eq('email', email);
    else if (familyId) query = query.eq('family_id', familyId);
    else return NextResponse.json({ error: 'Provide an email or familyId.' }, { status: 400 });

    const { data: rows, error: qErr } = await query.limit(1);
    if (qErr) throw qErr;
    const target = rows?.[0];
    if (!target?.id) {
      return NextResponse.json({ error: 'No account found for that user.' }, { status: 404 });
    }
    email = (target.email as string) || email;

    const { error: updErr } = await supabase.auth.admin.updateUserById(target.id as string, {
      password,
    });
    if (updErr) {
      return NextResponse.json({ error: updErr.message || 'Could not reset the password.' }, { status: 400 });
    }

    logAuditEvent('admin', 'reset_password', 'user', target.id as string, { email });

    return NextResponse.json({ success: true, email, password });
  } catch (error) {
    console.error('POST /api/admin/users/reset-password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
