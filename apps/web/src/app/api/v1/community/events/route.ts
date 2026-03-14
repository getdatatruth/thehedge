import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/community/events
 * Returns upcoming events from community groups the family is a member of.
 * Ordered by date ascending.
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
    return apiSuccess([]);
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: events, error: queryError } = await supabase
    .from('events')
    .select('*, community_groups(name)')
    .in('group_id', memberGroupIds)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(50);

  if (queryError) {
    return apiError('Failed to fetch events', 500);
  }

  const formatted = (events || []).map((event) => {
    const group = Array.isArray(event.community_groups) ? event.community_groups[0] : event.community_groups;
    return {
      ...event,
      group_name: group?.name || null,
      community_groups: undefined,
    };
  });

  return apiSuccess(formatted);
}
