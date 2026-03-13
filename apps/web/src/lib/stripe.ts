import Stripe from 'stripe';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Lazy-init: only throws when actually used, not at import time
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) _stripe = getStripeClient();
  return _stripe;
}

// Replace these with real Stripe Price IDs from your dashboard
export const PRICE_IDS = {
  family: process.env.STRIPE_PRICE_FAMILY || 'price_family_placeholder',
  educator: process.env.STRIPE_PRICE_EDUCATOR || 'price_educator_placeholder',
} as const;

export type PlanType = keyof typeof PRICE_IDS;

export async function createCheckoutSession(
  familyId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerId?: string
) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { family_id: familyId },
    allow_promotion_codes: true,
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_creation = 'always';
  }

  return getStripe().checkout.sessions.create(sessionParams);
}

export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string
) {
  return getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(stripeCustomerId: string) {
  const subscriptions = await getStripe().subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    limit: 1,
    expand: ['data.default_payment_method'],
  });

  return subscriptions.data[0] || null;
}

export async function getInvoices(stripeCustomerId: string, limit = 10) {
  const invoices = await getStripe().invoices.list({
    customer: stripeCustomerId,
    limit,
  });

  return invoices.data;
}
