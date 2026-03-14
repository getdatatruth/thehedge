import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPost } from '@/hooks/use-api';
import { ChildSelector } from './ChildSelector';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { hapticSuccess } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface LogActivityModalProps {
  activityId: string;
  activityTitle: string;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onLogged?: () => void;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function LogActivityModal({
  activityId,
  activityTitle,
  bottomSheetRef,
  onLogged,
}: LogActivityModalProps) {
  const { children } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedChildren, setSelectedChildren] = useState<string[]>(
    children.length === 1 ? [children[0].id] : []
  );
  const [rating, setRating] = useState(0);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  const logMutation = useApiPost('/activity-logs', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      bottomSheetRef.current?.close();
      onLogged?.();
    },
  });

  const handleSubmit = () => {
    logMutation.mutate({
      activity_id: activityId,
      child_ids: selectedChildren,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: duration,
      notes: notes.trim() || undefined,
      rating: rating || undefined,
    });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['75%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.title}>Log activity</Text>
        <Text style={styles.activityName}>{activityTitle}</Text>

        {/* Child selector */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Who did it?</Text>
            <ChildSelector
              children={children}
              selected={selectedChildren}
              onChange={setSelectedChildren}
            />
          </View>
        )}

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>How long?</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((d) => (
              <View
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
              >
                <Text
                  style={[styles.durationText, duration === d && styles.durationTextActive]}
                  onPress={() => setDuration(d)}
                >
                  {d}m
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.label}>How did it go?</Text>
          <StarRating rating={rating} onChange={setRating} />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What happened, what they enjoyed..."
            placeholderTextColor={`${colors.clay}60`}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          loading={logMutation.isPending}
        >
          {logMutation.isSuccess ? 'Logged!' : 'Log activity'}
        </Button>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.parchment,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: colors.stone,
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.ink,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.clay,
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.3,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  durationChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.clay,
  },
  durationTextActive: {
    color: colors.parchment,
  },
  notesInput: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.ink,
    minHeight: 80,
  },
});
