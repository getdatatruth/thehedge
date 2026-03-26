import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Leaf } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function OnboardingWelcome() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  const handleStart = () => {
    reset();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/onboarding/family');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Leaf size={48} color={darkTheme.accent} strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.title}>The Hedge</Text>
        <Text style={styles.subtitle}>
          Your family's learning adventure starts here. Let's set things up so we
          can personalise everything for you.
        </Text>
      </View>

      {/* Bottom CTA */}
      <SafeAreaView edges={['bottom']} style={styles.bottomArea}>
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </TouchableOpacity>

        <Text style={styles.timeEstimate}>Takes about 2 minutes</Text>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  logoContainer: {
    marginBottom: spacing['3xl'],
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: darkTheme.accent,
  },
  title: {
    fontFamily: 'CormorantGaramond-Light',
    fontSize: 42,
    color: darkTheme.text,
    marginBottom: spacing.lg,
    letterSpacing: -1,
  },
  subtitle: {
    ...typography.body,
    color: darkTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomArea: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  ctaButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  timeEstimate: {
    ...typography.uiSmall,
    color: darkTheme.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
