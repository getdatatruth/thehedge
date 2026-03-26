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
import { Flame, Activity, Trophy, Leaf, Award } from 'lucide-react-native';
import { ScoreRing } from '@/components/ui/ScoreRing';
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
  current_streak: number;
  this_week: number;
  average_rating: number | null;
  unique_days: number;
  category_breakdown: Record<string, number>;
  hedge_score: {
    score: number;
    max_score: number;
    breakdown: { volume: number; consistency: number; breadth: number; depth: number };
  };
  tier: {
    name: string;
    emoji: string;
    next_tier: string | null;
    progress: number;
    min_score: number;
    max_score: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    emoji: string;
    unlocked: boolean;
    requirement: string;
  }>;
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
              label="Activities"
            />
            <StatCard
              icon={<Flame size={20} color="#E8735A" />}
              value={progress?.current_streak || 0}
              label="Day streak"
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
                streak: progress?.current_streak,
                uniqueDays: progress?.unique_days,
                totalMinutes: progress?.total_minutes,
                categoryBreakdown: progress?.category_breakdown,
                hedgeScore: progress?.hedge_score?.score,
                tierName: progress?.tier?.name,
                scoreBreakdown: progress?.hedge_score?.breakdown,
              }}
              enabled={!!progress}
            />

            {/* Hedge Score + Tier */}
            <AnimatedCard delay={100}>
              <View style={styles.scoreCard}>
                <ScoreRing
                  score={progress?.hedge_score?.score || 0}
                  maxScore={progress?.hedge_score?.max_score || 1000}
                  label={progress?.tier ? `${progress.tier.emoji} ${progress.tier.name}` : 'Hedge Score'}
                  subtitle={progress?.tier?.next_tier
                    ? `${Math.round((progress.tier.progress) * 100)}% to ${progress.tier.next_tier}`
                    : 'Max tier reached!'
                  }
                />
                {/* Score breakdown */}
                {progress?.hedge_score?.breakdown && (
                  <View style={styles.scoreBreakdown}>
                    {[
                      { label: 'Volume', value: progress.hedge_score.breakdown.volume, max: 250, color: lightTheme.accent },
                      { label: 'Consistency', value: progress.hedge_score.breakdown.consistency, max: 250, color: '#F5A623' },
                      { label: 'Breadth', value: progress.hedge_score.breakdown.breadth, max: 250, color: '#5B8DEF' },
                      { label: 'Depth', value: progress.hedge_score.breakdown.depth, max: 250, color: '#9B7BD4' },
                    ].map((dim) => (
                      <View key={dim.label} style={styles.breakdownDim}>
                        <View style={styles.breakdownDimHeader}>
                          <Text style={styles.breakdownDimLabel}>{dim.label}</Text>
                          <Text style={styles.breakdownDimValue}>{dim.value}/{dim.max}</Text>
                        </View>
                        <View style={styles.breakdownDimBar}>
                          <View style={[styles.breakdownDimFill, { width: `${(dim.value / dim.max) * 100}%`, backgroundColor: dim.color }]} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </AnimatedCard>

            {/* Achievements */}
            <AnimatedCard delay={200}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Achievements</Text>
                  <TouchableOpacity>
                    <Text style={styles.showMore}>SHOW MORE</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementsRow}
              >
                {(progress?.achievements || []).map((badge, i) => (
                  <View
                    key={i}
                    style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}
                  >
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>
                      {badge.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              </View>
            </AnimatedCard>

            {/* Milestones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <View style={styles.milestonesGrid}>
                {[
                  { label: 'First week complete', done: (progress?.unique_days || 0) >= 7 },
                  { label: '10 activities logged', done: (progress?.total_activities || 0) >= 10 },
                  { label: 'All categories explored', done: Object.keys(breakdown).length >= 5 },
                  { label: '30-day streak', done: (progress?.current_streak || 0) >= 30 },
                ].map((milestone, i) => (
                  <View key={i} style={styles.milestoneRow}>
                    <View style={[styles.milestoneCheck, milestone.done && styles.milestoneCheckDone]}>
                      {milestone.done && <Award size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.milestoneLabel, milestone.done && styles.milestoneLabelDone]}>
                      {milestone.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

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
  scoreCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.xl,
  },
  scoreBreakdown: {
    width: '100%',
    gap: spacing.md,
  },
  breakdownDim: {
    gap: 4,
  },
  breakdownDimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownDimLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: lightTheme.textSecondary,
  },
  breakdownDimValue: {
    fontSize: 11,
    color: lightTheme.textMuted,
  },
  breakdownDimBar: {
    height: 6,
    backgroundColor: lightTheme.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownDimFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showMore: {
    ...typography.caption,
    color: lightTheme.accent,
  },
  achievementsRow: {
    gap: spacing.md,
  },
  badgeCard: {
    width: 90,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeName: {
    ...typography.uiSmall,
    color: lightTheme.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: lightTheme.textMuted,
  },
  milestonesGrid: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneCheckDone: {
    backgroundColor: lightTheme.accent,
    borderColor: lightTheme.accent,
  },
  milestoneLabel: {
    ...typography.ui,
    color: lightTheme.textSecondary,
  },
  milestoneLabelDone: {
    color: lightTheme.text,
    fontWeight: '600',
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
