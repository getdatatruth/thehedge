import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/activities/:slug
 * Returns a single activity by slug with full details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { slug } = await params;

  const { data: activity, error: queryError } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (queryError || !activity) {
    return apiError('Activity not found', 404);
  }

  // Get related activities (same category)
  const { data: related } = await supabase
    .from('activities')
    .select('id, title, slug, category, duration_minutes, age_min, age_max, energy_level, description')
    .eq('category', activity.category)
    .eq('published', true)
    .neq('id', activity.id)
    .limit(3);

  return apiSuccess({
    ...activity,
    related: related || [],
  });
}
