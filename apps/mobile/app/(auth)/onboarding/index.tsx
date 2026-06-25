import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/theme/colors';
import { useOnboardingStore } from '@/stores/onboarding-store';

// Onboarding entry. New families now land in The Kitchen Table: a warm,
// consultative chat that writes their Family Framework. The old multi-step
// wizard files remain in this folder but are no longer routed to.
export default function OnboardingEntry() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  useEffect(() => {
    reset();
    router.replace('/(auth)/kitchen-table' as never);
  }, [reset, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={darkTheme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
