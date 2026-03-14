import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AlertCircle size={32} color={`${colors.terracotta}80`} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button variant="secondary" size="sm" onPress={onRetry}>
          Try again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  message: {
    fontSize: 14,
    color: colors.clay,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
