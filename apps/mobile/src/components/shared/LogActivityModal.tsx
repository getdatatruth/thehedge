import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  ImagePlus,
  X,
  BookOpen,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPost } from '@/hooks/use-api';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { ChildSelector } from './ChildSelector';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface LogActivityModalProps {
  activityId: string;
  activityTitle: string;
  bottomSheetRef: React.RefObject<SimpleBottomSheetRef | null>;
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
  const [diaryEntry, setDiaryEntry] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saveToPortfolio, setSaveToPortfolio] = useState(false);

  const logMutation = useApiPost('/activity-logs', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      if (saveToPortfolio) {
        queryClient.invalidateQueries({ queryKey: ['educator', 'portfolio'] });
      }
      bottomSheetRef.current?.close();
      onLogged?.();
      resetForm();
    },
  });

  const resetForm = () => {
    setRating(0);
    setDuration(30);
    setNotes('');
    setDiaryEntry('');
    setPhotos([]);
    setSaveToPortfolio(false);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      hapticLight();
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      hapticLight();
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    hapticLight();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    logMutation.mutate({
      activity_id: activityId,
      child_ids: selectedChildren,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: duration,
      notes: notes.trim() || undefined,
      rating: rating || undefined,
      diary_entry: diaryEntry.trim() || undefined,
      photo_count: photos.length,
      save_to_portfolio: saveToPortfolio,
    });
  };

  return (
    <SimpleBottomSheet ref={bottomSheetRef} snapPoint="85%" scrollable>
      <View style={styles.content}>
        <Text style={styles.title}>Log activity</Text>
        <Text style={styles.activityName}>{activityTitle}</Text>

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

        <View style={styles.section}>
          <Text style={styles.label}>How did it go?</Text>
          <StarRating rating={rating} onChange={setRating} />
        </View>

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

        {/* Diary Entry */}
        <View style={styles.section}>
          <Text style={styles.label}>Diary entry (optional)</Text>
          <Text style={styles.hint}>
            Record observations, milestones, or reflections for your portfolio
          </Text>
          <TextInput
            style={[styles.notesInput, styles.diaryInput]}
            placeholder="Today we explored cloud types together. They were fascinated by..."
            placeholderTextColor={`${colors.clay}40`}
            value={diaryEntry}
            onChangeText={setDiaryEntry}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos (optional)</Text>
          <View style={styles.photoSection}>
            {photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {photos.map((uri, i) => (
                  <View key={i} style={styles.photoThumb}>
                    <Image source={{ uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(i)}
                    >
                      <X size={12} color={colors.parchment} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            {photos.length < 5 && (
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                  <Camera size={18} color={colors.forest} />
                  <Text style={styles.photoBtnText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickFromLibrary}>
                  <ImagePlus size={18} color={colors.forest} />
                  <Text style={styles.photoBtnText}>Choose from library</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.photoLimit}>{photos.length}/5 photos</Text>
          </View>
        </View>

        {/* Save to Portfolio Toggle */}
        <TouchableOpacity
          style={[styles.portfolioToggle, saveToPortfolio && styles.portfolioToggleActive]}
          onPress={() => { hapticLight(); setSaveToPortfolio(!saveToPortfolio); }}
          activeOpacity={0.7}
        >
          <View style={[styles.portfolioIcon, saveToPortfolio && styles.portfolioIconActive]}>
            <BookOpen size={16} color={saveToPortfolio ? colors.parchment : colors.forest} />
          </View>
          <View style={styles.portfolioInfo}>
            <Text style={[styles.portfolioLabel, saveToPortfolio && styles.portfolioLabelActive]}>
              Save to portfolio
            </Text>
            <Text style={styles.portfolioHint}>
              Add this to your child's learning portfolio for Tusla
            </Text>
          </View>
          <View style={[styles.portfolioCheck, saveToPortfolio && styles.portfolioCheckActive]} />
        </TouchableOpacity>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          loading={logMutation.isPending}
        >
          {logMutation.isSuccess ? 'Logged!' : 'Log activity'}
        </Button>
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
  hint: {
    fontSize: 12,
    color: `${colors.clay}80`,
    lineHeight: 16,
    marginTop: -2,
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
  diaryInput: {
    minHeight: 120,
  },
  photoSection: {
    gap: spacing.sm,
  },
  photoRow: {
    gap: spacing.sm,
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.ink}80`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    backgroundColor: `${colors.forest}08`,
    borderWidth: 1,
    borderColor: `${colors.forest}30`,
    borderRadius: radius.sm,
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.forest,
  },
  photoLimit: {
    fontSize: 11,
    color: `${colors.clay}60`,
    textAlign: 'right',
  },
  portfolioToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.md,
  },
  portfolioToggleActive: {
    backgroundColor: `${colors.forest}08`,
    borderColor: colors.forest,
  },
  portfolioIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${colors.forest}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioIconActive: {
    backgroundColor: colors.forest,
  },
  portfolioInfo: {
    flex: 1,
    gap: 2,
  },
  portfolioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  portfolioLabelActive: {
    color: colors.forest,
  },
  portfolioHint: {
    fontSize: 11,
    color: `${colors.clay}80`,
    lineHeight: 14,
  },
  portfolioCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.stone,
  },
  portfolioCheckActive: {
    borderColor: colors.forest,
    backgroundColor: colors.forest,
  },
});
