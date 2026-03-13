'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { ActivityCard } from '@/components/shared/activity-card';
import { LogActivityModal } from '@/components/shared/log-activity-modal';
import { FavouriteButton } from '@/components/shared/favourite-button';
import { useFavouritesStore } from '@/stores/favourites';
import type { MockActivity } from '@/lib/mock-data';
import {
  Clock,
  Users,
  Zap,
  Paintbrush,
  MapPin,
  Share2,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

const MESS_LABELS: Record<string, string> = {
  none: 'No mess',
  low: 'Low mess',
  medium: 'Some mess',
  high: 'Messy!',
};

const LOCATION_LABELS: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Indoor or outdoor',
  car: 'Car-friendly',
  anywhere: 'Anywhere',
};

interface ActivityDetailClientProps {
  activity: Record<string, unknown>;
  category: string;
  instructions: { steps: string[] };
  materials: { name: string; household_common: boolean }[];
  variations: MockActivity[];
  tryNext: MockActivity[];
}

export function ActivityDetailClient({
  activity,
  category,
  instructions,
  materials,
  variations,
  tryNext,
}: ActivityDetailClientProps) {
  const { loadFavourites } = useFavouritesStore();
  const [checkedMaterials, setCheckedMaterials] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  // Look up category config on the client side (avoids serializing React components)
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.nature;
  const Icon = config.icon;

  function toggleMaterial(index: number) {
    setCheckedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleStep(index: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const allStepsCompleted = instructions.steps.length > 0 && completedSteps.size === instructions.steps.length;

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-up pb-24">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/browse"
          className="text-clay/40 hover:text-moss transition-colors"
        >
          Browse
        </Link>
        <ChevronRight className="h-3 w-3 text-clay/20" />
        <Link
          href={`/browse?category=${category}`}
          className="text-clay/40 hover:text-moss transition-colors"
        >
          {config.label}
        </Link>
        <ChevronRight className="h-3 w-3 text-clay/20" />
        <span className="text-clay/70 font-medium truncate">{activity.title as string}</span>
      </div>

      {/* Hero header */}
      <div
        className="category-strip card-elevated relative overflow-hidden p-8"
        data-category={category}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-forest/3 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${config.bg}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <span className="eyebrow">
                {config.label}
              </span>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <FavouriteButton activityId={activity.id as string} size="md" />
              <button className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-linen text-clay/30 hover:text-moss hover:bg-moss/5 transition-all">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-light text-ink mb-3 tracking-tight">
            {activity.title as string}
          </h1>
          <p className="text-clay font-serif text-lg leading-relaxed">
            {activity.description as string}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { icon: Clock, label: `${activity.duration_minutes} min` },
              { icon: Users, label: `Ages ${activity.age_min}–${activity.age_max}` },
              { icon: Zap, label: activity.energy_level as string },
              { icon: Paintbrush, label: MESS_LABELS[activity.mess_level as string] || (activity.mess_level as string) },
              { icon: MapPin, label: LOCATION_LABELS[activity.location as string] || (activity.location as string) },
            ].map(({ icon: MetaIcon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-[3px] bg-linen border border-stone px-3 py-1.5 text-[12px] font-medium text-clay"
              >
                <MetaIcon className="h-3.5 w-3.5 text-clay/40" />
                {label}
              </span>
            ))}
          </div>

          {(activity.screen_free as boolean) && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-[3px] bg-moss/8 border border-moss/15 px-3 py-1 text-[11px] font-semibold text-moss">
              <Sparkles className="h-3 w-3" />
              Screen-free activity
            </div>
          )}
        </div>
      </div>

      {/* Materials checklist */}
      {materials && materials.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-light text-ink">
              What you&apos;ll <em className="text-moss italic">need</em>
            </h2>
            <span className="text-xs text-clay/40 font-medium">
              {checkedMaterials.size}/{materials.length} ready
            </span>
          </div>
          <div className="space-y-1">
            {materials.map((item, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 cursor-pointer group rounded-[14px] px-3 py-2.5 -mx-3 transition-all ${
                  checkedMaterials.has(i) ? 'bg-forest/3' : 'hover:bg-linen'
                }`}
                onClick={() => toggleMaterial(i)}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                    checkedMaterials.has(i)
                      ? 'border-moss bg-moss text-white'
                      : 'border-forest/15 group-hover:border-moss/40'
                  }`}
                >
                  {checkedMaterials.has(i) && (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={`text-sm transition-all ${
                    checkedMaterials.has(i)
                      ? 'text-clay/40 line-through'
                      : 'text-umber group-hover:text-forest'
                  }`}
                >
                  {item.name}
                  {item.household_common && (
                    <span className="ml-1.5 tag">
                      household item
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-step instructions */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-light text-ink">
            How to <em className="text-moss italic">do it</em>
          </h2>
          {instructions.steps.length > 0 && (
            <span className="text-xs text-clay/40 font-medium">
              {completedSteps.size}/{instructions.steps.length} steps
            </span>
          )}
        </div>
        <ol className="space-y-2">
          {instructions.steps.map((step, i) => (
            <li
              key={i}
              className={`flex gap-4 cursor-pointer group rounded-[14px] px-3 py-3 -mx-3 transition-all ${
                completedSteps.has(i) ? 'bg-forest/3' : 'hover:bg-linen'
              }`}
              onClick={() => toggleStep(i)}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all ${
                  completedSteps.has(i)
                    ? 'bg-moss text-parchment'
                    : 'bg-gradient-to-br from-forest to-moss text-parchment'
                }`}
              >
                {completedSteps.has(i) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </span>
              <p
                className={`text-sm leading-relaxed pt-1.5 transition-all ${
                  completedSteps.has(i)
                    ? 'text-clay/40 line-through'
                    : 'text-umber'
                }`}
              >
                {step}
              </p>
            </li>
          ))}
        </ol>

        {allStepsCompleted && (
          <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-moss/8 border border-moss/15 px-4 py-3 animate-scale-in">
            <Sparkles className="h-5 w-5 text-moss" />
            <p className="text-sm font-medium text-moss">
              All steps complete — tap &quot;We did this!&quot; below to log it.
            </p>
          </div>
        )}
      </div>

      {/* Learning outcomes */}
      {(activity.learning_outcomes as string[])?.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber" />
            <h2 className="font-display text-lg font-light text-ink">
              What they&apos;ll <em className="text-moss italic">learn</em>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(activity.learning_outcomes as string[]).map((outcome: string) => (
              <span
                key={outcome}
                className="tag"
              >
                {outcome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip card */}
      <div className="rounded-[14px] bg-gradient-to-r from-amber/5 via-amber/8 to-amber/5 border border-amber/15 p-5">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[14px] bg-amber/10">
            <Lightbulb className="h-4 w-4 text-amber" />
          </div>
          <div>
            <p className="text-sm font-semibold text-umber mb-1">Parent tip</p>
            <p className="text-[13px] text-clay/60 font-serif leading-relaxed">
              Let your child lead the pace. If they want to spend longer on one step, that&apos;s
              great — curiosity-driven learning sticks better than rushing through.
            </p>
          </div>
        </div>
      </div>

      {/* Variations */}
      {variations.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-light text-ink">
            <em className="text-moss italic">Variations</em>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {variations.slice(0, 4).map((v) => (
              <Link
                key={v.id}
                href={`/activity/${v.slug}`}
                className="card-interactive p-4 flex items-center gap-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${CATEGORY_CONFIG[v.category]?.bg || 'bg-moss/10'}`}>
                  {(() => { const VIcon = CATEGORY_CONFIG[v.category]?.icon; return VIcon ? <VIcon className={`h-4 w-4 ${CATEGORY_CONFIG[v.category]?.color}`} /> : null; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{v.title}</p>
                  {v.variation_type && (
                    <p className="text-xs text-clay/50 capitalize">{v.variation_type} version</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-clay/20 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Try next */}
      {tryNext.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-light text-ink">
              Try <em className="text-moss italic">next</em>
            </h2>
            <Link
              href={`/browse?category=${category}`}
              className="text-xs font-medium text-moss hover:text-forest transition-colors flex items-center gap-1"
            >
              More {config.label} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 stagger-children">
            {tryNext.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky log button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:left-[calc(50%+130px)]">
        <LogActivityModal
          activityId={activity.id as string}
          activityTitle={activity.title as string}
          defaultDuration={activity.duration_minutes as number}
        >
          <button className={`btn-primary text-base px-8 py-3.5 shadow-xl shadow-forest/25 flex items-center gap-2 ${allStepsCompleted ? 'animate-glow ring-2 ring-sage/30' : ''}`}>
            <CheckCircle className="h-5 w-5" />
            We did this!
          </button>
        </LogActivityModal>
      </div>
    </div>
  );
}
