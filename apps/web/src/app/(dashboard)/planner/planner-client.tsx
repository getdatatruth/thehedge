'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Sparkles,
  RefreshCw,
  BookOpen,
  Shuffle,
  X,
  Loader2,
  TreePine,
  Zap,
  Plus,
  Search,
  Printer,
  Sun,
  Sunrise,
  Moon,
  BarChart3,
  Trash2,
  Leaf,
  Snowflake,
  Flower2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  interests: string[];
  school_status: string;
}

interface PlanBlock {
  time: string;
  subject: string;
  activity_id?: string;
  title: string;
  duration: number;
  notes?: string;
  completed: boolean;
  outcome_ids?: string[];
}

interface DailyPlan {
  id: string;
  education_plan_id: string;
  child_id: string;
  date: string;
  blocks: PlanBlock[];
  status: string;
  attendance_logged: boolean;
}

interface Activity {
  id: string;
  title: string;
  slug?: string;
  category: string;
  duration_minutes: number;
  age_min: number;
  age_max: number;
  description: string;
  season?: string[];
  weather?: string[];
  location?: string;
}

interface PlannerClientProps {
  children: Child[];
  weeklyPlans: DailyPlan[];
  activities: Activity[];
  weekStart: string;
  weekEnd: string;
  weekOffset: number;
  familyName: string;
  weatherCondition?: string;
  temperature?: number | null;
}

// ─── Constants ──────────────────────────────────────────

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', time: '09:00', icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon', time: '14:00', icon: Sun },
  { key: 'evening', label: 'Evening', time: '18:00', icon: Moon },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  nature: 'bg-moss/15 text-moss border-moss/20',
  science: 'bg-[#5B9BD5]/15 text-[#5B9BD5] border-[#5B9BD5]/20',
  kitchen: 'bg-amber/15 text-amber border-amber/20',
  art: 'bg-[#8B3A62]/15 text-[#8B3A62] border-[#8B3A62]/20',
  movement: 'bg-terracotta/15 text-terracotta border-terracotta/20',
  literacy: 'bg-forest/15 text-forest border-forest/20',
  maths: 'bg-amber/15 text-amber border-amber/20',
  life_skills: 'bg-umber/15 text-umber border-umber/20',
  calm: 'bg-sage/15 text-sage border-sage/20',
  social: 'bg-fern/15 text-fern border-fern/20',
};

const CATEGORY_LABELS: Record<string, string> = {
  nature: 'Nature',
  science: 'Science',
  kitchen: 'Kitchen',
  art: 'Art',
  movement: 'Movement',
  literacy: 'Literacy',
  maths: 'Maths',
  life_skills: 'Life Skills',
  calm: 'Calm',
  social: 'Social',
};

const SUBJECT_MAP: Record<string, string> = {
  nature: 'SESE',
  science: 'SESE',
  kitchen: 'Life Skills',
  art: 'Arts',
  movement: 'PE',
  literacy: 'Language',
  maths: 'Mathematics',
  life_skills: 'SPHE',
  calm: 'Wellbeing',
  social: 'SPHE',
};

// ─── Helpers ────────────────────────────────────────────

function getWeekDates(startDate: string): string[] {
  const d = new Date(startDate + 'T00:00:00');
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    dates.push(day.toISOString().split('T')[0]);
  }
  return dates;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split('T')[0];
}

function getChildAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function getTimeSlot(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getSeasonIcon() {
  const s = getSeason();
  switch (s) {
    case 'spring':
      return Flower2;
    case 'summer':
      return Sun;
    case 'autumn':
      return Leaf;
    case 'winter':
      return Snowflake;
    default:
      return Sun;
  }
}

// ─── Component ──────────────────────────────────────────

export function PlannerClient({
  children: childrenProp,
  weeklyPlans,
  activities,
  weekStart,
  weekOffset,
  familyName,
  weatherCondition,
}: PlannerClientProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>(
    childrenProp[0]?.id || ''
  );
  const [swapState, setSwapState] = useState<{
    planId: string;
    blockIndex: number;
    category: string;
  } | null>(null);
  const [updatingBlock, setUpdatingBlock] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<{
    date: string;
    slot: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Filter plans for the selected child
  const childPlans = useMemo(
    () => weeklyPlans.filter((p) => p.child_id === selectedChild),
    [weeklyPlans, selectedChild]
  );

  // Map plans by date for quick lookup
  const plansByDate = useMemo(() => {
    const map: Record<string, DailyPlan> = {};
    for (const plan of childPlans) {
      map[plan.date] = plan;
    }
    return map;
  }, [childPlans]);

  const hasPlans = childPlans.length > 0;

  // Build activity lookup by ID
  const activityById = useMemo(() => {
    const map: Record<string, Activity> = {};
    for (const a of activities) {
      map[a.id] = a;
    }
    return map;
  }, [activities]);

  // Stats
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;
    const categoryBreakdown: Record<string, { total: number; completed: number }> = {};

    for (const plan of childPlans) {
      for (const block of plan.blocks) {
        total++;
        totalMinutes += block.duration;
        const activity = block.activity_id ? activityById[block.activity_id] : null;
        const cat = activity?.category || 'other';
        if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, completed: 0 };
        categoryBreakdown[cat].total++;

        if (block.completed) {
          completed++;
          completedMinutes += block.duration;
          categoryBreakdown[cat].completed++;
        }
      }
    }
    return { total, completed, totalMinutes, completedMinutes, categoryBreakdown };
  }, [childPlans, activityById]);

  // Selected child info
  const selectedChildObj = childrenProp.find((c) => c.id === selectedChild);
  const selectedChildName = selectedChildObj?.name || '';
  const selectedChildAge = selectedChildObj
    ? getChildAge(selectedChildObj.date_of_birth)
    : 0;

  const weekLabel =
    weekOffset === 0
      ? 'This week'
      : weekOffset === -1
        ? 'Last week'
        : weekOffset === 1
          ? 'Next week'
          : weekOffset > 0
            ? `+${weekOffset} weeks`
            : `${weekOffset} weeks`;

  const navigateWeek = useCallback(
    (direction: -1 | 1) => {
      const newOffset = weekOffset + direction;
      router.push(`/planner?week=${newOffset}`);
    },
    [weekOffset, router]
  );

  // ─── Auto-suggestions ────────────────────────────────

  const suggestions = useMemo(() => {
    const season = getSeason();
    const isRainy = weatherCondition === 'rain' || weatherCondition === 'drizzle';
    const childAge = selectedChildAge;

    let suitable = activities.filter(
      (a) => a.age_min <= childAge && a.age_max >= childAge
    );

    // Score by relevance
    const scored = suitable.map((a) => {
      let score = 0;
      // Season match
      if (a.season?.includes(season)) score += 3;
      if (a.season?.includes('all')) score += 1;
      // Weather match
      if (isRainy && (a.location === 'indoor' || a.location === 'both')) score += 2;
      if (!isRainy && (a.location === 'outdoor' || a.location === 'both')) score += 1;
      // Interest match
      if (selectedChildObj?.interests?.includes(a.category)) score += 2;
      // Not already in plan
      const alreadyPlanned = childPlans.some((p) =>
        p.blocks.some((b) => b.activity_id === a.id)
      );
      if (!alreadyPlanned) score += 2;
      return { activity: a, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6);
  }, [activities, selectedChildAge, selectedChildObj, weatherCondition, childPlans]);

  // ─── Search ────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return activities
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery, activities]);

  // ─── Actions ────────────────────────────────────────

  const generatePlan = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekOffset }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to generate plan. Please try again.');
        return;
      }

      router.refresh();
    } catch {
      setError(
        'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [router, weekOffset]);

  const toggleComplete = useCallback(
    async (planId: string, blockIndex: number, currentCompleted: boolean) => {
      const key = `${planId}-${blockIndex}`;
      setUpdatingBlock(key);
      try {
        const res = await fetch('/api/planner', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            blockIndex,
            updates: { completed: !currentCompleted },
          }),
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error('Toggle error:', err);
      } finally {
        setUpdatingBlock(null);
      }
    },
    [router]
  );

  const swapActivity = useCallback(
    async (planId: string, blockIndex: number, newActivity: Activity) => {
      setUpdatingBlock(`${planId}-${blockIndex}`);
      try {
        const res = await fetch('/api/planner', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            blockIndex,
            updates: {
              activity_id: newActivity.id,
              title: newActivity.title,
              duration: newActivity.duration_minutes,
              subject:
                SUBJECT_MAP[newActivity.category] || newActivity.category,
            },
          }),
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error('Swap error:', err);
      } finally {
        setUpdatingBlock(null);
        setSwapState(null);
      }
    },
    [router]
  );

  const addActivityToSlot = useCallback(
    async (activity: Activity, date: string, timeSlot: string) => {
      setUpdatingBlock(`add-${date}-${timeSlot}`);
      try {
        const slotConfig = TIME_SLOTS.find((s) => s.key === timeSlot);
        const time = slotConfig?.time || '09:00';

        const res = await fetch('/api/planner/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childId: selectedChild,
            date,
            time,
            activityId: activity.id,
            title: activity.title,
            duration: activity.duration_minutes,
            subject: SUBJECT_MAP[activity.category] || activity.category,
          }),
        });

        if (res.ok) {
          router.refresh();
        } else {
          const err = await res.json();
          setError(err.error || 'Failed to add activity.');
        }
      } catch {
        setError('Failed to add activity.');
      } finally {
        setUpdatingBlock(null);
        setShowAddModal(null);
        setSearchQuery('');
      }
    },
    [router, selectedChild]
  );

  const removeBlock = useCallback(
    async (planId: string, blockIndex: number) => {
      setUpdatingBlock(`${planId}-${blockIndex}`);
      try {
        const res = await fetch('/api/planner/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, blockIndex }),
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error('Remove error:', err);
      } finally {
        setUpdatingBlock(null);
      }
    },
    [router]
  );

  // Get alternatives for swap
  const swapAlternatives = useMemo(() => {
    if (!swapState) return [];
    const plan = plansByDate[
      Object.keys(plansByDate).find(
        (date) => plansByDate[date].id === swapState.planId
      ) || ''
    ];
    const currentActivityId =
      plan?.blocks[swapState.blockIndex]?.activity_id;

    return activities
      .filter(
        (a) =>
          a.category === swapState.category && a.id !== currentActivityId
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [swapState, activities, plansByDate]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ─── Render: No children ──────────────────────────

  if (childrenProp.length === 0) {
    return (
      <div className="space-y-8 animate-fade-up">
        <div>
          <div className="eyebrow mb-3">Weekly Planner</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
            Plan your <em className="text-moss italic">week</em>
          </h1>
        </div>
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
          <div className="text-center px-4 max-w-sm">
            <TreePine className="mx-auto mb-4 h-10 w-10 text-stone" />
            <p className="font-display text-xl text-ink font-light mb-2">
              No children added yet
            </p>
            <p className="text-[13px] text-clay font-serif italic">
              Add your children in Settings to start planning their learning
              week.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">Weekly Planner</div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
            {familyName}&apos;s{' '}
            <em className="text-moss italic">learning week</em>
          </h1>
          <p className="text-clay mt-2 font-serif text-base">
            {formatDate(weekDates[0])} &ndash; {formatDate(weekDates[6])}
            {childrenProp.length === 1 && (
              <span> &middot; {selectedChildName}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Week navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded border border-stone hover:border-moss/30 transition-colors text-clay hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/planner?week=0')}
              className="text-[12px] font-bold text-clay px-2 uppercase tracking-wider hover:text-ink transition-colors"
            >
              {weekLabel}
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded border border-stone hover:border-moss/30 transition-colors text-clay hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="btn-ghost print:hidden"
            title="Print weekly plan"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* View toggle */}
          <div className="flex items-center border border-stone rounded overflow-hidden print:hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 text-xs ${viewMode === 'grid' ? 'bg-forest text-parchment' : 'text-clay hover:bg-linen'}`}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-xs ${viewMode === 'list' ? 'bg-forest text-parchment' : 'text-clay hover:bg-linen'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className="btn-primary print:hidden"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : hasPlans ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 print:hidden">
          <p className="text-sm text-terracotta flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-terracotta/10 transition-colors"
          >
            <X className="h-4 w-4 text-terracotta/60" />
          </button>
        </div>
      )}

      {/* Child selector */}
      {childrenProp.length > 1 && (
        <div className="flex items-center gap-2 print:hidden">
          {childrenProp.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`rounded px-4 py-2 text-[12px] font-bold transition-all ${
                selectedChild === child.id
                  ? 'bg-forest text-parchment'
                  : 'bg-linen text-clay border border-stone hover:border-moss/30'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Weekly Summary Stats */}
      {hasPlans && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-elevated p-4 text-center">
            <p className="font-display text-2xl font-light text-ink">
              {stats.total}
            </p>
            <p className="text-[11px] text-clay font-medium mt-1">
              planned
            </p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="font-display text-2xl font-light text-moss">
              {stats.completed}
            </p>
            <p className="text-[11px] text-clay font-medium mt-1">
              completed
            </p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="font-display text-2xl font-light text-ink">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              %
            </p>
            <p className="text-[11px] text-clay font-medium mt-1">
              completion
            </p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="font-display text-2xl font-light text-ink">
              {Math.round(stats.completedMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-[11px] text-clay font-medium mt-1">
              learning time
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {hasPlans && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss/10">
                <Sparkles className="h-5 w-5 text-moss" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  This week&apos;s progress
                </p>
                <p className="text-xs text-clay/60">
                  {stats.completed} of {stats.total} activities completed
                  {stats.completedMinutes > 0 && (
                    <span>
                      {' '}
                      &middot; {stats.completedMinutes} min learned
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-2xl font-light font-display text-ink">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-linen">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest to-fern transition-all duration-500"
              style={{
                width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Category breakdown */}
          {Object.keys(stats.categoryBreakdown).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(stats.categoryBreakdown).map(([cat, data]) => (
                <span
                  key={cat}
                  className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold border ${
                    CATEGORY_COLORS[cat] || 'bg-stone/10 text-clay border-stone/20'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}: {data.completed}/{data.total}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasPlans && (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
          <div className="text-center px-4 max-w-md">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-stone" />
            <p className="font-display text-2xl text-ink font-light mb-2">
              Generate your first plan!
            </p>
            <p className="text-[13px] text-clay font-serif italic mb-6 max-w-xs mx-auto">
              We&apos;ll create a personalised learning week based on your
              children&apos;s ages, interests, and your family style.
            </p>
            <button
              onClick={generatePlan}
              disabled={isGenerating}
              className="btn-terra"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Weekly Plan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile day selector */}
      {hasPlans && (
        <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden -mx-4 px-4 scrollbar-none print:hidden">
          <button
            onClick={() => setSelectedDay(null)}
            className={`shrink-0 rounded px-3 py-2 text-[11px] font-bold transition-all ${
              selectedDay === null
                ? 'bg-forest text-parchment'
                : 'bg-linen text-clay border border-stone'
            }`}
          >
            All
          </button>
          {weekDates.map((date, i) => {
            const plan = plansByDate[date];
            const today = isToday(date);
            const allDone =
              plan &&
              plan.blocks.length > 0 &&
              plan.blocks.every((b) => b.completed);

            return (
              <button
                key={date}
                onClick={() =>
                  setSelectedDay(selectedDay === date ? null : date)
                }
                className={`shrink-0 rounded px-3 py-2 text-[11px] font-bold transition-all ${
                  selectedDay === date
                    ? 'bg-forest text-parchment'
                    : today
                      ? 'bg-moss/10 text-moss border border-moss/20'
                      : allDone
                        ? 'bg-sage/10 text-moss border border-sage/20'
                        : 'bg-linen text-clay border border-stone'
                }`}
              >
                {DAY_NAMES[i]}
                {allDone && <Check className="inline ml-1 h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── GRID VIEW ─── */}
      {hasPlans && viewMode === 'grid' && (
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-7 sm:gap-3 stagger-children">
          {weekDates.map((date, dayIndex) => {
            const plan = plansByDate[date];
            const today = isToday(date);
            const past = isPast(date);
            const isWeekend = dayIndex >= 5;

            // Mobile: filter by selected day
            if (
              selectedDay !== null &&
              selectedDay !== date &&
              typeof window !== 'undefined' &&
              window.innerWidth < 640
            ) {
              return null;
            }

            // Group blocks by time slot
            const blocksBySlot: Record<string, { block: PlanBlock; index: number }[]> = {
              morning: [],
              afternoon: [],
              evening: [],
            };
            plan?.blocks.forEach((block, index) => {
              const slot = getTimeSlot(block.time);
              blocksBySlot[slot].push({ block, index });
            });

            return (
              <div
                key={date}
                className={`group rounded-xl border transition-all ${
                  today
                    ? 'border-moss/40 bg-moss/5 ring-1 ring-moss/20'
                    : isWeekend && !plan
                      ? 'border-stone/50 bg-parchment/50'
                      : 'border-stone bg-linen'
                }`}
              >
                {/* Day header */}
                <div
                  className={`px-3 py-2.5 border-b ${
                    today ? 'border-moss/20' : 'border-stone/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        today ? 'text-moss' : 'text-clay/50'
                      }`}
                    >
                      {DAY_NAMES[dayIndex]}
                    </span>
                    <div className="flex items-center gap-1">
                      {today && (
                        <span className="flex h-2 w-2 rounded-full bg-moss animate-glow" />
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[13px] font-medium ${
                      today ? 'text-ink' : 'text-clay'
                    }`}
                  >
                    {formatDate(date)}
                  </span>
                </div>

                {/* Time-slotted activity blocks */}
                <div className="p-2 space-y-1 min-h-[120px]">
                  {TIME_SLOTS.map((slot) => {
                    const slotBlocks = blocksBySlot[slot.key];
                    const SlotIcon = slot.icon;

                    return (
                      <div key={slot.key}>
                        {/* Slot label */}
                        {(slotBlocks.length > 0 || !past) && (
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="flex items-center gap-1 text-[9px] text-clay/40 font-bold uppercase tracking-wider">
                              <SlotIcon className="h-2.5 w-2.5" />
                              {slot.label}
                            </span>
                            {!past && (
                              <button
                                onClick={() =>
                                  setShowAddModal({ date, slot: slot.key })
                                }
                                className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-moss/10 transition-all print:hidden"
                                title={`Add to ${slot.label}`}
                              >
                                <Plus className="h-3 w-3 text-moss/50" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Blocks */}
                        {slotBlocks.map(({ block, index: blockIndex }) => {
                          const blockKey = `${plan!.id}-${blockIndex}`;
                          const isUpdating = updatingBlock === blockKey;
                          const activity = block.activity_id
                            ? activityById[block.activity_id]
                            : null;
                          const activityCategory = activity?.category || '';
                          const categoryColor =
                            CATEGORY_COLORS[activityCategory] ||
                            'bg-stone/10 text-clay border-stone/20';

                          return (
                            <div
                              key={blockIndex}
                              className={`group/block relative rounded-lg border p-2 mb-1 transition-all ${
                                block.completed
                                  ? 'bg-sage/10 border-sage/20'
                                  : past
                                    ? 'bg-parchment/80 border-stone/30 opacity-60'
                                    : 'bg-parchment border-stone/40 hover:border-moss/30'
                              }`}
                            >
                              {/* Controls row */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1 text-[10px] text-clay/60">
                                  <Clock className="h-3 w-3" />
                                  {block.time}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  {/* Remove button */}
                                  {!block.completed && !past && (
                                    <button
                                      onClick={() =>
                                        removeBlock(plan!.id, blockIndex)
                                      }
                                      className="opacity-0 group-hover/block:opacity-100 transition-opacity p-1 rounded hover:bg-terracotta/10 print:hidden"
                                      title="Remove activity"
                                    >
                                      <Trash2 className="h-3 w-3 text-terracotta/50" />
                                    </button>
                                  )}
                                  {/* Swap button */}
                                  {!block.completed && !past && (
                                    <button
                                      onClick={() =>
                                        setSwapState({
                                          planId: plan!.id,
                                          blockIndex,
                                          category: activityCategory,
                                        })
                                      }
                                      className="opacity-0 group-hover/block:opacity-100 transition-opacity p-1 rounded hover:bg-stone/20 print:hidden"
                                      title="Swap activity"
                                    >
                                      <Shuffle className="h-3 w-3 text-clay/50" />
                                    </button>
                                  )}
                                  {/* Completion toggle */}
                                  <button
                                    onClick={() =>
                                      toggleComplete(
                                        plan!.id,
                                        blockIndex,
                                        block.completed
                                      )
                                    }
                                    disabled={isUpdating}
                                    className={`flex h-5 w-5 items-center justify-center rounded transition-all print:hidden ${
                                      block.completed
                                        ? 'bg-sage text-parchment'
                                        : 'border border-stone/40 hover:border-moss/50 text-transparent hover:text-moss/30'
                                    }`}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-3 w-3 animate-spin text-clay" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Title */}
                              {activity?.slug ? (
                                <Link
                                  href={`/activity/${activity.slug}`}
                                  className={`text-[12px] font-medium leading-snug mb-1 block hover:text-moss transition-colors ${
                                    block.completed
                                      ? 'text-clay/60 line-through'
                                      : 'text-ink'
                                  }`}
                                >
                                  {block.title}
                                </Link>
                              ) : (
                                <p
                                  className={`text-[12px] font-medium leading-snug mb-1 ${
                                    block.completed
                                      ? 'text-clay/60 line-through'
                                      : 'text-ink'
                                  }`}
                                >
                                  {block.title}
                                </p>
                              )}

                              {/* Category + Duration */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border ${categoryColor}`}
                                >
                                  {CATEGORY_LABELS[activityCategory] ||
                                    block.subject}
                                </span>
                                <span className="text-[9px] text-clay/40">
                                  {block.duration}m
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty slot - add button */}
                        {slotBlocks.length === 0 && !past && (
                          <button
                            onClick={() =>
                              setShowAddModal({ date, slot: slot.key })
                            }
                            className="w-full rounded-lg border border-dashed border-stone/30 p-2 mb-1 text-[10px] text-clay/30 hover:border-moss/30 hover:text-moss/50 transition-all flex items-center justify-center gap-1 print:hidden"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty day - no plan at all */}
                  {!plan && (
                    <div className="flex flex-col items-center justify-center h-[120px] text-center gap-2">
                      <p className="text-[11px] text-clay/30 italic font-serif">
                        {isWeekend ? 'Weekend' : 'No activities'}
                      </p>
                      {!past && (
                        <button
                          onClick={() =>
                            setShowAddModal({ date, slot: 'morning' })
                          }
                          className="text-[10px] text-moss/50 hover:text-moss transition-colors flex items-center gap-1 print:hidden"
                        >
                          <Plus className="h-3 w-3" />
                          Add activity
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Day status */}
                {plan && (
                  <div
                    className={`px-3 py-1.5 border-t text-center ${
                      today ? 'border-moss/20' : 'border-stone/50'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-clay/40">
                      {plan.status === 'completed'
                        ? 'Done'
                        : plan.status === 'in_progress'
                          ? 'In progress'
                          : past
                            ? 'Missed'
                            : 'Planned'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── LIST VIEW ─── */}
      {hasPlans && viewMode === 'list' && (
        <div className="space-y-4 stagger-children">
          {weekDates.map((date, dayIndex) => {
            const plan = plansByDate[date];
            const today = isToday(date);
            const past = isPast(date);

            if (!plan && past) return null;

            return (
              <div
                key={date}
                className={`card-elevated overflow-hidden ${
                  today ? 'ring-1 ring-moss/20' : ''
                }`}
              >
                <div
                  className={`px-5 py-3 border-b flex items-center justify-between ${
                    today
                      ? 'bg-moss/5 border-moss/20'
                      : 'bg-linen border-stone/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[12px] font-bold uppercase tracking-wider ${
                        today ? 'text-moss' : 'text-clay/60'
                      }`}
                    >
                      {DAY_FULL_NAMES[dayIndex]}
                    </span>
                    <span className="text-[13px] text-clay">
                      {formatDate(date)}
                    </span>
                    {today && (
                      <span className="tag bg-moss/10 text-moss text-[9px]">
                        Today
                      </span>
                    )}
                  </div>
                  {plan && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        plan.status === 'completed'
                          ? 'text-moss'
                          : plan.status === 'in_progress'
                            ? 'text-amber'
                            : 'text-clay/40'
                      }`}
                    >
                      {plan.blocks.filter((b) => b.completed).length}/
                      {plan.blocks.length} done
                    </span>
                  )}
                </div>

                <div className="divide-y divide-stone/20">
                  {plan?.blocks.map((block, blockIndex) => {
                    const blockKey = `${plan.id}-${blockIndex}`;
                    const isUpdating = updatingBlock === blockKey;
                    const activity = block.activity_id
                      ? activityById[block.activity_id]
                      : null;
                    const activityCategory = activity?.category || '';
                    const categoryColor =
                      CATEGORY_COLORS[activityCategory] ||
                      'bg-stone/10 text-clay border-stone/20';
                    const slot = getTimeSlot(block.time);
                    const SlotIcon =
                      TIME_SLOTS.find((s) => s.key === slot)?.icon || Sun;

                    return (
                      <div
                        key={blockIndex}
                        className={`group flex items-center gap-4 px-5 py-3 transition-all ${
                          block.completed ? 'bg-sage/5' : ''
                        }`}
                      >
                        {/* Completion toggle */}
                        <button
                          onClick={() =>
                            toggleComplete(plan.id, blockIndex, block.completed)
                          }
                          disabled={isUpdating}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all print:hidden ${
                            block.completed
                              ? 'bg-sage text-parchment'
                              : 'border border-stone/40 hover:border-moss/50 text-transparent hover:text-moss/30'
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-clay" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 w-20 shrink-0">
                          <SlotIcon className="h-3.5 w-3.5 text-clay/40" />
                          <span className="text-[12px] text-clay/60">
                            {block.time}
                          </span>
                        </div>

                        {/* Activity info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] font-medium ${
                              block.completed
                                ? 'text-clay/60 line-through'
                                : 'text-ink'
                            }`}
                          >
                            {block.title}
                          </p>
                        </div>

                        {/* Category tag */}
                        <span
                          className={`hidden sm:inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border ${categoryColor}`}
                        >
                          {CATEGORY_LABELS[activityCategory] || block.subject}
                        </span>

                        {/* Duration */}
                        <span className="text-[11px] text-clay/40 shrink-0">
                          {block.duration}m
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                          {!block.completed && !past && (
                            <>
                              <button
                                onClick={() =>
                                  setSwapState({
                                    planId: plan.id,
                                    blockIndex,
                                    category: activityCategory,
                                  })
                                }
                                className="p-1 rounded hover:bg-stone/20"
                                title="Swap"
                              >
                                <Shuffle className="h-3.5 w-3.5 text-clay/50" />
                              </button>
                              <button
                                onClick={() =>
                                  removeBlock(plan.id, blockIndex)
                                }
                                className="p-1 rounded hover:bg-terracotta/10"
                                title="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-terracotta/50" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* No activities */}
                  {(!plan || plan.blocks.length === 0) && (
                    <div className="px-5 py-6 text-center">
                      <p className="text-[12px] text-clay/40 italic font-serif">
                        No activities planned
                      </p>
                      {!past && (
                        <button
                          onClick={() =>
                            setShowAddModal({ date, slot: 'morning' })
                          }
                          className="mt-2 text-[11px] text-moss/60 hover:text-moss transition-colors inline-flex items-center gap-1 print:hidden"
                        >
                          <Plus className="h-3 w-3" /> Add activity
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Auto-Suggestions ─── */}
      {hasPlans && (
        <div className="print:hidden">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 mb-4 text-sm font-semibold text-ink hover:text-moss transition-colors"
          >
            {(() => {
              const SeasonIcon = getSeasonIcon();
              return <SeasonIcon className="h-4 w-4 text-moss" />;
            })()}
            Suggested activities for {selectedChildName}
            <ChevronRight
              className={`h-4 w-4 transition-transform ${showSuggestions ? 'rotate-90' : ''}`}
            />
          </button>

          {showSuggestions && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map(({ activity, score }) => (
                <div
                  key={activity.id}
                  className="card-interactive p-4 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink mb-1">
                      {activity.title}
                    </p>
                    <p className="text-[11px] text-clay font-serif line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                          CATEGORY_COLORS[activity.category] ||
                          'bg-stone/10 text-clay border-stone/20'
                        }`}
                      >
                        {CATEGORY_LABELS[activity.category] || activity.category}
                      </span>
                      <span className="text-[9px] text-clay/40">
                        {activity.duration_minutes}m
                      </span>
                      {score >= 5 && (
                        <span className="tag bg-moss/10 text-moss text-[8px]">
                          Great fit
                        </span>
                      )}
                      {activity.season?.includes(getSeason()) && (
                        <span className="tag bg-sage/10 text-sage text-[8px]">
                          Seasonal
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Find first empty slot for today or next unfilled day
                      const todayStr = new Date().toISOString().split('T')[0];
                      const targetDate =
                        weekDates.find((d) => d >= todayStr) || weekDates[0];
                      const plan = plansByDate[targetDate];
                      const usedSlots = new Set(
                        plan?.blocks.map((b) => getTimeSlot(b.time)) || []
                      );
                      const freeSlot =
                        TIME_SLOTS.find((s) => !usedSlots.has(s.key))?.key ||
                        'morning';
                      addActivityToSlot(activity, targetDate, freeSlot);
                    }}
                    className="shrink-0 p-2 rounded-lg border border-stone/40 hover:border-moss/30 hover:bg-moss/5 transition-all"
                    title="Add to plan"
                  >
                    <Plus className="h-4 w-4 text-moss" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI explanation card */}
      {hasPlans && (
        <div className="card-elevated p-6 border-l-4 border-l-moss/30">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-moss mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink mb-1">
                Why these activities?
              </p>
              <p className="text-sm text-clay font-serif leading-relaxed">
                This week&apos;s plan is personalised for{' '}
                {childrenProp.map((c) => c.name).join(' & ')}, based on their
                ages, interests, and your family&apos;s preferences. We&apos;ve
                balanced calm and active energy across the week with a mix of
                subjects.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Activity Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm print:hidden">
          <div className="card-elevated p-6 max-w-lg w-full mx-4 animate-scale-in max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-light text-ink">
                  Add activity
                </h3>
                <p className="text-[12px] text-clay font-serif">
                  {formatDateLong(showAddModal.date)} &middot;{' '}
                  {TIME_SLOTS.find((s) => s.key === showAddModal.slot)?.label}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(null);
                  setSearchQuery('');
                }}
                className="p-1.5 rounded hover:bg-stone/20 transition-colors"
              >
                <X className="h-4 w-4 text-clay" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clay/40" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stone bg-parchment pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-clay/40 focus:outline-none focus:ring-1 focus:ring-moss/30 focus:border-moss/30"
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 space-y-2">
              {searchQuery.trim() ? (
                searchResults.length === 0 ? (
                  <p className="text-[12px] text-clay/50 italic text-center py-8 font-serif">
                    No activities found for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  searchResults.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() =>
                        addActivityToSlot(
                          activity,
                          showAddModal.date,
                          showAddModal.slot
                        )
                      }
                      disabled={updatingBlock !== null}
                      className="card-interactive w-full p-3 text-left flex items-start gap-3"
                    >
                      <BookOpen className="h-4 w-4 text-moss mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-ink">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-clay mt-0.5 line-clamp-2 font-serif">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                              CATEGORY_COLORS[activity.category] ||
                              'bg-stone/10 text-clay border-stone/20'
                            }`}
                          >
                            {CATEGORY_LABELS[activity.category] ||
                              activity.category}
                          </span>
                          <span className="text-[10px] text-clay/50">
                            {activity.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )
              ) : (
                <>
                  <p className="text-[11px] font-bold text-clay/50 uppercase tracking-wider mb-2">
                    Suggested for {selectedChildName}
                  </p>
                  {suggestions.slice(0, 5).map(({ activity }) => (
                    <button
                      key={activity.id}
                      onClick={() =>
                        addActivityToSlot(
                          activity,
                          showAddModal.date,
                          showAddModal.slot
                        )
                      }
                      disabled={updatingBlock !== null}
                      className="card-interactive w-full p-3 text-left flex items-start gap-3"
                    >
                      <Sparkles className="h-4 w-4 text-moss mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-ink">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-clay mt-0.5 line-clamp-2 font-serif">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                              CATEGORY_COLORS[activity.category] ||
                              'bg-stone/10 text-clay border-stone/20'
                            }`}
                          >
                            {CATEGORY_LABELS[activity.category] ||
                              activity.category}
                          </span>
                          <span className="text-[10px] text-clay/50">
                            {activity.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Swap modal ─── */}
      {swapState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm print:hidden">
          <div className="card-elevated p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-light text-ink">
                Swap activity
              </h3>
              <button
                onClick={() => setSwapState(null)}
                className="p-1.5 rounded hover:bg-stone/20 transition-colors"
              >
                <X className="h-4 w-4 text-clay" />
              </button>
            </div>
            <p className="text-[12px] text-clay font-serif mb-4">
              Choose an alternative{' '}
              {CATEGORY_LABELS[swapState.category] || swapState.category}{' '}
              activity:
            </p>

            {swapAlternatives.length === 0 ? (
              <p className="text-[12px] text-clay/50 italic text-center py-4 font-serif">
                No alternatives available in this category.
              </p>
            ) : (
              <div className="space-y-2">
                {swapAlternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() =>
                      swapActivity(
                        swapState.planId,
                        swapState.blockIndex,
                        alt
                      )
                    }
                    disabled={updatingBlock !== null}
                    className="card-interactive w-full p-3 text-left flex items-start gap-3"
                  >
                    <BookOpen className="h-4 w-4 text-moss mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink">
                        {alt.title}
                      </p>
                      <p className="text-[11px] text-clay mt-0.5 line-clamp-2 font-serif">
                        {alt.description}
                      </p>
                      <span className="text-[10px] text-clay/50 mt-1 inline-block">
                        {alt.duration_minutes} min
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
