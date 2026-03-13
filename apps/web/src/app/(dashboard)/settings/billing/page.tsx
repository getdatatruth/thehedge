import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';

export const metadata = {
  title: 'Billing — The Hedge',
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
      'family_id, families(id, name, stripe_customer_id, subscription_tier, subscription_status)'
    )
    .eq('id', user.id)
    .single();

  if (!profile?.family_id) {
    redirect('/login');
  }

  const family = Array.isArray(profile.families)
    ? profile.families[0]
    : profile.families;

  return (
    <BillingClient
      familyId={family?.id || ''}
      currentTier={(family?.subscription_tier as string) || 'free'}
      subscriptionStatus={(family?.subscription_status as string) || 'active'}
      hasStripeCustomer={!!family?.stripe_customer_id}
    />
  );
}
