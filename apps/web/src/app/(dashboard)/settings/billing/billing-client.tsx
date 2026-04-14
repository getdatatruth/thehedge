'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Crown,
  Check,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  Heart,
  GraduationCap,
  FileText,
  Star,
  Zap,
} from 'lucide-react';

interface BillingClientProps {
  familyId: string;
  currentTier: string;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
  trialDaysLeft?: number | null;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: '0',
    annualPrice: '0',
    period: 'forever',
    description: 'Get started with the basics',
    features: [
      { icon: Sparkles, text: '5 AI suggestions per week' },
      { icon: BookOpen, text: 'Browse activities (limited)' },
      { icon: Calendar, text: 'Activity logging' },
      { icon: Star, text: 'Basic timeline' },
    ],
    cta: 'Current plan',
  },
  {
    id: 'family',
    name: 'Family',
    monthlyPrice: '6.99',
    annualPrice: '59.99',
    period: '/month',
    description: 'Everything your family needs',
    popular: true,
    features: [
      { icon: Zap, text: 'Unlimited AI suggestions' },
      { icon: BookOpen, text: 'Full activity library' },
      { icon: Calendar, text: 'Weekly planner' },
      { icon: Heart, text: 'Favourites & collections' },
      { icon: Star, text: 'Full timeline with stats' },
      { icon: Sparkles, text: 'iOS & Android app' },
    ],
    cta: 'Upgrade to Family',
  },
  {
    id: 'educator',
    name: 'Educator',
    monthlyPrice: '14.99',
    annualPrice: '134.99',
    period: '/month',
    description: 'For home educators and co-ops',
    features: [
      { icon: Check, text: 'Everything in Family' },
      { icon: GraduationCap, text: 'Educator suite' },
      { icon: FileText, text: 'Tusla compliance tools' },
      { icon: BookOpen, text: 'Portfolio management' },
      { icon: Calendar, text: 'Curriculum tracking' },
      { icon: FileText, text: 'PDF report generation' },
    ],
    cta: 'Upgrade to Educator',
  },
];

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  active: { text: 'Active', className: 'tag-sage' },
  trialing: { text: 'Trial', className: 'tag-sage' },
  past_due: { text: 'Past due', className: 'bg-terracotta/10 text-terracotta' },
  cancelled: { text: 'Cancelled', className: 'bg-terracotta/10 text-terracotta' },
};

export function BillingClient({
  currentTier,
  subscriptionStatus,
  hasStripeCustomer,
  trialDaysLeft,
}: BillingClientProps) {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');
  const upgradePrompt = searchParams.get('upgrade');

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = async (plan: string) => {
    if (plan === currentTier || plan === 'free') return;

    setLoading(plan);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('portal');
    setError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || json.error || 'Failed to open billing portal');
      }

      const portalUrl = json.data?.url || json.url;
      window.location.href = portalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  const statusInfo = STATUS_LABELS[subscriptionStatus] || STATUS_LABELS.active;

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div>
        <a
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs text-clay/50 hover:text-moss transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to settings
        </a>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-3">
          Subscription
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          <em className="text-moss italic">Billing</em>
        </h1>
        <p className="text-clay mt-2 text-lg">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Success/cancel banners */}
      {success && (
        <div className="card-elevated p-4 border-l-4 border-l-moss bg-sage/5">
          <p className="text-sm font-medium text-forest">
            Payment successful! Your plan has been upgraded.
          </p>
        </div>
      )}
      {cancelled && (
        <div className="card-elevated p-4 border-l-4 border-l-terracotta/30">
          <p className="text-sm text-clay">
            Checkout was cancelled. No changes were made to your plan.
          </p>
        </div>
      )}

      {upgradePrompt && (
        <div className="card-elevated p-4 border-l-4 border-l-moss bg-sage/5">
          <p className="text-sm font-medium text-forest">
            The feature you tried to access requires a{' '}
            <span className="capitalize">{upgradePrompt}</span> plan. Upgrade
            below to unlock it.
          </p>
        </div>
      )}

      {subscriptionStatus === 'trialing' && trialDaysLeft !== null && (
        <div className="card-elevated p-5 border-l-4 border-l-sage bg-sage/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest">
                {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your trial
              </p>
              <p className="text-sm text-clay/60 mt-1">
                Subscribe now to keep all your {currentTier === 'educator' ? 'Educator' : 'Family'} features when your trial ends.
              </p>
            </div>
            <button
              onClick={() => handleUpgrade(currentTier)}
              disabled={loading === currentTier}
              className="btn-primary text-sm shrink-0 flex items-center gap-2"
            >
              {loading === currentTier && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Subscribe now
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card-elevated p-4 border-l-4 border-l-terracotta/30">
          <p className="text-sm text-terracotta">{error}</p>
        </div>
      )}

      {/* Current plan summary */}
      <div className="card-elevated p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10">
            <Crown className="h-6 w-6 text-amber" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-light text-ink">
                {PLANS.find((p) => p.id === currentTier)?.name || 'Free'} Plan
              </h2>
              <span className={`tag font-bold ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
            </div>
            <p className="text-sm text-clay/60 mt-1.5">
              {PLANS.find((p) => p.id === currentTier)?.description}
            </p>
          </div>
          {hasStripeCustomer && (
            <button
              onClick={handleManageBilling}
              disabled={loading === 'portal'}
              className="btn-secondary flex items-center gap-2 text-sm shrink-0"
            >
              {loading === 'portal' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              Manage billing
            </button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-light text-ink">
            Available plans
          </h3>
          <div className="flex items-center gap-1 rounded-[4px] border border-stone bg-linen p-0.5">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`rounded-[3px] px-3 py-1.5 text-xs font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-parchment text-ink shadow-sm'
                  : 'text-clay/60 hover:text-ink'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`rounded-[3px] px-3 py-1.5 text-xs font-medium transition-all ${
                billingInterval === 'annual'
                  ? 'bg-parchment text-ink shadow-sm'
                  : 'text-clay/60 hover:text-ink'
              }`}
            >
              Annual <span className="text-[10px] text-terracotta font-bold ml-1">Save 28%</span>
            </button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const isDowngrade =
              (currentTier === 'educator' && plan.id !== 'educator') ||
              (currentTier === 'family' && plan.id === 'free');

            return (
              <div
                key={plan.id}
                className={`card-elevated p-6 relative ${
                  plan.popular && !isCurrent
                    ? 'border-2 border-moss/30'
                    : ''
                } ${isCurrent ? 'ring-2 ring-moss/20' : ''}`}
              >
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-3 left-6 bg-moss text-parchment text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}

                <div className="mb-6">
                  <h4 className="font-display text-lg font-medium text-ink">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-display text-3xl font-light text-ink">
                      &euro;{billingInterval === 'annual' && plan.id !== 'free' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-clay/50">
                      {plan.id === 'free' ? plan.period : billingInterval === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>
                  {billingInterval === 'annual' && plan.id !== 'free' && (
                    <p className="text-[11px] text-terracotta font-medium mt-1">
                      Save &euro;{plan.id === 'family' ? '23.89' : '44.89'} per year
                    </p>
                  )}
                  <p className="text-sm text-clay/60 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <feature.icon className="h-4 w-4 text-moss mt-0.5 shrink-0" />
                      <span className="text-sm text-clay">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-[4px] border border-stone px-4 py-2.5 text-sm font-medium text-clay/50 cursor-not-allowed"
                  >
                    Current plan
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={!hasStripeCustomer || loading === 'portal'}
                    className="w-full btn-ghost text-sm"
                  >
                    {hasStripeCustomer
                      ? 'Downgrade via billing portal'
                      : 'Not available'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    {loading === plan.id && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="card-elevated p-6 sm:p-8">
        <h3 className="font-display text-lg font-light text-ink mb-4">
          Common questions
        </h3>
        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel anytime?',
              a: "Yes, you can cancel your subscription at any time from the billing portal. You'll retain access until the end of your current billing period.",
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit and debit cards through Stripe, our secure payment processor.',
            },
            {
              q: 'Is there a free trial?',
              a: 'The free tier gives you ongoing access to basic features. Upgrade when you need more.',
            },
            {
              q: 'Can I switch plans?',
              a: 'You can upgrade at any time. To downgrade, use the billing portal and changes take effect at the next billing cycle.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="py-3 border-b border-stone last:border-0"
            >
              <p className="text-sm font-medium text-ink">{item.q}</p>
              <p className="text-sm text-clay/60 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
