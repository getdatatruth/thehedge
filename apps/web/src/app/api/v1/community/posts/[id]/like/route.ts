import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * POST /api/v1/community/posts/[id]/like
 * Toggle like on a post.
 * If already liked, removes the like and decrements like_count.
 * If not liked, adds a like and increments like_count.
 * Returns { liked: boolean, like_count: number }
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

  // Verify the post exists and get current like_count
  const { data: post } = await supabase
    .from('community_posts')
    .select('id, group_id, like_count')
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

  // Check if a like already exists
  const { data: existingLike } = await supabase
    .from('community_post_likes')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('post_id', id)
    .single();

  let liked: boolean;
  let newLikeCount: number;

  if (existingLike) {
    // Unlike - remove the like and decrement
    const { error: deleteError } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('family_id', profile.family_id)
      .eq('post_id', id);

    if (deleteError) {
      return apiError('Failed to remove like', 500);
    }

    newLikeCount = Math.max(0, (post.like_count || 0) - 1);
    liked = false;
  } else {
    // Like - insert and increment
    const { error: insertError } = await supabase
      .from('community_post_likes')
      .insert({
        family_id: profile.family_id,
        post_id: id,
      });

    if (insertError) {
      return apiError('Failed to add like', 500);
    }

    newLikeCount = (post.like_count || 0) + 1;
    liked = true;
  }

  // Update the like_count on the post
  const { error: updateError } = await supabase
    .from('community_posts')
    .update({ like_count: newLikeCount })
    .eq('id', id);

  if (updateError) {
    return apiError('Failed to update like count', 500);
  }

  return apiSuccess({ liked, like_count: newLikeCount });
}
