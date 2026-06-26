import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// The 32 counties of Ireland. Tusla home-ed is Republic-only, but families live
// island-wide, so we list all 32 until the product expands beyond Ireland.
export const IE_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
];

export function CountyDropdown({ value, onChange }: { value?: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || 'Choose your county'}
        </Text>
        <ChevronDown size={18} color={lightTheme.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Your county</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {IE_COUNTIES.map((c) => {
                const on = value === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => { onChange(c); setOpen(false); }}
                  >
                    <Text style={[styles.rowText, on && styles.rowTextOn]}>{c}</Text>
                    {on && <Check size={18} color={lightTheme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightTheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  triggerText: { ...typography.body, color: lightTheme.text },
  placeholder: { color: lightTheme.textMuted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,31,18,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightTheme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    maxHeight: '70%',
  },
  sheetTitle: {
    ...typography.h3,
    color: lightTheme.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.borderLight,
  },
  rowText: { ...typography.body, color: lightTheme.text },
  rowTextOn: { color: lightTheme.accent, fontWeight: '600' },
});
