import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2, Calendar } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcAge(dateStr: string): string {
  if (!dateStr) return '';
  const dob = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const years = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 12) return `${totalMonths} months`;
  if (totalMonths < 24) return `${years} year${months > 0 ? `, ${months} months` : ''}`;
  return `${years} years old`;
}

export default function ChildrenScreen() {
  const router = useRouter();
  const children = useOnboardingStore((s) => s.children);
  const addChild = useOnboardingStore((s) => s.addChild);
  const updateChild = useOnboardingStore((s) => s.updateChild);
  const removeChild = useOnboardingStore((s) => s.removeChild);

  const [showPickerIndex, setShowPickerIndex] = useState<number | null>(null);

  const canContinue = children.length > 0 && children.every((c) => c.name.trim().length > 0 && c.dateOfBirth.length > 0);

  function handleDateChange(index: number, event: DateTimePickerEvent, date?: Date) {
    if (event.type === 'set' && date) {
      const dateStr = date.toISOString().split('T')[0];
      updateChild(index, 'dateOfBirth', dateStr);
    }
    if (Platform.OS === 'android') {
      setShowPickerIndex(null);
    }
  }

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

          {/* Date of birth picker */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPickerIndex(showPickerIndex === i ? null : i);
            }}
            style={[styles.input, styles.dateButton]}
          >
            <Calendar size={16} color={child.dateOfBirth ? darkTheme.text : darkTheme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dateText, !child.dateOfBirth && styles.datePlaceholder]}>
                {child.dateOfBirth ? formatDate(child.dateOfBirth) : 'Date of birth'}
              </Text>
              {child.dateOfBirth ? (
                <Text style={styles.ageText}>{calcAge(child.dateOfBirth)}</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          {showPickerIndex === i && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={child.dateOfBirth ? new Date(child.dateOfBirth + 'T00:00:00') : new Date(2020, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                minimumDate={new Date(2010, 0, 1)}
                onChange={(event, date) => handleDateChange(i, event, date)}
                themeVariant="dark"
                textColor={darkTheme.text}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => setShowPickerIndex(null)}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.body,
    color: darkTheme.text,
  },
  datePlaceholder: {
    color: darkTheme.textMuted,
  },
  ageText: {
    ...typography.uiSmall,
    color: darkTheme.accent,
    marginTop: 2,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    backgroundColor: darkTheme.surfaceElevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: darkTheme.border,
  },
  doneText: {
    ...typography.uiBold,
    color: darkTheme.accent,
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
