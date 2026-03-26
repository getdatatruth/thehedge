import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, darkTheme } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  /** Use dark variant for dark-themed screens (auth/onboarding) */
  variant?: 'light' | 'dark';
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  variant = 'light',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isDark = variant === 'dark';

  const themedStyles = isDark ? darkStyles : lightStyles;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={themedStyles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          themedStyles.input,
          isFocused && themedStyles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={isDark ? darkTheme.textMuted : `${colors.clay}80`}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#E57373',
  },
  error: {
    fontSize: 12,
    color: '#E57373',
  },
});

const lightStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  input: {
    borderColor: colors.stone,
    backgroundColor: colors.linen,
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
});

const darkStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: darkTheme.textSecondary,
  },
  input: {
    borderColor: darkTheme.border,
    backgroundColor: darkTheme.surface,
    color: darkTheme.text,
  },
  inputFocused: {
    borderColor: darkTheme.accent,
  },
});
