import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * POST /api/v1/community/groups/[id]/join
 * Join a community group.
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
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Verify group exists
  const { data: group } = await supabase
    .from('community_groups')
    .select('id, member_count')
    .eq('id', id)
    .single();

  if (!group) return apiError('Group not found', 404);

  // Check if already a member
  const { data: existing } = await supabase
    .from('community_memberships')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('group_id', id)
    .single();

  if (existing) return apiError('Already a member of this group', 409);

  // Insert membership
  const { error: joinError } = await supabase
    .from('community_memberships')
    .insert({
      family_id: profile.family_id,
      group_id: id,
      role: 'member',
    });

  if (joinError) {
    return apiError('Failed to join group', 500);
  }

  // Increment member count
  const { error: updateError } = await supabase
    .from('community_groups')
    .update({ member_count: (group.member_count || 0) + 1 })
    .eq('id', id);

  if (updateError) {
    // Membership was created, count update failed - non-critical
  }

  return apiSuccess({ joined: true }, undefined, 201);
}

/**
 * DELETE /api/v1/community/groups/[id]/join
 * Leave a community group.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  // Verify membership exists
  const { data: membership } = await supabase
    .from('community_memberships')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('group_id', id)
    .single();

  if (!membership) return apiError('Not a member of this group', 404);

  // Delete membership
  const { error: deleteError } = await supabase
    .from('community_memberships')
    .delete()
    .eq('family_id', profile.family_id)
    .eq('group_id', id);

  if (deleteError) {
    return apiError('Failed to leave group', 500);
  }

  // Decrement member count
  const { data: group } = await supabase
    .from('community_groups')
    .select('member_count')
    .eq('id', id)
    .single();

  if (group) {
    await supabase
      .from('community_groups')
      .update({ member_count: Math.max((group.member_count || 1) - 1, 0) })
      .eq('id', id);
  }

  return apiSuccess({ left: true });
}
