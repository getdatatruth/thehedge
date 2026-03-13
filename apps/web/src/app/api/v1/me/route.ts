import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/me
 * Returns the authenticated user's profile, family, and children.
 * Used by mobile apps on launch to load the user's context.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('*, families(id, name, county, country, family_style, subscription_tier, subscription_status, onboarding_completed)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('Profile not found', 404);
  }

  const family = Array.isArray(profile.families) ? profile.families[0] : profile.families;
  const familyId = profile.family_id;

  let children: Record<string, unknown>[] = [];
  if (familyId) {
    const { data } = await supabase
      .from('children')
      .select('id, name, date_of_birth, interests, school_status, learning_style, avatar_url')
      .eq('family_id', familyId);
    children = data || [];
  }

  return apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      notification_prefs: profile.notification_prefs,
      created_at: profile.created_at,
    },
    family: family
      ? {
          id: familyId,
          name: family.name,
          county: family.county,
          country: family.country,
          family_style: family.family_style,
          subscription_tier: family.subscription_tier,
          subscription_status: family.subscription_status,
          onboarding_completed: family.onboarding_completed,
        }
      : null,
    children: children.map((c) => ({
      id: c.id,
      name: c.name,
      date_of_birth: c.date_of_birth,
      interests: c.interests,
      school_status: c.school_status,
      learning_style: c.learning_style,
      avatar_url: c.avatar_url,
      age: Math.floor(
        (Date.now() - new Date(c.date_of_birth as string).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      ),
    })),
  });
}
