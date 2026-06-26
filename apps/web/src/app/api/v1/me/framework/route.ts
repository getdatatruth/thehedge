import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

// GET /api/v1/me/framework
// Returns the family's latest Family Framework (from the Kitchen Table), so a
// client can load it cold instead of relying on a passed-in copy.
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) return apiError('No family found', 400);

  const { data: framework } = await supabase
    .from('family_frameworks')
    .select('profile, rendered_markdown, version, created_at, updated_at')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return apiSuccess({ framework: framework ?? null });
}
