import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Activity, Trophy, Clock, Calendar, Compass } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { ProgressSkeleton } from '@/components/ui/ScreenSkeletons';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface ProgressData {
  total_activities: number;
  total_minutes: number;
  this_week: number;
  average_rating: number | null;
  unique_days: number;
  areas_explored: number;
  category_breakdown: Record<string, number>;
}

type TabMode = 'activities' | 'insights';

function getCategoryColor(cat: string): string {
  const key = cat?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

export default function ProgressScreen() {
  const { children } = useAuthStore();
  // Default: "Family" (null) if multiple children, single child's ID if only one
  const [selectedChild, setSelectedChild] = useState<string | null>(
    children.length === 1 ? children[0]?.id : null
  );
  const [tab, setTab] = useState<TabMode>('insights');

  const {
    data: progress,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<ProgressData>(
    ['progress', selectedChild || 'family'],
    selectedChild ? `/progress?child_id=${selectedChild}` : '/progress'
  );

  if (isLoading && !progress) return <ProgressSkeleton />;

  const breakdown = progress?.category_breakdown || {};
  const totalForBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab('insights'); }}
          style={[styles.tab, tab === 'insights' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'insights' && styles.tabTextActive]}>
            Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab('activities'); }}
          style={[styles.tab, tab === 'activities' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'activities' && styles.tabTextActive]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Child Selector */}
      {children.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.childSelector}
          style={styles.childSelectorContainer}
        >
          <TouchableOpacity
            style={[styles.childChip, !selectedChild && styles.childChipActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedChild(null); }}
          >
            <Text style={[styles.childChipText, !selectedChild && styles.childChipTextActive]}>
              Family
            </Text>
          </TouchableOpacity>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childChip, selectedChild === child.id && styles.childChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedChild(child.id); }}
            >
              <Text style={[styles.childChipText, selectedChild === child.id && styles.childChipTextActive]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={lightTheme.accent}
          />
        }
      >
        {/* Stats Grid */}
        <AnimatedCard delay={0}>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Activity size={20} color={lightTheme.accent} />}
              value={progress?.total_activities || 0}
              label="Moments kept"
            />
            <StatCard
              icon={<Calendar size={20} color="#9B7BD4" />}
              value={progress?.unique_days || 0}
              label="Days of learning"
            />
            <StatCard
              icon={<Trophy size={20} color="#F5A623" />}
              value={progress?.this_week || 0}
              label="This week"
            />
          </View>
        </AnimatedCard>

        {tab === 'insights' && (
          <>
            {/* AI Insight */}
            <InsightCard
              type="progress"
              context={{
                children,
                totalActivities: progress?.total_activities,
                uniqueDays: progress?.unique_days,
                totalMinutes: progress?.total_minutes,
                areasExplored: progress?.areas_explored,
                categoryBreakdown: progress?.category_breakdown,
              }}
              enabled={!!progress}
            />

            {/* Warm reflection */}
            <AnimatedCard delay={100}>
              <View style={styles.reflectionCard}>
                <Text style={styles.reflectionTitle}>Your learning so far</Text>
                <Text style={styles.reflectionBody}>
                  No scores, no streaks. Just a record of the time you have spent together.
                </Text>
                <View style={styles.reflectionGrid}>
                  <ReflectionStat
                    icon={<Activity size={18} color={lightTheme.accent} />}
                    value={`${progress?.total_activities || 0}`}
                    label="moments kept"
                  />
                  <ReflectionStat
                    icon={<Clock size={18} color="#F5A623" />}
                    value={`${Math.round((progress?.total_minutes || 0) / 60)}h`}
                    label="time together"
                  />
                  <ReflectionStat
                    icon={<Calendar size={18} color="#9B7BD4" />}
                    value={`${progress?.unique_days || 0}`}
                    label="days of learning"
                  />
                  <ReflectionStat
                    icon={<Compass size={18} color="#5B8DEF" />}
                    value={`${progress?.areas_explored ?? Object.keys(breakdown).length} of 10`}
                    label="areas explored"
                  />
                </View>
              </View>
            </AnimatedCard>

            {/* Category Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category balance</Text>
              <View style={styles.card}>
                {Object.entries(breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <View key={category} style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={styles.breakdownCatRow}>
                          <View
                            style={[
                              styles.catDot,
                              { backgroundColor: getCategoryColor(category) },
                            ]}
                          />
                          <Text style={styles.breakdownCategory}>{category}</Text>
                        </View>
                        <Text style={styles.breakdownCount}>{count}</Text>
                      </View>
                      <View style={styles.breakdownBar}>
                        <View
                          style={[
                            styles.breakdownFill,
                            {
                              width: `${(count / totalForBreakdown) * 100}%`,
                              backgroundColor: getCategoryColor(category),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                {Object.keys(breakdown).length === 0 && (
                  <Text style={styles.emptyText}>
                    Complete activities to see your category balance
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        {tab === 'activities' && (
          <>
            {/* Time invested */}
            {(progress?.total_minutes ?? 0) > 0 && (
              <View style={styles.card}>
                <View style={styles.timeCard}>
                  <Text style={styles.timeValue}>
                    {Math.round((progress?.total_minutes || 0) / 60)}h{' '}
                    {(progress?.total_minutes || 0) % 60}m
                  </Text>
                  <Text style={styles.timeLabel}>
                    Learning time across {progress?.unique_days || 0} days
                  </Text>
                </View>
              </View>
            )}

            {/* Category breakdown in activities tab too */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By category</Text>
              <View style={styles.card}>
                {Object.entries(breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <View key={category} style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={styles.breakdownCatRow}>
                          <View
                            style={[
                              styles.catDot,
                              { backgroundColor: getCategoryColor(category) },
                            ]}
                          />
                          <Text style={styles.breakdownCategory}>{category}</Text>
                        </View>
                        <Text style={styles.breakdownCount}>{count}</Text>
                      </View>
                      <View style={styles.breakdownBar}>
                        <View
                          style={[
                            styles.breakdownFill,
                            {
                              width: `${(count / totalForBreakdown) * 100}%`,
                              backgroundColor: getCategoryColor(category),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                {Object.keys(breakdown).length === 0 && (
                  <Text style={styles.emptyText}>
                    No activities logged yet. Start exploring!
                  </Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ReflectionStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.reflectionStat}>
      {icon}
      <Text style={styles.reflectionStatValue}>{value}</Text>
      <Text style={styles.reflectionStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: lightTheme.text,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: lightTheme.primary,
  },
  tabText: {
    ...typography.uiBold,
    color: lightTheme.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  childSelectorContainer: {
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  childSelector: {
    paddingHorizontal: spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  childChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: lightTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childChipActive: {
    backgroundColor: lightTheme.primary,
  },
  childChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textSecondary,
    lineHeight: 18,
  },
  childChipTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: lightTheme.text,
  },
  statLabel: {
    ...typography.eyebrow,
    color: lightTheme.textMuted,
  },
  reflectionCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.md,
  },
  reflectionTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  reflectionBody: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    lineHeight: 20,
  },
  reflectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  reflectionStat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: lightTheme.background,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'flex-start',
    gap: 6,
  },
  reflectionStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: lightTheme.text,
  },
  reflectionStatLabel: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    ...typography.h3,
    color: lightTheme.text,
  },
  card: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  breakdownRow: {
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  breakdownLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownCategory: {
    ...typography.ui,
    color: lightTheme.text,
    textTransform: 'capitalize',
  },
  breakdownCount: {
    ...typography.uiBold,
    color: lightTheme.textSecondary,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: lightTheme.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: lightTheme.text,
  },
  timeLabel: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  emptyText: {
    ...typography.body,
    color: lightTheme.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
