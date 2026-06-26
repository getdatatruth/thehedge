import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'portfolio';
const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/**
 * Upload a portfolio photo to private Storage under the family's folder.
 * Returns the storage path (NOT a URL) - durable, signed on read.
 */
export async function uploadPortfolioPhoto(
  familyId: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return { error: 'Unsupported image type' };
  if (file.size > 10 * 1024 * 1024) return { error: 'Image is over the 10MB limit' };

  const admin = createAdminClient();
  const rand = `${Date.now()}-${Math.round(Math.random() * 1e9).toString(36)}`;
  const path = `${familyId}/${rand}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };
  return { path };
}

/**
 * Turn stored photo references into displayable URLs. Storage paths are
 * signed; legacy data: URLs (from before Storage) pass through unchanged.
 */
export async function signPortfolioPhotos(
  refs: string[] | null | undefined
): Promise<string[]> {
  if (!refs || refs.length === 0) return [];
  const admin = createAdminClient();
  const out: string[] = [];
  for (const ref of refs) {
    if (ref.startsWith('data:') || ref.startsWith('http')) {
      out.push(ref);
      continue;
    }
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(ref, SIGNED_TTL);
    if (data?.signedUrl) out.push(data.signedUrl);
  }
  return out;
}
