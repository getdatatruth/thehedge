import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, PRICE_IDS, getPriceId, type PlanType, type BillingInterval } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, interval = 'monthly' } = body as { plan: PlanType; interval?: BillingInterval };

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get user's family
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(id, stripe_customer_id, subscription_tier)')
      .eq('id', user.id)
      .single();

    if (!profile?.family_id) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const family = Array.isArray(profile.families)
      ? profile.families[0]
      : profile.families;

    if (!family) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 });
    }

    const priceId = getPriceId(plan, interval);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const successUrl = `${origin}/settings/billing?success=true`;
    const cancelUrl = `${origin}/settings/billing?cancelled=true`;

    const session = await createCheckoutSession(
      family.id,
      priceId,
      successUrl,
      cancelUrl,
      family.stripe_customer_id || undefined
    );

    // If customer was created during checkout, save the customer ID
    if (session.customer && !family.stripe_customer_id) {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from('families')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', family.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
