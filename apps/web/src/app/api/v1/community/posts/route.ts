import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiPaginated, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/community/posts
 * Returns posts from groups the family is a member of, paginated, with author name.
 * Query params: ?page=1&per_page=20&group_id=uuid
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

  // Get family's group memberships
  const { data: memberships } = await supabase
    .from('community_memberships')
    .select('group_id')
    .eq('family_id', profile.family_id);

  const memberGroupIds = (memberships || []).map((m) => m.group_id);

  if (memberGroupIds.length === 0) {
    return apiPaginated([], 1, 20, 0);
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 50);
  const groupIdFilter = searchParams.get('group_id');

  let query = supabase
    .from('community_posts')
    .select('*, families(name), community_groups(name)', { count: 'exact' })
    .in('group_id', memberGroupIds);

  if (groupIdFilter) {
    if (!memberGroupIds.includes(groupIdFilter)) {
      return apiError('Not a member of this group', 403);
    }
    query = query.eq('group_id', groupIdFilter);
  }

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data: posts, count, error: queryError } = await query;

  if (queryError) {
    return apiError('Failed to fetch posts', 500);
  }

  const formatted = (posts || []).map((post) => {
    const family = Array.isArray(post.families) ? post.families[0] : post.families;
    const group = Array.isArray(post.community_groups) ? post.community_groups[0] : post.community_groups;
    return {
      ...post,
      author_name: family?.name || 'Unknown',
      group_name: group?.name || null,
      families: undefined,
      community_groups: undefined,
    };
  });

  return apiPaginated(formatted, page, perPage, count || 0);
}

/**
 * POST /api/v1/community/posts
 * Create a new community post.
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
  const { group_id, title, body: postBody, type } = body;

  if (!group_id || !title) {
    return apiError('group_id and title are required', 422, 'VALIDATION_ERROR');
  }

  // Verify family is a member of this group
  const { data: membership } = await supabase
    .from('community_memberships')
    .select('family_id')
    .eq('family_id', profile.family_id)
    .eq('group_id', group_id)
    .single();

  if (!membership) return apiError('Not a member of this group', 403);

  const { data: post, error: insertError } = await supabase
    .from('community_posts')
    .insert({
      family_id: profile.family_id,
      group_id,
      title,
      body: postBody || null,
      type: type || 'discussion',
    })
    .select()
    .single();

  if (insertError) {
    return apiError('Failed to create post', 500);
  }

  return apiSuccess(post, undefined, 201);
}
