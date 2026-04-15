import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface Milestone {
  id: string;
  name: string;
  emoji: string;
  achieved: boolean;
  progress?: number;
  target?: number;
  achievedDate?: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onPress: () => void;
}

function isRecentlyAchieved(achievedDate?: string): boolean {
  if (!achievedDate) return false;
  const achieved = new Date(achievedDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - achieved.getTime()) / 86400000);
  return diffDays <= 7;
}

function daysAgoLabel(achievedDate: string): string {
  const achieved = new Date(achievedDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - achieved.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function MilestoneCard({ milestone, onPress }: MilestoneCardProps) {
  const recentlyAchieved = milestone.achieved && isRecentlyAchieved(milestone.achievedDate);
  const isClose = !milestone.achieved
    && milestone.progress !== undefined
    && milestone.target !== undefined
    && milestone.progress / milestone.target > 0.8;

  // Only render if recently achieved or close to achieving
  if (!recentlyAchieved && !isClose) return null;

  if (recentlyAchieved) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.achievedContainer}
      >
        <View style={styles.achievedHeader}>
          <Text style={styles.confettiEmoji}>{'\u{1F389}'}</Text>
          <Text style={styles.achievedEyebrow}>MILESTONE UNLOCKED</Text>
          <Text style={styles.confettiEmoji}>{'\u{1F389}'}</Text>
        </View>

        <Text style={styles.achievedEmoji}>{milestone.emoji}</Text>
        <Text style={styles.achievedTitle}>You just earned...</Text>
        <Text style={styles.achievedName}>{milestone.name}</Text>

        {milestone.achievedDate && (
          <Text style={styles.achievedDate}>
            {daysAgoLabel(milestone.achievedDate)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Close to achieving - progress card
  const progress = milestone.progress!;
  const target = milestone.target!;
  const pct = Math.min(1, progress / target);
  const remaining = target - progress;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.progressContainer}
    >
      <View style={styles.progressTopRow}>
        <Text style={styles.progressEmoji}>{milestone.emoji}</Text>
        <View style={styles.progressTextBlock}>
          <Text style={styles.progressEyebrow}>ALMOST THERE!</Text>
          <Text style={styles.progressName}>{milestone.name}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>

      <Text style={styles.progressLabel}>
        {progress} / {target} - {remaining} more to go
      </Text>
    </TouchableOpacity>
  );
}

// ── Gold/amber for celebrations, accent green for progress ──
const GOLD = '#F5A623';
const GOLD_BG = '#FDF8EE';
const GOLD_BORDER = '#F5A62330';

const styles = StyleSheet.create({
  // ── Achievement card ─────────────────────────────────────
  achievedContainer: {
    backgroundColor: GOLD_BG,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confettiEmoji: {
    fontSize: 16,
  },
  achievedEyebrow: {
    ...typography.eyebrow,
    color: GOLD,
    letterSpacing: 2,
  },
  achievedEmoji: {
    fontSize: 40,
    marginTop: spacing.sm,
  },
  achievedTitle: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
  },
  achievedName: {
    ...typography.h3,
    color: lightTheme.text,
    textAlign: 'center',
  },
  achievedDate: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
    marginTop: spacing.xs,
  },

  // ── Progress card ────────────────────────────────────────
  progressContainer: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressEmoji: {
    fontSize: 28,
  },
  progressTextBlock: {
    flex: 1,
    gap: 2,
  },
  progressEyebrow: {
    ...typography.eyebrow,
    color: lightTheme.accent,
  },
  progressName: {
    ...typography.uiBold,
    color: lightTheme.text,
    fontSize: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: `${lightTheme.accent}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: lightTheme.accent,
    borderRadius: 4,
  },
  progressLabel: {
    ...typography.uiSmall,
    color: lightTheme.textSecondary,
  },
});
