import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const INTEREST_OPTIONS = [
  { id: 'nature', label: 'Nature & outdoors', emoji: '🌿' },
  { id: 'art', label: 'Art & creativity', emoji: '🎨' },
  { id: 'building', label: 'Building & making', emoji: '🔨' },
  { id: 'animals', label: 'Animals & wildlife', emoji: '🐾' },
  { id: 'sport', label: 'Sport & movement', emoji: '⚽' },
  { id: 'music', label: 'Music & dance', emoji: '🎵' },
  { id: 'science', label: 'Science & experiments', emoji: '🔬' },
  { id: 'cooking', label: 'Cooking & baking', emoji: '🍳' },
  { id: 'stories', label: 'Stories & reading', emoji: '📚' },
  { id: 'numbers', label: 'Numbers & puzzles', emoji: '🧩' },
  { id: 'sensory', label: 'Sensory play', emoji: '✨' },
  { id: 'imaginative', label: 'Imaginative play', emoji: '🏰' },
];

export default function InterestsScreen() {
  const router = useRouter();
  const children = useOnboardingStore((s) => s.children);
  const updateChild = useOnboardingStore((s) => s.updateChild);

  // Show interests for first child (or all children combined for simplicity)
  // We'll collect interests that apply across the family
  const firstChild = children[0];
  const selectedInterests = firstChild?.interests || [];

  function toggleInterest(interestId: string) {
    const current = firstChild?.interests || [];
    const updated = current.includes(interestId)
      ? current.filter((i) => i !== interestId)
      : [...current, interestId];
    // Apply to all children
    children.forEach((_, index) => {
      updateChild(index, 'interests', updated);
    });
  }

  const childNames = children.filter((c) => c.name).map((c) => c.name);
  const subtitle = childNames.length > 0
    ? `What do ${childNames.length === 1 ? childNames[0] : childNames.join(' and ')} love? Pick as many as you like.`
    : 'What do your children love? Pick as many as you like.';

  return (
    <OnboardingLayout
      step={5}
      totalSteps={TOTAL_STEPS}
      title="What are they into?"
      subtitle={subtitle}
      canContinue={selectedInterests.length >= 1}
      onContinue={() => router.push('/(auth)/onboarding/style')}
    >
      <View style={styles.grid}>
        {INTEREST_OPTIONS.map(({ id, label, emoji }) => {
          const selected = selectedInterests.includes(id);
          return (
            <TouchableOpacity
              key={id}
              onPress={() => toggleInterest(id)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                selected && styles.chipSelected,
              ]}
            >
              <Text style={styles.chipEmoji}>{emoji}</Text>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {label}
              </Text>
              {selected && (
                <View style={styles.checkCircle}>
                  <Check size={12} color={darkTheme.background} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: darkTheme.border,
    backgroundColor: darkTheme.surface,
  },
  chipSelected: {
    borderColor: darkTheme.accent,
    backgroundColor: `${darkTheme.accent}15`,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    ...typography.uiSmall,
    color: darkTheme.textSecondary,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: darkTheme.text,
    fontWeight: '600',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: darkTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
