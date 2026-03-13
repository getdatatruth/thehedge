'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { BadgeDisplay, BadgeRibbon, AchievementTimeline } from '@/components/shared/badge-display';
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
}

type TabId = 'overview' | 'badges' | 'calendar' | 'compare';

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
}: ProgressClientProps) {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const earnedBadges = badges.filter((b) => b.unlocked);

  // Get data for the selected child or family
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

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    ...(childStats.length > 1 ? [{ id: 'compare' as TabId, label: 'Compare', icon: Users }] : []),
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-3">Family</p>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          <em className="text-moss italic">Progress</em> &amp; Badges
        </h1>
        <p className="text-clay mt-2 font-serif text-lg">
          Track your family&apos;s learning journey and celebrate achievements.
        </p>
      </div>

      {/* Child selector */}
      {childStats.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setSelectedChild(null)}
            className={`rounded-[4px] px-4 py-2.5 text-sm font-semibold transition-all ${
              !selectedChild
                ? 'bg-forest text-parchment shadow-sm'
                : 'bg-linen text-clay/60 border border-stone hover:border-umber/20'
            }`}
          >
            All children
          </button>
          {childStats.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`rounded-[4px] px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedChild === child.id
                  ? 'bg-forest text-parchment shadow-sm'
                  : 'bg-linen text-clay/60 border border-stone hover:border-umber/20'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selectedChild === child.id ? 'bg-parchment/20 text-parchment' : 'bg-sage/20 text-forest'
              }`}>
                {child.name[0]}
              </div>
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-moss/10">
              <Target className="h-5 w-5 text-moss" />
            </div>
            <div>
              <p className="text-2xl font-display font-light text-ink">{displayTotalActivities}</p>
              <p className="text-xs text-clay/50">Activities</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-terracotta/10">
              <Flame className="h-5 w-5 text-terracotta" />
            </div>
            <div>
              <p className="text-2xl font-display font-light text-ink">{displayCurrentStreak}</p>
              <p className="text-xs text-clay/50">Day streak</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber/10">
              <Zap className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="text-2xl font-display font-light text-ink">{displayLongestStreak}</p>
              <p className="text-xs text-clay/50">Best streak</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sage/10">
              <Trophy className="h-5 w-5 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-display font-light text-ink">{displayEarnedCount}</p>
              <p className="text-xs text-clay/50">Badges</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sky/10">
              <Clock className="h-5 w-5 text-sky" />
            </div>
            <div>
              <p className="text-2xl font-display font-light text-ink">{displayTotalMinutes}</p>
              <p className="text-xs text-clay/50">Minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-linen rounded-[8px] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-parchment text-forest shadow-sm'
                  : 'text-clay/50 hover:text-clay/70'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Category breakdown */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
              Activities by category
            </p>
            {Object.keys(displayCategoryCounts).length === 0 ? (
              <p className="text-sm text-clay/50 font-serif py-4">
                No activities logged yet. Start exploring to see your category breakdown!
              </p>
            ) : (
              <div className="space-y-3.5">
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
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-xs font-medium text-umber w-20 shrink-0">{config.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-linen">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-forest to-moss transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-clay/50 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Monthly activity chart */}
          {!selectedChild && monthlyActivity.length > 0 && (
            <div className="card-elevated p-6 sm:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
                Monthly activity
              </p>
              <div className="flex items-end gap-2 h-32">
                {monthlyActivity.map((m) => {
                  const maxCount = Math.max(...monthlyActivity.map((x) => x.count), 1);
                  const height = (m.count / maxCount) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-clay/50">{m.count}</span>
                      <div className="w-full relative" style={{ height: '100px' }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-forest to-moss/70 transition-all"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-clay/40 font-medium">{m.month.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Badge ribbon + recent badges */}
          <div className="card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                Recent badges
              </p>
              <button
                onClick={() => setActiveTab('badges')}
                className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <BadgeRibbon badges={displayBadges} maxDisplay={12} />
            {displayBadges.filter((b) => b.unlocked).length === 0 && (
              <p className="text-sm text-clay/50 font-serif mt-2">
                Log activities to start earning badges!
              </p>
            )}
          </div>

          {/* Per-child cards */}
          {!selectedChild && childStats.length > 0 && (
            <div className="space-y-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Children</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {childStats.map((child) => (
                  <Link
                    key={child.id}
                    href={`/progress/${child.id}`}
                    className="card-interactive p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-sage/15">
                        <span className="text-xl font-bold font-display text-forest">
                          {child.name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-medium text-ink">{child.name}</h3>
                          <span className="text-xs text-clay/40">Age {child.age}</span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <p className="text-lg font-display font-light text-ink">{child.totalActivities}</p>
                            <p className="text-[10px] text-clay/40">activities</p>
                          </div>
                          <div>
                            <p className="text-lg font-display font-light text-ink">{child.currentStreak}</p>
                            <p className="text-[10px] text-clay/40">streak</p>
                          </div>
                          <div>
                            <p className="text-lg font-display font-light text-ink">{child.badgesEarned}</p>
                            <p className="text-[10px] text-clay/40">badges</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <BadgeRibbon badges={child.badges} maxDisplay={5} />
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-clay/20 mt-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-8">
          <div className="space-y-6">
            <BadgeDisplay badges={displayBadges} showAll />
          </div>

          {/* Achievement timeline */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
              Achievement timeline
            </p>
            <AchievementTimeline badges={displayBadges} />
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-8">
          <CalendarHeatmap data={displayCalendar} />

          {/* This week */}
          <div className="card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-1">This week</p>
                <p className="text-3xl font-display font-light text-ink">{activitiesThisWeek}</p>
                <p className="text-xs text-clay/50 font-serif mt-1">
                  {activitiesThisWeek === 0
                    ? 'No activities logged yet this week'
                    : activitiesThisWeek === 1
                      ? 'activity logged'
                      : 'activities logged'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-1">Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-terracotta" />
                  <p className="text-3xl font-display font-light text-ink">{displayCurrentStreak}</p>
                </div>
                <p className="text-xs text-clay/50 font-serif mt-1">
                  Best: {displayLongestStreak} days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && childStats.length > 1 && (
        <ComparisonView childStats={childStats} />
      )}

      {/* Empty state */}
      {totalActivities === 0 && childStats.length === 0 && (
        <div className="card-elevated p-8 text-center">
          <TrendingUp className="h-10 w-10 text-clay/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-ink mb-1">No progress yet</p>
          <p className="text-xs text-clay/50 font-serif mb-4">
            Start logging activities to see your family&apos;s learning journey here.
          </p>
          <Link
            href="/browse"
            className="btn-primary inline-flex items-center gap-1.5"
          >
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
        <p className="text-sm text-clay/50 font-serif">No activity data to display.</p>
      </div>
    );
  }

  // Group by month
  const months: Record<string, CalendarDay[]> = {};
  for (const day of data) {
    const monthKey = day.date.substring(0, 7);
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(day);
  }

  const levelColors = [
    'bg-linen',
    'bg-sage/30',
    'bg-sage/50',
    'bg-moss/60',
    'bg-forest',
  ];

  return (
    <div className="card-elevated p-6 sm:p-8">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
          Activity calendar
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-clay/40">Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={`h-3 w-3 rounded-[2px] ${color}`} />
          ))}
          <span className="text-[9px] text-clay/40">More</span>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(months).map(([monthKey, days]) => {
          const monthDate = new Date(monthKey + '-01');
          const monthName = monthDate.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });

          // Build a grid: 7 columns (Mon-Sun), need to pad start
          const firstDay = new Date(days[0].date + 'T00:00:00');
          let startPad = firstDay.getDay() - 1; // Mon=0
          if (startPad < 0) startPad = 6; // Sunday

          const paddedDays: (CalendarDay | null)[] = [
            ...Array(startPad).fill(null),
            ...days,
          ];

          return (
            <div key={monthKey}>
              <p className="text-xs font-medium text-clay/60 mb-2">{monthName}</p>
              <div className="grid grid-cols-7 gap-[3px]">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="h-3 flex items-center justify-center">
                    <span className="text-[8px] text-clay/30 font-medium">{d}</span>
                  </div>
                ))}
                {paddedDays.map((day, i) => {
                  if (!day) {
                    return <div key={`pad-${i}`} className="h-3.5" />;
                  }
                  const color = levelColors[day.level];
                  return (
                    <div
                      key={day.date}
                      className={`h-3.5 rounded-[2px] ${color} transition-colors`}
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
  const childColors = ['bg-forest', 'bg-terracotta', 'bg-sage', 'bg-sky', 'bg-amber'];

  return (
    <div className="space-y-8">
      {/* Overall comparison */}
      <div className="card-elevated p-6 sm:p-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
          Activity comparison
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/30">
                <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-clay/40">Child</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Activities</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Minutes</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Streak</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Best</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Badges</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay/40">Categories</th>
              </tr>
            </thead>
            <tbody>
              {childStats.map((child, idx) => (
                <tr key={child.id} className="border-b border-stone/10">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full ${childColors[idx % childColors.length]} flex items-center justify-center`}>
                        <span className="text-[10px] font-bold text-parchment">{child.name[0]}</span>
                      </div>
                      <span className="font-medium text-ink text-sm">{child.name}</span>
                      <span className="text-[10px] text-clay/40">({child.age})</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.totalActivities}</td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.totalMinutes}</td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.currentStreak}</td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.longestStreak}</td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.badgesEarned}</td>
                  <td className="text-center py-3 px-3 font-display text-lg font-light text-ink">{child.categoriesCovered}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category comparison */}
      <div className="card-elevated p-6 sm:p-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
          Category breakdown by child
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-5">
          {childStats.map((child, idx) => (
            <div key={child.id} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-[2px] ${childColors[idx % childColors.length]}`} />
              <span className="text-xs text-clay/60">{child.name}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {allCategories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            if (!config) return null;
            const Icon = config.icon;
            const maxCount = Math.max(
              ...childStats.map((c) => c.categoryCounts[category] || 0),
              1
            );

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bg}`}>
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
                        <span className="text-[10px] text-clay/40 w-16 truncate">{child.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-linen">
                          <div
                            className={`h-full rounded-full ${childColors[idx % childColors.length]} transition-all`}
                            style={{ width: `${Math.max(percent, count > 0 ? 4 : 0)}%`, opacity: 0.7 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-clay/40 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge comparison */}
      <div className="card-elevated p-6 sm:p-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
          Badge comparison
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {childStats.map((child, idx) => (
            <div key={child.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full ${childColors[idx % childColors.length]} flex items-center justify-center`}>
                  <span className="text-[10px] font-bold text-parchment">{child.name[0]}</span>
                </div>
                <span className="text-sm font-medium text-ink">{child.name}</span>
                <span className="text-xs text-clay/40">{child.badgesEarned} earned</span>
              </div>
              <BadgeRibbon badges={child.badges} maxDisplay={10} />
              {child.badgesEarned === 0 && (
                <p className="text-xs text-clay/40 font-serif">No badges earned yet</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
