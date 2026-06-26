import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import type { Chip } from '@/lib/kitchen-table';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// One conversational question: a stack of soft chips, plus an optional free-text
// box ("or say it your own way"). A chip carries the structured key; the text is
// the colour the framework reads back. Dark onboarding theme throughout.
export function ChipTurn({
  question,
  note,
  chips,
  placeholder,
  submitLabel,
  onSubmit,
}: {
  question: string;
  note?: string;
  chips: Chip[];
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (key: string, text?: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const canGo = selected !== null || text.trim().length > 0;

  return (
    <View>
      <Text style={styles.question}>{question}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}

      <View style={styles.chips}>
        {chips.map((c) => {
          const on = selected === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                setSelected(c.key);
                setText('');
              }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {placeholder ? (
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            if (t) setSelected(null);
          }}
          placeholder={placeholder}
          placeholderTextColor={lightTheme.textMuted}
          multiline
          style={styles.textarea}
        />
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!canGo}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSubmit(selected ?? 'other', text.trim() || undefined);
        }}
        style={[styles.cta, !canGo && styles.ctaDisabled]}
      >
        <Text style={styles.ctaText}>{submitLabel || 'Continue'}</Text>
        <ArrowRight size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    ...typography.onboardingTitle,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  note: {
    ...typography.bodySmall,
    color: lightTheme.accent,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  chips: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
  },
  chipOn: {
    backgroundColor: lightTheme.accentLight,
    borderColor: lightTheme.accent,
  },
  chipText: {
    ...typography.body,
    color: lightTheme.text,
  },
  chipTextOn: {
    color: lightTheme.text,
    fontWeight: '600',
  },
  textarea: {
    ...typography.body,
    color: lightTheme.text,
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 84,
    marginTop: spacing.md,
    textAlignVertical: 'top',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: spacing['2xl'],
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
