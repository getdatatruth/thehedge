import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPut, useApiDelete } from '@/hooks/use-api';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { ChildSelector } from './ChildSelector';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptics';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface EditLogData {
  id: string;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  rating: number | null;
  child_ids: string[];
  activityTitle: string;
}

interface EditLogModalProps {
  log: EditLogData | null;
  bottomSheetRef: React.RefObject<SimpleBottomSheetRef | null>;
  onSaved?: () => void;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function EditLogModal({ log, bottomSheetRef, onSaved }: EditLogModalProps) {
  const { children } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  // Sync form state when log changes
  useEffect(() => {
    if (log) {
      setSelectedChildren(log.child_ids || []);
      setRating(log.rating || 0);
      setDuration(log.duration_minutes || 30);
      setNotes(log.notes || '');
    }
  }, [log]);

  const updateMutation = useApiPut('/activity-logs', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      bottomSheetRef.current?.close();
      onSaved?.();
    },
  });

  const deleteMutation = useApiDelete('/activity-logs', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      bottomSheetRef.current?.close();
      onSaved?.();
    },
  });

  const handleSave = () => {
    if (!log) return;
    updateMutation.mutate({
      id: log.id,
      duration_minutes: duration,
      notes: notes.trim() || null,
      rating: rating || null,
      child_ids: selectedChildren,
    });
  };

  const handleDelete = () => {
    if (!log) return;
    Alert.alert(
      'Delete log',
      'Are you sure you want to delete this activity log? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticError();
            deleteMutation.mutate({ id: log.id } as any);
          },
        },
      ]
    );
  };

  const formattedDate = log
    ? new Date(log.date + 'T00:00:00').toLocaleDateString('en-IE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <SimpleBottomSheet ref={bottomSheetRef} snapPoint="85%" scrollable>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Activity Log</Text>
        <Text style={styles.activityName}>{log?.activityTitle || 'Activity'}</Text>

        {/* Date display */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

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
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
                onPress={() => { hapticLight(); setDuration(d); }}
              >
                <Text
                  style={[styles.durationText, duration === d && styles.durationTextActive]}
                >
                  {d}m
                </Text>
              </TouchableOpacity>
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
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What happened, what they enjoyed..."
            placeholderTextColor={lightTheme.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <Button
          variant="terra"
          size="lg"
          fullWidth
          onPress={handleSave}
          loading={updateMutation.isPending}
        >
          Save Changes
        </Button>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteBtn}
          disabled={deleteMutation.isPending}
        >
          <Trash2 size={16} color={lightTheme.error} />
          <Text style={styles.deleteText}>Delete Log</Text>
        </TouchableOpacity>
      </View>
    </SimpleBottomSheet>
  );
}

const styles = StyleSheet.create({
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
    color: lightTheme.text,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '500',
    color: lightTheme.textSecondary,
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.text,
    letterSpacing: 0.3,
  },
  dateDisplay: {
    backgroundColor: lightTheme.background,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateText: {
    fontSize: 14,
    color: lightTheme.textSecondary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: lightTheme.background,
  },
  durationChipActive: {
    backgroundColor: lightTheme.accent,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightTheme.textSecondary,
  },
  durationTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: lightTheme.background,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: lightTheme.text,
    minHeight: 80,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '500',
    color: lightTheme.error,
  },
});
