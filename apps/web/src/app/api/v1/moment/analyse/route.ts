import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { analyseMoment } from '@/lib/moment';

export const maxDuration = 45;

export async function OPTIONS() {
  return apiOptions();
}

// POST /api/v1/moment/analyse
// { childIds: string[], description: string } -> an editable, curriculum-mapped
// portfolio draft. Read-only: nothing is saved here.
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    const body = await request.json();
    const { childIds, description } = body as { childIds?: string[]; description?: string };
    if (!description || typeof description !== 'string' || description.trim().length < 3) {
      return apiError('Tell me a little about what they did.', 400);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();
    if (!profile?.family_id) return apiError('Finish setting up your family first.', 400);

    let query = supabase
      .from('children')
      .select('id, name, date_of_birth')
      .eq('family_id', profile.family_id);
    if (Array.isArray(childIds) && childIds.length > 0) query = query.in('id', childIds);
    const { data: children } = await query;
    if (!children || children.length === 0) return apiError('Add a child first.', 400);

    const draft = await analyseMoment(supabase, { children, description });
    if (!draft) return apiError('I could not read that one back just now. Have another go in a moment.', 502);

    return apiSuccess(draft);
  } catch (err) {
    console.error('moment analyse error:', err);
    return apiError('Something went sideways. Have another go in a moment.', 500);
  }
}
