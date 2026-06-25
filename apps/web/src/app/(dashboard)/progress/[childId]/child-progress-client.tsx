'use client';

import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import {
  ArrowLeft,
  Star,
  Clock,
  Target,
  ChevronRight,
  Image,
  FileText,
  CalendarDays,
  Compass,
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
  uniqueDays: number;
  areasExplored: number;
  totalAreas: number;
  avgRating: string | null;
  categoryCounts: Record<string, number>;
  activityLogs: ActivityLog[];
  portfolioEntries: PortfolioEntry[];
}

export function ChildProgressClient({
  child,
  totalActivities,
  totalMinutes,
  uniqueDays,
  areasExplored,
  totalAreas,
  avgRating,
  categoryCounts,
  activityLogs,
  portfolioEntries,
}: ChildProgressClientProps) {
  const hours = Math.floor(totalMinutes / 60);

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
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss/10">
            <Target className="h-5 w-5 text-moss" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{totalActivities}</p>
            <p className="text-xs text-clay/50">moments kept</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky/10">
            <Clock className="h-5 w-5 text-sky" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{hours}</p>
            <p className="text-xs text-clay/50">hours together</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10">
            <CalendarDays className="h-5 w-5 text-terracotta" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{uniqueDays}</p>
            <p className="text-xs text-clay/50">days of learning</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage/10">
            <Compass className="h-5 w-5 text-sage" />
          </div>
          <div>
            <p className="text-2xl font-light text-ink">{areasExplored}<span className="text-sm text-clay/50">/{totalAreas}</span></p>
            <p className="text-xs text-clay/50">areas explored</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Season reflection */}
        <div className="card-elevated p-6 sm:p-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-4">This season</p>
          <p className="font-display text-2xl font-light text-ink leading-relaxed">
            {child.name} has explored{' '}
            <span className="text-forest">{areasExplored} of {totalAreas} areas</span>{' '}
            and kept{' '}
            <span className="text-forest">{totalActivities} {totalActivities === 1 ? 'lovely moment' : 'lovely moments'}</span>.
          </p>
          <p className="text-sm text-clay/60 mt-4">
            {uniqueDays} {uniqueDays === 1 ? 'day' : 'days'} of learning, around {hours} {hours === 1 ? 'hour' : 'hours'} together so far.
          </p>
        </div>

        {/* Average rating */}
        {avgRating && (
          <div className="card-elevated p-6 sm:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">How it has felt</p>
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
            <p className="text-sm text-clay/60 mt-2">A gentle reminder of what landed well for {child.name}.</p>
          </div>
        )}

        {/* Category breakdown */}
        <div className="card-elevated p-6 sm:p-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-5">
            Areas explored
          </p>
          {Object.keys(categoryCounts).filter((k) => k !== 'unknown').length === 0 ? (
            <p className="text-sm text-clay/50 py-4">
              Nothing logged for {child.name} yet. Every small moment you keep will show up here.
            </p>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(categoryCounts)
                .filter(([cat]) => cat !== 'unknown')
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

        {/* Recent activities */}
        <div className="card-elevated p-6 sm:p-8 space-y-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50">Recent moments</p>
          {activityLogs.length === 0 ? (
            <p className="text-sm text-clay/50 py-4">
              Nothing logged for {child.name} yet.
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
    </div>
  );
}
