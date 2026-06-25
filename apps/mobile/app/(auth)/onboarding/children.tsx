import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2, Calendar, ChevronDown } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function calcAge(dateStr: string): string {
  if (!dateStr) return '';
  const dob = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const totalMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (totalMonths < 1) return 'Newborn';
  if (totalMonths < 12) return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years < 2) return months > 0 ? `${years} year, ${months} months` : `${years} year`;
  return `${years} years old`;
}

// Generate year options from current year back to 2010
function getYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 2010; y--) years.push(y);
  return years;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function ChildrenScreen() {
  const router = useRouter();
  const children = useOnboardingStore((s) => s.children);
  const addChild = useOnboardingStore((s) => s.addChild);
  const updateChild = useOnboardingStore((s) => s.updateChild);
  const removeChild = useOnboardingStore((s) => s.removeChild);

  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);
  const [pickerYear, setPickerYear] = useState(2022);
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);

  const canContinue = children.length > 0 && children.every((c) => c.name.trim().length > 0 && c.dateOfBirth.length > 0);

  function openPicker(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const child = children[index];
    if (child.dateOfBirth) {
      const d = new Date(child.dateOfBirth + 'T00:00:00');
      setPickerYear(d.getFullYear());
      setPickerMonth(d.getMonth());
      setPickerDay(d.getDate());
    } else {
      setPickerYear(2022);
      setPickerMonth(0);
      setPickerDay(1);
    }
    setActivePickerIndex(activePickerIndex === index ? null : index);
  }

  function confirmDate(index: number) {
    const maxDay = getDaysInMonth(pickerYear, pickerMonth);
    const day = Math.min(pickerDay, maxDay);
    const dateStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateChild(index, 'dateOfBirth', dateStr);
    setActivePickerIndex(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

          {/* Date of birth selector */}
          <TouchableOpacity
            onPress={() => openPicker(i)}
            style={[styles.input as ViewStyle, styles.dateButton]}
            activeOpacity={0.7}
          >
            <Calendar size={16} color={child.dateOfBirth ? darkTheme.accent : darkTheme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dateText, !child.dateOfBirth && styles.datePlaceholder]}>
                {child.dateOfBirth ? formatDate(child.dateOfBirth) : 'Date of birth'}
              </Text>
              {child.dateOfBirth ? (
                <Text style={styles.ageText}>{calcAge(child.dateOfBirth)}</Text>
              ) : null}
            </View>
            <ChevronDown size={16} color={darkTheme.textMuted} style={activePickerIndex === i ? { transform: [{ rotate: '180deg' }] } : undefined} />
          </TouchableOpacity>

          {/* Inline date picker */}
          {activePickerIndex === i && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                {/* Day */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: getDaysInMonth(pickerYear, pickerMonth) }, (_, d) => d + 1).map(d => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setPickerDay(d)}
                        style={[styles.pickerItem, pickerDay === d && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, pickerDay === d && styles.pickerItemTextActive]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Month */}
                <View style={[styles.pickerColumn, { flex: 1.5 }]}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {MONTHS.map((m, idx) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setPickerMonth(idx)}
                        style={[styles.pickerItem, pickerMonth === idx && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, pickerMonth === idx && styles.pickerItemTextActive]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {getYears().map(y => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setPickerYear(y)}
                        style={[styles.pickerItem, pickerYear === y && styles.pickerItemActive]}
                      >
                        <Text style={[styles.pickerItemText, pickerYear === y && styles.pickerItemTextActive]}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TouchableOpacity onPress={() => confirmDate(i)} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
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
  pickerRow: {
    flexDirection: 'row',
    height: 180,
  },
  pickerColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: darkTheme.border,
  },
  pickerLabel: {
    ...typography.caption,
    color: darkTheme.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: `${darkTheme.accent}20`,
  },
  pickerItemText: {
    ...typography.body,
    color: darkTheme.textSecondary,
  },
  pickerItemTextActive: {
    color: darkTheme.accent,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: darkTheme.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    ...typography.button,
    color: '#FFFFFF',
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
