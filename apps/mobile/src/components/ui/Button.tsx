import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'terra' | 'light';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  icon,
  fullWidth = false,
  size = 'md',
  disabled,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const sizeStyles = sizes[size];
  const variantStyles = variants[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
});

const sizes = {
  sm: {
    container: { paddingHorizontal: 12, paddingVertical: 8 } as ViewStyle,
    text: { fontSize: 13 } as TextStyle,
  },
  md: {
    container: { paddingHorizontal: 20, paddingVertical: 12 } as ViewStyle,
    text: { fontSize: 15 } as TextStyle,
  },
  lg: {
    container: { paddingHorizontal: 24, paddingVertical: 16 } as ViewStyle,
    text: { fontSize: 17 } as TextStyle,
  },
};

const variants: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle }
> = {
  primary: {
    container: { backgroundColor: colors.forest },
    text: { color: colors.parchment },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.stone,
    },
    text: { color: colors.ink },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.clay },
  },
  terra: {
    container: { backgroundColor: colors.terracotta },
    text: { color: colors.white },
  },
  light: {
    container: { backgroundColor: colors.parchment },
    text: { color: colors.forest },
  },
};
