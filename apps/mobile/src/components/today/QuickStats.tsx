import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Calendar } from 'lucide-react-native';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface QuickStatsProps {
  daysOfLearning: number;
  activitiesThisWeek: number;
}

export function QuickStats({
  daysOfLearning,
  activitiesThisWeek,
}: QuickStatsProps) {
  return (
    <View style={styles.row}>
      <StatCard
        icon={<Calendar size={18} color={categoryColors.art} />}
        value={daysOfLearning}
        label="Days of learning"
      />
      <StatCard
        icon={<Activity size={18} color={categoryColors.nature} />}
        value={activitiesThisWeek}
        label="This week"
      />
    </View>
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
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: lightTheme.text,
    letterSpacing: -0.5,
  },
  label: {
    ...typography.eyebrow,
    color: lightTheme.textMuted,
    fontSize: 9,
  },
});
