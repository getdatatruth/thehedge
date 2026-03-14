import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Clock, ChevronRight, Filter } from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  duration_minutes: number;
  location: string;
  age_range: string;
  is_premium: boolean;
}

const CATEGORIES = [
  'All',
  'Nature',
  'Science',
  'Arts',
  'Maths',
  'Language',
  'Irish',
  'Physical',
  'Music',
  'Cooking',
];

const CATEGORY_COLORS: Record<string, string> = {
  nature: colors.sage,
  science: colors.moss,
  arts: colors.terracotta,
  maths: colors.amber,
  language: colors.umber,
  irish: colors.forest,
  physical: colors.terracotta,
  music: colors.clay,
  cooking: colors.amber,
};

export default function BrowseScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    data: activities,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<Activity[]>(['activities'], '/activities?limit=100');

  const filtered = useMemo(() => {
    if (!activities) return [];
    return activities.filter((a) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        a.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activities, selectedCategory, searchQuery]);

  if (isLoading && !activities) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Explore</Text>
        <Text style={styles.title}>Browse activities</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={colors.clay} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          placeholderTextColor={`${colors.clay}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.chip,
              selectedCategory === item && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {filtered.length} activit{filtered.length === 1 ? 'y' : 'ies'}
        </Text>
      </View>

      {/* Activity List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/browse/${item.slug}` as any)}
            activeOpacity={0.8}
          >
            <Card variant="interactive" padding="lg">
              <View style={styles.activityCard}>
                <View style={styles.categoryStrip}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[item.category.toLowerCase()] ||
                          colors.moss,
                      },
                    ]}
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityMeta}>
                    <Badge variant="sage" size="sm">
                      {item.category}
                    </Badge>
                    <View style={styles.durationPill}>
                      <Clock size={10} color={colors.clay} />
                      <Text style={styles.durationText}>
                        {item.duration_minutes} min
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.activityTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.activityDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={colors.stone}
                  style={styles.chevron}
                />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activities found</Text>
            <Text style={styles.emptyBody}>
              Try a different search or category.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: `${colors.clay}80`,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.ink,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.clay,
  },
  chipTextActive: {
    color: colors.parchment,
  },
  resultsBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  resultsText: {
    fontSize: 12,
    color: `${colors.clay}60`,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  separator: { height: spacing.md },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStrip: {
    width: 3,
    height: '100%',
    marginRight: spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryDot: {
    flex: 1,
    borderRadius: 2,
  },
  activityContent: {
    flex: 1,
    gap: 6,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: colors.clay,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
    lineHeight: 20,
  },
  activityDesc: {
    fontSize: 13,
    color: `${colors.clay}90`,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.clay,
  },
});
