import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CalendarDays, Plus, Check, Lock, Crown } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface PlanDay {
  date: string;
  day_name: string;
  blocks: Array<{
    id: string;
    title: string;
    category: string;
    duration_minutes: number;
    time_slot: string;
    completed: boolean;
  }>;
}

interface PlannerData {
  week_start: string;
  week_end: string;
  days: PlanDay[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlanScreen() {
  const router = useRouter();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());
  const isFree = effectiveTier === 'free';

  const { data: plannerData, isLoading } = useApiQuery<PlannerData>(
    ['planner'],
    '/planner',
    { enabled: !isFree }
  );

  // Free users see upgrade prompt
  if (isFree) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Weekly Planner</Text>
          <Text style={styles.title}>Plan your week</Text>
        </View>
        <View style={styles.upgradeContainer}>
          <View style={styles.upgradeIcon}>
            <Crown size={32} color={colors.amber} />
          </View>
          <Text style={styles.upgradeTitle}>Unlock the planner</Text>
          <Text style={styles.upgradeBody}>
            Plan your family's week with drag-and-drop activities, balanced
            across subjects and energy levels. Available on the Family plan.
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/(stack)/settings/billing' as any)}
          >
            Upgrade to Family
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) return <LoadingScreen />;

  const days = plannerData?.days || [];
  const today = DAY_NAMES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Build grouped map from API days array
  const grouped = DAY_NAMES.reduce((acc, day) => {
    const found = days.find((d) => d.day_name?.substring(0, 3) === day);
    acc[day] = found?.blocks || [];
    return acc;
  }, {} as Record<string, PlanDay['blocks']>);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Weekly Planner</Text>
        <Text style={styles.title}>This week's plan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <View style={styles.dayLabelRow}>
                <Text
                  style={[
                    styles.dayName,
                    day === today && styles.dayNameToday,
                  ]}
                >
                  {day}
                </Text>
                {day === today && <Badge variant="sage" size="sm">Today</Badge>}
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={16} color={colors.moss} />
              </TouchableOpacity>
            </View>

            {grouped[day].length > 0 ? (
              grouped[day].map((activity, i) => (
                <Card key={i} variant="interactive" padding="md">
                  <View style={styles.planActivityRow}>
                    <TouchableOpacity
                      style={[
                        styles.planCheckbox,
                        activity.completed && styles.planCheckboxDone,
                      ]}
                    >
                      {activity.completed && (
                        <Check size={12} color={colors.parchment} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.planActivityInfo}>
                      <Text
                        style={[
                          styles.planActivityTitle,
                          activity.completed && styles.planActivityDone,
                        ]}
                      >
                        {activity.title}
                      </Text>
                      <Text style={styles.planActivityMeta}>
                        {activity.category} - {activity.duration_minutes} min
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>No activities planned</Text>
              </View>
            )}
          </View>
        ))}
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
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  daySection: { gap: spacing.sm },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  dayNameToday: {
    color: colors.forest,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: `${colors.moss}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCheckboxDone: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  planActivityInfo: { flex: 1, gap: 2 },
  planActivityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  planActivityDone: {
    textDecorationLine: 'line-through',
    color: colors.clay,
  },
  planActivityMeta: {
    fontSize: 11,
    color: `${colors.clay}80`,
    textTransform: 'capitalize',
  },
  emptyDay: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: `${colors.stone}20`,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: `${colors.stone}40`,
    borderStyle: 'dashed',
  },
  emptyDayText: {
    fontSize: 12,
    color: `${colors.clay}60`,
    textAlign: 'center',
  },
  upgradeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  upgradeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.amber}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.ink,
  },
  upgradeBody: {
    fontSize: 15,
    color: colors.clay,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
});
