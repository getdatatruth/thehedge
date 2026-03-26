import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Activity, Leaf } from 'lucide-react-native';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface QuickStatsProps {
  streak: number;
  activitiesThisWeek: number;
  hedgeScore?: number;
}

export function QuickStats({
  streak,
  activitiesThisWeek,
  hedgeScore,
}: QuickStatsProps) {
  return (
    <View style={styles.row}>
      <StatCard
        icon={<Flame size={18} color={categoryColors.art} />}
        value={streak}
        label="Day streak"
      />
      <StatCard
        icon={<Activity size={18} color={categoryColors.nature} />}
        value={activitiesThisWeek}
        label="This week"
      />
      <StatCard
        icon={<Leaf size={18} color={lightTheme.accent} />}
        value={hedgeScore ?? 0}
        label="Hedge Score"
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
