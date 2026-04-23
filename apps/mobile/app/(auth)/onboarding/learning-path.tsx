import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { School, Home, HelpCircle } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { OptionCard } from '@/components/ui/OptionCard';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const LEARNING_PATHS = [
  {
    id: 'mainstream',
    label: 'Our kids go to school',
    description: 'We want great activities for evenings, weekends, and holidays',
    Icon: School,
  },
  {
    id: 'homeschool',
    label: 'We homeschool',
    description: 'We need a full learning system with curriculum support and planning',
    Icon: Home,
  },
  {
    id: 'considering',
    label: "We're thinking about it",
    description: "Exploring homeschooling but haven't committed yet - show us what's possible",
    Icon: HelpCircle,
  },
];

export default function LearningPathScreen() {
  const router = useRouter();
  const learningPath = useOnboardingStore((s) => s.learningPath);
  const setLearningPath = useOnboardingStore((s) => s.setLearningPath);

  return (
    <OnboardingLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      title="How does your family learn?"
      subtitle="This shapes your entire experience - you can always change it later."
      canContinue={learningPath.length > 0}
      onContinue={() => {
        if (learningPath === 'homeschool' || learningPath === 'considering') {
          router.push('/(auth)/onboarding/education-approach');
        } else {
          router.push('/(auth)/onboarding/interests');
        }
      }}
    >
      <View style={styles.options}>
        {LEARNING_PATHS.map(({ id, label, description, Icon }) => (
          <OptionCard
            key={id}
            label={label}
            description={description}
            selected={learningPath === id}
            onPress={() => setLearningPath(id)}
            icon={
              <Icon
                size={24}
                color={learningPath === id ? darkTheme.accent : darkTheme.textSecondary}
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
