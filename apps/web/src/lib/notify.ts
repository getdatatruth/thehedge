import { createAdminClient } from '@/lib/supabase/admin';

export interface NotifyInput {
  familyId: string;
  type?: string;
  title: string;
  body?: string | null;
  actionUrl?: string | null;
}

/**
 * Insert an in-app notification for a single family.
 *
 * Uses the service-role admin client so it can write notifications for ANY
 * family (RLS only allows a family to write its own). This is deliberately
 * safe: it swallows its own errors and never throws into the request path, so
 * a notification failure can never break the user action that triggered it.
 */
export async function notify(input: NotifyInput): Promise<void> {
  const { familyId, type = 'info', title, body, actionUrl } = input;

  if (!familyId || !title) return;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('notifications').insert({
      family_id: familyId,
      type,
      title,
      body: body ?? null,
      action_url: actionUrl ?? null,
      read: false,
    });
    if (error) {
      console.error('[notify] failed to insert notification:', error.message);
    }
  } catch (e) {
    console.error('[notify] unexpected error inserting notification:', e);
  }
}

/**
 * Insert the same notification for many families in one batch insert.
 * Same safety guarantees as notify(): never throws.
 */
export async function notifyMany(
  familyIds: string[],
  input: Omit<NotifyInput, 'familyId'>
): Promise<void> {
  const { type = 'info', title, body, actionUrl } = input;

  const ids = [...new Set(familyIds.filter(Boolean))];
  if (ids.length === 0 || !title) return;

  try {
    const supabase = createAdminClient();
    const rows = ids.map((family_id) => ({
      family_id,
      type,
      title,
      body: body ?? null,
      action_url: actionUrl ?? null,
      read: false,
    }));
    const { error } = await supabase.from('notifications').insert(rows);
    if (error) {
      console.error('[notify] failed to insert notifications:', error.message);
    }
  } catch (e) {
    console.error('[notify] unexpected error inserting notifications:', e);
  }
}
