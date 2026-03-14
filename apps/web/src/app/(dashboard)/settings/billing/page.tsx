import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';

export const metadata = {
  title: 'Billing - The Hedge',
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select(
      'family_id, families(id, name, stripe_customer_id, subscription_tier, subscription_status, trial_ends_at)'
    )
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    redirect('/login');
  }

  const family = Array.isArray(profile.families)
    ? profile.families[0]
    : profile.families;

  const trialEndsAt = (family as { trial_ends_at?: string | null } | null)?.trial_ends_at || null;
  let trialDaysLeft: number | null = null;
  const status = (family?.subscription_status as string) || 'active';

  if (status === 'trialing' && trialEndsAt) {
    const trialEnd = new Date(trialEndsAt);
    const now = new Date();
    if (now < trialEnd) {
      trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <BillingClient
      familyId={family?.id || ''}
      currentTier={(family?.subscription_tier as string) || 'free'}
      subscriptionStatus={status}
      hasStripeCustomer={!!family?.stripe_customer_id}
      trialDaysLeft={trialDaysLeft}
    />
  );
}
