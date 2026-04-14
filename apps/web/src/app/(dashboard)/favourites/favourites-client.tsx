'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_ACTIVITIES } from '@/lib/mock-data';
import type { MockActivity } from '@/lib/mock-data';
import { ActivityCard, CATEGORY_CONFIG } from '@/components/shared/activity-card';
import { useFavouritesStore } from '@/stores/favourites';
import {
  Heart,
  Search,
  Loader2,
  ArrowUpDown,
  ArrowRight,
  SlidersHorizontal,
  Grid3X3,
  List,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

type SortOption = 'recent' | 'name' | 'duration' | 'age';
type ViewMode = 'grid' | 'list';

export function FavouritesClient() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dbActivities, setDbActivities] = useState<MockActivity[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { favouriteIds, loading, loadFavourites } = useFavouritesStore();

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  // Fetch real activity data from the API
  useEffect(() => {
    async function fetchFavouriteActivities() {
      try {
        const res = await fetch('/api/favourites');
        if (res.ok) {
          const data = await res.json();
          if (data.activities && data.activities.length > 0) {
            const mapped = data.activities.map((a: Record<string, unknown>) => ({
              ...a,
              instructions: Array.isArray(a.instructions) ? a.instructions : [],
              materials: Array.isArray(a.materials) ? a.materials : [],
              season: Array.isArray(a.season) ? a.season : [],
              weather: Array.isArray(a.weather) ? a.weather : [],
              learning_outcomes: Array.isArray(a.learning_outcomes) ? a.learning_outcomes : [],
            }));
            setDbActivities(mapped);
          }
        }
      } catch (error) {
        console.error('Failed to fetch favourite activities:', error);
      }
    }
    fetchFavouriteActivities();
  }, []);

  const favourites = useMemo(() => {
    const mockMatches = MOCK_ACTIVITIES.filter((a) => favouriteIds.has(a.id));
    const mockIds = new Set(mockMatches.map((a) => a.id));
    const dbMatches = dbActivities.filter(
      (a) => favouriteIds.has(a.id) && !mockIds.has(a.id)
    );
    return [...mockMatches, ...dbMatches];
  }, [favouriteIds, dbActivities]);

  const filtered = useMemo(() => {
    let result = favourites;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.learning_outcomes?.some((o: string) => o.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        result = [...result].sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case 'age':
        result = [...result].sort((a, b) => a.age_min - b.age_min);
        break;
      case 'recent':
      default:
        // Keep original order (most recently favourited first)
        break;
    }

    return result;
  }, [favourites, search, selectedCategory, sortBy]);

  const categories = useMemo(
    () => [...new Set(favourites.map((a) => a.category))],
    [favourites]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of favourites) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [favourites]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recently added' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'duration', label: 'Duration' },
    { value: 'age', label: 'Age range' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 text-moss animate-spin mx-auto mb-3" />
          <p className="text-sm text-clay/50">Loading your favourites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10">
            <Heart className="h-5 w-5 text-terracotta" />
          </div>
          <div>
            <div className="eyebrow mb-1">Your Collection</div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-ink tracking-tight">
              Favourites
            </h1>
            <p className="text-clay mt-1 text-base">
              {favourites.length} saved {favourites.length === 1 ? 'activity' : 'activities'}
              {selectedCategory && (
                <span>
                  {' '}&middot; {filtered.length} in{' '}
                  {CATEGORY_CONFIG[selectedCategory]?.label || selectedCategory}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search, filter & sort bar */}
      {favourites.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay/30" />
              <Input
                placeholder="Search favourites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 rounded-[4px] border-stone bg-linen shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex h-10 items-center gap-2 rounded-[4px] border border-stone px-3 text-[12px] font-bold text-clay hover:border-moss/30 transition-all"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-[8px] border border-stone bg-linen shadow-lg py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                            sortBy === option.value
                              ? 'text-forest font-bold bg-forest/5'
                              : 'text-clay hover:bg-parchment/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex rounded-[4px] border border-stone overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`h-10 w-10 flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-forest text-parchment' : 'text-clay hover:bg-linen'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`h-10 w-10 flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-forest text-parchment' : 'text-clay hover:bg-linen'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-[3px] px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                !selectedCategory
                  ? 'bg-forest text-parchment'
                  : 'bg-linen text-clay/60 border border-stone hover:border-umber/20'
              }`}
            >
              All ({favourites.length})
            </button>
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`rounded-[3px] px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-forest text-parchment'
                      : 'bg-linen text-clay/60 border border-stone hover:border-umber/20'
                  }`}
                >
                  {config?.label || cat} ({categoryCounts[cat] || 0})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results count */}
      {favourites.length > 0 && (search || selectedCategory) && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-clay/50 uppercase tracking-wider">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </span>
          {(search || selectedCategory) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(null); }}
              className="text-[12px] text-terracotta font-bold hover:text-forest transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {favourites.length === 0 ? (
        /* Empty state - no favourites at all */
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
          <div className="text-center px-6 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-terracotta/8 mx-auto mb-5">
              <Heart className="h-8 w-8 text-terracotta/40" />
            </div>
            <p className="font-display text-2xl font-light text-ink mb-2">
              Save activities you love
            </p>
            <p className="text-[14px] text-clay leading-relaxed mb-6">
              Tap the heart on any activity to save it here. Build your own collection of
              go-to ideas for every mood, weather, and energy level.
            </p>
            <Link
              href="/browse"
              className="btn-terra inline-flex items-center gap-2 text-sm"
            >
              Browse Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* No results from search/filter */
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-stone bg-linen/50">
          <div className="text-center px-4">
            <Search className="mx-auto mb-3 h-8 w-8 text-stone" />
            <p className="font-medium text-umber">No matches found</p>
            <p className="text-[13px] text-clay mt-1 italic max-w-xs">
              Try adjusting your search or category filter.
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid view */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2 stagger-children">
          {filtered.map((activity) => {
            const config = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.nature;
            const Icon = config.icon;

            return (
              <Link
                key={activity.id}
                href={`/activity/${activity.slug}`}
                className="card-interactive flex items-center gap-4 p-4 group"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink group-hover:text-moss transition-colors truncate">
                    {activity.title}
                  </p>
                  <p className="text-[12px] text-clay truncate">{activity.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="tag bg-stone/30 text-umber">{activity.duration_minutes}m</span>
                  <span className="tag bg-stone/30 text-umber">
                    {activity.age_min}&ndash;{activity.age_max}y
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-stone shrink-0 group-hover:text-terracotta transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
