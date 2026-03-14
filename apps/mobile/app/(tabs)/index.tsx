import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sun,
  Cloud,
  CloudRain,
  Flame,
  Activity,
  Trophy,
  ChevronRight,
  Sparkles,
  Bell,
  Settings,
  Search,
  Heart,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  emoji: string | null;
  activity_count: number;
}

interface DashboardData {
  greeting: string;
  firstName: string;
  weather: {
    temperature: number;
    condition: string;
    isRaining: boolean;
  } | null;
  streak: number;
  activitiesThisWeek: number;
  todayActivities: Array<{
    id: string;
    title: string;
    category: string;
    slug: string;
    duration_minutes: number;
  }>;
  familyName: string;
  featuredCollections?: CollectionItem[];
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  if (condition?.toLowerCase().includes('rain'))
    return <CloudRain size={20} color={colors.clay} />;
  if (condition?.toLowerCase().includes('cloud'))
    return <Cloud size={20} color={colors.clay} />;
  return <Sun size={20} color={colors.amber} />;
};

export default function TodayScreen() {
  const router = useRouter();
  const { profile, children, family } = useAuthStore();
  const firstName = profile?.name?.split(' ')[0] || 'there';

  const {
    data: dashboard,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<DashboardData>(['dashboard'], '/me/dashboard', {
    staleTime: 1000 * 60 * 5,
  });

  // Build greeting locally as fallback
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading && !dashboard) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>
            {family?.name || 'Your family'}
          </Text>
          <Text style={styles.greeting}>
            {greeting}, {firstName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/(stack)/notifications' as any)}
            style={styles.headerButton}
          >
            <Bell size={20} color={colors.clay} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(stack)/settings' as any)}
            style={styles.headerButton}
          >
            <Settings size={20} color={colors.clay} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
      >
        {/* Weather + Brief Card */}
        <Card variant="elevated" padding="xl">
          <View style={styles.briefHeader}>
            <Text style={styles.briefTitle}>Today's brief</Text>
            {dashboard?.weather && (
              <View style={styles.weatherPill}>
                <WeatherIcon condition={dashboard.weather.condition} />
                <Text style={styles.weatherText}>
                  {Math.round(dashboard.weather.temperature)}C
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.briefBody}>
            {dashboard?.weather?.isRaining
              ? "It's a rainy day - perfect for indoor activities."
              : children.length > 0
              ? `We've got ${dashboard?.todayActivities?.length || 'some great'} ideas for ${children.map((c) => c.name).join(' & ')} today.`
              : "Here are today's activity ideas for your family."}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/chat')}
            style={styles.askAiButton}
          >
            <Sparkles size={16} color={colors.parchment} />
            <Text style={styles.askAiText}>Ask AI for ideas</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Flame size={18} color={colors.terracotta} />
            <Text style={styles.statNumber}>
              {dashboard?.streak || 0}
            </Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={18} color={colors.moss} />
            <Text style={styles.statNumber}>
              {dashboard?.activitiesThisWeek || 0}
            </Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={18} color={colors.amber} />
            <Text style={styles.statNumber}>
              {children.length}
            </Text>
            <Text style={styles.statLabel}>
              {children.length === 1 ? 'Child' : 'Children'}
            </Text>
          </View>
        </View>

        {/* Today's Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's ideas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
              <Text style={styles.seeAll}>Browse all</Text>
            </TouchableOpacity>
          </View>

          {dashboard?.todayActivities?.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              onPress={() =>
                router.push(`/(tabs)/browse/${activity.slug}` as any)
              }
            >
              <Card variant="interactive" padding="lg">
                <View style={styles.activityRow}>
                  <View style={styles.activityInfo}>
                    <Badge variant="sage" size="sm">
                      {activity.category}
                    </Badge>
                    <Text style={styles.activityTitle}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityDuration}>
                      {activity.duration_minutes} min
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.stone} />
                </View>
              </Card>
            </TouchableOpacity>
          )) ?? (
            <Card variant="elevated" padding="xl">
              <View style={styles.emptyState}>
                <Sparkles size={24} color={colors.moss} />
                <Text style={styles.emptyTitle}>
                  Your activities will appear here
                </Text>
                <Text style={styles.emptyBody}>
                  Ask the AI for personalised ideas or browse the library.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/(tabs)/browse')}
                >
                  Browse activities
                </Button>
              </View>
            </Card>
          )}
        </View>

        {/* Featured Collections */}
        {(dashboard?.featuredCollections?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Collections</Text>
              <TouchableOpacity onPress={() => router.push('/(stack)/collections' as any)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionsRow}
            >
              {dashboard!.featuredCollections!.map((col) => (
                <TouchableOpacity
                  key={col.id}
                  onPress={() => router.push('/(stack)/collections' as any)}
                  style={styles.collectionCard}
                >
                  <Card variant="elevated" padding="lg">
                    <View style={styles.collectionContent}>
                      {col.emoji && <Text style={styles.collectionEmoji}>{col.emoji}</Text>}
                      <Text style={styles.collectionTitle} numberOfLines={2}>
                        {col.title}
                      </Text>
                      <Text style={styles.collectionCount}>
                        {col.activity_count} activities
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.quickActions}>
            {[
              {
                label: 'Ask AI',
                icon: Sparkles,
                color: colors.forest,
                route: '/(tabs)/chat',
              },
              {
                label: 'Browse',
                icon: Search,
                color: colors.moss,
                route: '/(tabs)/browse',
              },
              {
                label: 'Favourites',
                icon: Heart,
                color: colors.terracotta,
                route: '/(stack)/favourites',
              },
              {
                label: 'Timeline',
                icon: Activity,
                color: colors.umber,
                route: '/(stack)/timeline',
              },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}12` },
                  ]}
                >
                  <action.icon size={20} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    zIndex: 1,
  },
  headerLeft: { flex: 1, marginRight: spacing.md },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: `${colors.clay}80`,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  briefTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.parchment,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  weatherText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  briefBody: {
    fontSize: 15,
    color: colors.clay,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    borderRadius: radius.sm,
    paddingVertical: 12,
  },
  askAiText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.parchment,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: `${colors.clay}80`,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.moss,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityInfo: { flex: 1, gap: 6 },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  activityDuration: {
    fontSize: 12,
    color: `${colors.clay}80`,
  },
  collectionsRow: {
    gap: spacing.md,
  },
  collectionCard: {
    width: 140,
  },
  collectionContent: {
    alignItems: 'center',
    gap: 4,
  },
  collectionEmoji: {
    fontSize: 28,
  },
  collectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
  },
  collectionCount: {
    fontSize: 11,
    color: colors.clay,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.clay,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.clay,
    textAlign: 'center',
    lineHeight: 20,
  },
});
