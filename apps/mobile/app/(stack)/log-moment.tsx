import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { X, BookHeart, ArrowRight, Mic, GraduationCap, Check, Layers } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPost } from '@/hooks/use-api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface MomentDraft {
  title: string;
  summary: string;
  areas: string[];
  outcomeIds: string[];
  outcomeCodes: string[];
  rationale: string;
}

const DURATIONS = [10, 20, 30, 45, 60, 90];

export default function LogMomentScreen() {
  const router = useRouter();
  const { children } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(children.map((c) => c.id));
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | null>(30);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [draft, setDraft] = useState<MomentDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyse = useApiPost<MomentDraft, { childIds: string[]; description: string }>('/moment/analyse');
  const save = useApiPost<{ portfolioSaved: number }, {
    childIds: string[]; date: string; durationMinutes: number | null;
    title: string; summary: string; areas: string[]; outcomeIds: string[];
  }>('/moment/save');

  const today = new Date().toISOString().split('T')[0];
  const canAnalyse = description.trim().length > 4 && selected.length > 0 && !analyse.isPending;

  function toggleChild(id: string) {
    Haptics.selectionAsync();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function runAnalyse() {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const d = await analyse.mutateAsync({ childIds: selected, description: description.trim() });
      setDraft(d);
      setStep('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'I could not read that one back. Have another go in a moment.');
    }
  }

  async function runSave() {
    if (!draft) return;
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await save.mutateAsync({
        childIds: selected,
        date: today,
        durationMinutes: duration,
        title: draft.title,
        summary: draft.summary,
        areas: draft.areas,
        outcomeIds: draft.outcomeIds,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'I could not save that. Have another go in a moment.');
    }
  }

  const aistear = draft?.areas.filter((a) => a.startsWith('Aistear')).map((a) => a.replace('Aistear:', '').trim()) || [];
  const ncca = draft?.areas.filter((a) => !a.startsWith('Aistear')) || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BookHeart size={18} color={lightTheme.accent} />
          <Text style={styles.headerTitle}>{step === 'input' ? 'Log a moment' : 'How it looks'}</Text>
        </View>
        {!analyse.isPending && !save.isPending && (
          <TouchableOpacity onPress={() => (step === 'review' ? setStep('input') : router.back())} hitSlop={12}>
            <X size={22} color={lightTheme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {analyse.isPending ? (
          <Loading text="Reading it back and finding what it covered..." />
        ) : step === 'input' ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>
              Just did something lovely? Tell me what happened in your own words and I will read it back,
              find what it quietly covered, and tidy it for the portfolio.
            </Text>

            {children.length > 1 && (
              <>
                <Text style={styles.label}>Who was it?</Text>
                <View style={styles.row}>
                  {children.map((c) => {
                    const on = selected.includes(c.id);
                    return (
                      <TouchableOpacity key={c.id} onPress={() => toggleChild(c.id)} style={[styles.pill, on && styles.pillOn]}>
                        {on && <Check size={13} color={lightTheme.text} />}
                        <Text style={[styles.pillText, on && styles.pillTextOn]}>{c.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>What did they do?</Text>
            <TextInput
              value={description}
              onChangeText={(t) => { setDescription(t); if (error) setError(null); }}
              placeholder="e.g. We baked brown bread together, she measured the flour and we talked about how the bread rises"
              placeholderTextColor={lightTheme.textMuted}
              multiline
              style={styles.input}
              autoFocus
            />
            <View style={styles.dictateRow}>
              <Mic size={14} color={lightTheme.accent} />
              <Text style={styles.dictateText}>Prefer to talk? Tap the microphone on your keyboard and just say it.</Text>
            </View>

            <Text style={styles.label}>How long, roughly?</Text>
            <View style={styles.row}>
              {DURATIONS.map((d) => (
                <TouchableOpacity key={d} onPress={() => { Haptics.selectionAsync(); setDuration(d); }} style={[styles.pill, duration === d && styles.pillOn]}>
                  <Text style={[styles.pillText, duration === d && styles.pillTextOn]}>{d < 60 ? `${d} min` : `${d / 60} hr`}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
        ) : save.isPending ? (
          <Loading text="Saving it to the portfolio..." />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>Here is how it reads. Tweak anything, then keep it for the portfolio.</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              value={draft?.title}
              onChangeText={(t) => setDraft((d) => (d ? { ...d, title: t } : d))}
              style={[styles.input, styles.inputShort]}
            />

            <Text style={styles.label}>What happened</Text>
            <TextInput
              value={draft?.summary}
              onChangeText={(t) => setDraft((d) => (d ? { ...d, summary: t } : d))}
              multiline
              style={styles.input}
            />

            {(aistear.length > 0 || ncca.length > 0) && (
              <View style={styles.alignCard}>
                <Text style={styles.alignTitle}>What this covered</Text>
                {draft?.rationale ? <Text style={styles.rationale}>{draft.rationale}</Text> : null}
                {aistear.length > 0 && (
                  <View style={styles.alignGroup}>
                    <View style={styles.alignLabelRow}><Layers size={13} color={lightTheme.accent} /><Text style={styles.alignLabel}>Aistear</Text></View>
                    <View style={styles.tagRow}>{aistear.map((a) => <View key={a} style={styles.tag}><Text style={styles.tagText}>{a}</Text></View>)}</View>
                  </View>
                )}
                {ncca.length > 0 && (
                  <View style={styles.alignGroup}>
                    <View style={styles.alignLabelRow}><GraduationCap size={13} color={lightTheme.primary} /><Text style={styles.alignLabel}>Primary Curriculum</Text></View>
                    <View style={styles.tagRow}>{ncca.map((a) => <View key={a} style={[styles.tag, styles.tagNcca]}><Text style={[styles.tagText, styles.tagTextNcca]}>{a}</Text></View>)}</View>
                  </View>
                )}
                {draft && draft.outcomeCodes.length > 0 && (
                  <Text style={styles.codes}>Outcomes touched: {draft.outcomeCodes.join(', ')}</Text>
                )}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
        )}

        {!analyse.isPending && !save.isPending && (
          <View style={styles.footer}>
            {step === 'input' ? (
              <TouchableOpacity disabled={!canAnalyse} onPress={runAnalyse} style={[styles.cta, !canAnalyse && styles.ctaOff]}>
                <Text style={styles.ctaText}>Read it back</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={runSave} style={styles.cta}>
                <BookHeart size={18} color="#FFFFFF" />
                <Text style={styles.ctaText}>Keep it for the portfolio</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color={lightTheme.accent} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.h3, color: lightTheme.text },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  lead: { ...typography.body, color: lightTheme.textSecondary, marginBottom: spacing.lg, lineHeight: 23 },
  label: { ...typography.uiBold, color: lightTheme.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: lightTheme.surface, borderRadius: 999, borderWidth: 1.5, borderColor: lightTheme.border, paddingHorizontal: spacing.md, paddingVertical: 9 },
  pillOn: { backgroundColor: lightTheme.accentLight, borderColor: lightTheme.accent },
  pillText: { ...typography.bodySmall, color: lightTheme.textSecondary },
  pillTextOn: { color: lightTheme.text, fontWeight: '600' },
  input: { ...typography.body, color: lightTheme.text, backgroundColor: lightTheme.surface, borderRadius: 14, borderWidth: 1.5, borderColor: lightTheme.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, minHeight: 110, textAlignVertical: 'top' },
  inputShort: { minHeight: 0, paddingVertical: spacing.md },
  dictateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  dictateText: { ...typography.bodySmall, color: lightTheme.textSecondary, flex: 1, lineHeight: 18 },
  error: { ...typography.bodySmall, color: '#C0392B', marginTop: spacing.md },
  alignCard: { backgroundColor: lightTheme.surface, borderRadius: 16, borderWidth: 1, borderColor: lightTheme.borderLight, padding: spacing.lg, marginTop: spacing.lg },
  alignTitle: { ...typography.uiBold, color: lightTheme.text, marginBottom: spacing.sm },
  rationale: { ...typography.bodySmall, color: lightTheme.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  alignGroup: { marginBottom: spacing.md },
  alignLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  alignLabel: { ...typography.uiSmall, color: lightTheme.text, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: lightTheme.accentLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagText: { ...typography.uiSmall, color: lightTheme.accent, fontWeight: '600' },
  tagNcca: { backgroundColor: `${lightTheme.primary}12` },
  tagTextNcca: { color: lightTheme.primary },
  codes: { ...typography.bodySmall, color: lightTheme.textMuted, marginTop: 4 },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: lightTheme.accent, borderRadius: 16, paddingVertical: 17 },
  ctaOff: { opacity: 0.4 },
  ctaText: { ...typography.button, color: '#FFFFFF' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  loadingText: { ...typography.body, color: lightTheme.textSecondary, textAlign: 'center', lineHeight: 22 },
});
