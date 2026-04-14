import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/community/posts/[id]/comments
 * List comments for a post, ordered by created_at ascending.
 * Joins with families table to include author name.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Verify the post exists
  const { data: post } = await supabase
    .from('community_posts')
    .select('id, group_id')
    .eq('id', id)
    .single();

  if (!post) return apiError('Post not found', 404);

  // Verify the user is a member of the group this post belongs to
  const { data: membership } = await supabase
    .from('community_memberships')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('group_id', post.group_id)
    .single();

  if (!membership) return apiError('Not a member of this group', 403);

  const { data: comments, error: queryError } = await supabase
    .from('community_comments')
    .select('*, families(name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  if (queryError) {
    return apiError('Failed to fetch comments', 500);
  }

  const formatted = (comments || []).map((comment) => {
    const family = Array.isArray(comment.families)
      ? comment.families[0]
      : comment.families;
    return {
      id: comment.id,
      post_id: comment.post_id,
      family_id: comment.family_id,
      body: comment.body,
      parent_comment_id: comment.parent_comment_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author_name: family?.name || 'Unknown',
    };
  });

  return apiSuccess(formatted);
}

/**
 * POST /api/v1/community/posts/[id]/comments
 * Create a comment on a post.
 * Body: { body: string, parent_comment_id?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Verify the post exists and get current comment_count
  const { data: post } = await supabase
    .from('community_posts')
    .select('id, group_id, comment_count')
    .eq('id', id)
    .single();

  if (!post) return apiError('Post not found', 404);

  // Verify the user is a member of the group this post belongs to
  const { data: membership } = await supabase
    .from('community_memberships')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('group_id', post.group_id)
    .single();

  if (!membership) return apiError('Not a member of this group', 403);

  const body = await request.json();
  const { body: commentBody, parent_comment_id } = body;

  if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
    return apiError('body is required', 422, 'VALIDATION_ERROR');
  }

  if (commentBody.trim().length > 5000) {
    return apiError('Comment must be 5000 characters or fewer', 422, 'VALIDATION_ERROR');
  }

  // If replying to a parent comment, verify it exists and belongs to this post
  if (parent_comment_id) {
    const { data: parentComment } = await supabase
      .from('community_comments')
      .select('id')
      .eq('id', parent_comment_id)
      .eq('post_id', id)
      .single();

    if (!parentComment) {
      return apiError('Parent comment not found on this post', 404);
    }
  }

  const { data: comment, error: insertError } = await supabase
    .from('community_comments')
    .insert({
      post_id: id,
      family_id: profile.family_id,
      body: commentBody.trim(),
      parent_comment_id: parent_comment_id || null,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create comment', 500);
  }

  // Increment comment_count on the post
  const { error: updateError } = await supabase
    .from('community_posts')
    .update({ comment_count: (post.comment_count || 0) + 1 })
    .eq('id', id);

  if (updateError) {
    return apiError('Failed to update comment count', 500);
  }

  return apiSuccess(comment, undefined, 201);
}
