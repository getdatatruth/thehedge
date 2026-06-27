import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { X, CalendarDays, Sparkles, Feather, ArrowRight, Leaf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApiQuery } from '@/hooks/use-api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface WeeklyReview {
  firstName: string;
  activityCount: number; daysOfLearning: number; totalMinutes: number; areasTouched: number;
  categoryBreakdown: Record<string, number>;
  lovelyAreas: string[];
  quietFloor: { areas: { category: string; label: string; hint: string }[]; message: string } | null;
  nextWeekPlanned: number;
}

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const { data, isLoading } = useApiQuery<WeeklyReview>(['weekly-review'], '/me/weekly-review', { staleTime: 60000 });
  const hours = data ? Math.round((data.totalMinutes / 60) * 10) / 10 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CalendarDays size={18} color={lightTheme.accent} />
          <Text style={styles.headerTitle}>Your week</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><X size={22} color={lightTheme.textMuted} /></TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={lightTheme.accent} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.bigGreeting}>The week with {data?.firstName}'s family.</Text>
          <Text style={styles.lead}>A gentle look at how the week went, and the one ahead. No scores, just the shape of it.</Text>

          <View style={styles.statRow}>
            <View style={styles.stat}><Text style={styles.statNum}>{data?.activityCount ?? 0}</Text><Text style={styles.statLabel}>moments kept</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{data?.daysOfLearning ?? 0}</Text><Text style={styles.statLabel}>days of learning</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{data?.areasTouched ?? 0}</Text><Text style={styles.statLabel}>areas touched</Text></View>
          </View>

          {(data?.lovelyAreas?.length ?? 0) > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHead}><Leaf size={15} color={lightTheme.accent} /><Text style={styles.cardTitle}>What was lovely</Text></View>
              <Text style={styles.cardBody}>
                You had a good run on {(data!.lovelyAreas).join(', ')}. That is a rounded, curious week.
              </Text>
            </View>
          )}

          {data?.quietFloor && (
            <View style={styles.card}>
              <View style={styles.cardHead}><Feather size={15} color={lightTheme.accent} /><Text style={styles.cardTitle}>A gentle nudge for next week</Text></View>
              <Text style={styles.cardBody}>{data.quietFloor.message}</Text>
              <TouchableOpacity
                style={styles.nudgeCta}
                activeOpacity={0.85}
                onPress={() => {
                  const a = data.quietFloor!.areas[0];
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace(`/(stack)/spark?lean=${a.category}&leanLabel=${encodeURIComponent(a.label)}&leanHint=${encodeURIComponent(a.hint)}` as never);
                }}
              >
                <Text style={styles.nudgeCtaText}>Shape a spark that leans that way</Text>
                <ArrowRight size={15} color={lightTheme.accent} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.cardHead}><CalendarDays size={15} color={lightTheme.primary} /><Text style={styles.cardTitle}>The week ahead</Text></View>
            <Text style={styles.cardBody}>
              {(data?.nextWeekPlanned ?? 0) > 0
                ? `You have ${data!.nextWeekPlanned} things gently sketched in for next week. Shape it however suits.`
                : 'Nothing locked in for next week yet, which is a lovely blank page. Plan a rhythm, or just follow the days.'}
            </Text>
            <TouchableOpacity style={styles.planCta} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(tabs)/plan' as never); }}>
              <Text style={styles.planCtaText}>Look at next week</Text>
              <ArrowRight size={15} color={lightTheme.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(stack)/spark' as never); }}>
            <Sparkles size={17} color="#FFFFFF" />
            <Text style={styles.ctaText}>Follow a spark</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.h3, color: lightTheme.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  bigGreeting: { ...typography.h1, color: lightTheme.text, marginBottom: spacing.xs },
  lead: { ...typography.body, color: lightTheme.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  stat: { flex: 1, backgroundColor: lightTheme.surface, borderRadius: 16, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: lightTheme.borderLight },
  statNum: { ...typography.h1, color: lightTheme.accent },
  statLabel: { ...typography.uiSmall, color: lightTheme.textSecondary, textAlign: 'center', marginTop: 2 },
  card: { backgroundColor: lightTheme.surface, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: lightTheme.borderLight },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  cardTitle: { ...typography.uiBold, color: lightTheme.text },
  cardBody: { ...typography.body, color: lightTheme.textSecondary, lineHeight: 22 },
  nudgeCta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md },
  nudgeCtaText: { ...typography.uiBold, color: lightTheme.accent },
  planCta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md },
  planCtaText: { ...typography.uiBold, color: lightTheme.primary },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: lightTheme.accent, borderRadius: 16, paddingVertical: 16, marginTop: spacing.sm },
  ctaText: { ...typography.button, color: '#FFFFFF' },
});
