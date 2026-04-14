'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { BadgeDisplay, BadgeRibbon, AchievementTimeline } from '@/components/shared/badge-display';
import { InsightCard } from '@/components/shared/insight-card';
import { ScoreRing } from '@/components/shared/score-ring';
import type { EarnedBadge, CalendarDay } from '@/lib/badges';
import {
  Trophy,
  Flame,
  Clock,
  Target,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  Zap,
  Users,
  Sparkles,
  Check,
  Lock,
} from 'lucide-react';

interface ChildStat {
  id: string;
  name: string;
  age: number;
  interests: string[];
  totalActivities: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  categoryCounts: Record<string, number>;
  categoriesCovered: number;
  badgesEarned: number;
  badges: EarnedBadge[];
  calendarData: CalendarDay[];
  hedgeScore: { score: number; breakdown: { volume: number; consistency: number; breadth: number; depth: number } };
  tier: { name: string; emoji: string; nextTier: string | null; progress: number; minScore: number; maxScore: number };
}

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  unlocked: boolean;
  requirement: string;
  threshold: number;
  current: number;
}

interface Milestone {
  id: string;
  name: string;
  done: boolean;
}

interface ProgressClientProps {
  totalActivities: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  activitiesThisWeek: number;
  categoryCounts: Record<string, number>;
  childStats: ChildStat[];
  badges: EarnedBadge[];
  calendarData: CalendarDay[];
  monthlyActivity: { month: string; count: number }[];
  hedgeScore: { score: number; breakdown: { volume: number; consistency: number; breadth: number; depth: number } };
  tier: { name: string; emoji: string; nextTier: string | null; progress: number; minScore: number; maxScore: number };
  achievements: Achievement[];
  milestones: Milestone[];
  children: { id: string; name: string; age: number }[];
}

type TabId = 'insights' | 'activities' | 'badges' | 'calendar' | 'compare';

export function ProgressClient({
  totalActivities,
  totalMinutes,
  currentStreak,
  longestStreak,
  activitiesThisWeek,
  categoryCounts,
  childStats,
  badges,
  calendarData,
  monthlyActivity,
  hedgeScore,
  tier,
  achievements,
  milestones,
  children,
}: ProgressClientProps) {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('insights');

  const earnedBadges = badges.filter((b) => b.unlocked);

  const selectedChildData = selectedChild
    ? childStats.find((c) => c.id === selectedChild)
    : null;

  const displayTotalActivities = selectedChildData?.totalActivities ?? totalActivities;
  const displayTotalMinutes = selectedChildData?.totalMinutes ?? totalMinutes;
  const displayCurrentStreak = selectedChildData?.currentStreak ?? currentStreak;
  const displayLongestStreak = selectedChildData?.longestStreak ?? longestStreak;
  const displayCategoryCounts = selectedChildData?.categoryCounts ?? categoryCounts;
  const displayBadges = selectedChildData?.badges ?? badges;
  const displayCalendar = selectedChildData?.calendarData ?? calendarData;
  const displayEarnedCount = selectedChildData?.badgesEarned ?? earnedBadges.length;
  const displayHedgeScore = selectedChildData?.hedgeScore ?? hedgeScore;
  const displayTier = selectedChildData?.tier ?? tier;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'activities', label: 'Activities', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    ...(childStats.length > 1 ? [{ id: 'compare' as TabId, label: 'Compare', icon: Users }] : []),
  ];

  const insightContext = {
    children: children.map(c => ({ name: c.name, age: c.age })),
    totalActivities: displayTotalActivities,
    streak: displayCurrentStreak,
    uniqueDays: 0,
    totalMinutes: displayTotalMinutes,
    categoryBreakdown: displayCategoryCounts,
    hedgeScore: displayHedgeScore.score,
    tierName: displayTier.name,
    scoreBreakdown: displayHedgeScore.breakdown,
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          <em className="text-moss italic">Progress</em> &amp; Badges
        </h1>
        <p className="text-clay mt-2 text-sm">
          Track your family's learning journey and celebrate achievements.
        </p>
      </div>

      {/* Child selector */}
      {childStats.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedChild(null)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
              !selectedChild
                ? 'bg-forest text-parchment shadow-sm'
                : 'bg-linen text-clay hover:bg-stone/30'
            }`}
          >
            Family
          </button>
          {childStats.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedChild === child.id
                  ? 'bg-forest text-parchment shadow-sm'
                  : 'bg-linen text-clay hover:bg-stone/30'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selectedChild === child.id ? 'bg-parchment/20 text-parchment' : 'bg-cat-nature/15 text-forest'
              }`}>
                {child.name[0]}
              </div>
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-3 grid-cols-3">
        <div className="card-elevated p-4 text-center">
          <Target className="h-5 w-5 text-cat-nature mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayTotalActivities}</p>
          <p className="text-[11px] text-clay">Activities</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Flame className="h-5 w-5 text-cat-movement mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayCurrentStreak}</p>
          <p className="text-[11px] text-clay">Day streak</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Zap className="h-5 w-5 text-cat-maths mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{activitiesThisWeek}</p>
          <p className="text-[11px] text-clay">This week</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-linen rounded-2xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-parchment text-forest shadow-sm'
                  : 'text-clay hover:text-umber'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── INSIGHTS TAB ─── */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Insight */}
          <InsightCard type="progress" context={insightContext} />

          {/* Hedge Score */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-6">Hedge Score</p>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreRing
                score={displayHedgeScore.score}
                label={`${displayTier.emoji} ${displayTier.name}`}
                subtitle={displayTier.nextTier ? `${Math.round(displayTier.progress * 100)}% to ${displayTier.nextTier}` : 'Maximum tier reached'}
              />
              {/* Score breakdown */}
              <div className="flex-1 w-full space-y-4">
                {([
                  { key: 'volume', label: 'Volume', desc: 'Activities completed' },
                  { key: 'consistency', label: 'Consistency', desc: 'Streak & regularity' },
                  { key: 'breadth', label: 'Breadth', desc: 'Categories explored' },
                  { key: 'depth', label: 'Depth', desc: 'Time invested' },
                ] as const).map(({ key, label, desc }) => {
                  const value = displayHedgeScore.breakdown[key];
                  const percent = (value / 250) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-umber">{label}</span>
                          <span className="text-[11px] text-clay ml-2">{desc}</span>
                        </div>
                        <span className="text-sm font-semibold text-cat-nature">{value}/250</span>
                      </div>
                      <div className="h-2 rounded-full bg-stone/20">
                        <div
                          className="h-full rounded-full bg-cat-nature transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Achievements</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl p-4 text-center transition-all ${
                    a.unlocked
                      ? 'bg-cat-nature/8 border border-cat-nature/20'
                      : 'bg-stone/10 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <p className="text-[12px] font-semibold text-umber mt-1.5">{a.name}</p>
                  {a.unlocked ? (
                    <p className="text-[10px] text-cat-nature font-medium mt-0.5">Unlocked</p>
                  ) : (
                    <div className="mt-1.5">
                      <div className="h-1.5 rounded-full bg-stone/20">
                        <div
                          className="h-full rounded-full bg-cat-nature/40"
                          style={{ width: `${Math.min(100, (a.current / a.threshold) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-clay mt-1">{a.current}/{a.threshold}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Milestones</p>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.done ? 'bg-cat-nature text-white' : 'bg-stone/20 text-clay'
                  }`}>
                    {m.done ? <Check className="h-4 w-4" /> : <Lock className="h-3 w-3" />}
                  </div>
                  <span className={`text-sm ${m.done ? 'text-umber font-medium' : 'text-clay'}`}>
                    {m.name}
                  </span>
                  {m.done && <span className="text-[10px] text-cat-nature font-semibold">Done</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Category balance */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Category balance</p>
            {Object.keys(displayCategoryCounts).length === 0 ? (
              <p className="text-sm text-clay">
                No activities logged yet. Start exploring to see your category breakdown.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(displayCategoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const config = CATEGORY_CONFIG[category];
                    if (!config) return null;
                    const Icon = config.icon;
                    const maxCount = Math.max(...Object.values(displayCategoryCounts));
                    const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-xs font-medium text-umber w-20 shrink-0">{config.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-stone/15">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${config.bg.replace('/15', '').replace('/10', '').replace('/12', '').replace('/8', '')}`}
                            style={{ width: `${percent}%`, opacity: 0.6 }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-clay w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Per-child cards */}
          {!selectedChild && childStats.length > 0 && (
            <div className="space-y-4">
              <p className="eyebrow">Children</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {childStats.map((child) => (
                  <Link
                    key={child.id}
                    href={`/progress/${child.id}`}
                    className="card-interactive p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cat-nature/10">
                        <span className="text-lg font-bold text-forest">
                          {child.name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-ink">{child.name}</h3>
                          <span className="text-xs text-clay">Age {child.age}</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-umber font-medium">{child.totalActivities} <span className="text-clay font-normal">activities</span></span>
                          <span className="text-umber font-medium">{child.currentStreak} <span className="text-clay font-normal">streak</span></span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm">{child.tier.emoji} {child.tier.name}</span>
                          <span className="text-[11px] text-clay ml-2">Score: {child.hedgeScore.score}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-stone mt-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ACTIVITIES TAB ─── */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Time invested */}
          <div className="card-elevated p-6 sm:p-8 text-center">
            <p className="eyebrow justify-center mb-4">Time invested</p>
            <p className="text-4xl font-light text-ink">
              {Math.floor(displayTotalMinutes / 60)}<span className="text-lg text-clay ml-1">hrs</span>{' '}
              {displayTotalMinutes % 60}<span className="text-lg text-clay ml-1">min</span>
            </p>
            <p className="text-sm text-clay mt-2">{displayTotalActivities} activities across {Object.keys(displayCategoryCounts).filter(k => k !== 'unknown').length} categories</p>
          </div>

          {/* Category breakdown */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Activities by category</p>
            {Object.keys(displayCategoryCounts).length === 0 ? (
              <p className="text-sm text-clay">
                No activities logged yet. Start exploring to see your category breakdown.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(displayCategoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const config = CATEGORY_CONFIG[category];
                    if (!config) return null;
                    const Icon = config.icon;
                    const maxCount = Math.max(...Object.values(displayCategoryCounts));
                    const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-xs font-medium text-umber w-20 shrink-0">{config.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-stone/15">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-forest to-moss transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-clay w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Monthly activity chart */}
          {!selectedChild && monthlyActivity.length > 0 && (
            <div className="card-elevated p-6 sm:p-8">
              <p className="eyebrow mb-5">Monthly activity</p>
              <div className="flex items-end gap-2 h-32">
                {monthlyActivity.map((m) => {
                  const maxCount = Math.max(...monthlyActivity.map((x) => x.count), 1);
                  const height = (m.count / maxCount) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-clay">{m.count}</span>
                      <div className="w-full relative" style={{ height: '100px' }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-cat-nature to-cat-nature/40 transition-all"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-clay font-medium">{m.month.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── BADGES TAB ─── */}
      {activeTab === 'badges' && (
        <div className="space-y-8">
          <div className="space-y-6">
            <BadgeDisplay badges={displayBadges} showAll />
          </div>
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Achievement timeline</p>
            <AchievementTimeline badges={displayBadges} />
          </div>
        </div>
      )}

      {/* ─── CALENDAR TAB ─── */}
      {activeTab === 'calendar' && (
        <div className="space-y-8">
          <CalendarHeatmap data={displayCalendar} />
          <div className="card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">This week</p>
                <p className="text-3xl font-light text-ink">{activitiesThisWeek}</p>
                <p className="text-xs text-clay mt-1">
                  {activitiesThisWeek === 0 ? 'No activities logged yet this week' : 'activities logged'}
                </p>
              </div>
              <div className="text-right">
                <p className="eyebrow mb-1 justify-end">Streak</p>
                <div className="flex items-center gap-2 justify-end">
                  <Flame className="h-5 w-5 text-cat-movement" />
                  <p className="text-3xl font-light text-ink">{displayCurrentStreak}</p>
                </div>
                <p className="text-xs text-clay mt-1">Best: {displayLongestStreak} days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── COMPARE TAB ─── */}
      {activeTab === 'compare' && childStats.length > 1 && (
        <ComparisonView childStats={childStats} />
      )}

      {/* Empty state */}
      {totalActivities === 0 && childStats.length === 0 && (
        <div className="card-elevated p-8 text-center">
          <TrendingUp className="h-10 w-10 text-stone mx-auto mb-3" />
          <p className="text-sm font-medium text-ink mb-1">No progress yet</p>
          <p className="text-xs text-clay mb-4">
            Start logging activities to see your family's learning journey here.
          </p>
          <Link href="/browse" className="btn-primary inline-flex items-center gap-1.5">
            Browse activities
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Calendar Heatmap Component ──────────────────────────

function CalendarHeatmap({ data }: { data: CalendarDay[] }) {
  if (data.length === 0) {
    return (
      <div className="card-elevated p-6 text-center">
        <p className="text-sm text-clay">No activity data to display.</p>
      </div>
    );
  }

  const months: Record<string, CalendarDay[]> = {};
  for (const day of data) {
    const monthKey = day.date.substring(0, 7);
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(day);
  }

  const levelColors = [
    'bg-stone/15',
    'bg-cat-nature/20',
    'bg-cat-nature/40',
    'bg-cat-nature/60',
    'bg-cat-nature',
  ];

  return (
    <div className="card-elevated p-6 sm:p-8">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">Activity calendar</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-clay">Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={`h-3 w-3 rounded-[3px] ${color}`} />
          ))}
          <span className="text-[9px] text-clay">More</span>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(months).map(([monthKey, days]) => {
          const monthDate = new Date(monthKey + '-01');
          const monthName = monthDate.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
          const firstDay = new Date(days[0].date + 'T00:00:00');
          let startPad = firstDay.getDay() - 1;
          if (startPad < 0) startPad = 6;
          const paddedDays: (CalendarDay | null)[] = [...Array(startPad).fill(null), ...days];
          return (
            <div key={monthKey}>
              <p className="text-xs font-medium text-clay mb-2">{monthName}</p>
              <div className="grid grid-cols-7 gap-[3px]">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="h-3 flex items-center justify-center">
                    <span className="text-[8px] text-sage font-medium">{d}</span>
                  </div>
                ))}
                {paddedDays.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} className="h-3.5" />;
                  const color = levelColors[day.level];
                  return (
                    <div
                      key={day.date}
                      className={`h-3.5 rounded-[3px] ${color} transition-colors`}
                      title={`${day.date}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Comparison View ─────────────────────────────────────

function ComparisonView({ childStats }: { childStats: ChildStat[] }) {
  const allCategories = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
  const childColors = ['bg-forest', 'bg-cat-art', 'bg-cat-nature', 'bg-cat-science', 'bg-cat-movement'];

  return (
    <div className="space-y-8">
      <div className="card-elevated p-6 sm:p-8">
        <p className="eyebrow mb-5">Activity comparison</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/30">
                <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-clay">Child</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Activities</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Minutes</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Streak</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Score</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Tier</th>
              </tr>
            </thead>
            <tbody>
              {childStats.map((child, idx) => (
                <tr key={child.id} className="border-b border-stone/10">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full ${childColors[idx % childColors.length]} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-white">{child.name[0]}</span>
                      </div>
                      <span className="font-medium text-ink text-sm">{child.name}</span>
                      <span className="text-[10px] text-clay">({child.age})</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-3 text-lg font-light text-ink">{child.totalActivities}</td>
                  <td className="text-center py-3 px-3 text-lg font-light text-ink">{child.totalMinutes}</td>
                  <td className="text-center py-3 px-3 text-lg font-light text-ink">{child.currentStreak}</td>
                  <td className="text-center py-3 px-3 text-lg font-light text-cat-nature">{child.hedgeScore.score}</td>
                  <td className="text-center py-3 px-3">{child.tier.emoji} {child.tier.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-elevated p-6 sm:p-8">
        <p className="eyebrow mb-5">Category breakdown by child</p>
        <div className="flex flex-wrap gap-3 mb-5">
          {childStats.map((child, idx) => (
            <div key={child.id} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-[3px] ${childColors[idx % childColors.length]}`} />
              <span className="text-xs text-clay">{child.name}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {allCategories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            if (!config) return null;
            const Icon = config.icon;
            const maxCount = Math.max(...childStats.map((c) => c.categoryCounts[category] || 0), 1);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${config.bg}`}>
                    <Icon className={`h-3 w-3 ${config.color}`} />
                  </div>
                  <span className="text-xs font-medium text-umber">{config.label}</span>
                </div>
                <div className="space-y-1 ml-8">
                  {childStats.map((child, idx) => {
                    const count = child.categoryCounts[category] || 0;
                    const percent = (count / maxCount) * 100;
                    return (
                      <div key={child.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-clay w-16 truncate">{child.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-stone/15">
                          <div
                            className={`h-full rounded-full ${childColors[idx % childColors.length]} transition-all`}
                            style={{ width: `${Math.max(percent, count > 0 ? 4 : 0)}%`, opacity: 0.7 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-clay w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
