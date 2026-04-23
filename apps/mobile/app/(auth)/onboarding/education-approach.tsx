import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Shuffle, Compass, Leaf, Heart } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { OptionCard } from '@/components/ui/OptionCard';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const APPROACHES = [
  {
    id: 'structured',
    label: 'We follow a curriculum',
    description: 'We plan lessons and track what we cover. Tusla-ready reports are important to us.',
    Icon: BookOpen,
  },
  {
    id: 'blended',
    label: 'We mix it up',
    description: 'Some structure, some freedom. We want balanced coverage without rigid timetables.',
    Icon: Shuffle,
  },
  {
    id: 'child_led',
    label: "We follow our children's lead",
    description: "Our children's interests drive our learning. We want inspiration, not schedules.",
    Icon: Compass,
  },
  {
    id: 'waldorf',
    label: "We're nature and rhythm-led",
    description: 'Seasonal living, sensory play, creative expression. Learning through doing and being.',
    Icon: Leaf,
  },
  {
    id: 'unschool',
    label: "We don't do school",
    description: 'Life is learning. We want ideas when we want them, no tracking or pressure.',
    Icon: Heart,
  },
];

export default function EducationApproachScreen() {
  const router = useRouter();
  const educationApproach = useOnboardingStore((s) => s.educationApproach);
  const setEducationApproach = useOnboardingStore((s) => s.setEducationApproach);

  return (
    <OnboardingLayout
      step={4}
      totalSteps={TOTAL_STEPS}
      title="How do you approach learning?"
      subtitle="This shapes how The Hedge works for your family. You can always change it later."
      canContinue={educationApproach.length > 0}
      onContinue={() => router.push('/(auth)/onboarding/interests')}
    >
      <View style={styles.options}>
        {APPROACHES.map(({ id, label, description, Icon }) => (
          <OptionCard
            key={id}
            label={label}
            description={description}
            selected={educationApproach === id}
            onPress={() => setEducationApproach(id)}
            icon={
              <Icon
                size={24}
                color={educationApproach === id ? darkTheme.accent : darkTheme.textSecondary}
              />
            }
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
