'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, Sparkles, Sunrise, ArrowRight } from 'lucide-react';
import { KitchenTableClient } from '@/app/(dashboard)/kitchen-table/kitchen-table-client';

const STEPS = [
  {
    icon: MessageCircle,
    title: 'A warm chat',
    body: 'A few gentle questions, about two minutes. There are no wrong answers, and you can say as much or as little as you like.',
  },
  {
    icon: Sparkles,
    title: 'Your Family Framework',
    body: 'We write your family its own page and read it back to you, so you can see we have understood.',
  },
  {
    icon: Sunrise,
    title: 'Your first day',
    body: 'From there, The Hedge brings you daily ideas that fit, a gentle weekly rhythm, and a record that quietly keeps itself.',
  },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeFlow({ name }: { name?: string | null }) {
  const [started, setStarted] = useState(false);
  const firstName = useMemo(() => (name || '').trim().split(/\s+/)[0] || '', [name]);
  const hello = useMemo(() => greeting(), []);

  if (started) {
    // Skip the Kitchen Table's own intro screen - this welcome already served
    // as the threshold - and go straight to the first question.
    return <KitchenTableClient initialStep={1} />;
  }

  return (
    <div className="mx-auto max-w-xl pb-16 pt-6 animate-scale-in">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          {hello}{firstName ? `, ${firstName}` : ''}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
          Welcome to The Hedge.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-clay">
          Most apps would hand you a list of activities right now. We do something
          different. Before anything else, we sit down with you at the Kitchen
          Table and get to know your family, the way your days run, and what you
          are hoping for.
        </p>
      </div>

      <div className="mt-9 rounded-2xl border border-stone bg-parchment/40 p-6 sm:p-7">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.1em] text-umber">
          How the next few minutes go
        </p>
        <ol className="space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-moss/12 text-moss">
                    <Icon className="h-5 w-5" />
                  </span>
                  {i < STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-stone" />}
                </div>
                <div className="pb-1">
                  <div className="font-display text-lg font-semibold text-ink">{s.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-clay">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => setStarted(true)}
          className="btn-primary mx-auto h-12 justify-center px-7 text-sm"
        >
          Pull up a chair
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-xs text-clay/70">
          This is the only setup. After this, The Hedge comes to you.
        </p>
      </div>
    </div>
  );
}
