import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/theme/colors';

// Onboarding entry. New families now land in The Kitchen Table: a warm,
// consultative chat that writes their Family Framework. The old multi-step
// wizard has been removed; this screen simply redirects.
export default function OnboardingEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/kitchen-table' as never);
  }, [router]);

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
