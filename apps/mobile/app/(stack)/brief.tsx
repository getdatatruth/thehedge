import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Sun, Moon, Sparkles, BookHeart, ArrowRight, Check, Sprout } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApiQuery } from '@/hooks/use-api';
import { lightTheme, categoryColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface Block { title: string; subject?: string; time?: string; duration?: number; completed?: boolean }
interface BriefChild {
  id: string; name: string; age: number | null;
  todayPlan: Block[]; tomorrowPlan: Block[];
  doneToday: { title: string; category: string | null }[];
  idea: { slug: string; title: string; category: string; duration_minutes: number } | null;
}
interface BriefData {
  mode: 'morning' | 'evening';
  greeting: string; firstName: string; date: string;
  children: BriefChild[];
}

export default function BriefScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'evening' ? 'evening' : 'morning';
  const { data, isLoading } = useApiQuery<BriefData>(['brief', mode], `/me/brief?mode=${mode}`, { staleTime: 60000 });

  const catColor = (c?: string | null) => (c && (categoryColors as Record<string, string>)[c]) || lightTheme.accent;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          {mode === 'evening' ? <Moon size={18} color={lightTheme.accent} /> : <Sun size={18} color={lightTheme.accent} />}
          <Text style={styles.headerTitle}>{mode === 'evening' ? 'This evening' : 'Today'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><X size={22} color={lightTheme.textMuted} /></TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={lightTheme.accent} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.bigGreeting}>{data?.greeting}, {data?.firstName}.</Text>
          <Text style={styles.lead}>
            {mode === 'evening'
              ? 'A gentle look back at the day, and a peek at tomorrow.'
              : "Here's the shape of the day with your crew. Nothing you have to do, just a calm place to start."}
          </Text>

          {(data?.children || []).map((child) => (
            <View key={child.id} style={styles.childCard}>
              <Text style={styles.childName}>{child.name}{child.age != null ? `, ${child.age}` : ''}</Text>

              {mode === 'morning' ? (
                child.todayPlan.length > 0 ? (
                  <>
                    <Text style={styles.sectionLabel}>On the plan today</Text>
                    {child.todayPlan.map((b, i) => (
                      <View key={i} style={styles.blockRow}>
                        <View style={[styles.dot, { backgroundColor: catColor(b.subject) }]} />
                        <Text style={styles.blockText}>{b.time ? `${b.time}  ` : ''}{b.title}</Text>
                        {b.duration ? <Text style={styles.blockMeta}>{b.duration}m</Text> : null}
                      </View>
                    ))}
                  </>
                ) : child.idea ? (
                  <>
                    <Text style={styles.sectionLabel}>An idea for today</Text>
                    <TouchableOpacity
                      style={styles.ideaCard}
                      activeOpacity={0.85}
                      onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/browse/${child.idea!.slug}` as never); }}
                    >
                      <View style={[styles.ideaIcon, { backgroundColor: `${catColor(child.idea.category)}20` }]}>
                        <Sprout size={18} color={catColor(child.idea.category)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.ideaTitle}>{child.idea.title}</Text>
                        <Text style={styles.ideaMeta}>{child.idea.category} · {child.idea.duration_minutes} min</Text>
                      </View>
                      <ArrowRight size={16} color={lightTheme.textMuted} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.soft}>A blank page today. Follow whatever they are curious about.</Text>
                )
              ) : (
                <>
                  <Text style={styles.sectionLabel}>What {child.name} did today</Text>
                  {child.doneToday.length > 0 ? (
                    <View style={styles.tagRow}>
                      {child.doneToday.map((d, i) => (
                        <View key={i} style={[styles.tag, { backgroundColor: `${catColor(d.category)}18` }]}>
                          <Check size={12} color={catColor(d.category)} />
                          <Text style={[styles.tagText, { color: catColor(d.category) }]}>{d.title}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.soft}>Nothing logged today, and that is no bother at all. Tomorrow is a fresh page.</Text>
                  )}
                  {child.tomorrowPlan.length > 0 && (
                    <>
                      <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>A peek at tomorrow</Text>
                      {child.tomorrowPlan.slice(0, 3).map((b, i) => (
                        <View key={i} style={styles.blockRow}>
                          <View style={[styles.dot, { backgroundColor: catColor(b.subject) }]} />
                          <Text style={styles.blockText}>{b.title}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}
            </View>
          ))}

          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(stack)/spark' as never); }}>
              <Sparkles size={17} color="#FFFFFF" />
              <Text style={styles.ctaText}>Follow a spark</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaAlt} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(stack)/log-moment' as never); }}>
              <BookHeart size={17} color={lightTheme.accent} />
              <Text style={styles.ctaAltText}>Log a moment</Text>
            </TouchableOpacity>
          </View>
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
  childCard: { backgroundColor: lightTheme.surface, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: lightTheme.borderLight },
  childName: { ...typography.h3, color: lightTheme.text, marginBottom: spacing.md },
  sectionLabel: { ...typography.uiSmall, color: lightTheme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing.sm },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  blockText: { ...typography.body, color: lightTheme.text, flex: 1 },
  blockMeta: { ...typography.bodySmall, color: lightTheme.textMuted },
  ideaCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: lightTheme.background, borderRadius: 14, padding: spacing.md },
  ideaIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  ideaTitle: { ...typography.uiBold, color: lightTheme.text },
  ideaMeta: { ...typography.bodySmall, color: lightTheme.textSecondary, marginTop: 1 },
  soft: { ...typography.body, color: lightTheme.textSecondary, lineHeight: 21, fontStyle: 'italic' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  tagText: { ...typography.uiSmall, fontWeight: '600' },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cta: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: lightTheme.accent, borderRadius: 14, paddingVertical: 15 },
  ctaText: { ...typography.button, color: '#FFFFFF' },
  ctaAlt: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: lightTheme.surface, borderWidth: 1.5, borderColor: lightTheme.accent, borderRadius: 14, paddingVertical: 15 },
  ctaAltText: { ...typography.button, color: lightTheme.accent },
});
