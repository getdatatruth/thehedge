import React, { useState, useMemo, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Clock, ChevronRight, SlidersHorizontal, X } from 'lucide-react-native';
import { SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { useApiQuery } from '@/hooks/use-api';
import { BrowseSkeleton } from '@/components/ui/ScreenSkeletons';
import { FilterSheet, Filters, DEFAULT_FILTERS } from '@/components/shared/FilterSheet';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  duration_minutes: number;
  location: string;
  age_min?: number;
  age_max?: number;
  energy_level?: string;
  mess_level?: string;
}

// Labels for display, values match database category enum exactly
const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Nature', value: 'nature' },
  { label: 'Science', value: 'science' },
  { label: 'Art', value: 'art' },
  { label: 'Maths', value: 'maths' },
  { label: 'Literacy', value: 'literacy' },
  { label: 'Movement', value: 'movement' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Life Skills', value: 'life_skills' },
  { label: 'Calm', value: 'calm' },
  { label: 'Social', value: 'social' },
];

function getCategoryColor(category: string): string {
  const key = category?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

export default function BrowseScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<SimpleBottomSheetRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Build server-side query params - the API handles all filtering
  const queryParams = useMemo(() => {
    const params: string[] = ['per_page=50'];
    if (selectedCategory !== 'all') {
      params.push(`category=${selectedCategory}`);
    }
    if (searchSubmitted) {
      params.push(`q=${encodeURIComponent(searchSubmitted)}`);
    }
    if (filters.duration !== null) {
      params.push(`duration_max=${filters.duration}`);
    }
    if (filters.location && filters.location !== 'anywhere' && filters.location !== 'both') {
      params.push(`location=${filters.location}`);
    }
    if (filters.energy) {
      params.push(`energy=${filters.energy}`);
    }
    if (filters.mess) {
      params.push(`mess=${filters.mess}`);
    }
    if (filters.ageMin !== null) {
      params.push(`age_min=${filters.ageMin}`);
    }
    if (filters.ageMax !== null) {
      params.push(`age_max=${filters.ageMax}`);
    }
    return params.join('&');
  }, [selectedCategory, searchSubmitted, filters]);

  const {
    data: activities,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<Activity[]>(
    ['activities', queryParams],
    `/activities?${queryParams}`
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.duration !== null) count++;
    if (filters.location !== null && filters.location !== 'anywhere') count++;
    if (filters.energy !== null) count++;
    if (filters.mess !== null) count++;
    if (filters.ageMin !== null) count++;
    return count;
  }, [filters]);

  const handleCategoryChange = useCallback((cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
  }, []);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchSubmitted(searchQuery);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchSubmitted('');
  }, []);

  if (isLoading && !activities) return <BrowseSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={lightTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor={lightTheme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={lightTheme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            filterSheetRef.current?.expand();
          }}
        >
          <SlidersHorizontal
            size={18}
            color={activeFilterCount > 0 ? '#FFFFFF' : lightTheme.textSecondary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsContainer}
        bounces={false}
        alwaysBounceHorizontal={false}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          const chipBg = isActive
            ? cat.value === 'all'
              ? lightTheme.primary
              : getCategoryColor(cat.value)
            : lightTheme.surface;

          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => handleCategoryChange(cat.value)}
              style={[styles.chip, { backgroundColor: chipBg }]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {activities?.length || 0} activit{(activities?.length || 0) === 1 ? 'y' : 'ies'}
          {selectedCategory !== 'all' ? ` in ${CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}` : ''}
        </Text>
        {(activeFilterCount > 0 || searchSubmitted || selectedCategory !== 'all') && (
          <TouchableOpacity
            onPress={() => {
              setFilters(DEFAULT_FILTERS);
              clearSearch();
              setSelectedCategory('all');
            }}
          >
            <Text style={styles.clearAll}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Activity List */}
      <FlatList
        data={activities || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={lightTheme.accent}
          />
        }
        renderItem={({ item, index }) => {
          const catColor = getCategoryColor(item.category);
          return (
            <AnimatedCard delay={index * 50}>
              <TouchableOpacity
                onPress={() => router.push(`/(tabs)/browse/${item.slug}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.activityCard}>
                  <View style={[styles.categoryStrip, { backgroundColor: catColor }]} />
                  <View style={styles.activityContent}>
                    <View style={styles.activityTopRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                        <Text style={[styles.categoryBadgeText, { color: catColor }]}>
                          {item.category}
                        </Text>
                      </View>
                      <View style={styles.durationPill}>
                        <Clock size={11} color={lightTheme.textMuted} />
                        <Text style={styles.durationText}>
                          {item.duration_minutes} min
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.activityDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={lightTheme.border} style={styles.chevron} />
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activities found</Text>
            <Text style={styles.emptyBody}>
              Try a different search, category, or adjust your filters.
            </Text>
            {(activeFilterCount > 0 || searchSubmitted || selectedCategory !== 'all') && (
              <TouchableOpacity
                onPress={() => {
                  setFilters(DEFAULT_FILTERS);
                  clearSearch();
                  setSelectedCategory('all');
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <FilterSheet
        filters={filters}
        onChange={handleFilterChange}
        bottomSheetRef={filterSheetRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: lightTheme.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: lightTheme.text,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: lightTheme.accent,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E8735A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chipsContainer: {
    flexGrow: 0,
    height: 40,
    marginBottom: spacing.md,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textSecondary,
    lineHeight: 16,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    fontWeight: '600',
  },
  clearAll: {
    ...typography.uiSmall,
    color: lightTheme.accent,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },
  separator: { height: spacing.md },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  activityContent: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  activityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 12,
    color: lightTheme.textMuted,
  },
  activityTitle: {
    ...typography.uiBold,
    color: lightTheme.text,
    marginTop: 2,
  },
  activityDesc: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    marginRight: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  emptyBody: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  clearButton: {
    backgroundColor: lightTheme.accent,
    borderRadius: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  clearButtonText: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
  },
});
