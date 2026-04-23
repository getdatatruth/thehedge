import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { OnboardingLayout } from '@/components/ui/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding-store';

const TOTAL_STEPS = 9;

const COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford',
  'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon',
  'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
];

export default function CountyScreen() {
  const router = useRouter();
  const county = useOnboardingStore((s) => s.county);
  const setCounty = useOnboardingStore((s) => s.setCounty);

  const handleSelect = (c: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCounty(c);
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={TOTAL_STEPS}
      title="Where are you based?"
      subtitle="We'll suggest local events and activities near you."
      canContinue={county.length > 0}
      onContinue={() => router.push('/(auth)/onboarding/children')}
    >
      <View style={styles.grid}>
        {COUNTIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => handleSelect(c)}
            style={[
              styles.chip,
              county === c && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                county === c && styles.chipTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: darkTheme.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: darkTheme.accentLight,
    borderColor: darkTheme.accent,
  },
  chipText: {
    ...typography.uiSmall,
    color: darkTheme.text,
    opacity: 0.7,
  },
  chipTextActive: {
    color: darkTheme.accent,
    fontWeight: '600',
  },
});
