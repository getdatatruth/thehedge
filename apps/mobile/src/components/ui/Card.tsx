import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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
    borderRadius: 16,
    overflow: 'hidden',
  },
});

const variantStyles: Record<string, ViewStyle> = {
  elevated: {
    backgroundColor: lightTheme.surface,
  },
  interactive: {
    backgroundColor: lightTheme.surface,
  },
  flat: {
    backgroundColor: lightTheme.background,
  },
};
