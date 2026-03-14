import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'interactive' | 'flat';
  padding?: keyof typeof spacing;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 'lg',
  children,
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        { padding: spacing[padding] },
        style as ViewStyle,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});

const variantStyles: Record<string, ViewStyle> = {
  elevated: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  interactive: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  flat: {
    backgroundColor: colors.parchment,
  },
};
