import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEducator = false;
  let familyName = '';
  let userName = '';
  let unreadNotificationCount = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, family_id, families(name, subscription_tier)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { name: string; subscription_tier: string } | null | undefined;
    isEducator = true; // Force show educator nav for dev preview
    familyName = family?.name || '';
    userName = profile?.name || user.email?.split('@')[0] || '';

    if (profile?.family_id) {
      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', profile.family_id)
          .eq('read', false);

        unreadNotificationCount = count ?? 0;
      } catch {
        // notifications table may not exist yet
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      <Sidebar isEducator={isEducator} familyName={familyName} userName={userName} unreadCount={unreadNotificationCount} />
      <main className="flex-1 pt-13 lg:pt-0 pb-24 lg:pb-0">
        <div className="mx-auto max-w-[960px] px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
