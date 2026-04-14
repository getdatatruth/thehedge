// ─── Stripe Revenue Metrics ──────────────────────────────
// Functions that pull real revenue data from the Stripe API.

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

export interface MRRDataPoint {
  month: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
}

export interface RevenueByTier {
  family: number;
  educator: number;
}

/**
 * Get current MRR from active subscriptions
 */
export async function getCurrentMRR(): Promise<number> {
  const stripe = getStripe();
  if (!stripe) return 0;

  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    let mrr = 0;
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const amount = item.price?.unit_amount || 0;
        const interval = item.price?.recurring?.interval;
        if (interval === 'month') {
          mrr += amount;
        } else if (interval === 'year') {
          mrr += Math.round(amount / 12);
        }
      }
    }
    return mrr / 100; // Convert cents to euros
  } catch {
    return 0;
  }
}

/**
 * Get MRR history for the last N months from Stripe invoices
 */
export async function getMRRHistory(months: number = 12): Promise<MRRDataPoint[]> {
  const stripe = getStripe();
  if (!stripe) {
    // Return empty history with correct month labels
    const result: MRRDataPoint[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' }),
        mrr: 0, newMrr: 0, churnedMrr: 0,
      });
    }
    return result;
  }

  try {
    const now = new Date();
    const result: MRRDataPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const invoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(monthStart.getTime() / 1000),
          lte: Math.floor(monthEnd.getTime() / 1000),
        },
        status: 'paid',
        limit: 100,
      });

      let mrr = 0;
      for (const inv of invoices.data) {
        mrr += (inv.amount_paid || 0) / 100;
      }

      result.push({
        month: monthStart.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' }),
        mrr: Math.round(mrr * 100) / 100,
        newMrr: 0, // Would need subscription creation events to calculate
        churnedMrr: 0, // Would need cancellation events to calculate
      });
    }

    return result;
  } catch {
    const result: MRRDataPoint[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' }),
        mrr: 0, newMrr: 0, churnedMrr: 0,
      });
    }
    return result;
  }
}

/**
 * Get revenue breakdown by tier
 */
export async function getRevenueByTier(): Promise<RevenueByTier> {
  const stripe = getStripe();
  if (!stripe) return { family: 0, educator: 0 };

  try {
    const familyPriceId = process.env.STRIPE_PRICE_FAMILY;
    const educatorPriceId = process.env.STRIPE_PRICE_EDUCATOR;

    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    let familyRevenue = 0;
    let educatorRevenue = 0;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const amount = item.price?.unit_amount || 0;
        const interval = item.price?.recurring?.interval;
        const monthly = interval === 'year' ? Math.round(amount / 12) : amount;

        if (item.price?.id === familyPriceId) {
          familyRevenue += monthly;
        } else if (item.price?.id === educatorPriceId) {
          educatorRevenue += monthly;
        }
      }
    }

    return {
      family: Math.round(familyRevenue) / 100,
      educator: Math.round(educatorRevenue) / 100,
    };
  } catch {
    return { family: 0, educator: 0 };
  }
}

/**
 * Get trial conversion count (trials that became paid in last 30 days)
 */
export async function getTrialConversions(): Promise<{ converted: number; expired: number }> {
  const stripe = getStripe();
  if (!stripe) return { converted: 0, expired: 0 };

  try {
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 86400000) / 1000);

    const events = await stripe.events.list({
      type: 'customer.subscription.updated',
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    let converted = 0;
    let expired = 0;

    for (const event of events.data) {
      const sub = event.data.object as Stripe.Subscription;
      const prev = event.data.previous_attributes as Record<string, unknown> | undefined;
      if (prev?.status === 'trialing') {
        if (sub.status === 'active') converted++;
        else if (sub.status === 'canceled' || sub.status === 'incomplete_expired') expired++;
      }
    }

    return { converted, expired };
  } catch {
    return { converted: 0, expired: 0 };
  }
}
