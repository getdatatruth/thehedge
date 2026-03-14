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

// Stripe Price IDs — monthly and annual for each tier
export const PRICE_IDS = {
  family: {
    monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY || 'price_1TAn1DRqzN6VBgZy8YhOkUUK',
    annual: process.env.STRIPE_PRICE_FAMILY_ANNUAL || 'price_1TAn1DRqzN6VBgZyJ7Gkn6vI',
  },
  educator: {
    monthly: process.env.STRIPE_PRICE_EDUCATOR_MONTHLY || 'price_1TAn1ERqzN6VBgZyb4PcuBWp',
    annual: process.env.STRIPE_PRICE_EDUCATOR_ANNUAL || 'price_1TAn1ERqzN6VBgZy2vOnmtzh',
  },
} as const;

export type PlanType = keyof typeof PRICE_IDS;
export type BillingInterval = 'monthly' | 'annual';

export function getPriceId(plan: PlanType, interval: BillingInterval = 'monthly'): string {
  return PRICE_IDS[plan][interval];
}

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
