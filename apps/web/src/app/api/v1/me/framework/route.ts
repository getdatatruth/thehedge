import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';
import { frameworkToMarkdown, type KTFramework } from '@/lib/kitchen-table';

export async function OPTIONS() {
  return apiOptions();
}

const MAX_FIELD = 1200;
const clean = (s: unknown): string =>
  typeof s === 'string' ? s.replace(/\s+\n/g, '\n').trim().slice(0, MAX_FIELD) : '';

// PATCH /api/v1/me/framework
// Persist edits a parent makes to their Family Framework from Our Hedge. We merge
// the edited fields over the latest stored framework, update it in place, and
// re-render the markdown the AI reads so Ask and insights stay in sync.
export async function PATCH(request: NextRequest) {
  try {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();
  if (!profile?.family_id) return apiError('No family found', 400);

  const body = await request.json().catch(() => null);
  const edits = body?.framework as Partial<KTFramework> | undefined;
  if (!edits || typeof edits !== 'object') return apiError('No framework edits provided', 400);

  // Load the latest framework row to merge over.
  const { data: row } = await supabase
    .from('family_frameworks')
    .select('id, profile')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) return apiError('No framework to edit yet', 404);

  const storedProfile = (row.profile as { framework?: KTFramework } & Record<string, unknown>) || {};
  const current = storedProfile.framework;
  if (!current) return apiError('No framework to edit yet', 404);

  const merged: KTFramework = {
    opening: current.opening,
    thingsToday: current.thingsToday,
    whatYouToldMe: edits.whatYouToldMe !== undefined ? clean(edits.whatYouToldMe) : current.whatYouToldMe,
    quietFloor: edits.quietFloor !== undefined ? clean(edits.quietFloor) : current.quietFloor,
    forYourWorry: edits.forYourWorry !== undefined ? clean(edits.forYourWorry) : current.forYourWorry,
    commitments: Array.isArray(edits.commitments)
      ? edits.commitments.map(clean).filter(Boolean).slice(0, 8)
      : current.commitments,
  };

  const { error: updErr } = await supabase
    .from('family_frameworks')
    .update({
      profile: { ...storedProfile, framework: merged },
      rendered_markdown: frameworkToMarkdown(merged),
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  if (updErr) {
    console.error('framework PATCH update error:', updErr.message);
    return apiError('Could not save your changes', 500);
  }
  return apiSuccess({ framework: merged });
  } catch (e) {
    console.error('framework PATCH error:', e);
    return apiError('Could not save your changes', 500);
  }
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
