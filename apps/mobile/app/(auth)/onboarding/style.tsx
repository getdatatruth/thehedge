import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf, Sparkles, Calendar, Users } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { OptionCard } from '@/components/ui/OptionCard';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 6;

const FAMILY_STYLES = [
  {
    id: 'outdoor',
    label: 'Outdoor & Active',
    description: 'Hiking, nature walks, garden play',
    Icon: Leaf,
  },
  {
    id: 'creative',
    label: 'Creative & Artistic',
    description: 'Arts, crafts, music, storytelling',
    Icon: Sparkles,
  },
  {
    id: 'structured',
    label: 'Structured & Routine',
    description: 'Planned activities, clear schedules',
    Icon: Calendar,
  },
  {
    id: 'flexible',
    label: 'Go with the Flow',
    description: 'Spontaneous, child-led exploration',
    Icon: Users,
  },
];

export default function StyleScreen() {
  const router = useRouter();
  const familyStyle = useOnboardingStore((s) => s.familyStyle);
  const setFamilyStyle = useOnboardingStore((s) => s.setFamilyStyle);

  return (
    <OnboardingLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      title="What's your family style?"
      subtitle="This helps us suggest the right mix of activities."
      canContinue={familyStyle.length > 0}
      onContinue={() => router.push('/(auth)/onboarding/goals')}
    >
      <View style={styles.options}>
        {FAMILY_STYLES.map(({ id, label, description, Icon }) => (
          <OptionCard
            key={id}
            label={label}
            description={description}
            selected={familyStyle === id}
            onPress={() => setFamilyStyle(id)}
            icon={
              <Icon
                size={24}
                color={familyStyle === id ? darkTheme.accent : darkTheme.textSecondary}
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
