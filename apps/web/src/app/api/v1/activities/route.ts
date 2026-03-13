import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiPaginated, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/activities
 * Browse activities with filtering, searching, and pagination.
 * Supports query params: category, location, energy, mess, age_min, age_max,
 *   duration_max, screen_free, q (search), page, per_page, sort
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50);
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const energy = searchParams.get('energy');
  const mess = searchParams.get('mess');
  const ageMin = searchParams.get('age_min');
  const ageMax = searchParams.get('age_max');
  const durationMax = searchParams.get('duration_max');
  const screenFree = searchParams.get('screen_free');
  const search = searchParams.get('q');
  const sort = searchParams.get('sort') || 'created_at';

  let query = supabase
    .from('activities')
    .select('*', { count: 'exact' })
    .eq('published', true);

  if (category) query = query.eq('category', category);
  if (location) query = query.eq('location', location);
  if (energy) query = query.eq('energy_level', energy);
  if (mess) query = query.eq('mess_level', mess);
  if (ageMin) query = query.lte('age_min', parseInt(ageMin, 10));
  if (ageMax) query = query.gte('age_max', parseInt(ageMax, 10));
  if (durationMax) query = query.lte('duration_minutes', parseInt(durationMax, 10));
  if (screenFree === 'true') query = query.eq('screen_free', true);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const sortField = ['title', 'duration_minutes', 'created_at', 'age_min'].includes(sort)
    ? sort
    : 'created_at';
  const ascending = sort === 'title' || sort === 'age_min';

  query = query
    .order(sortField, { ascending })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch activities', 500);
  }

  return apiPaginated(data || [], page, perPage, count || 0);
}
