import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { uploadPortfolioPhoto, signPortfolioPhotos } from '@/lib/storage';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export const maxDuration = 30;

export async function OPTIONS() {
  return apiOptions();
}

// POST /api/v1/portfolio/photo  (Bearer, for mobile)
// Multipart upload of a single portfolio/evidence photo to private Storage.
// Returns the durable storage path plus a short-lived signed URL for preview.
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();
  if (!profile?.family_id) return apiError('No family found', 400);

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return apiError('No file provided', 400);

  const result = await uploadPortfolioPhoto(profile.family_id, file);
  if ('error' in result) return apiError(result.error, 400);

  const [url] = await signPortfolioPhotos([result.path]);
  return apiSuccess({ path: result.path, url });
}
