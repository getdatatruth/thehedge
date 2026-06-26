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
    <div className="mx-auto w-full max-w-xl px-1 pb-10 pt-1 animate-scale-in sm:pt-5">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-moss sm:text-sm">
          {hello}{firstName ? `, ${firstName}` : ''}
        </p>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-tight text-ink sm:mt-3 sm:text-4xl">
          Welcome to The Hedge.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-clay sm:mt-4 sm:text-[15px]">
          Most apps would hand you a list of activities right now. We do something
          different. Before anything else, we sit down with you at the Kitchen
          Table and get to know your family, the way your days run, and what you
          are hoping for.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-stone bg-parchment/40 p-5 sm:mt-8 sm:p-7">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-umber sm:mb-5">
          How the next few minutes go
        </p>
        <ol className="space-y-4 sm:space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex gap-3.5 sm:gap-4">
                <div className="relative flex flex-col items-center">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-moss/12 text-moss sm:h-10 sm:w-10">
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  </span>
                  {i < STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-stone" />}
                </div>
                <div className="pb-0.5">
                  <div className="font-display text-base font-semibold text-ink sm:text-lg">{s.title}</div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-clay sm:mt-1 sm:text-sm">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 text-center sm:mt-8">
        <button
          onClick={() => setStarted(true)}
          className="btn-primary mx-auto h-12 w-full justify-center px-7 text-sm sm:w-auto"
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
