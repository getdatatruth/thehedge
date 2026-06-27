'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Sprout,
  Sun,
  Sparkles,
  GraduationCap,
  BookHeart,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'hedge_walkthrough_seen_v1';

const STEPS = [
  {
    Icon: Sprout,
    eyebrow: 'Welcome to The Hedge',
    title: 'Learning that feels like a breath, not a battle',
    body: "This is a calm home for your family's learning, your way. No scores, no streaks, no pressure. Let me show you around.",
  },
  {
    Icon: Sun,
    eyebrow: 'Today',
    title: 'One gentle idea a day, shaped around your children',
    body: "Every day, a lovely thing to do, matched to your children's ages and what they love. Never a timetable. Just a good idea when you want one.",
  },
  {
    Icon: Sparkles,
    eyebrow: 'Follow the spark',
    title: "Whatever they're curious about, we make it count",
    body: "Mad about volcanoes this morning? Tell me and I'll shape a real, screen-free activity around it in seconds. Following your child is the whole point.",
  },
  {
    Icon: GraduationCap,
    eyebrow: 'Quietly underpinned',
    title: 'Tied to Aistear and the curriculum, honestly',
    body: "Behind every activity sits the real curriculum, Aistear for the early years and the primary curriculum after. So child-led still counts, and I'll always be honest about Tusla and AEARS.",
  },
  {
    Icon: BookHeart,
    eyebrow: 'The record keeps itself',
    title: 'A portfolio that builds as you live',
    body: 'Mark "we did this" and it lands in your child\'s portfolio, already tied to the outcomes it touched. Real evidence for a Tusla review, with no data entry. And I keep a light eye on balance.',
  },
  {
    Icon: ShieldCheck,
    eyebrow: 'Yours, and private',
    title: "Your family's information stays your family's",
    body: 'Everything here is private to you, stored in the EU, and never used to train anything or to help any other family. This is your hedge school. Let\'s begin.',
  },
];

export function FirstRunWalkthrough() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const last = index === STEPS.length - 1;

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') setOpen(true);
    } catch {
      // storage unavailable: do not nag
    }
    // Allow replay from anywhere (e.g. a Settings link) via a custom event.
    const reopen = () => { setIndex(0); setOpen(true); };
    window.addEventListener('hedge:start-walkthrough', reopen);
    return () => window.removeEventListener('hedge:start-walkthrough', reopen);
  }, []);

  const finish = useCallback(() => {
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setOpen(false);
  }, []);

  if (!open) return null;

  const step = STEPS[index];
  const Icon = step.Icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-parchment animate-fade-up">
      {/* Top bar: progress + skip */}
      <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-forest' : 'w-1.5 bg-stone'}`}
            />
          ))}
        </div>
        <button
          onClick={finish}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-clay transition-colors hover:text-ink"
        >
          Skip <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-moss/10">
          <Icon className="h-11 w-11 text-forest" strokeWidth={1.6} />
        </div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-forest">{step.eyebrow}</p>
        <h2 className="mb-4 max-w-xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">{step.title}</h2>
        <p className="max-w-md text-[15px] leading-relaxed text-clay sm:text-base">{step.body}</p>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-md px-6 pb-10">
        <button
          onClick={() => (last ? finish() : setIndex((i) => i + 1))}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-4 text-base font-semibold text-parchment transition-colors hover:bg-forest/90"
        >
          {last ? 'Start exploring' : 'Next'} <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
