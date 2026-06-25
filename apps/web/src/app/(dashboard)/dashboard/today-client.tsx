'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { InsightCard } from '@/components/shared/insight-card';
import { NewThisWeek } from '@/components/shared/new-this-week';
import { type MockActivity } from '@/lib/mock-data';
import { structureFromApproach } from '@/lib/personalisation';
import {
  ArrowRight,
  Shuffle,
  Clock,
  Leaf,
  Sun,
  Cloud,
  CloudRain,
  Feather,
  Sprout,
  ChevronRight,
  Heart,
  Crown,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

interface PlanActivity {
  day: string;
  date: string;
  activity_id: string;
  title: string;
  category: string;
  slug: string;
  duration_minutes: number;
  time_slot: string;
  completed: boolean;
}

interface TodayClientProps {
  activities: MockActivity[];
  season: string;
  greeting: string;
  firstName: string;
  familyName: string;
  county: string;
  childNames: string[];
  isRaining: boolean;
  temperature?: number | null;
  weatherDescription?: string | null;
  streak?: number;
  activitiesThisWeek: number;
  planActivities?: PlanActivity[];
  isFreeUser?: boolean;
  learningPath?: string | null;
  activitiesLogged?: number;
  approach?: string | null;
}

// Reframe chips re-pick the single hero, they do not open a list.
const REFRAMES = [
  { id: 'calm', label: 'Something calmer', Icon: Feather },
  { id: 'quick', label: "We've ten minutes", Icon: Clock },
  { id: 'outdoor', label: 'Out of doors', Icon: Sprout },
  { id: 'rain', label: "It's lashing", Icon: CloudRain },
] as const;

const UPGRADE_PROMPTS = [
  { icon: CalendarDays, text: 'Unlock the weekly planner', description: 'Plan your week with drag-and-drop scheduling.' },
  { icon: Heart, text: 'Save your favourites', description: 'Build a library of activities your family loves.' },
  { icon: Sparkles, text: 'Unlimited suggestions', description: 'Ask The Hedge as many times as you like.' },
  { icon: Crown, text: 'The full library', description: 'Every activity across every category.' },
];

const SEASON_LEAF_SLOTS = 12;

export function TodayClient({
  activities,
  season,
  greeting,
  firstName,
  childNames,
  county,
  isRaining,
  temperature,
  weatherDescription,
  activitiesThisWeek,
  planActivities = [],
  isFreeUser = false,
  learningPath,
  activitiesLogged = 0,
  approach,
}: TodayClientProps) {
  const [reframe, setReframe] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(0);
  const [loggedId, setLoggedId] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  const dayOfWeek = new Date().toLocaleDateString('en-IE', { weekday: 'long' });

  const hasRealPlan = planActivities.length > 0;
  const todayPlanActivities = planActivities.filter((a) => a.day === today && !a.completed);

  // ─── The Thread: one context-aware hero, re-pickable by reframe chips ───
  const pool = useMemo(() => {
    let base = activities;
    if (reframe === 'calm') base = activities.filter((a) => a.energy_level === 'calm');
    else if (reframe === 'quick') base = activities.filter((a) => a.duration_minutes <= 15);
    else if (reframe === 'outdoor') base = activities.filter((a) => ['outdoor', 'both', 'anywhere'].includes(a.location));
    else if (reframe === 'rain') base = activities.filter((a) => ['indoor', 'both', 'anywhere'].includes(a.location));
    else if (isRaining) base = activities.filter((a) => ['indoor', 'both', 'anywhere'].includes(a.location));

    // Lead with activities in season
    return [...base].sort((a, b) => {
      const am = a.season?.includes(season) ? 0 : 1;
      const bm = b.season?.includes(season) ? 0 : 1;
      return am - bm;
    });
  }, [activities, reframe, isRaining, season]);

  const hero = pool.length > 0 ? pool[shuffle % pool.length] : null;
  const heroCat = hero ? CATEGORY_CONFIG[hero.category] || CATEGORY_CONFIG.nature : CATEGORY_CONFIG.nature;

  // The hero is two-faced: planned families hear "today's plan"; emergent
  // families (child-led / relaxed / nature-led) hear an observational thread.
  const emergent = structureFromApproach(approach) < 0.4;
  const firstChild = childNames[0];
  const heroLabel = (() => {
    if (reframe === 'calm') return 'Something gentler';
    if (reframe === 'quick') return 'A quick one';
    if (reframe === 'outdoor') return 'Out in the fresh air';
    if (reframe === 'rain') return emergent ? 'A cosy thread for a wet day' : 'Good for a wet day';
    if (activitiesLogged === 0) return 'A lovely place to start';
    if (emergent) return firstChild ? `A thread ${firstChild} might love` : 'A thread worth pulling';
    if (hasRealPlan) return 'Up next';
    if (greeting === 'Good morning') return 'To start the day';
    if (greeting === 'Good afternoon') return 'For this afternoon';
    return 'A gentle one for this evening';
  })();

  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);
  const moments = activitiesLogged;
  const leavesFilled = Math.min(moments, SEASON_LEAF_SLOTS);

  const showOpenDoor = learningPath === 'considering' || learningPath === 'homeschool';

  const heroId = hero ? (hero as { id?: string }).id ?? null : null;
  const heroLogged = loggedId !== null && loggedId === heroId;

  // One-tap "we did this": no form, just a warm note that quietly keeps the record.
  async function quickLog() {
    if (!hero || logging) return;
    setLogging(true);
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: heroId,
          date: new Date().toISOString().split('T')[0],
          child_ids: [],
          duration_minutes: hero.duration_minutes,
        }),
      });
      setLoggedId(heroId);
    } catch {
      // quietly ignore; the friend never scolds
    }
    setLogging(false);
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl mx-auto">

      {/* ─── Greeting + weather ─── */}
      <header className="pt-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-moss/80">
          {isRaining ? <CloudRain className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          {greeting}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink mt-2 tracking-tight">
          Today with <em className="text-moss italic">{firstName}&apos;s family</em>
        </h1>
        <p className="text-[13px] text-clay mt-2 flex items-center gap-1.5">
          {isRaining ? <CloudRain className="h-3.5 w-3.5 text-sky" /> : <Cloud className="h-3.5 w-3.5 text-sage" />}
          {county} · {dayOfWeek} · {temperature ? `${temperature}°C` : '14°C'}
          {weatherDescription ? `, ${weatherDescription.toLowerCase()}` : isRaining ? ', rain' : ', mixed'}
        </p>
      </header>

      {/* ─── The Thread: one breathing hero ─── */}
      {hero ? (
        <section>
          {/* Reframe chips */}
          <div className="flex gap-2 flex-wrap mb-4">
            {REFRAMES.map(({ id, label, Icon }) => {
              const active = reframe === id;
              return (
                <button
                  key={id}
                  onClick={() => { setReframe(active ? null : id); setShuffle(0); }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                    active
                      ? 'bg-forest text-parchment shadow-sm'
                      : 'bg-linen text-clay hover:bg-stone/30'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Hero card */}
          <div className="rounded-3xl bg-white shadow-sm overflow-hidden border-t-4 border-moss/40">
            <div className="p-7 sm:p-8">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-moss">
                <Leaf className="h-3.5 w-3.5" />
                {heroLabel}
              </span>
              <h2 className="font-display text-3xl sm:text-[2.4rem] leading-tight font-light text-ink mt-3">
                {hero.title}
              </h2>
              <div className="flex items-center gap-3 mt-4 text-[12px] text-clay">
                <span className="inline-flex items-center gap-1 rounded-lg bg-moss/10 px-2.5 py-1 font-semibold text-moss">
                  {heroCat.label}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {hero.duration_minutes} min
                </span>
                {hero.screen_free && <span className="text-sage">screen-free</span>}
              </div>

              {heroLogged ? (
                <div className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-moss/10 px-5 py-3 text-[14px] text-moss font-medium">
                  <Leaf className="h-4 w-4" fill="currentColor" />
                  Lovely, that&apos;s one for the book.
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-7 flex-wrap">
                  <Link
                    href={hero.slug ? `/activity/${hero.slug}` : '/browse'}
                    className="inline-flex items-center gap-2 bg-forest text-parchment font-semibold text-sm rounded-2xl px-6 py-3 hover:bg-forest/90 transition-colors"
                  >
                    Let&apos;s do this
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={quickLog}
                    disabled={logging}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-moss/30 px-4 py-3 text-[13px] font-medium text-moss hover:bg-moss/5 transition-colors disabled:opacity-50"
                  >
                    <Leaf className="h-3.5 w-3.5" />
                    We did this
                  </button>
                  <button
                    onClick={() => setShuffle((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-clay hover:text-ink transition-colors"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    Show me another
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-stone bg-linen/50 p-10 text-center">
          <p className="font-medium text-umber">Nothing to suggest just yet</p>
          <p className="text-[13px] text-clay mt-1 italic">
            {reframe ? 'Nothing matches that right now. Try another, or clear it.' : 'We are adding more ideas all the time.'}
          </p>
          {reframe && (
            <button onClick={() => setReframe(null)} className="btn-secondary mt-4 text-[13px]">
              Show me anything
            </button>
          )}
        </section>
      )}

      {/* ─── Today's plan (homeschool families with a plan) ─── */}
      {hasRealPlan && todayPlanActivities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow">Also on today</span>
            <Link href="/planner" className="btn-ghost text-[12px]">
              Full plan <ArrowRight className="h-3 w-3 inline" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayPlanActivities.slice(0, 3).map((p) => {
              const cat = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.nature;
              const CatIcon = cat.icon;
              return (
                <Link
                  key={`${p.activity_id}-${p.time_slot}`}
                  href={p.slug ? `/activity/${p.slug}` : '/planner'}
                  className="flex items-center gap-3 rounded-xl bg-white border border-stone/40 px-4 py-3 transition-all hover:translate-x-0.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss/10">
                    <CatIcon className="h-4 w-4 text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{p.title}</p>
                    <p className="text-[11px] text-clay">{cat.label} · {p.duration_minutes} min · {p.time_slot}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── A warm note ─── */}
      <InsightCard
        type="today"
        context={{
          children: childNames.map((name) => ({ name })),
          weather: { temperature, isRaining, description: weatherDescription },
          activitiesThisWeek,
          todayActivities: todayPlanActivities.map((a) => ({ title: a.title, category: a.category })),
        }}
      />

      {/* ─── Your season so far: accumulating leaves (not a score) ─── */}
      <Link href="/progress" className="block rounded-2xl bg-sage/8 border border-sage/15 p-5 transition-colors hover:bg-sage/12">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80 mb-2">Your {seasonLabel.toLowerCase()} so far</p>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: SEASON_LEAF_SLOTS }).map((_, i) => (
            <Leaf
              key={i}
              className={`h-4 w-4 ${i < leavesFilled ? 'text-moss' : 'text-sage/25'}`}
              fill={i < leavesFilled ? 'currentColor' : 'none'}
            />
          ))}
          {moments > SEASON_LEAF_SLOTS && (
            <span className="text-[12px] text-moss font-medium ml-1.5">+{moments - SEASON_LEAF_SLOTS}</span>
          )}
        </div>
        <p className="text-[14px] text-umber leading-relaxed">
          {moments === 0
            ? 'Nothing kept yet this season. Your first one is waiting just above.'
            : `You have kept ${moments} ${moments === 1 ? 'moment' : 'moments'} together this ${seasonLabel.toLowerCase()}. Lovely.`}
        </p>
      </Link>

      {/* ─── The open door (considering / homeschool) ─── */}
      {showOpenDoor && (
        <Link
          href={learningPath === 'homeschool' ? '/planner' : '/educator'}
          className="block rounded-2xl border border-moss/20 bg-moss/5 p-5 transition-colors hover:bg-moss/10"
        >
          <p className="text-sm font-semibold text-ink mb-1">
            {learningPath === 'homeschool' ? 'Plan a gentle week' : 'Curious about home education?'}
          </p>
          <p className="text-[13px] text-clay leading-relaxed">
            {learningPath === 'homeschool'
              ? 'Build a calm, curriculum-aligned rhythm for your family, your way.'
              : 'No decision today. Just see what it could look like, at your own pace.'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-moss mt-3">
            {learningPath === 'homeschool' ? 'Open the planner' : 'Have a look'}
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {/* ─── Upgrade (free users, quiet) ─── */}
      {isFreeUser && (() => {
        const prompt = UPGRADE_PROMPTS[new Date().getDay() % UPGRADE_PROMPTS.length];
        const PromptIcon = prompt.icon;
        return (
          <Link
            href="/settings/billing"
            className="flex items-center gap-4 rounded-2xl border border-stone/50 bg-white p-4 hover:border-amber/40 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/10">
              <PromptIcon className="h-5 w-5 text-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink">{prompt.text}</p>
              <p className="text-[12px] text-clay/70 mt-0.5">{prompt.description}</p>
            </div>
            <span className="text-[11px] font-bold text-amber shrink-0 group-hover:underline">See plans</span>
          </Link>
        );
      })()}

      {/* ─── A few more ideas (real, gentle) ─── */}
      <NewThisWeek />

      <div className="text-center pt-2">
        <Link href="/browse" className="btn-ghost text-[13px]">
          Browse all ideas <ArrowRight className="h-3.5 w-3.5 inline" />
        </Link>
      </div>
    </div>
  );
}
