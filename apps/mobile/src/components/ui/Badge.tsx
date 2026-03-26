import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { lightTheme, categoryColors } from '@/theme/colors';

type BadgeVariant = 'sage' | 'terra' | 'moss' | 'amber' | 'stone' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'sage', size = 'sm' }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View style={[styles.base, sizeStyles[size].container, variantStyle.container]}>
      <Text style={[styles.text, sizeStyles[size].text, variantStyle.text]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});

const sizeStyles = {
  sm: {
    container: { paddingHorizontal: 8, paddingVertical: 3 } as ViewStyle,
    text: { fontSize: 10 } as TextStyle,
  },
  md: {
    container: { paddingHorizontal: 10, paddingVertical: 4 } as ViewStyle,
    text: { fontSize: 12 } as TextStyle,
  },
};

const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
  sage: {
    container: { backgroundColor: `${categoryColors.nature}15` },
    text: { color: categoryColors.nature },
  },
  terra: {
    container: { backgroundColor: `${categoryColors.art}15` },
    text: { color: categoryColors.art },
  },
  moss: {
    container: { backgroundColor: `${lightTheme.primary}12` },
    text: { color: lightTheme.primary },
  },
  amber: {
    container: { backgroundColor: '#F5A62315' },
    text: { color: '#F5A623' },
  },
  stone: {
    container: { backgroundColor: lightTheme.background },
    text: { color: lightTheme.textSecondary },
  },
  accent: {
    container: { backgroundColor: `${lightTheme.accent}15` },
    text: { color: lightTheme.accent },
  },
};
