import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

interface ActivityCardProps {
  title: string;
  category: string;
  durationMinutes: number;
  childName?: string;
  completed?: boolean;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

function getCategoryColor(category: string): string {
  const key = category?.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[key] || categoryColors.default;
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function ActivityCard({
  title,
  category,
  durationMinutes,
  childName,
  completed = false,
  onPress,
  onToggleComplete,
}: ActivityCardProps) {
  const color = getCategoryColor(category);

  const handleCheck = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleComplete?.();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, completed && styles.containerCompleted]}
    >
      {/* Color bar on left */}
      <View style={[styles.colorBar, { backgroundColor: color }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.categoryBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.categoryText, { color }]}>
              {formatCategory(category)}
            </Text>
          </View>
          {childName && (
            <Text style={styles.childName}>{childName}</Text>
          )}
        </View>

        <Text
          style={[styles.title, completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {title}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.durationRow}>
            <Clock size={12} color={lightTheme.textMuted} />
            <Text style={styles.duration}>{durationMinutes} min</Text>
          </View>
        </View>
      </View>

      {/* Right side: checkbox or chevron */}
      {onToggleComplete ? (
        <TouchableOpacity onPress={handleCheck} style={styles.checkButton}>
          <View
            style={[
              styles.checkbox,
              completed && [styles.checkboxChecked, { backgroundColor: color }],
            ]}
          >
            {completed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      ) : (
        <ChevronRight size={18} color={lightTheme.textMuted} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 80,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  childName: {
    ...typography.uiSmall,
    color: lightTheme.textMuted,
  },
  title: {
    ...typography.uiBold,
    color: lightTheme.text,
    fontSize: 15,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: lightTheme.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: lightTheme.textMuted,
  },
  checkButton: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: 'transparent',
  },
  chevron: {
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});
