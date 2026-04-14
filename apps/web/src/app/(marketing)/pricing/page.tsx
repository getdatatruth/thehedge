import Link from 'next/link';
import { Check, X, TreePine, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Pricing - The Hedge',
};

const TIERS = [
  {
    name: 'Free',
    price: '0',
    description: 'Try The Hedge with your family.',
    cta: 'Get started free',
    ctaStyle: 'btn-secondary',
    features: [
      { text: 'Browse non-premium activities', included: true },
      { text: '5 AI suggestions per week', included: true },
      { text: 'Activity logging & timeline', included: true },
      { text: 'Up to 5 favourites', included: true },
      { text: 'Weekly plans', included: false },
      { text: 'Unlimited favourites', included: false },
      { text: 'Child progress tracking', included: false },
      { text: 'Educator tools', included: false },
      { text: 'Tusla compliance reports', included: false },
    ],
  },
  {
    name: 'Family',
    price: '9.99',
    description: 'Full access for active families.',
    cta: 'Start 14-day free trial',
    ctaStyle: 'btn-primary',
    popular: true,
    features: [
      { text: 'All activities (200+)', included: true },
      { text: '30 AI suggestions per week', included: true },
      { text: 'Activity logging & timeline', included: true },
      { text: 'Unlimited favourites', included: true },
      { text: 'Personalised weekly plans', included: true },
      { text: 'Child progress & achievements', included: true },
      { text: 'Portfolio per child', included: true },
      { text: 'Educator tools', included: false },
      { text: 'Tusla compliance reports', included: false },
    ],
  },
  {
    name: 'Educator',
    price: '19.99',
    description: 'The complete homeschool OS.',
    cta: 'Start 14-day free trial',
    ctaStyle: 'btn-primary',
    features: [
      { text: 'Everything in Family, plus:', included: true },
      { text: 'Unlimited AI suggestions', included: true },
      { text: 'Curriculum planning (Irish Primary)', included: true },
      { text: 'Daily schedule builder', included: true },
      { text: 'Tusla compliance dashboard', included: true },
      { text: 'Downloadable PDF reports', included: true },
      { text: 'Portfolio with curriculum tagging', included: true },
      { text: 'Attendance tracking', included: true },
      { text: 'Year-at-a-glance view', included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen mesh-gradient-hero">
      {/* Nav */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-forest">
              <TreePine className="h-4 w-4 text-sage" />
            </div>
            <span className="font-display text-lg font-bold text-forest">The Hedge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-clay/60 hover:text-forest transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Get started
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl text-center px-4 pt-12 pb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="text-clay/70 mt-4 font-serif text-lg max-w-xl mx-auto">
          Start free, upgrade when you&apos;re ready. No hidden fees, no lock-in. Cancel anytime.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl bg-parchment p-6 ${
                tier.popular
                  ? 'ring-2 ring-moss shadow-xl shadow-forest/10'
                  : 'border border-stone'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded bg-moss px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-forest">{tier.name}</h3>
                <p className="text-xs text-clay/50 mt-1">{tier.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display text-forest">&euro;{tier.price}</span>
                  {tier.price !== '0' && (
                    <span className="text-sm text-clay/40">/month</span>
                  )}
                </div>
              </div>

              <button className={`w-full justify-center h-11 mb-6 ${tier.ctaStyle}`}>
                {tier.cta}
              </button>

              <div className="space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature.text} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/10 mt-0.5">
                        <Check className="h-3 w-3 text-moss" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linen mt-0.5">
                        <X className="h-3 w-3 text-clay/30" />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-clay/70' : 'text-clay/30'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-forest text-center mb-8">
            Common questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans?', a: 'Yes, upgrade or downgrade anytime. Changes take effect immediately.' },
              { q: 'Is there a contract?', a: 'No contracts. Cancel anytime with one click. No questions asked.' },
              { q: 'What happens when my trial ends?', a: 'You\'ll be moved to the Free plan automatically. No surprise charges.' },
              { q: 'Do you offer family discounts?', a: 'Each plan covers your entire family - unlimited children, one price.' },
              { q: 'Is my data safe?', a: 'We use Supabase (EU region) for all data storage. Your data stays in the EU and is encrypted.' },
            ].map((faq) => (
              <div key={faq.q} className="card-elevated p-5">
                <h3 className="text-sm font-semibold text-forest">{faq.q}</h3>
                <p className="text-sm text-clay/60 mt-1.5 font-serif">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
