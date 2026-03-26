import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiPaginated, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/activity-logs
 * Returns the family's activity log history.
 * Supports: page, per_page, child_id, date_from, date_to
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
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 200);
  const childId = searchParams.get('child_id');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  let query = supabase
    .from('activity_logs')
    .select('*, activities(title, slug, category)', { count: 'exact' })
    .eq('family_id', profile.family_id);

  if (childId) query = query.contains('child_ids', [childId]);
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  query = query
    .order('date', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch activity logs', 500);
  }

  return apiPaginated(data || [], page, perPage, count || 0);
}

/**
 * POST /api/v1/activity-logs
 * Log a completed activity.
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

  const body = await request.json();
  const { activity_id, child_ids, date, duration_minutes, notes, rating } = body;

  if (!date) return apiError('Date is required', 422, 'VALIDATION_ERROR');

  const { data: log, error: insertError } = await supabase
    .from('activity_logs')
    .insert({
      family_id: profile.family_id,
      activity_id: activity_id || null,
      child_ids: child_ids || [],
      date,
      duration_minutes: duration_minutes || null,
      notes: notes || null,
      rating: rating || null,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to log activity', 500);
  }

  return apiSuccess(log, undefined, 201);
}

/**
 * PUT /api/v1/activity-logs
 * Update an existing activity log entry.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json();
  const { id, duration_minutes, notes, rating, child_ids } = body;

  if (!id) return apiError('Log ID is required', 422, 'VALIDATION_ERROR');

  // Verify the log belongs to this family
  const { data: existing } = await supabase
    .from('activity_logs')
    .select('id')
    .eq('id', id)
    .eq('family_id', profile.family_id)
    .single();

  if (!existing) return apiError('Activity log not found', 404);

  const updates: Record<string, unknown> = {};
  if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
  if (notes !== undefined) updates.notes = notes || null;
  if (rating !== undefined) updates.rating = rating || null;
  if (child_ids !== undefined) updates.child_ids = child_ids;

  const { data: updated, error: updateError } = await supabase
    .from('activity_logs')
    .update(updates)
    .eq('id', id)
    .eq('family_id', profile.family_id)
    .select()
    .single();

  if (updateError) {
    return apiError('Failed to update activity log', 500);
  }

  return apiSuccess(updated);
}

/**
 * DELETE /api/v1/activity-logs
 * Delete an activity log entry.
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

  const body = await request.json();
  const { id } = body;

  if (!id) return apiError('Log ID is required', 422, 'VALIDATION_ERROR');

  const { error: deleteError } = await supabase
    .from('activity_logs')
    .delete()
    .eq('id', id)
    .eq('family_id', profile.family_id);

  if (deleteError) {
    return apiError('Failed to delete activity log', 500);
  }

  return apiSuccess({ deleted: true });
}
