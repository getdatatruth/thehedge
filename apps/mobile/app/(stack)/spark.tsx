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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Sparkles, ArrowRight, Feather } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth-store';
import { useApiPost } from '@/hooks/use-api';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface SparkResult {
  slug: string;
  childName: string;
  outcomeCount: number;
}

export default function SparkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lean?: string; leanLabel?: string; leanHint?: string }>();
  const { children } = useAuthStore();
  const [childId, setChildId] = useState<string | null>(children[0]?.id ?? null);
  // Arriving from a Quiet Floor nudge pre-fills a gentle starting point toward
  // the quiet area, which the parent can keep or rewrite in their own words.
  const [prompt, setPrompt] = useState(params.leanHint ? String(params.leanHint) : '');
  const [error, setError] = useState<string | null>(null);

  const child = children.find((c) => c.id === childId) ?? children[0];
  const spark = useApiPost<SparkResult, { childId: string; prompt: string; lean?: string }>('/spark');

  const canGo = prompt.trim().length > 2 && !!childId && !spark.isPending;

  async function follow() {
    if (!childId) return;
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await spark.mutateAsync({
        childId,
        prompt: prompt.trim(),
        lean: typeof params.lean === 'string' ? params.lean : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Replace this modal with the freshly-shaped activity. The existing detail
      // screen renders it, including its curriculum grounding, and the usual log
      // + save-to-portfolio flow works unchanged.
      router.replace(`/(tabs)/browse/${res.slug}` as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'I could not shape that one just now. Have another go in a moment.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={20} color={lightTheme.accent} />
          <Text style={styles.headerTitle}>Follow a spark</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <X size={22} color={lightTheme.textMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {spark.isPending ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={lightTheme.accent} />
            <Text style={styles.loadingText}>
              Shaping something for {child?.name ?? 'them'}, and tying it back to what matters...
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.lead}>
              Something caught their eye? Tell me what they are curious about right now and I will
              shape one lovely thing to do, tied quietly back to the curriculum so it counts.
            </Text>

            {params.leanLabel ? (
              <View style={styles.leanBanner}>
                <Feather size={15} color={lightTheme.accent} />
                <Text style={styles.leanBannerText}>
                  Leaning toward {String(params.leanLabel)} to round things out. Tweak it however you like.
                </Text>
              </View>
            ) : null}

            {children.length > 1 && (
              <>
                <Text style={styles.label}>Who is this for?</Text>
                <View style={styles.childRow}>
                  {children.map((c) => {
                    const on = c.id === childId;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        activeOpacity={0.85}
                        onPress={() => { Haptics.selectionAsync(); setChildId(c.id); }}
                        style={[styles.childPill, on && styles.childPillOn]}
                      >
                        <Text style={[styles.childPillText, on && styles.childPillTextOn]}>{c.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.label}>What are they curious about?</Text>
            <TextInput
              value={prompt}
              onChangeText={(t) => { setPrompt(t); if (error) setError(null); }}
              placeholder={`e.g. ${child?.name ?? 'They'} is mad about volcanoes and how they erupt`}
              placeholderTextColor={lightTheme.textMuted}
              multiline
              style={styles.input}
              autoFocus
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.hint}>
              I already know {child?.name ?? 'them'}, so just say it the way you would at the table.
            </Text>
          </ScrollView>
        )}

        {!spark.isPending && (
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!canGo}
              onPress={follow}
              style={[styles.cta, !canGo && styles.ctaDisabled]}
            >
              <Text style={styles.ctaText}>Follow it</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.h3, color: lightTheme.text },
  closeBtn: { padding: spacing.xs },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  lead: { ...typography.body, color: lightTheme.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  leanBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: lightTheme.accentLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  leanBannerText: { ...typography.bodySmall, color: lightTheme.text, flex: 1, lineHeight: 18 },
  label: { ...typography.uiBold, color: lightTheme.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  childRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  childPill: {
    backgroundColor: lightTheme.surface,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  childPillOn: { backgroundColor: lightTheme.accentLight, borderColor: lightTheme.accent },
  childPillText: { ...typography.bodySmall, color: lightTheme.textSecondary },
  childPillTextOn: { color: lightTheme.text, fontWeight: '600' },
  input: {
    ...typography.body,
    color: lightTheme.text,
    backgroundColor: lightTheme.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  hint: { ...typography.bodySmall, color: lightTheme.textMuted, marginTop: spacing.md, fontStyle: 'italic' },
  error: { ...typography.bodySmall, color: '#C0392B', marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { ...typography.button, color: '#FFFFFF' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  loadingText: { ...typography.body, color: lightTheme.textSecondary, textAlign: 'center', lineHeight: 22 },
});
