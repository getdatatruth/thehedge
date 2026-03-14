'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ActivityCard, CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { Input } from '@/components/ui/input';
import { FilterChips } from '@/components/shared/filter-chips';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Grid3X3,
  FolderOpen,
  X,
  ArrowRight,
  ChevronDown,
  Crown,
} from 'lucide-react';

const PAGE_SIZE = 12;

const DURATION_FILTERS = [
  { label: '15 min', value: 'dur:15' },
  { label: '30 min', value: 'dur:30' },
  { label: '45 min', value: 'dur:45' },
  { label: '60 min', value: 'dur:60' },
];

const ENERGY_FILTERS = [
  { label: 'Calm', value: 'energy:calm' },
  { label: 'Moderate', value: 'energy:moderate' },
  { label: 'Active', value: 'energy:active' },
];

const LOCATION_FILTERS = [
  { label: 'Indoor', value: 'loc:indoor' },
  { label: 'Outdoor', value: 'loc:outdoor' },
  { label: 'Both', value: 'loc:both' },
];

const MESS_FILTERS = [
  { label: 'No mess', value: 'mess:none' },
  { label: 'Low mess', value: 'mess:low' },
];

const AGE_FILTERS = [
  { label: 'Under 3', value: 'age:0-3' },
  { label: '3\u20135', value: 'age:3-5' },
  { label: '5\u20138', value: 'age:5-8' },
  { label: '8\u201312', value: 'age:8-12' },
];

interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  energy_level: string;
  mess_level: string;
  location: string;
  premium: boolean;
  screen_free: boolean;
  season: string[];
  weather: string[];
  learning_outcomes: string[];
  is_new?: boolean;
}

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  emoji: string;
  activity_ids: string[];
  featured: boolean;
  seasonal?: boolean;
  event_date?: string | null;
}

interface BrowseClientProps {
  activities: Activity[];
  collections: CollectionItem[];
  isFreeUser: boolean;
}

type Tab = 'all' | 'collections' | 'new';

export function BrowseClient({ activities, collections, isFreeUser }: BrowseClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Initialize state from URL search params on mount
  useEffect(() => {
    const durParam = searchParams.get('dur');
    const categoryParam = searchParams.get('category');
    const tabParam = searchParams.get('tab');
    const collectionParam = searchParams.get('collection');
    const searchParam = searchParams.get('q');
    const energyParam = searchParams.get('energy');
    const locationParam = searchParams.get('location');
    const messParam = searchParams.get('mess');
    const ageParam = searchParams.get('age');

    const initialFilters: string[] = [];

    if (durParam) {
      initialFilters.push(`dur:${durParam}`);
    }
    if (energyParam) {
      initialFilters.push(`energy:${energyParam}`);
    }
    if (locationParam) {
      initialFilters.push(`loc:${locationParam}`);
    }
    if (messParam) {
      initialFilters.push(`mess:${messParam}`);
    }
    if (ageParam) {
      initialFilters.push(`age:${ageParam}`);
    }

    if (initialFilters.length > 0) {
      setActiveFilters(initialFilters);
      setShowFilters(true);
    }

    if (categoryParam) {
      setCategory(categoryParam);
      setShowFilters(true);
    }
    if (searchParam) {
      setSearch(searchParam);
    }
    if (collectionParam) {
      setTab('collections');
      setSelectedCollection(collectionParam);
    } else if (tabParam === 'collections' || tabParam === 'new') {
      setTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL params when filters change (debounced)
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('tab', tab);
    if (category !== 'all') params.set('category', category);
    if (search) params.set('q', search);
    if (selectedCollection) params.set('collection', selectedCollection);
    for (const filter of activeFilters) {
      const [type, value] = filter.split(':');
      if (type === 'dur') params.set('dur', value);
      else if (type === 'energy') params.set('energy', value);
      else if (type === 'loc') params.set('location', value);
      else if (type === 'mess') params.set('mess', value);
      else if (type === 'age') params.set('age', value);
    }
    const qs = params.toString();
    const url = qs ? `/browse?${qs}` : '/browse';
    router.replace(url, { scroll: false });
  }, [tab, category, search, selectedCollection, activeFilters, router]);

  useEffect(() => {
    const timeout = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(timeout);
  }, [updateUrlParams]);

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category, activeFilters, tab, selectedCollection]);

  const allFilters = [
    ...AGE_FILTERS,
    ...DURATION_FILTERS,
    ...ENERGY_FILTERS,
    ...LOCATION_FILTERS,
    ...MESS_FILTERS,
  ];

  const newActivities = activities.filter((a) => a.is_new);
  const freeActivityCount = activities.filter((a) => !a.premium).length;

  // Count activities per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of activities) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [activities]);

  const filtered = useMemo(() => {
    let result = activities;

    if (selectedCollection) {
      const collection = collections.find((c) => c.slug === selectedCollection);
      if (collection) {
        result = result.filter((a) => collection.activity_ids.includes(a.id));
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.learning_outcomes?.some((o: string) => o.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      result = result.filter((a) => a.category === category);
    }

    for (const filter of activeFilters) {
      const [type, value] = filter.split(':');
      switch (type) {
        case 'dur':
          result = result.filter((a) => a.duration_minutes <= parseInt(value));
          break;
        case 'energy':
          result = result.filter((a) => a.energy_level === value);
          break;
        case 'loc':
          result = result.filter(
            (a) => a.location === value || a.location === 'both' || a.location === 'anywhere'
          );
          break;
        case 'mess':
          result = result.filter((a) => a.mess_level === value);
          break;
        case 'age': {
          const [min, max] = value.split('-').map(Number);
          result = result.filter((a) => a.age_min <= max && a.age_max >= min);
          break;
        }
      }
    }

    // Apply new-only filter for the "new" tab
    if (tab === 'new') {
      result = result.filter((a) => a.is_new);
    }

    return result;
  }, [activities, search, category, activeFilters, selectedCollection, tab]);

  const visibleActivities = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  function handleClearAll() {
    setActiveFilters([]);
    setCategory('all');
    setSearch('');
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="eyebrow mb-3">Browse</div>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
          Find your next <em className="text-moss italic">adventure</em>
        </h1>
        <p className="text-clay mt-2 font-serif text-base">
          {activities.length} activities across {Object.keys(CATEGORY_CONFIG).length} categories.
        </p>
      </div>

      {/* Free tier upgrade nudge */}
      {isFreeUser && (
        <Link
          href="/settings/billing"
          className="card-elevated flex items-center gap-4 p-4 border-l-4 border-l-amber/40 hover:border-l-amber transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-amber/10">
            <Crown className="h-5 w-5 text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">
              You&apos;re browsing {freeActivityCount} free activities
            </p>
            <p className="text-[12px] text-clay/60 font-serif mt-0.5">
              Upgrade to unlock all {activities.length} activities, including premium content across every category.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-stone shrink-0 transition-all group-hover:text-amber group-hover:translate-x-1" />
        </Link>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone">
        {([
          { id: 'all' as Tab, label: 'All Activities', icon: Grid3X3 },
          { id: 'collections' as Tab, label: 'Collections', icon: FolderOpen },
          { id: 'new' as Tab, label: 'New', icon: Sparkles, count: newActivities.length },
        ]).map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedCollection(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              tab === id
                ? 'border-terracotta text-ink'
                : 'border-transparent text-clay/50 hover:text-clay'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span className="tag tag-terra">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Collections tab */}
      {tab === 'collections' && !selectedCollection && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {collections.map((collection) => {
            const collectionActivityCount = activities.filter((a) =>
              collection.activity_ids.includes(a.id)
            ).length;

            return (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.slug)}
                className="card-interactive p-5 flex items-start gap-4 text-left group"
              >
                <span className="text-3xl mt-0.5 transition-transform group-hover:scale-110">{collection.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-medium text-ink">{collection.title}</h3>
                  <p className="text-[12px] text-clay mt-1 line-clamp-2 font-serif">{collection.description}</p>
                  <p className="text-[11px] text-terracotta font-bold mt-2 uppercase tracking-wider">
                    {collectionActivityCount} {collectionActivityCount === 1 ? 'activity' : 'activities'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-stone mt-1 shrink-0 transition-all group-hover:text-terracotta group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      )}

      {/* Selected collection header */}
      {selectedCollection && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-1.5 text-[12px] text-terracotta hover:text-forest transition-colors font-bold uppercase tracking-wider"
          >
            <X className="h-4 w-4" />
            Back
          </button>
          {(() => {
            const col = collections.find((c) => c.slug === selectedCollection);
            return col ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">{col.emoji}</span>
                <h2 className="font-display text-xl font-light text-ink">{col.title}</h2>
                <span className="tag bg-stone/30 text-clay">{filtered.length} activities</span>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Search & filters */}
      {(tab === 'all' || tab === 'new' || selectedCollection) && (
        <>
          <div className="card-elevated p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/40" />
                <Input
                  placeholder="Search activities, skills, topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-10 rounded-lg border-stone bg-parchment/50 text-[13px]"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-[12px] font-bold transition-all ${
                  showFilters || activeFilters.length > 0
                    ? 'border-terracotta/30 bg-terracotta/5 text-terracotta'
                    : 'border-stone text-clay hover:border-moss/30'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilters.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded bg-terracotta text-white text-[9px] font-bold px-1">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategory('all')}
                    className={`rounded px-3 py-1.5 text-[11px] font-bold transition-all ${
                      category === 'all'
                        ? 'bg-forest text-parchment'
                        : 'bg-linen text-clay border border-stone hover:border-moss/30'
                    }`}
                  >
                    All ({activities.length})
                  </button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(category === key ? 'all' : key)}
                      className={`rounded px-3 py-1.5 text-[11px] font-bold transition-all ${
                        category === key
                          ? 'bg-forest text-parchment'
                          : 'bg-linen text-clay border border-stone hover:border-moss/30'
                      }`}
                    >
                      {label} {categoryCounts[key] ? `(${categoryCounts[key]})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Age Range</p>
                <FilterChips filters={AGE_FILTERS} active={activeFilters} onChange={setActiveFilters} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Duration</p>
                <FilterChips filters={DURATION_FILTERS} active={activeFilters} onChange={setActiveFilters} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Energy Level</p>
                <FilterChips filters={ENERGY_FILTERS} active={activeFilters} onChange={setActiveFilters} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Location</p>
                <FilterChips filters={LOCATION_FILTERS} active={activeFilters} onChange={setActiveFilters} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay/50 mb-2">Mess Level</p>
                <FilterChips filters={MESS_FILTERS} active={activeFilters} onChange={setActiveFilters} />
              </div>
            </div>
          )}

          {/* Results header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-clay/50 uppercase tracking-wider">
              {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'}
              {tab === 'new' && ' new this week'}
              {visibleCount < filtered.length && (
                <span className="text-clay/30">
                  {' '}&middot; showing {visibleCount}
                </span>
              )}
            </span>
            {(activeFilters.length > 0 || category !== 'all' || search) && (
              <button
                onClick={handleClearAll}
                className="text-[12px] text-terracotta font-bold hover:text-forest transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
              <div className="text-center px-4">
                <Search className="mx-auto mb-3 h-8 w-8 text-stone" />
                <p className="font-medium text-umber">No activities found</p>
                <p className="text-[13px] text-clay mt-1 font-serif italic max-w-xs">
                  Try adjusting your search or filters. We&apos;re always adding new activities.
                </p>
                {(activeFilters.length > 0 || category !== 'all') && (
                  <button
                    onClick={handleClearAll}
                    className="btn-secondary text-xs py-2 px-4 mt-4"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {visibleActivities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    showPremiumLock={isFreeUser}
                  />
                ))}
              </div>

              {/* Inline upgrade prompt after first page for free users */}
              {isFreeUser && visibleCount >= PAGE_SIZE && (
                <Link
                  href="/settings/billing"
                  className="block rounded-[14px] bg-gradient-to-r from-forest/5 via-forest/8 to-forest/5 border border-forest/10 p-6 text-center hover:border-forest/20 transition-all group"
                >
                  <p className="font-display text-lg font-light text-ink">
                    Loving what you see? <em className="text-moss italic">There&apos;s so much more.</em>
                  </p>
                  <p className="text-sm text-clay/60 font-serif mt-1.5 max-w-md mx-auto">
                    Unlock {activities.length - freeActivityCount} premium activities, the weekly planner, unlimited AI suggestions, and favourites.
                  </p>
                  <span className="inline-flex items-center gap-2 btn-primary text-sm mt-4 group-hover:shadow-lg transition-all">
                    <Crown className="h-4 w-4" />
                    See plans
                  </span>
                </Link>
              )}

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="btn-secondary flex items-center gap-2 text-sm py-3 px-6"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load more ({remaining > PAGE_SIZE ? PAGE_SIZE : remaining} of {remaining} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
