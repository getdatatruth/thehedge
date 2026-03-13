import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/favourites
 * Returns the user's favourited activity IDs and optionally full activity data.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { searchParams } = request.nextUrl;
  const expand = searchParams.get('expand') === 'true';

  if (expand) {
    const { data } = await supabase
      .from('activity_favourites')
      .select('activity_id, activities(*)')
      .eq('family_id', profile.family_id);

    return apiSuccess({
      favourites: (data || []).map((f) => ({
        activity_id: f.activity_id,
        activity: f.activities,
      })),
    });
  }

  const { data } = await supabase
    .from('activity_favourites')
    .select('activity_id')
    .eq('family_id', profile.family_id);

  return apiSuccess({
    activity_ids: (data || []).map((f) => f.activity_id),
  });
}

/**
 * POST /api/v1/favourites
 * Add an activity to favourites.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { activity_id } = await request.json();
  if (!activity_id) return apiError('activity_id is required', 422);

  const { error: insertError } = await supabase
    .from('activity_favourites')
    .insert({ family_id: profile.family_id, activity_id });

  if (insertError) {
    if (insertError.code === '23505') {
      return apiSuccess({ already_favourited: true });
    }
    return apiError('Failed to add favourite', 500);
  }

  return apiSuccess({ favourited: true }, undefined, 201);
}

/**
 * DELETE /api/v1/favourites
 * Remove an activity from favourites.
 */
export async function DELETE(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { activity_id } = await request.json();
  if (!activity_id) return apiError('activity_id is required', 422);

  await supabase
    .from('activity_favourites')
    .delete()
    .eq('family_id', profile.family_id)
    .eq('activity_id', activity_id);

  return apiSuccess({ unfavourited: true });
}
