import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { hapticLight } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface Child {
  id: string;
  name: string;
}

interface ChildSelectorProps {
  children: Child[];
  selected: string[];
  onChange: (ids: string[]) => void;
  multi?: boolean;
}

export function ChildSelector({
  children: childList,
  selected,
  onChange,
  multi = true,
}: ChildSelectorProps) {
  const toggle = (id: string) => {
    hapticLight();
    if (multi) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {childList.map((child) => {
        const isSelected = selected.includes(child.id);
        return (
          <TouchableOpacity
            key={child.id}
            onPress={() => toggle(child.id)}
            style={[styles.chip, isSelected && styles.chipActive]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {child.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.clay,
  },
  chipTextActive: {
    color: colors.parchment,
  },
});
