import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';

type BadgeVariant = 'sage' | 'terra' | 'moss' | 'amber' | 'stone';

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
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const sizeStyles = {
  sm: {
    container: { paddingHorizontal: 8, paddingVertical: 3 } as ViewStyle,
    text: { fontSize: 9 } as TextStyle,
  },
  md: {
    container: { paddingHorizontal: 10, paddingVertical: 4 } as ViewStyle,
    text: { fontSize: 11 } as TextStyle,
  },
};

const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
  sage: {
    container: { backgroundColor: `${colors.sage}20` },
    text: { color: colors.sage },
  },
  terra: {
    container: { backgroundColor: `${colors.terracotta}15` },
    text: { color: colors.terracotta },
  },
  moss: {
    container: { backgroundColor: `${colors.moss}15` },
    text: { color: colors.moss },
  },
  amber: {
    container: { backgroundColor: `${colors.amber}15` },
    text: { color: colors.amber },
  },
  stone: {
    container: { backgroundColor: colors.linen, borderWidth: 1, borderColor: colors.stone },
    text: { color: colors.clay },
  },
};
