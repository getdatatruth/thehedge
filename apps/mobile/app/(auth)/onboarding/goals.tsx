import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { OptionCard } from '@/components/ui/OptionCard';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const LEARNING_GOALS = [
  { id: 'outdoor_exploration', label: 'Outdoor exploration', emoji: '🌿' },
  { id: 'school_readiness', label: 'School readiness', emoji: '📚' },
  { id: 'creative_expression', label: 'Creative expression', emoji: '🎨' },
  { id: 'irish_language', label: 'Irish language & culture', emoji: '☘️' },
  { id: 'stem_skills', label: 'STEM skills', emoji: '🔬' },
  { id: 'social_skills', label: 'Social & emotional skills', emoji: '🤝' },
  { id: 'physical_activity', label: 'Physical activity', emoji: '⚽' },
  { id: 'balanced', label: 'Balanced development', emoji: '⚖️' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const learningGoals = useOnboardingStore((s) => s.learningGoals);
  const toggleLearningGoal = useOnboardingStore((s) => s.toggleLearningGoal);

  return (
    <OnboardingLayout
      step={7}
      totalSteps={TOTAL_STEPS}
      title="What matters most to you?"
      subtitle="Choose as many as you like. This shapes your activity suggestions."
      canContinue={learningGoals.length > 0}
      onContinue={() => router.push('/(auth)/onboarding/schedule')}
    >
      <Text style={styles.hint}>
        Select at least 1 to continue
      </Text>
      <View style={styles.options}>
        {LEARNING_GOALS.map(({ id, label, emoji }) => (
          <OptionCard
            key={id}
            label={`${emoji}  ${label}`}
            selected={learningGoals.includes(id)}
            onPress={() => toggleLearningGoal(id)}
            showCheck
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: darkTheme.accent,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.md,
  },
});
