import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/community/groups
 * Returns all community groups with is_member flag for the current family.
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

  // Get all groups
  const { data: groups, error: queryError } = await supabase
    .from('community_groups')
    .select('*')
    .order('name', { ascending: true });

  if (queryError) {
    return apiError('Failed to fetch groups', 500);
  }

  // Get family's memberships
  const { data: memberships } = await supabase
    .from('community_memberships')
    .select('group_id, role')
    .eq('family_id', profile.family_id);

  const membershipMap = new Map(
    (memberships || []).map((m) => [m.group_id, m.role])
  );

  const formatted = (groups || []).map((group) => ({
    ...group,
    is_member: membershipMap.has(group.id),
    membership_role: membershipMap.get(group.id) || null,
  }));

  return apiSuccess(formatted);
}

/**
 * POST /api/v1/community/groups
 * Create a new community group.
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
  const { name, county, type } = body;

  if (!name) return apiError('Group name is required', 422, 'VALIDATION_ERROR');

  const { data: group, error: insertError } = await supabase
    .from('community_groups')
    .insert({
      name,
      county: county || null,
      type: type || 'general',
      member_count: 1,
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create group', 500);
  }

  // Auto-join the creator as admin
  const { error: joinError } = await supabase
    .from('community_memberships')
    .insert({
      family_id: profile.family_id,
      group_id: group.id,
      role: 'admin',
    });

  if (joinError) {
    // Group was created but join failed - still return the group
    return apiSuccess({ ...group, is_member: false, membership_role: null }, undefined, 201);
  }

  return apiSuccess({ ...group, is_member: true, membership_role: 'admin' }, undefined, 201);
}
