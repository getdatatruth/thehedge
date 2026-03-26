import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from './Skeleton';
import { lightTheme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

// ---------- TodaySkeleton ----------
// Skeleton week strip + 3 skeleton activity cards + skeleton stats
export function TodaySkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={{ gap: 6 }}>
            <Skeleton width={140} height={14} />
            <Skeleton width={90} height={12} />
          </View>
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.scroll}>
        {/* Week strip */}
        <View style={styles.weekStrip}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.weekDay}>
              <Skeleton width={28} height={10} />
              <Skeleton width={36} height={36} borderRadius={18} />
            </View>
          ))}
        </View>

        {/* Context card */}
        <Skeleton width="100%" height={80} borderRadius={16} />

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <Skeleton width="30%" height={72} borderRadius={16} style={{ flex: 1 }} />
          <Skeleton width="30%" height={72} borderRadius={16} style={{ flex: 1 }} />
          <Skeleton width="30%" height={72} borderRadius={16} style={{ flex: 1 }} />
        </View>

        {/* Section title */}
        <Skeleton width={140} height={18} style={{ marginTop: spacing.md }} />

        {/* 3 activity cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.activityCard}>
            <Skeleton width={4} height={64} borderRadius={2} />
            <View style={styles.activityContent}>
              <Skeleton width={60} height={12} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="60%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ---------- BrowseSkeleton ----------
// Skeleton search bar + skeleton chips row + 4 skeleton cards
export function BrowseSkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.sectionPadded}>
        <Skeleton width={100} height={24} />
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Skeleton width="100%" height={48} borderRadius={14} style={{ flex: 1 }} />
        <Skeleton width={48} height={48} borderRadius={24} />
      </View>

      {/* Chips row */}
      <View style={styles.chipsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={70 + i * 8} height={40} borderRadius={50} />
        ))}
      </View>

      {/* Results bar */}
      <View style={styles.resultsBar}>
        <Skeleton width={100} height={12} />
      </View>

      {/* 4 activity cards */}
      <View style={styles.listPadded}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.activityCard}>
            <Skeleton width={4} height={72} borderRadius={2} />
            <View style={styles.activityContent}>
              <View style={styles.activityTopRow}>
                <Skeleton width={60} height={16} borderRadius={6} />
                <Skeleton width={50} height={12} />
              </View>
              <Skeleton width="85%" height={16} />
              <Skeleton width="65%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ---------- ProgressSkeleton ----------
// Skeleton stats grid + skeleton chart area
export function ProgressSkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.sectionPadded}>
        <Skeleton width={110} height={24} />
      </View>

      {/* Tab toggle */}
      <View style={[styles.sectionPadded, { marginBottom: spacing.lg }]}>
        <Skeleton width="100%" height={44} borderRadius={radius.lg} />
      </View>

      <View style={styles.scroll}>
        {/* Stats grid */}
        <View style={styles.statsRow}>
          <Skeleton width="30%" height={88} borderRadius={16} style={{ flex: 1 }} />
          <Skeleton width="30%" height={88} borderRadius={16} style={{ flex: 1 }} />
          <Skeleton width="30%" height={88} borderRadius={16} style={{ flex: 1 }} />
        </View>

        {/* Time card */}
        <Skeleton width="100%" height={72} borderRadius={16} />

        {/* Section title */}
        <Skeleton width={100} height={18} style={{ marginTop: spacing.sm }} />

        {/* Category breakdown bars */}
        <View style={styles.breakdownCard}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.breakdownRow}>
              <View style={styles.breakdownLabel}>
                <Skeleton width={80} height={14} />
                <Skeleton width={20} height={14} />
              </View>
              <Skeleton width="100%" height={6} borderRadius={3} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------- PlanSkeleton ----------
// 2 skeleton week cards
export function PlanSkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Skeleton width={120} height={24} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      {/* Toggle row */}
      <View style={[styles.sectionPadded, { marginBottom: spacing.lg }]}>
        <Skeleton width="100%" height={44} borderRadius={radius.lg} />
      </View>

      <View style={styles.scroll}>
        {/* Week card 1 */}
        <View style={styles.weekCard}>
          <View style={styles.weekCardHeader}>
            <Skeleton width={100} height={16} />
            <Skeleton width={120} height={12} />
          </View>
          <Skeleton width="100%" height={8} borderRadius={4} style={{ marginVertical: spacing.md }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.planDayRow}>
              <Skeleton width={32} height={14} />
              <Skeleton width="70%" height={14} style={{ flex: 1 }} />
            </View>
          ))}
        </View>

        {/* Week card 2 */}
        <View style={styles.weekCard}>
          <View style={styles.weekCardHeader}>
            <Skeleton width={100} height={16} />
            <Skeleton width={120} height={12} />
          </View>
          <Skeleton width="100%" height={8} borderRadius={4} style={{ marginVertical: spacing.md }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.planDayRow}>
              <Skeleton width={32} height={14} />
              <Skeleton width="70%" height={14} style={{ flex: 1 }} />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------- ActivityDetailSkeleton ----------
// Skeleton title area + skeleton content blocks
export function ActivityDetailSkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.scroll}>
        {/* Category badge */}
        <Skeleton width={70} height={24} borderRadius={8} />

        {/* Title */}
        <Skeleton width="90%" height={24} style={{ marginTop: spacing.md }} />

        {/* Description */}
        <Skeleton width="100%" height={16} style={{ marginTop: spacing.md }} />
        <Skeleton width="85%" height={16} style={{ marginTop: spacing.sm }} />
        <Skeleton width="70%" height={16} style={{ marginTop: spacing.sm }} />

        {/* Meta tags */}
        <View style={[styles.metaRow, { marginTop: spacing.lg }]}>
          <Skeleton width={70} height={16} />
          <Skeleton width={70} height={16} />
          <Skeleton width={70} height={16} />
        </View>

        {/* Info badges */}
        <View style={[styles.statsRow, { marginTop: spacing.xl }]}>
          <Skeleton width="30%" height={44} borderRadius={radius.lg} style={{ flex: 1 }} />
          <Skeleton width="30%" height={44} borderRadius={radius.lg} style={{ flex: 1 }} />
          <Skeleton width="30%" height={44} borderRadius={radius.lg} style={{ flex: 1 }} />
        </View>

        {/* Materials section */}
        <Skeleton width={140} height={18} style={{ marginTop: spacing.xl }} />
        <View style={[styles.breakdownCard, { marginTop: spacing.md }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.materialSkeletonRow}>
              <Skeleton width={22} height={22} borderRadius={6} />
              <Skeleton width="75%" height={14} style={{ flex: 1 }} />
            </View>
          ))}
        </View>

        {/* Steps section */}
        <Skeleton width={120} height={18} style={{ marginTop: spacing.xl }} />
        <View style={[styles.breakdownCard, { marginTop: spacing.md }]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.stepSkeletonRow}>
              <Skeleton width={28} height={28} borderRadius={14} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="90%" height={14} />
                <Skeleton width="60%" height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  sectionPadded: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Week strip
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  weekDay: {
    alignItems: 'center',
    gap: 6,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  // Activity card
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityContent: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  // Results bar
  resultsBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  listPadded: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  // Breakdown
  breakdownCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Meta
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  // Plan
  weekCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.xl,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  // Detail
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  materialSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 4,
  },
  stepSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
});
