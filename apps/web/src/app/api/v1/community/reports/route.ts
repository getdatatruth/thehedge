import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * POST /api/v1/community/reports
 * Report a post or comment for moderation
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
  const { post_id, comment_id, reason } = body;

  if (!reason || reason.trim().length === 0) {
    return apiError('Reason is required', 400);
  }

  if (!post_id && !comment_id) {
    return apiError('Either post_id or comment_id is required', 400);
  }

  // Check for duplicate report
  let dupeQuery = supabase
    .from('community_reports')
    .select('id')
    .eq('reporter_family_id', profile.family_id)
    .eq('status', 'pending');

  if (post_id) dupeQuery = dupeQuery.eq('post_id', post_id);
  if (comment_id) dupeQuery = dupeQuery.eq('comment_id', comment_id);

  const { data: existing } = await dupeQuery;
  if (existing && existing.length > 0) {
    return apiSuccess({ already_reported: true });
  }

  const { data: report, error: insertError } = await supabase
    .from('community_reports')
    .insert({
      post_id: post_id || null,
      comment_id: comment_id || null,
      reporter_family_id: profile.family_id,
      reason: reason.trim(),
    })
    .select('id')
    .single();

  if (insertError) {
    return apiError('Failed to submit report', 500);
  }

  return apiSuccess({ id: report.id, reported: true });
}

/**
 * GET /api/v1/community/reports
 * Admin: list reports with filtering
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || 'pending';

  const { data: reports, error: fetchError } = await supabase
    .from('community_reports')
    .select(`
      *,
      post:post_id(id, title, body, type, family_id, group_id, families(name)),
      comment:comment_id(id, body, family_id, families(name))
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50);

  if (fetchError) {
    return apiError('Failed to fetch reports', 500);
  }

  return apiSuccess(reports || []);
}
