import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, Plus } from 'lucide-react-native';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface PlanActivity {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  completed: boolean;
}

interface WeekCardProps {
  weekNumber: number;
  dateRange: string;
  activities: Record<string, PlanActivity[]>;
  totalActivities: number;
  completedActivities: number;
  isCurrentWeek?: boolean;
  onAddActivity?: (day: string) => void;
  onActivityPress?: (activity: PlanActivity) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getCategoryColor(category: string): string {
  const key = category?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

export function WeekCard({
  weekNumber,
  dateRange,
  activities,
  totalActivities,
  completedActivities,
  isCurrentWeek = false,
  onAddActivity,
  onActivityPress,
}: WeekCardProps) {
  const [expanded, setExpanded] = useState(isCurrentWeek);
  const progress = totalActivities > 0 ? completedActivities / totalActivities : 0;

  return (
    <View style={[styles.container, isCurrentWeek && styles.currentWeek]}>
      {/* Header - always visible */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.dateRange}>{dateRange.toUpperCase()}</Text>
          <Text style={styles.weekTitle}>Week {weekNumber}</Text>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            {Array.from({ length: totalActivities || 6 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i < completedActivities && styles.progressSegmentFilled,
                ]}
              />
            ))}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              Activities: <Text style={styles.statsBold}>{completedActivities}/{totalActivities}</Text>
            </Text>
          </View>
        </View>

        <ChevronDown
          size={20}
          color={lightTheme.textMuted}
          style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined}
        />
      </TouchableOpacity>

      {/* Expanded day list */}
      {expanded && (
        <View style={styles.dayList}>
          {DAY_NAMES.map((day) => {
            const dayActivities = activities[day] || [];
            return (
              <View key={day} style={styles.dayRow}>
                <View style={styles.dayLabel}>
                  <Text style={styles.dayName}>{day}</Text>
                </View>
                <View style={styles.dayContent}>
                  {dayActivities.length > 0 ? (
                    dayActivities.map((act) => (
                      <TouchableOpacity
                        key={act.id}
                        onPress={() => onActivityPress?.(act)}
                        style={styles.activityPill}
                      >
                        <View
                          style={[
                            styles.categoryDot,
                            { backgroundColor: getCategoryColor(act.category) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.activityName,
                            act.completed && styles.activityCompleted,
                          ]}
                          numberOfLines={1}
                        >
                          {act.title}
                        </Text>
                        <Text style={styles.activityDuration}>
                          {act.duration_minutes}m
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyDay}>-</Text>
                  )}
                </View>
                {onAddActivity && (
                  <TouchableOpacity
                    onPress={() => onAddActivity(day)}
                    style={styles.addButton}
                  >
                    <Plus size={14} color={lightTheme.textMuted} />
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  currentWeek: {
    borderWidth: 1.5,
    borderColor: lightTheme.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.xl,
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  dateRange: {
    ...typography.caption,
    color: lightTheme.textMuted,
    marginBottom: 2,
  },
  weekTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: lightTheme.text,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: lightTheme.borderLight,
    borderRadius: 2,
  },
  progressSegmentFilled: {
    backgroundColor: lightTheme.accent,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statsText: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  statsBold: {
    fontWeight: '700',
    color: lightTheme.textSecondary,
  },
  // Day list
  dayList: {
    borderTopWidth: 1,
    borderTopColor: lightTheme.borderLight,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
    minHeight: 44,
  },
  dayLabel: {
    width: 40,
  },
  dayName: {
    ...typography.uiBold,
    color: lightTheme.textSecondary,
    fontSize: 13,
  },
  dayContent: {
    flex: 1,
    gap: 4,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.background,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityName: {
    ...typography.uiSmall,
    color: lightTheme.text,
    flex: 1,
  },
  activityCompleted: {
    textDecorationLine: 'line-through',
    color: lightTheme.textMuted,
  },
  activityDuration: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  emptyDay: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: spacing.sm,
  },
  addText: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
});
