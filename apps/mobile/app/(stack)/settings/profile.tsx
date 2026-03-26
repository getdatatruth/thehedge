import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPut } from '@/hooks/use-api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

const FAMILY_STYLES = ['active', 'creative', 'curious', 'bookish', 'balanced'];

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, family } = useAuthStore();

  const [name, setName] = useState(profile?.name || '');
  const [county, setCounty] = useState(family?.county || '');
  const [familyStyle, setFamilyStyle] = useState(
    family?.family_style || 'balanced'
  );

  const updateProfile = useApiPut<any, any>('/settings/profile', {
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.back();
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    updateProfile.mutate({ name: name.trim(), county: county.trim(), familyStyle });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
        />

        <Input
          label="County"
          value={county}
          onChangeText={setCounty}
          placeholder="e.g. Dublin, Cork"
          autoCapitalize="words"
        />

        <View style={styles.styleSection}>
          <Text style={styles.styleLabel}>Family style</Text>
          <View style={styles.chips}>
            {FAMILY_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => setFamilyStyle(style)}
                style={[
                  styles.chip,
                  familyStyle === style && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    familyStyle === style && styles.chipTextActive,
                  ]}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          variant="primary"
          fullWidth
          loading={updateProfile.isPending}
          onPress={handleSave}
        >
          Save changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h3, color: lightTheme.text },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  styleSection: {
    gap: spacing.sm,
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: lightTheme.surface,
  },
  chipActive: {
    backgroundColor: lightTheme.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textSecondary,
  },
  chipTextActive: {
    color: lightTheme.background,
  },
});
