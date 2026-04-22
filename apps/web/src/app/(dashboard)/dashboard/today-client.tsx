'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ActivityCard, CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { FilterChips } from '@/components/shared/filter-chips';
import { InsightCard } from '@/components/shared/insight-card';
import { MilestoneCard } from '@/components/shared/milestone-card';
import { NewThisWeek } from '@/components/shared/new-this-week';
import {
  MOCK_ACTIVITIES,
  MOCK_COLLECTIONS,
  type MockActivity,
} from '@/lib/mock-data';
import {
  ChevronRight,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  CloudRain,
  Sun,
  Cloud,
  Crown,
  Heart,
  CalendarDays,
  Shuffle,
  Clock,
  Calendar,
} from 'lucide-react';

const FILTERS = [
  { label: '15 min', value: 'dur:15' },
  { label: '30 min', value: 'dur:30' },
  { label: '1 hour', value: 'dur:60' },
  { label: 'Indoor', value: 'loc:indoor' },
  { label: 'Outdoor', value: 'loc:outdoor' },
  { label: 'Calm', value: 'energy:calm' },
  { label: 'Active', value: 'energy:active' },
  { label: 'No mess', value: 'mess:none' },
  { label: 'Screen-free', value: 'screen:true' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  streak: number;
  activitiesThisWeek: number;
  planActivities?: PlanActivity[];
  isFreeUser?: boolean;
  learningPath?: string | null;
  activitiesLogged?: number;
}

const UPGRADE_PROMPTS = [
  { icon: CalendarDays, text: 'Unlock the weekly planner', description: 'Plan your week with drag-and-drop scheduling.' },
  { icon: Heart, text: 'Save your favourites', description: 'Build a library of activities your family loves.' },
  { icon: Sparkles, text: 'Unlimited AI suggestions', description: 'Ask HedgeAI as many times as you like.' },
  { icon: Crown, text: 'Access all 700+ activities', description: 'Including premium content across every category.' },
];

export function TodayClient({
  activities,
  season,
  greeting,
  firstName,
  familyName,
  county,
  childNames,
  isRaining,
  temperature,
  weatherDescription,
  streak,
  activitiesThisWeek,
  planActivities = [],
  isFreeUser = false,
  learningPath,
  activitiesLogged = 0,
}: TodayClientProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [heroShuffleIndex, setHeroShuffleIndex] = useState(0);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayIndex = new Date().getDay();
  const today = dayNames[currentDayIndex];

  // Use real plan data if available, otherwise empty
  const hasRealPlan = planActivities.length > 0;
  const todayPlanActivities = planActivities.filter((a) => a.day === today);
  const completedToday = todayPlanActivities.filter((a) => a.completed).length;

  const newActivities = MOCK_ACTIVITIES.filter((a) => a.is_new);
  const featuredCollections = MOCK_COLLECTIONS.filter((c) => c.featured);

  // Hero recommendation: pick from plan or activities pool
  const heroPool = useMemo(() => {
    if (isRaining && todayPlanActivities.length > 0) {
      // When raining, prioritise indoor plan activities
      const indoor = todayPlanActivities.filter((a) => {
        const match = activities.find((act) => act.id === a.activity_id || act.slug === a.slug);
        return !match || match.location === 'indoor' || match.location === 'both' || match.location === 'anywhere';
      });
      if (indoor.length > 0) return indoor;
    }
    if (todayPlanActivities.length > 0) {
      return todayPlanActivities.filter((a) => !a.completed);
    }
    return activities.slice(0, 10);
  }, [isRaining, todayPlanActivities, activities]);

  const heroActivity = heroPool.length > 0
    ? heroPool[heroShuffleIndex % heroPool.length]
    : null;

  const heroLabel = activitiesLogged === 0
    ? 'Start here'
    : isRaining
      ? 'Perfect for a rainy day'
      : hasRealPlan
        ? 'Up next'
        : 'Try this today';

  // Resolve hero details - could be PlanActivity or MockActivity
  const heroIsPlan = heroActivity && 'time_slot' in heroActivity;
  const heroTitle = heroActivity
    ? heroIsPlan
      ? (heroActivity as PlanActivity).title
      : (heroActivity as MockActivity).title
    : null;
  const heroCategory = heroActivity
    ? heroIsPlan
      ? (heroActivity as PlanActivity).category
      : (heroActivity as MockActivity).category
    : 'nature';
  const heroDuration = heroActivity
    ? heroIsPlan
      ? (heroActivity as PlanActivity).duration_minutes
      : (heroActivity as MockActivity).duration_minutes
    : 30;
  const heroSlug = heroActivity
    ? heroIsPlan
      ? (heroActivity as PlanActivity).slug
      : (heroActivity as MockActivity).slug
    : '';
  const heroCatConfig = CATEGORY_CONFIG[heroCategory] || CATEGORY_CONFIG.nature;

  const filtered = useMemo(() => {
    let result = [...activities];
    result.sort((a, b) => {
      const aMatch = a.season?.includes(season) ? 0 : 1;
      const bMatch = b.season?.includes(season) ? 0 : 1;
      return aMatch - bMatch;
    });
    for (const filter of activeFilters) {
      const [type, value] = filter.split(':');
      switch (type) {
        case 'dur':
          result = result.filter((a) => a.duration_minutes <= parseInt(value));
          break;
        case 'loc':
          result = result.filter(
            (a) => a.location === value || a.location === 'both' || a.location === 'anywhere'
          );
          break;
        case 'energy':
          result = result.filter((a) => a.energy_level === value);
          break;
        case 'mess':
          result = result.filter((a) => a.mess_level === value);
          break;
        case 'screen':
          result = result.filter((a) => a.screen_free === true);
          break;
      }
    }
    return result;
  }, [activities, activeFilters, season]);

  const dayOfWeek = new Date().toLocaleDateString('en-IE', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-10 animate-fade-up">

      {/* ─── Morning Brief Card ─── */}
      <div className="rounded-2xl bg-forest overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-parchment/8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded bg-fern/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mist">
              <Sun className="h-3 w-3" />
              {greeting}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light text-parchment tracking-tight">
            Today for <em className="text-sage italic">{firstName}&apos;s family</em>
          </h1>
        </div>

        {/* Weather bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-forest/60 border-b border-parchment/6">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-sage/70">{county} · {dayOfWeek}</span>
          <span className="font-display text-base font-light text-parchment flex items-center gap-2">
            {isRaining ? <CloudRain className="h-4 w-4 text-sky" /> : <Cloud className="h-4 w-4 text-sage" />}
            {temperature ? `${temperature}°C` : '14°C'} · {weatherDescription || (isRaining ? 'Rain' : 'Mixed')}
          </span>
        </div>

        {/* Today's planned activities */}
        <div className="px-6 py-4 space-y-2">
          {todayPlanActivities.length > 0 ? (
            todayPlanActivities.slice(0, 3).map((planItem) => {
              const cat = CATEGORY_CONFIG[planItem.category] || CATEGORY_CONFIG.nature;
              const CatIcon = cat.icon;
              const rowColor = planItem.category === 'nature' || planItem.category === 'movement'
                ? 'bg-sage/8 border-sage/12'
                : planItem.category === 'science' || planItem.category === 'kitchen'
                  ? 'bg-terracotta/8 border-terracotta/12'
                  : 'bg-parchment/5 border-parchment/8';

              const href = planItem.slug
                ? `/activity/${planItem.slug}`
                : '/planner';

              return (
                <Link
                  key={`${planItem.activity_id}-${planItem.time_slot}`}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all hover:translate-x-1 ${rowColor} ${planItem.completed ? 'opacity-50' : ''}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    planItem.category === 'nature' || planItem.category === 'movement'
                      ? 'bg-sage/20'
                      : planItem.category === 'science' || planItem.category === 'kitchen'
                        ? 'bg-terracotta/20'
                        : 'bg-parchment/10'
                  }`}>
                    <CatIcon className="h-4 w-4 text-parchment/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium text-parchment ${planItem.completed ? 'line-through' : ''}`}>
                      {planItem.title}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="tag bg-parchment/8 text-sage text-[8px]">{cat.label}</span>
                      <span className="tag bg-parchment/8 text-sage text-[8px]">{planItem.duration_minutes}m</span>
                      <span className="tag bg-parchment/8 text-sage text-[8px]">{planItem.time_slot}</span>
                    </div>
                  </div>
                  {planItem.completed && (
                    <span className="text-sage text-[10px] font-bold uppercase tracking-wider">Done</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-parchment/20 shrink-0" />
                </Link>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-sage/60 text-sm italic">No plan for today yet.</p>
              <Link href="/planner" className="btn-light text-[12px] mt-3 py-2 px-4">
                Generate a plan <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-3 border-t border-parchment/8 flex items-center justify-between">
          <span className="text-[11px] text-sage/50 font-medium">
            {completedToday}/{todayPlanActivities.length} done today
          </span>
          <Link href="/planner" className="btn-terra text-[11px] py-1.5 px-3">
            View full plan <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ─── Hero Recommendation Card ─── */}
      {heroActivity && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-l-cat-nature">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-cat-nature">
              <Sparkles className="h-3 w-3 inline mr-1" />
              {heroLabel}
            </span>
            <button
              onClick={() => setHeroShuffleIndex((i) => i + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-parchment hover:bg-stone/20 transition-colors"
              aria-label="Shuffle recommendation"
            >
              <Shuffle className="h-4 w-4 text-clay" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-umber mb-2">{heroTitle}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 rounded-lg bg-cat-nature/10 px-2 py-1 text-[11px] font-semibold text-cat-nature">
              {heroCatConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-clay">
              <Clock className="h-3 w-3" />
              {heroDuration} min
            </span>
          </div>
          <Link
            href={heroSlug ? `/activity/${heroSlug}` : '/browse'}
            className="inline-flex items-center gap-2 bg-cat-nature text-white font-semibold text-sm rounded-2xl px-5 py-2.5 hover:bg-cat-nature/90 transition-colors"
          >
            Let&apos;s do this
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ─── Guided Pathway (new users) ─── */}
      {activitiesLogged === 0 && (
        <div className="bg-cat-nature/5 border border-cat-nature/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cat-nature/15 mt-0.5">
              <Zap className="h-4 w-4 text-cat-nature" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-umber mb-1">
                {learningPath === 'homeschool'
                  ? 'Ready to plan your first week?'
                  : learningPath === 'considering'
                    ? 'Exploring homeschooling?'
                    : 'Welcome to The Hedge!'}
              </p>
              <p className="text-[13px] text-clay leading-relaxed mb-3">
                {learningPath === 'homeschool'
                  ? 'Generate your first weekly plan and get a structured, curriculum-aligned schedule for your family.'
                  : learningPath === 'considering'
                    ? 'Try a few activities this week to see how homeschooling feels. No commitment needed.'
                    : 'Pick an activity above and try it with your kids. It only takes 15 minutes to get started.'}
              </p>
              <Link
                href={learningPath === 'homeschool' ? '/planner' : '/browse'}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cat-nature hover:text-cat-nature/80 transition-colors"
              >
                {learningPath === 'homeschool' ? (
                  <>
                    <Calendar className="h-4 w-4" />
                    Generate your first weekly plan
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Browse activities
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}

      <InsightCard
        type="today"
        context={{
          children: childNames.map(name => ({ name })),
          weather: { temperature, isRaining, description: weatherDescription },
          streak,
          activitiesThisWeek,
          todayActivities: todayPlanActivities.map(a => ({ title: a.title, category: a.category })),
          categoryBreakdown: todayPlanActivities.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {} as Record<string, number>),
        }}
      />

      {/* TODO: Wire MilestoneCard here once milestone API data is available */}
      {/* <MilestoneCard milestone={milestone} onClick={() => {}} /> */}

      {/* ─── Child Selector ─── */}
      {childNames.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedChild(null)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
              !selectedChild
                ? 'bg-forest text-parchment shadow-sm'
                : 'bg-linen text-clay hover:bg-stone/30'
            }`}
          >
            All
          </button>
          {childNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedChild(name)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                selectedChild === name
                  ? 'bg-forest text-parchment shadow-sm'
                  : 'bg-linen text-clay hover:bg-stone/30'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat text-center">
          <p className="font-display text-3xl font-light text-ink">{streak}</p>
          <p className="text-[11px] text-clay font-medium mt-1">day streak</p>
        </div>
        <Link href="/progress" className="stat text-center hover:border-moss/30 transition-all cursor-pointer">
          <p className="font-display text-3xl font-light text-ink">0</p>
          <p className="text-[11px] text-clay font-medium mt-1">badges earned</p>
        </Link>
        <div className="stat text-center">
          <p className="font-display text-3xl font-light text-ink">{activitiesThisWeek}</p>
          <p className="text-[11px] text-clay font-medium mt-1">this week</p>
        </div>
      </div>

      {/* ─── Upgrade card (free users) ─── */}
      {isFreeUser && (() => {
        // Rotate through prompts based on day of week
        const prompt = UPGRADE_PROMPTS[new Date().getDay() % UPGRADE_PROMPTS.length];
        const PromptIcon = prompt.icon;
        return (
          <Link
            href="/settings/billing"
            className="card-elevated flex items-center gap-4 p-5 border-l-4 border-l-amber/40 hover:border-l-amber transition-all group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber/10">
              <PromptIcon className="h-5 w-5 text-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{prompt.text}</p>
              <p className="text-[12px] text-clay/60 mt-0.5">{prompt.description}</p>
            </div>
            <span className="text-[11px] font-bold text-amber shrink-0 group-hover:underline">
              See plans
            </span>
          </Link>
        );
      })()}

      {/* ─── Week Preview ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="eyebrow">This week</div>
          <Link href="/planner" className="btn-ghost text-[12px]">
            Full planner <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </div>
        <div className="card-elevated p-5">
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => {
              // Map DAYS (Mon=0, Tue=1, ...) to dayNames index for lookup
              const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              const dayFullName = fullDayNames[i];
              const isCurrentDay = day === dayAbbrevs[currentDayIndex];
              const dayActivities = planActivities.filter(
                (a) => a.day === dayFullName
              );
              const completed = dayActivities.filter((a) => a.completed).length;

              return (
                <div key={day} className="text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    isCurrentDay ? 'text-terracotta' : 'text-clay/50'
                  }`}>
                    {day}
                  </p>
                  <div className={`rounded-lg p-2 min-h-[60px] flex flex-col items-center justify-center gap-1 ${
                    isCurrentDay
                      ? 'bg-forest text-parchment'
                      : dayActivities.length > 0 && completed === dayActivities.length
                        ? 'bg-sage/15'
                        : 'bg-linen/50'
                  }`}>
                    <p className={`font-display text-lg font-light ${isCurrentDay ? 'text-parchment' : 'text-ink'}`}>
                      {dayActivities.length}
                    </p>
                    {dayActivities.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayActivities.slice(0, 3).map((a, j) => (
                          <div
                            key={j}
                            className={`h-1 w-1 rounded-full ${
                              a.completed
                                ? isCurrentDay ? 'bg-sage' : 'bg-moss'
                                : isCurrentDay ? 'bg-parchment/30' : 'bg-stone'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary below week grid */}
          {hasRealPlan && (
            <div className="mt-4 pt-3 border-t border-stone/20 flex items-center justify-between">
              <span className="text-[11px] text-clay/60">
                {planActivities.filter((a) => a.completed).length} of{' '}
                {planActivities.length} activities completed this week
              </span>
              <span className="text-[12px] font-bold text-moss">
                {planActivities.length > 0
                  ? Math.round(
                      (planActivities.filter((a) => a.completed).length /
                        planActivities.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="flex gap-3">
        <Link href="/browse?dur=15" className="btn-terra flex-1 justify-center py-3">
          <Zap className="h-4 w-4" />
          Quick activity
        </Link>
        <Link href="/chat" className="btn-primary flex-1 justify-center py-3">
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Link>
        <Link href="/planner" className="btn-secondary flex-1 justify-center py-3">
          <Target className="h-4 w-4" />
          View plan
        </Link>
      </div>

      {/* ─── New This Week ─── */}
      {newActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="eyebrow">New this week</div>
            <span className="tag tag-terra">{newActivities.length} added</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible scrollbar-none">
            {newActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="min-w-[280px] sm:min-w-0">
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Collections ─── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="eyebrow">Collections for you</div>
          <Link href="/browse?tab=collections" className="btn-ghost text-[12px]">
            View all <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/browse?collection=${collection.slug}`}
              className="card-interactive p-5 flex items-center gap-4 group"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{collection.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-ink">{collection.title}</p>
                <p className="text-[12px] text-clay">{collection.activity_ids.length} activities</p>
              </div>
              <ChevronRight className="h-4 w-4 text-stone transition-all group-hover:text-terracotta group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* ─── New This Week (from API) ─── */}
      <NewThisWeek />

      {/* ─── Explore Section ─── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-ink">
            Today&apos;s <em className="text-moss italic">ideas</em>
          </h2>
          <span className="text-[11px] font-bold text-clay/50 uppercase tracking-wider">
            {filtered.length} activities
          </span>
        </div>

        <FilterChips filters={FILTERS} active={activeFilters} onChange={setActiveFilters} />

        <div className="mt-5">
          {filtered.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
              <div className="text-center">
                <p className="font-medium text-umber">No activities match your filters</p>
                <p className="text-[13px] text-clay mt-1 italic">Try removing some filters to see more ideas.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {filtered.slice(0, 6).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
              {filtered.length > 6 && (
                <div className="text-center mt-6">
                  <Link href="/browse" className="btn-secondary">
                    Browse all {filtered.length} activities
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
