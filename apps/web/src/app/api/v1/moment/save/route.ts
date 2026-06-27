import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

// POST /api/v1/moment/save
// Persist a (possibly edited) "log a moment" entry: one activity_log for the
// family timeline + coverage, and a portfolio_entries row per child carrying the
// curriculum areas + outcomes the parent confirmed. No activity_id (it is a
// free-form moment, not a library/spark activity).
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    const body = await request.json();
    const {
      childIds, date, durationMinutes, title, summary,
      areas, outcomeIds, photos, saveToPortfolio = true,
    } = body as {
      childIds?: string[]; date?: string; durationMinutes?: number | null;
      title?: string; summary?: string; areas?: string[]; outcomeIds?: string[];
      photos?: string[]; saveToPortfolio?: boolean;
    };

    if (!Array.isArray(childIds) || childIds.length === 0) return apiError('Who was it for?', 400);
    if (!summary || !summary.trim()) return apiError('Tell me what they did.', 400);
    const entryDate = date || new Date().toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();
    if (!profile?.family_id) return apiError('Finish setting up your family first.', 400);

    // Verify the children belong to this family.
    const { data: ownChildren } = await supabase
      .from('children')
      .select('id')
      .eq('family_id', profile.family_id)
      .in('id', childIds);
    const validChildIds = (ownChildren || []).map((c) => c.id);
    if (validChildIds.length === 0) return apiError('Those children are not on your family.', 400);

    const cleanAreas = Array.isArray(areas) ? areas.filter((a) => typeof a === 'string') : [];
    const cleanOutcomeIds = Array.isArray(outcomeIds) ? outcomeIds.filter((o) => typeof o === 'string') : [];
    const cleanPhotos = Array.isArray(photos) ? photos.filter((p) => typeof p === 'string') : [];

    // One activity_log so the moment feeds the timeline + the rounded-childhood
    // warmth signal (curriculum_areas_covered drives coverage).
    const { data: log } = await supabase
      .from('activity_logs')
      .insert({
        family_id: profile.family_id,
        activity_id: null,
        child_ids: validChildIds,
        date: entryDate,
        duration_minutes: durationMinutes || null,
        notes: summary.trim(),
        photos: cleanPhotos,
        curriculum_areas_covered: cleanAreas,
      })
      .select('id')
      .single();

    let portfolioSaved = 0;
    if (saveToPortfolio) {
      const admin = createAdminClient();
      const { count } = await admin.from('portfolio_entries').insert(
        validChildIds.map((childId) => ({
          child_id: childId,
          date: entryDate,
          title: (title || 'A learning moment').trim(),
          description: summary.trim(),
          curriculum_areas: cleanAreas,
          outcome_ids: cleanOutcomeIds,
          photos: cleanPhotos,
          activity_log_id: log?.id || null,
        })),
        { count: 'exact' },
      );
      portfolioSaved = count || validChildIds.length;
    }

    return apiSuccess({ activityLogId: log?.id || null, portfolioSaved });
  } catch (err) {
    console.error('moment save error:', err);
    return apiError('I could not save that just now. Have another go in a moment.', 500);
  }
}
