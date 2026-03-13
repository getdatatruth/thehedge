import { SupabaseClient } from '@supabase/supabase-js';

export interface CreateNotificationParams {
  type: 'achievement' | 'streak' | 'plan' | 'content' | 'info';
  title: string;
  body?: string;
  actionUrl?: string;
}

/**
 * Create a notification for a family.
 * Can be called from any API route or server action.
 */
export async function createNotification(
  supabase: SupabaseClient,
  familyId: string,
  params: CreateNotificationParams
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      family_id: familyId,
      type: params.type,
      title: params.title,
      body: params.body || null,
      action_url: params.actionUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create notification:', error);
    return null;
  }

  return data;
}

/**
 * Get the unread notification count for a family.
 */
export async function getUnreadCount(
  supabase: SupabaseClient,
  familyId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }

  return count ?? 0;
}
