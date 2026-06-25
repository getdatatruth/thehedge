'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { InsightCard } from '@/components/shared/insight-card';
import {
  Clock,
  Target,
  ChevronRight,
  TrendingUp,
  Compass,
  CalendarDays,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';

interface ChildStat {
  id: string;
  name: string;
  age: number;
  interests: string[];
  totalActivities: number;
  totalMinutes: number;
  uniqueDays: number;
  categoryCounts: Record<string, number>;
  areasExplored: number;
  averageRating: number | null;
}

interface ProgressClientProps {
  totalActivities: number;
  totalMinutes: number;
  uniqueDays: number;
  activitiesThisWeek: number;
  areasExplored: number;
  totalAreas: number;
  averageRating: number | null;
  categoryCounts: Record<string, number>;
  childStats: ChildStat[];
  monthlyActivity: { month: string; count: number }[];
  children: { id: string; name: string; age: number }[];
}

type TabId = 'reflection' | 'activities' | 'compare';

export function ProgressClient({
  totalActivities,
  totalMinutes,
  uniqueDays,
  activitiesThisWeek,
  areasExplored,
  totalAreas,
  averageRating,
  categoryCounts,
  childStats,
  monthlyActivity,
  children,
}: ProgressClientProps) {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('reflection');

  const selectedChildData = selectedChild
    ? childStats.find((c) => c.id === selectedChild)
    : null;

  const displayTotalActivities = selectedChildData?.totalActivities ?? totalActivities;
  const displayTotalMinutes = selectedChildData?.totalMinutes ?? totalMinutes;
  const displayUniqueDays = selectedChildData?.uniqueDays ?? uniqueDays;
  const displayAreasExplored = selectedChildData?.areasExplored ?? areasExplored;
  const displayAverageRating = selectedChildData?.averageRating ?? averageRating;
  const displayCategoryCounts = selectedChildData?.categoryCounts ?? categoryCounts;

  const displayHours = Math.floor(displayTotalMinutes / 60);
  const displayMins = displayTotalMinutes % 60;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'reflection', label: 'Reflection', icon: Sparkles },
    { id: 'activities', label: 'Activities', icon: BarChart3 },
    ...(childStats.length > 1 ? [{ id: 'compare' as TabId, label: 'Compare', icon: Users }] : []),
  ];

  const insightContext = {
    children: children.map((c) => ({ name: c.name, age: c.age })),
    totalActivities: displayTotalActivities,
    uniqueDays: displayUniqueDays,
    totalMinutes: displayTotalMinutes,
    areasExplored: displayAreasExplored,
    categoryBreakdown: displayCategoryCounts,
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          Your <em className="text-moss italic">learning</em> so far
        </h1>
        <p className="text-clay mt-2 text-sm">
          A gentle look back at the moments your family has shared. No score to chase, just what you have explored together.
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
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="card-elevated p-4 text-center">
          <Target className="h-5 w-5 text-cat-nature mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayTotalActivities}</p>
          <p className="text-[11px] text-clay">moments kept</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Clock className="h-5 w-5 text-cat-maths mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayHours}</p>
          <p className="text-[11px] text-clay">hours together</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <CalendarDays className="h-5 w-5 text-cat-movement mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayUniqueDays}</p>
          <p className="text-[11px] text-clay">days of learning</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Compass className="h-5 w-5 text-cat-art mx-auto mb-1" />
          <p className="text-2xl font-light text-ink">{displayAreasExplored}<span className="text-sm text-clay">/{totalAreas}</span></p>
          <p className="text-[11px] text-clay">areas explored</p>
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

      {/* ─── REFLECTION TAB ─── */}
      {activeTab === 'reflection' && (
        <div className="space-y-6">
          {/* AI Insight */}
          <InsightCard type="progress" context={insightContext} />

          {/* Season reflection */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-4">This season</p>
            <p className="font-display text-2xl font-light text-ink leading-relaxed">
              You have explored{' '}
              <span className="text-forest">{displayAreasExplored} of {totalAreas} areas</span>{' '}
              and kept{' '}
              <span className="text-forest">{displayTotalActivities} {displayTotalActivities === 1 ? 'lovely moment' : 'lovely moments'}</span>
              {displayThisWeekLine(activitiesThisWeek, selectedChild)}
            </p>
            <p className="text-sm text-clay mt-4">
              {displayUniqueDays} {displayUniqueDays === 1 ? 'day' : 'days'} of learning, around {displayHours} {displayHours === 1 ? 'hour' : 'hours'} together so far. Every one of them counts.
            </p>
          </div>

          {/* Average rating */}
          {displayAverageRating != null && (
            <div className="card-elevated p-6 sm:p-8">
              <p className="eyebrow mb-2">How it has felt</p>
              <p className="text-sm text-clay">
                On average your family has rated these moments{' '}
                <span className="font-semibold text-umber">{displayAverageRating.toFixed(1)} out of 5</span>. A nice reminder of what landed well.
              </p>
            </div>
          )}

          {/* Areas explored */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Areas you have explored</p>
            {Object.keys(displayCategoryCounts).length === 0 ? (
              <p className="text-sm text-clay">
                Nothing logged yet. Whenever you are ready, every small moment you keep will show up here.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(displayCategoryCounts)
                  .filter(([cat]) => cat !== 'unknown')
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
                            className="h-full rounded-full bg-gradient-to-r from-forest to-moss transition-all duration-500"
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
                          <span className="text-umber font-medium">{child.totalActivities} <span className="text-clay font-normal">moments</span></span>
                          <span className="text-umber font-medium">{child.areasExplored} <span className="text-clay font-normal">areas</span></span>
                        </div>
                        <p className="text-[11px] text-clay mt-2">{child.uniqueDays} {child.uniqueDays === 1 ? 'day' : 'days'} of learning</p>
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
            <p className="eyebrow justify-center mb-4">Time spent together</p>
            <p className="text-4xl font-light text-ink">
              {displayHours}<span className="text-lg text-clay ml-1">hrs</span>{' '}
              {displayMins}<span className="text-lg text-clay ml-1">min</span>
            </p>
            <p className="text-sm text-clay mt-2">{displayTotalActivities} moments across {displayAreasExplored} areas</p>
          </div>

          {/* Category breakdown */}
          <div className="card-elevated p-6 sm:p-8">
            <p className="eyebrow mb-5">Activities by area</p>
            {Object.keys(displayCategoryCounts).length === 0 ? (
              <p className="text-sm text-clay">
                Nothing logged yet. Whenever you are ready, every small moment you keep will show up here.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(displayCategoryCounts)
                  .filter(([cat]) => cat !== 'unknown')
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
              <p className="eyebrow mb-5">Recent months</p>
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

      {/* ─── COMPARE TAB ─── */}
      {activeTab === 'compare' && childStats.length > 1 && (
        <ComparisonView childStats={childStats} />
      )}

      {/* Empty state */}
      {totalActivities === 0 && childStats.length === 0 && (
        <div className="card-elevated p-8 text-center">
          <TrendingUp className="h-10 w-10 text-stone mx-auto mb-3" />
          <p className="text-sm font-medium text-ink mb-1">Nothing here yet</p>
          <p className="text-xs text-clay mb-4">
            Once you start keeping moments, this is where you can look back on what your family has explored.
          </p>
          <Link href="/browse" className="btn-primary inline-flex items-center gap-1.5">
            Browse activities
          </Link>
        </div>
      )}
    </div>
  );
}

function displayThisWeekLine(activitiesThisWeek: number, selectedChild: string | null) {
  if (selectedChild || activitiesThisWeek === 0) return '.';
  return (
    <>
      , {activitiesThisWeek} of them{' '}
      <span className="text-forest">this week</span>.
    </>
  );
}

// ─── Comparison View ─────────────────────────────────────

function ComparisonView({ childStats }: { childStats: ChildStat[] }) {
  const allCategories = ['nature', 'kitchen', 'science', 'art', 'movement', 'literacy', 'maths', 'life_skills', 'calm', 'social'];
  const childColors = ['bg-forest', 'bg-cat-art', 'bg-cat-nature', 'bg-cat-science', 'bg-cat-movement'];

  return (
    <div className="space-y-8">
      <div className="card-elevated p-6 sm:p-8">
        <p className="eyebrow mb-5">A look across your children</p>
        <p className="text-xs text-clay mb-5">Side by side, not against each other. Every child explores at their own pace.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/30">
                <th className="text-left py-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-clay">Child</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Moments</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Hours</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Days</th>
                <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-clay">Areas</th>
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
                  <td className="text-center py-3 px-3 text-lg font-light text-ink">{Math.floor(child.totalMinutes / 60)}</td>
                  <td className="text-center py-3 px-3 text-lg font-light text-ink">{child.uniqueDays}</td>
                  <td className="text-center py-3 px-3 text-lg font-light text-cat-nature">{child.areasExplored}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-elevated p-6 sm:p-8">
        <p className="eyebrow mb-5">Areas explored by child</p>
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
