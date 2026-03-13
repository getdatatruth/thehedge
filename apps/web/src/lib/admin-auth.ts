import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin emails are stored in the ADMIN_EMAILS environment variable
 * as a comma-separated list, e.g.:
 *   ADMIN_EMAILS=adam@thehedge.ie,admin@thehedge.ie
 */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
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
