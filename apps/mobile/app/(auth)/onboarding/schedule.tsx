import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { OptionCard } from '@/components/ui/OptionCard';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 8;

const SCHEDULE_OPTIONS = [
  {
    id: '1-2',
    label: '1-2 activities per week',
    description: 'Light and relaxed - perfect for busy families',
  },
  {
    id: '3-4',
    label: '3-4 activities per week',
    description: 'A balanced mix throughout the week',
  },
  {
    id: '5+',
    label: '5+ activities per week',
    description: 'An activity most days - great for homeschoolers',
  },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const activitiesPerWeek = useOnboardingStore((s) => s.activitiesPerWeek);
  const setActivitiesPerWeek = useOnboardingStore((s) => s.setActivitiesPerWeek);

  return (
    <OnboardingLayout
      step={7}
      totalSteps={TOTAL_STEPS}
      title="How many activities per week?"
      subtitle="This helps us build your weekly plan. You can change this anytime."
      canContinue={activitiesPerWeek.length > 0}
      onContinue={() => router.push('/(auth)/onboarding/complete')}
    >
      <View style={styles.options}>
        {SCHEDULE_OPTIONS.map(({ id, label, description }) => (
          <OptionCard
            key={id}
            label={label}
            description={description}
            selected={activitiesPerWeek === id}
            onPress={() => setActivitiesPerWeek(id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
