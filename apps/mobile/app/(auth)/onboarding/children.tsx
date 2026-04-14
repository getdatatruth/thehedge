import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2 } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 8;

export default function ChildrenScreen() {
  const router = useRouter();
  const children = useOnboardingStore((s) => s.children);
  const addChild = useOnboardingStore((s) => s.addChild);
  const updateChild = useOnboardingStore((s) => s.updateChild);
  const removeChild = useOnboardingStore((s) => s.removeChild);

  const canContinue = children.length > 0 && children.every((c) => c.name.trim().length > 0);

  return (
    <OnboardingLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      title="Tell us about your children"
      subtitle="We'll tailor activities to each child's age and stage."
      canContinue={canContinue}
      onContinue={() => router.push('/(auth)/onboarding/learning-path')}
    >
      {children.map((child, i) => (
        <View key={i} style={styles.childCard}>
          <View style={styles.childHeader}>
            <Text style={styles.childLabel}>Child {i + 1}</Text>
            {children.length > 1 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  removeChild(i);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Remove child"
              >
                <Trash2 size={18} color={darkTheme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={darkTheme.textMuted}
            value={child.name}
            onChangeText={(v) => updateChild(i, 'name', v)}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="Date of birth (YYYY-MM-DD)"
            placeholderTextColor={darkTheme.textMuted}
            value={child.dateOfBirth}
            onChangeText={(v) => updateChild(i, 'dateOfBirth', v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          addChild();
        }}
        style={styles.addButton}
      >
        <Plus size={20} color={darkTheme.accent} />
        <Text style={styles.addText}>Add another child</Text>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  childCard: {
    backgroundColor: darkTheme.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  childLabel: {
    ...typography.uiBold,
    color: darkTheme.textSecondary,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: darkTheme.surfaceElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    ...typography.body,
    color: darkTheme.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: darkTheme.border,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  addText: {
    ...typography.uiBold,
    color: darkTheme.accent,
  },
});
