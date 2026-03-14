import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * PUT /api/v1/settings/profile
 * Update user name and family county/family_style.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { name, county, family_style } = body;

  // Update user name if provided
  if (name !== undefined) {
    const { error: userError } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id);

    if (userError) {
      return apiError('Failed to update user name', 500);
    }
  }

  // Update family fields if provided
  const familyUpdates: Record<string, unknown> = {};
  if (county !== undefined) familyUpdates.county = county;
  if (family_style !== undefined) familyUpdates.family_style = family_style;

  if (Object.keys(familyUpdates).length > 0) {
    const { error: familyError } = await supabase
      .from('families')
      .update(familyUpdates)
      .eq('id', profile.family_id);

    if (familyError) {
      return apiError('Failed to update family settings', 500);
    }
  }

  // Return updated profile
  const { data: updatedProfile } = await supabase
    .from('users')
    .select('name, families(county, family_style)')
    .eq('id', user.id)
    .single();

  const family = updatedProfile
    ? Array.isArray(updatedProfile.families) ? updatedProfile.families[0] : updatedProfile.families
    : null;

  return apiSuccess({
    name: updatedProfile?.name,
    county: family?.county || null,
    family_style: family?.family_style || null,
  });
}
