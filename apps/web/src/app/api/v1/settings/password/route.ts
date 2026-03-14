import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * PUT /api/v1/settings/password
 * Change the authenticated user's password.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const body = await request.json();
  const { password } = body;

  if (!password) {
    return apiError('Password is required', 422, 'VALIDATION_ERROR');
  }

  if (password.length < 8) {
    return apiError('Password must be at least 8 characters', 422, 'VALIDATION_ERROR');
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return apiError(updateError.message || 'Failed to update password', 500);
  }

  return apiSuccess({ updated: true });
}
