import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-nav';
import type { SubscriptionTier } from '@/types/database';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscriptionTier: SubscriptionTier = 'free';
  let familyName = '';
  let userName = '';
  let unreadNotificationCount = 0;
  let isTrialing = false;
  let trialDaysLeft: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, family_id, families(name, subscription_tier, subscription_status, trial_ends_at)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families)
        ? profile.families[0]
        : profile?.families
    ) as { name: string; subscription_tier: string; subscription_status: string; trial_ends_at: string | null } | null | undefined;

    if (family) {
      const status = family.subscription_status || 'active';
      const trialEndsAt = family.trial_ends_at ? new Date(family.trial_ends_at) : null;

      if (status === 'trialing' && trialEndsAt) {
        const now = new Date();
        if (now > trialEndsAt) {
          // Trial expired
          subscriptionTier = 'free';
        } else {
          subscriptionTier = (family.subscription_tier as SubscriptionTier) || 'free';
          isTrialing = true;
          trialDaysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
      } else if (status === 'active') {
        subscriptionTier = (family.subscription_tier as SubscriptionTier) || 'free';
      }
      // cancelled / past_due → stays 'free'
    }

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
      <Sidebar
        subscriptionTier={subscriptionTier}
        familyName={familyName}
        userName={userName}
        unreadCount={unreadNotificationCount}
        isTrialing={isTrialing}
        trialDaysLeft={trialDaysLeft}
      />
      <main className="flex-1 pt-13 lg:pt-0 pb-24 lg:pb-0">
        <div className="mx-auto max-w-[960px] px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
      <MobileBottomNav subscriptionTier={subscriptionTier} />
    </div>
  );
}
