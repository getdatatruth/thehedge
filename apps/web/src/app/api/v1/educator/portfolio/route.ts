import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/educator/portfolio
 * Returns portfolio entries for family's children.
 * Optional ?child_id filter.
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Get family's children IDs
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', profile.family_id);

  if (!children || children.length === 0) {
    return apiSuccess([]);
  }

  const childIds = children.map((c) => c.id);

  const { searchParams } = request.nextUrl;
  const childIdFilter = searchParams.get('child_id');

  let query = supabase
    .from('portfolio_entries')
    .select('*, children(name)')
    .in('child_id', childIds)
    .order('date', { ascending: false });

  if (childIdFilter) {
    if (!childIds.includes(childIdFilter)) {
      return apiError('Child not found in this family', 403);
    }
    query = query.eq('child_id', childIdFilter);
  }

  const { data: entries, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch portfolio entries', 500);
  }

  const formatted = (entries || []).map((entry) => {
    const child = Array.isArray(entry.children) ? entry.children[0] : entry.children;
    return {
      ...entry,
      child_name: child?.name || null,
      children: undefined,
    };
  });

  return apiSuccess(formatted);
}

/**
 * POST /api/v1/educator/portfolio
 * Create a new portfolio entry.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { child_id, title, description, date, curriculum_areas, photos } = body;

  if (!child_id || !title) {
    return apiError('child_id and title are required', 422, 'VALIDATION_ERROR');
  }

  // Verify child belongs to family
  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('id', child_id)
    .eq('family_id', profile.family_id)
    .single();

  if (!child) return apiError('Child not found in this family', 404);

  const { data: entry, error: insertError } = await supabase
    .from('portfolio_entries')
    .insert({
      child_id,
      title,
      description: description || null,
      date: date || new Date().toISOString().split('T')[0],
      curriculum_areas: curriculum_areas || [],
      photos: photos || [],
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create portfolio entry', 500);
  }

  return apiSuccess(entry, undefined, 201);
}

/**
 * DELETE /api/v1/educator/portfolio
 * Remove a portfolio entry.
 */
export async function DELETE(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { id } = body;

  if (!id) return apiError('Portfolio entry id is required', 422, 'VALIDATION_ERROR');

  // Verify entry belongs to family's children
  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', profile.family_id);

  const childIds = (children || []).map((c) => c.id);

  const { data: entry } = await supabase
    .from('portfolio_entries')
    .select('id, child_id')
    .eq('id', id)
    .single();

  if (!entry || !childIds.includes(entry.child_id)) {
    return apiError('Portfolio entry not found', 404);
  }

  const { error: deleteError } = await supabase
    .from('portfolio_entries')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return apiError('Failed to delete portfolio entry', 500);
  }

  return apiSuccess({ deleted: true });
}
