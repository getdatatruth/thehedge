import { NextRequest, NextResponse } from 'next/server';
import { requireAdminCapability } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

// POST /api/admin/users/impersonate
// Generate a one-time magic sign-in link for a family's primary member so an
// admin can "view as" that user (open it in a private window to become them).
// Identify by familyId or email. Returns the action link.
export async function POST(request: NextRequest) {
  const auth = await requireAdminCapability(request, 'write');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const familyId = body.familyId as string | undefined;
    let email = (body.email as string | undefined)?.trim().toLowerCase();

    const supabase = createAdminClient();

    if (!email) {
      if (!familyId) {
        return NextResponse.json({ error: 'Provide an email or familyId.' }, { status: 400 });
      }
      const { data: rows } = await supabase
        .from('users')
        .select('email')
        .eq('family_id', familyId)
        .order('created_at', { ascending: true })
        .limit(1);
      email = (rows?.[0]?.email as string | undefined)?.toLowerCase();
    }
    if (!email) {
      return NextResponse.json({ error: 'No account found for that user.' }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/dashboard` },
    });
    if (error || !data?.properties?.action_link) {
      return NextResponse.json({ error: error?.message || 'Could not create a login link.' }, { status: 400 });
    }

    logAuditEvent('admin', 'impersonate', 'user', email, { email });

    return NextResponse.json({ success: true, email, link: data.properties.action_link });
  } catch (error) {
    console.error('POST /api/admin/users/impersonate error:', error);
    return NextResponse.json({ error: 'Failed to create login link' }, { status: 500 });
  }
}
