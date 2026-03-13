import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER: Record<string, 'family' | 'educator'> = {
  'price_1TAX0mRqzN6VBgZyqtObkOeW': 'family',
  'price_1TAX1iRqzN6VBgZyTXTe6gW9': 'educator',
};

function getTierFromPriceId(priceId: string | undefined): 'family' | 'educator' {
  if (!priceId) return 'family';
  return PRICE_TO_TIER[priceId] ?? 'family';
}

function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'trialing' | 'past_due' | 'cancelled' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'cancelled';
    default:
      return 'active';
  }
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ── Checkout completed ─────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const familyId = session.metadata?.family_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | null;

        if (!familyId) {
          console.error('No family_id in checkout session metadata');
          break;
        }

        // Determine tier from the subscription's price
        let tier: 'family' | 'educator' = 'family';
        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
          });
          const priceId = subscription.items.data[0]?.price?.id;
          tier = getTierFromPriceId(priceId);
        }

        const { error } = await supabase
          .from('families')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: tier,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', familyId);

        if (error) {
          console.error(`Failed to update family ${familyId}:`, error);
          throw error;
        }

        console.log(`Family ${familyId} subscribed to ${tier} (customer: ${customerId})`);
        break;
      }

      // ── Subscription updated (plan change, renewal, status change) ──
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = mapSubscriptionStatus(subscription.status);

        // Determine the current tier from the subscription's price
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = getTierFromPriceId(priceId);

        const { error } = await supabase
          .from('families')
          .update({
            subscription_tier: tier,
            subscription_status: status,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`Failed to update subscription for customer ${customerId}:`, error);
          throw error;
        }

        console.log(
          `Subscription updated for customer ${customerId}: tier=${tier}, status=${status}`
        );
        break;
      }

      // ── Subscription deleted (cancelled / expired) ─────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from('families')
          .update({
            subscription_tier: 'free',
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`Failed to downgrade customer ${customerId}:`, error);
          throw error;
        }

        console.log(`Subscription cancelled for customer ${customerId}, downgraded to free`);
        break;
      }

      // ── Payment failed ─────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error } = await supabase
          .from('families')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`Failed to flag payment failure for customer ${customerId}:`, error);
          throw error;
        }

        console.log(`Payment failed for customer ${customerId}, marked as past_due`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
