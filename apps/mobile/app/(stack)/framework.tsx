import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Leaf } from 'lucide-react-native';
import type { KTFramework } from '@/lib/kitchen-table';
import { FrameworkView } from '@/components/kitchen-table/FrameworkView';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// The Family Framework, revisitable from the profile area. The framework is
// passed in as a serialized route param (there is no GET endpoint yet, only the
// POST that authors it during onboarding). When opened cold without it, we offer
// a gentle path back to the Kitchen Table to write a fresh one.
export default function FrameworkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ framework?: string }>();

  let framework: KTFramework | null = null;
  if (typeof params.framework === 'string' && params.framework.length > 0) {
    try {
      framework = JSON.parse(params.framework) as KTFramework;
    } catch {
      framework = null;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={lightTheme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Framework</Text>
        <View style={styles.backBtn} />
      </View>

      {framework ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <FrameworkView framework={framework} theme={lightTheme} />
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <View style={styles.leafCircle}>
            <Leaf size={26} color={lightTheme.accent} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your framework lives here</Text>
          <Text style={styles.emptyBody}>
            Have a quick chat at the Kitchen Table and I'll write your family's
            framework back to you, in your own register.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.cta}
            onPress={() => router.push('/(auth)/kitchen-table' as never)}
          >
            <Text style={styles.ctaText}>Pull up a chair</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: lightTheme.text },
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  leafCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.h3, color: lightTheme.text, textAlign: 'center' },
  emptyBody: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  cta: {
    backgroundColor: lightTheme.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.xl,
  },
  ctaText: { ...typography.buttonSmall, color: '#FFFFFF' },
});
