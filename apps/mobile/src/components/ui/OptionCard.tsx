import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';
import { Check } from 'lucide-react-native';

interface OptionCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  /** Show checkmark when selected (for multi-select) */
  showCheck?: boolean;
  style?: ViewStyle;
}

export function OptionCard({
  label,
  description,
  selected = false,
  onPress,
  icon,
  showCheck = false,
  style,
}: OptionCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        selected && styles.selected,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, selected && styles.descriptionSelected]}>
            {description}
          </Text>
        )}
      </View>
      {showCheck && selected && (
        <View style={styles.checkContainer}>
          <Check size={20} color={darkTheme.accent} strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  selected: {
    borderColor: darkTheme.accent,
    backgroundColor: darkTheme.accentLight,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.bodyLarge,
    color: darkTheme.text,
    fontWeight: '500',
  },
  labelSelected: {
    color: darkTheme.text,
  },
  description: {
    ...typography.bodySmall,
    color: darkTheme.textSecondary,
    marginTop: 2,
  },
  descriptionSelected: {
    color: darkTheme.textSecondary,
  },
  checkContainer: {
    marginLeft: spacing.sm,
  },
});
