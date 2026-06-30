import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { buildReassurance } from '@/lib/reassurance';

export async function OPTIONS() {
  return apiOptions();
}

// GET /api/v1/me/reassurance
// A calm, never-a-score answer to "am I doing enough?" for this family. Used by
// the dashboard reassurance card (web) and the Today screen (mobile).
export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return apiError('Finish setting up your family first.', 400);
    }

    const reassurance = await buildReassurance(supabase, { familyId: profile.family_id });
    return apiSuccess(reassurance);
  } catch (err) {
    console.error('reassurance error:', err);
    return apiError('Could not load this just now.', 500);
  }
}
