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
import { Trophy, Flame, Activity, Star, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface ProgressData {
  total_activities: number;
  total_minutes: number;
  current_streak: number;
  this_week: number;
  average_rating: number | null;
  unique_days: number;
  category_breakdown: Record<string, number>;
}

export default function ProgressScreen() {
  const { children } = useAuthStore();
  const [selectedChild, setSelectedChild] = useState<string | null>(
    children[0]?.id ?? null
  );

  const {
    data: progress,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<ProgressData>(
    ['progress', selectedChild || 'family'],
    selectedChild ? `/progress?child_id=${selectedChild}` : '/progress'
  );

  if (isLoading && !progress) return <LoadingScreen />;

  const breakdown = progress?.category_breakdown || {};
  const totalForBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>Your family's journey</Text>
      </View>

      {/* Child Selector */}
      {children.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.childSelector}
        >
          <TouchableOpacity
            style={[
              styles.childChip,
              !selectedChild && styles.childChipActive,
            ]}
            onPress={() => setSelectedChild(null)}
          >
            <Text
              style={[
                styles.childChipText,
                !selectedChild && styles.childChipTextActive,
              ]}
            >
              Family
            </Text>
          </TouchableOpacity>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childChip,
                selectedChild === child.id && styles.childChipActive,
              ]}
              onPress={() => setSelectedChild(child.id)}
            >
              <Text
                style={[
                  styles.childChipText,
                  selectedChild === child.id && styles.childChipTextActive,
                ]}
              >
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
            tintColor={colors.moss}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Activity size={20} color={colors.moss} />
            <Text style={styles.statNumber}>
              {progress?.total_activities || 0}
            </Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={20} color={colors.terracotta} />
            <Text style={styles.statNumber}>
              {progress?.current_streak || 0}
            </Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color={colors.amber} />
            <Text style={styles.statNumber}>
              {progress?.this_week || 0}
            </Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By category</Text>
          <Card variant="elevated" padding="lg">
            {Object.entries(breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <View key={category} style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <Text style={styles.breakdownCategory}>{category}</Text>
                    <Text style={styles.breakdownCount}>{count}</Text>
                  </View>
                  <View style={styles.breakdownBar}>
                    <View
                      style={[
                        styles.breakdownFill,
                        {
                          width: `${(count / totalForBreakdown) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
          </Card>
        </View>

        {/* Total Minutes */}
        {(progress?.total_minutes ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time invested</Text>
            <Card variant="elevated" padding="lg">
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={styles.statNumber}>
                  {Math.round((progress?.total_minutes || 0) / 60)}h {(progress?.total_minutes || 0) % 60}m
                </Text>
                <Text style={{ fontSize: 13, color: colors.clay }}>
                  across {progress?.unique_days || 0} days
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
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
  childSelector: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    marginRight: spacing.sm,
  },
  childChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  childChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  childChipTextActive: {
    color: colors.parchment,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  statsGrid: {
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
    gap: 6,
  },
  statNumber: {
    fontSize: 28,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.ink,
  },
  breakdownRow: {
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  breakdownLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  breakdownCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: `${colors.stone}30`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: colors.moss,
    borderRadius: 3,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    color: colors.clay,
    textAlign: 'center',
    lineHeight: 16,
  },
});
