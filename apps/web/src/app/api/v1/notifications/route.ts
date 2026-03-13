import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiPaginated, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/notifications
 * Returns the user's notifications.
 * Query params: unread_only, page, per_page
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
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50);
  const unreadOnly = searchParams.get('unread_only') === 'true';

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('family_id', profile.family_id);

  if (unreadOnly) query = query.eq('read', false);

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error: queryError } = await query;

  if (queryError) {
    return apiSuccess({ notifications: [], unread_count: 0 });
  }

  // Also get unread count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', profile.family_id)
    .eq('read', false);

  return apiPaginated(data || [], page, perPage, count || 0);
}

/**
 * PUT /api/v1/notifications
 * Mark notifications as read.
 * Body: { ids: string[] } or { mark_all_read: true }
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

  if (body.mark_all_read) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('family_id', profile.family_id)
      .eq('read', false);

    return apiSuccess({ marked_all_read: true });
  }

  if (body.ids && Array.isArray(body.ids)) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('family_id', profile.family_id)
      .in('id', body.ids);

    return apiSuccess({ marked_read: body.ids.length });
  }

  return apiError('Provide ids array or mark_all_read: true', 422);
}
