import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * PUT /api/v1/settings/notifications
 * Update notification preferences on the users table.
 */
export async function PUT(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const body = await request.json();
  const { morning_idea, weekend_plan, weekly_summary, community } = body;

  const notificationPrefs: Record<string, boolean> = {};
  if (morning_idea !== undefined) notificationPrefs.morning_idea = !!morning_idea;
  if (weekend_plan !== undefined) notificationPrefs.weekend_plan = !!weekend_plan;
  if (weekly_summary !== undefined) notificationPrefs.weekly_summary = !!weekly_summary;
  if (community !== undefined) notificationPrefs.community = !!community;

  // Get current prefs and merge
  const { data: currentUser } = await supabase
    .from('users')
    .select('notification_prefs')
    .eq('id', user.id)
    .single();

  const currentPrefs = (currentUser?.notification_prefs as Record<string, boolean>) || {};
  const mergedPrefs = { ...currentPrefs, ...notificationPrefs };

  const { error: updateError } = await supabase
    .from('users')
    .update({ notification_prefs: mergedPrefs })
    .eq('id', user.id);

  if (updateError) {
    return apiError('Failed to update notification preferences', 500);
  }

  return apiSuccess({ notification_prefs: mergedPrefs });
}
