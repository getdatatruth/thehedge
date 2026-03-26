import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * POST /api/v1/me/push-token
 * Registers or updates an Expo push token for the authenticated user.
 * Body: { token: string, platform: 'ios' | 'android' }
 *
 * Stores the token in a `push_tokens` table:
 *   id (uuid), user_id (uuid), family_id (uuid), token (text), platform (text), created_at, updated_at
 *
 * The table should be created in Supabase with:
 *   CREATE TABLE IF NOT EXISTS push_tokens (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     family_id uuid REFERENCES families(id) ON DELETE CASCADE,
 *     token text NOT NULL,
 *     platform text NOT NULL DEFAULT 'ios',
 *     active boolean NOT NULL DEFAULT true,
 *     created_at timestamptz NOT NULL DEFAULT now(),
 *     updated_at timestamptz NOT NULL DEFAULT now(),
 *     UNIQUE(user_id, token)
 *   );
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const body = await request.json();
  const { token, platform } = body;

  if (!token || typeof token !== 'string') {
    return apiError('token is required', 422);
  }

  if (!platform || !['ios', 'android'].includes(platform)) {
    return apiError('platform must be ios or android', 422);
  }

  // Get the user's family_id
  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  // Upsert the push token - if the same user+token combo exists, update it
  const { error: upsertError } = await supabase
    .from('push_tokens')
    .upsert(
      {
        user_id: user.id,
        family_id: profile?.family_id || null,
        token,
        platform,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    );

  if (upsertError) {
    // If the table doesn't exist yet, return a helpful error
    if (upsertError.code === '42P01') {
      return apiError(
        'push_tokens table does not exist. Please create it in Supabase.',
        500
      );
    }
    return apiError(`Failed to save push token: ${upsertError.message}`, 500);
  }

  // Deactivate any other tokens for this user on the same platform
  // (user switched devices or reinstalled)
  await supabase
    .from('push_tokens')
    .update({ active: false })
    .eq('user_id', user.id)
    .eq('platform', platform)
    .neq('token', token);

  return apiSuccess({ registered: true });
}

/**
 * DELETE /api/v1/me/push-token
 * Deactivates a push token (e.g. on logout).
 * Body: { token: string }
 */
export async function DELETE(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return apiError('token is required', 422);
  }

  await supabase
    .from('push_tokens')
    .update({ active: false })
    .eq('user_id', user.id)
    .eq('token', token);

  return apiSuccess({ deactivated: true });
}
