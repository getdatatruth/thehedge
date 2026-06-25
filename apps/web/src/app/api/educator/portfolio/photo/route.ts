import { createClient } from '@/lib/supabase/server';
import { uploadPortfolioPhoto, signPortfolioPhotos } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/educator/portfolio/photo
// Multipart upload of a single portfolio/evidence photo to private Storage.
// Returns the durable storage path plus a short-lived signed URL for preview.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();
  if (!profile?.family_id) return NextResponse.json({ error: 'No family found' }, { status: 400 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const result = await uploadPortfolioPhoto(profile.family_id, file);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const [url] = await signPortfolioPhotos([result.path]);
  return NextResponse.json({ path: result.path, url });
}
