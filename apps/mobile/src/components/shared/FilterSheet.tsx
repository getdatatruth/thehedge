import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SimpleBottomSheet, SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { hapticLight } from '@/lib/haptics';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

export interface Filters {
  duration: number | null;
  location: string | null;
  energy: string | null;
  mess: string | null;
  ageMin: number | null;
  ageMax: number | null;
}

export const DEFAULT_FILTERS: Filters = {
  duration: null,
  location: null,
  energy: null,
  mess: null,
  ageMin: null,
  ageMax: null,
};

interface FilterSheetProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  bottomSheetRef: React.RefObject<SimpleBottomSheetRef | null>;
}

const DURATIONS = [
  { label: '< 15 min', value: 15 },
  { label: '< 30 min', value: 30 },
  { label: '< 60 min', value: 60 },
  { label: 'Any', value: null },
];

const LOCATIONS = ['indoor', 'outdoor', 'both', 'anywhere'];
const ENERGY_LEVELS = ['calm', 'moderate', 'active'];
const MESS_LEVELS = ['none', 'low', 'medium', 'high'];
const AGE_OPTIONS = [
  { label: '0-2', min: 0, max: 2 },
  { label: '3-5', min: 3, max: 5 },
  { label: '6-8', min: 6, max: 8 },
  { label: '9-12', min: 9, max: 12 },
  { label: 'Any', min: null, max: null },
];

export function FilterSheet({ filters, onChange, bottomSheetRef }: FilterSheetProps) {
  const [local, setLocal] = useState<Filters>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const apply = () => {
    onChange(local);
    bottomSheetRef.current?.close();
  };

  const reset = () => {
    hapticLight();
    setLocal(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
    bottomSheetRef.current?.close();
  };

  return (
    <SimpleBottomSheet ref={bottomSheetRef} snapPoint="80%" scrollable>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d.label}
                onPress={() => {
                  hapticLight();
                  setLocal({ ...local, duration: d.value });
                }}
                style={[styles.chip, local.duration === d.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, local.duration === d.value && styles.chipTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.chipRow}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                onPress={() => {
                  hapticLight();
                  setLocal({ ...local, location: local.location === loc ? null : loc });
                }}
                style={[styles.chip, local.location === loc && styles.chipActive]}
              >
                <Text style={[styles.chipText, local.location === loc && styles.chipTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Energy level</Text>
          <View style={styles.chipRow}>
            {ENERGY_LEVELS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  hapticLight();
                  setLocal({ ...local, energy: local.energy === e ? null : e });
                }}
                style={[styles.chip, local.energy === e && styles.chipActive]}
              >
                <Text style={[styles.chipText, local.energy === e && styles.chipTextActive]}>
                  {e}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mess level</Text>
          <View style={styles.chipRow}>
            {MESS_LEVELS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  hapticLight();
                  setLocal({ ...local, mess: local.mess === m ? null : m });
                }}
                style={[styles.chip, local.mess === m && styles.chipActive]}
              >
                <Text style={[styles.chipText, local.mess === m && styles.chipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age range</Text>
          <View style={styles.chipRow}>
            {AGE_OPTIONS.map((age) => (
              <TouchableOpacity
                key={age.label}
                onPress={() => {
                  hapticLight();
                  setLocal({ ...local, ageMin: age.min, ageMax: age.max });
                }}
                style={[
                  styles.chip,
                  local.ageMin === age.min && local.ageMax === age.max && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    local.ageMin === age.min && local.ageMax === age.max && styles.chipTextActive,
                  ]}
                >
                  {age.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button variant="primary" size="lg" fullWidth onPress={apply}>
          Apply filters
        </Button>
      </View>
    </SimpleBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.ink,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.terracotta,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.clay,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.parchment,
  },
});
