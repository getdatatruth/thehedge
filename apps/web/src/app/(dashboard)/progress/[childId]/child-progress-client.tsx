'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { BadgeDisplay, BadgeRibbon, AchievementTimeline } from '@/components/shared/badge-display';
import type { EarnedBadge, CalendarDay } from '@/lib/badges';
import {
  ArrowLeft,
  Star,
  Clock,
  Target,
  ChevronRight,
  Image,
  FileText,
  Flame,
  Trophy,
  Zap,
  Calendar,
  BarChart3,
  Award,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  date: string;
  duration_minutes: number | null;
  rating: number | null;
  notes: string | null;
  activity: {
    title: string;
    category: string;
    slug: string;
  };
}

interface PortfolioEntry {
  id: string;
  date: string;
  title: string;
  description: string | null;
  curriculum_areas: string[];
  photos: string[];
}

interface ChildProgressClientProps {
  child: {
    id: string;
    name: string;
    age: number;
    interests: string[];
  };
  totalActivities: number;
  totalMinutes: number;
  avgRating: string | null;
  currentStreak: number;
  longestStreak: number;
  categoryCounts: Record<string, number>;
  badges: EarnedBadge[];
  calendarData: CalendarDay[];
  activityLogs: ActivityLog[];
  portfolioEntries: PortfolioEntry[];
}

type TabId = 'overview' | 'badges' | 'calendar';

export function ChildProgressClient({
  child,
  totalActivities,
  totalMinutes,
  avgRating,
  currentStreak,
  longestStreak,
  categoryCounts,
  badges,
  calendarData,
  activityLogs,
  portfolioEntries,
}: ChildProgressClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const earnedCount = badges.filter((b) => b.unlocked).length;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <Link href="/progress" className="inline-flex items-center gap-1.5 text-sm text-moss hover:text-forest transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to progress
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/15">
            <span className="text-2xl font-bold text-forest">
              {child.name[0]}
            </span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-light text-ink tracking-tight">
              {child.name}
            </h1>
            <p className="text-clay mt-1">
              Age {child.age}{child.interests.length > 0 ? ` · ${child.interests.join(', ')}` : ''}
            </p>
            <div className="mt-1.5">
              <BadgeRibbon badges={badges} maxDisplay={8} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss/10">
            <Target className="h-5 w-5 text-moss" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{totalActivities}</p>
            <p className="text-xs text-clay/50">Activities</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10">
            <Flame className="h-5 w-5 text-terracotta" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{currentStreak}</p>
            <p className="text-xs text-clay/50">Streak</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber/10">
            <Zap className="h-5 w-5 text-amber" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{longestStreak}</p>
            <p className="text-xs text-clay/50">Best streak</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage/10">
            <Trophy className="h-5 w-5 text-sage" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{earnedCount}</p>
            <p className="text-xs text-clay/50">Badges</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky/10">
            <Clock className="h-5 w-5 text-sky" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{totalMinutes}</p>
            <p className="text-xs text-clay/50">Minutes</p>
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
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-sm text-clay/50 py-4">
                No activities logged for {child.name} yet.
              </p>
            ) : (
              <div className="space-y-3.5">
                {Object.entries(categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const config = CATEGORY_CONFIG[category];
                    if (!config) return null;
                    const Icon = config.icon;
                    const maxCount = Math.max(...Object.values(categoryCounts));
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

          {/* Recent badges */}
          <div className="card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">
                Badges ({earnedCount} earned)
              </p>
              <button
                onClick={() => setActiveTab('badges')}
                className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <BadgeDisplay badges={badges} showAll={false} compact />
          </div>

          {/* Recent activities */}
          <div className="card-elevated p-6 sm:p-8 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Recent activities</p>
            {activityLogs.length === 0 ? (
              <p className="text-sm text-clay/50 py-4">
                No activities logged for {child.name} yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activityLogs.slice(0, 10).map((log) => {
                  const config = CATEGORY_CONFIG[log.activity.category];
                  const Icon = config?.icon;
                  return (
                    <Link
                      key={log.id}
                      href={log.activity.slug ? `/activity/${log.activity.slug}` : '#'}
                      className="flex items-center gap-3 rounded-2xl p-3 hover:bg-parchment/50 transition-colors"
                    >
                      {Icon && (
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink">{log.activity.title}</p>
                        <p className="text-xs text-clay/50">
                          {new Date(log.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                          {log.duration_minutes ? ` · ${log.duration_minutes}m` : ''}
                        </p>
                      </div>
                      {log.rating != null && log.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < log.rating! ? 'fill-amber text-amber' : 'text-linen'}`}
                            />
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Portfolio</p>
              <Link href={`/educator/portfolio/${child.id}`} className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1">
                View full portfolio <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {portfolioEntries.length === 0 ? (
              <div className="card-elevated p-6 text-center">
                <p className="text-sm text-clay/50">
                  No portfolio entries for {child.name} yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolioEntries.slice(0, 4).map((entry) => {
                  const hasPhotos = entry.photos && entry.photos.length > 0;
                  const TypeIcon = hasPhotos ? Image : FileText;
                  return (
                    <div key={entry.id} className="card-elevated p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-terracotta/8">
                          <TypeIcon className="h-5 w-5 text-terracotta" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink">{entry.title}</p>
                          {entry.description && (
                            <p className="text-xs text-clay/50 line-clamp-2 mt-0.5">{entry.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] text-clay/40">
                              {new Date(entry.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                            </span>
                            {entry.curriculum_areas.map((area) => (
                              <span key={area} className="tag tag-sage text-[10px]">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-8">
          <div className="space-y-6">
            <BadgeDisplay badges={badges} showAll />
          </div>

          {/* Achievement timeline */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
              Achievement timeline
            </p>
            <AchievementTimeline badges={badges} />
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-8">
          <CalendarHeatmap data={calendarData} />

          {/* Streak info */}
          <div className="card-elevated p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-1">Current streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-terracotta" />
                  <p className="text-3xl font-light text-ink">{currentStreak}</p>
                  <span className="text-sm text-clay/50">days</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-1">Longest streak</p>
                <div className="flex items-center gap-2 justify-end">
                  <Zap className="h-5 w-5 text-amber" />
                  <p className="text-3xl font-light text-ink">{longestStreak}</p>
                  <span className="text-sm text-clay/50">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average rating */}
          {avgRating && (
            <div className="card-elevated p-6 sm:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Average rating</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-light text-ink">{avgRating}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(parseFloat(avgRating)) ? 'fill-amber text-amber' : 'text-linen'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
        <p className="text-sm text-clay/50">No activity data to display.</p>
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
