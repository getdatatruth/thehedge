import { createClient } from '@/lib/supabase/server';
import { NotificationsClient } from './notifications-client';

export const metadata = {
  title: 'Notifications — The Hedge',
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    read: boolean;
    action_url: string | null;
    created_at: string;
  }> = [];

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (profile?.family_id) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false })
        .limit(50);

      notifications = data || [];
    }
  }

  return <NotificationsClient initialNotifications={notifications} />;
}
