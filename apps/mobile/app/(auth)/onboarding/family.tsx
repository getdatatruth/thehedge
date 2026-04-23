import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

export default function FamilyNameScreen() {
  const router = useRouter();
  const familyName = useOnboardingStore((s) => s.familyName);
  const setFamilyName = useOnboardingStore((s) => s.setFamilyName);

  return (
    <OnboardingLayout
      step={0}
      totalSteps={TOTAL_STEPS}
      title="What's your family name?"
      subtitle="We'll use this to personalise your experience."
      canContinue={familyName.trim().length > 0}
      onContinue={() => router.push('/(auth)/onboarding/county')}
    >
      <TextInput
        style={styles.input}
        placeholder="e.g. Murphy"
        placeholderTextColor={darkTheme.textMuted}
        value={familyName}
        onChangeText={setFamilyName}
        autoFocus
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => {
          if (familyName.trim()) router.push('/(auth)/onboarding/county');
        }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: darkTheme.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: darkTheme.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.bodyLarge,
    color: darkTheme.text,
    marginTop: spacing.sm,
  },
});
