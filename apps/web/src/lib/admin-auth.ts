import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Founder emails that always have admin access, even if ADMIN_EMAILS is not
 * configured in the environment, so the owner can never be locked out of
 * /admin. Extend for a deployment via the ADMIN_EMAILS env var (comma-
 * separated), e.g. ADMIN_EMAILS=teammate@thehedge.ie,ops@thehedge.ie
 */
const DEFAULT_ADMIN_EMAILS = [
  'adam@thehedge.ie',
  'adam@ofmm.ie',
  'info@ofmm.ie',
  'adam@getdatatruth.com',
];

function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  // Built-in founder list plus any env-configured admins, deduped.
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]));
}

export interface AdminUser {
  id: string;
  email: string;
  familyId: string | null;
}

export type AdminAuthResult =
  | { authorized: true; user: AdminUser }
  | { authorized: false; response: NextResponse };

/**
 * Verify the request comes from an authenticated admin user.
 *
 * Usage:
 * ```ts
 * const auth = await requireAdmin(request);
 * if (!auth.authorized) return auth.response;
 * const { user } = auth;
 * ```
 */
export async function requireAdmin(
  _request: Request
): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      ),
    };
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: { message: 'Forbidden: admin access required', code: 'FORBIDDEN' },
        },
        { status: 403 }
      ),
    };
  }

  // Fetch family_id for convenience
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  return {
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
      familyId: profile?.family_id ?? null,
    },
  };
}
