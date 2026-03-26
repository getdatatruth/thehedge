import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface DayActivity {
  category: string;
}

interface WeekStripProps {
  /** Start of the week (Monday) */
  weekStart?: Date;
  /** Activities for each day of the week (Mon=0, Sun=6) */
  activitiesByDay?: Record<number, DayActivity[]>;
  /** Currently selected day index (0=Mon) */
  selectedDay?: number;
  /** Week label shown above the strip (e.g. "Week 12") */
  weekLabel?: string;
  onDayPress?: (dayIndex: number) => void;
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getCategoryColor(category: string): string {
  const key = category?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

export function WeekStrip({
  weekStart,
  activitiesByDay = {},
  selectedDay,
  weekLabel,
  onDayPress,
}: WeekStripProps) {
  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7; // Convert Sun=0 to Mon=0

  // Calculate date numbers for the week
  const start = weekStart || getMonday(now);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.getDate();
  });

  const selected = selectedDay ?? todayDow;

  return (
    <View style={styles.container}>
      {weekLabel && (
        <Text style={styles.weekLabel}>{weekLabel}</Text>
      )}
      <View style={styles.strip}>
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayDow;
          const isSelected = i === selected;
          const dayActivities = activitiesByDay[i] || [];
          const hasActivities = dayActivities.length > 0;

          return (
            <TouchableOpacity
              key={label}
              style={styles.dayColumn}
              onPress={() => onDayPress?.(i)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isToday && !isSelected && styles.dayLabelToday,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  styles.dateCircle,
                  isSelected && styles.dateCircleSelected,
                  isToday && !isSelected && styles.dateCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dateNumber,
                    isSelected && styles.dateNumberSelected,
                    isToday && !isSelected && styles.dateNumberToday,
                  ]}
                >
                  {dates[i]}
                </Text>
              </View>
              {/* Activity dots */}
              <View style={styles.dotsRow}>
                {hasActivities ? (
                  dayActivities.slice(0, 3).map((act, j) => (
                    <View
                      key={j}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected
                            ? '#FFFFFF'
                            : getCategoryColor(act.category),
                        },
                      ]}
                    />
                  ))
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  weekLabel: {
    ...typography.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: lightTheme.textMuted,
    letterSpacing: 0.5,
  },
  dayLabelToday: {
    color: lightTheme.accent,
  },
  dayLabelSelected: {
    color: lightTheme.primary,
    fontWeight: '700',
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleSelected: {
    backgroundColor: lightTheme.primary,
  },
  dateCircleToday: {
    backgroundColor: `${lightTheme.accent}15`,
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: lightTheme.text,
  },
  dateNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateNumberToday: {
    color: lightTheme.accent,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPlaceholder: {
    height: 6,
  },
});
