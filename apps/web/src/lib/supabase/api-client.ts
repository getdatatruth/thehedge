import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Creates a Supabase client for API routes that supports both:
 * - Cookie-based auth (web browser)
 * - Bearer token auth (mobile apps: iOS/Android)
 *
 * Mobile apps authenticate with Supabase directly using the
 * Supabase iOS/Android SDK, then pass the access token as:
 *   Authorization: Bearer <supabase_access_token>
 *
 * Usage in API routes:
 *   const { supabase, user } = await createApiClient(request);
 */
export async function createApiClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // Mobile app: Bearer token auth
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { supabase, user: null, error: 'Invalid or expired token' };
    }

    return { supabase, user, error: null };
  }

  // Web browser: Cookie-based auth
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a context where cookies can't be set
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user, error: user ? null : 'Not authenticated' };
}
