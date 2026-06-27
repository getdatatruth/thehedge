import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Sparkles, ArrowRight, Feather, Mic } from 'lucide-react-native';
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

const loadingLines = (name: string) => [
  `Listening to what ${name} is curious about`,
  `Shaping a hands-on, screen-free activity for ${name}`,
  `Aligning it to Aistear and the primary curriculum`,
  `Writing a little parent guide to follow along`,
  `Tying it to real outcomes for ${name}'s portfolio`,
  `Almost there, putting it all together`,
];

export default function SparkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lean?: string; leanLabel?: string; leanHint?: string }>();
  const { children } = useAuthStore();
  const [childId, setChildId] = useState<string | null>(children[0]?.id ?? null);
  const [prompt, setPrompt] = useState(params.leanHint ? String(params.leanHint) : '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const child = children.find((c) => c.id === childId) ?? children[0];
  const spark = useApiPost<SparkResult, { childId: string; prompt: string; lean?: string }>('/spark');

  const canGo = prompt.trim().length > 2 && !!childId && !spark.isPending;

  async function follow() {
    if (!childId) return;
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await spark.mutateAsync({
        childId,
        prompt: prompt.trim(),
        lean: typeof params.lean === 'string' ? params.lean : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Sparkles size={18} color={lightTheme.accent} />
          <Text style={styles.headerTitle}>Follow a spark</Text>
        </View>
        {!spark.isPending && (
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
            <X size={22} color={lightTheme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {spark.isPending ? (
          <SparkLoading name={child?.name ?? 'them'} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroIcon}>
              <Sparkles size={30} color={lightTheme.accent} strokeWidth={1.6} />
            </View>
            <Text style={styles.bigTitle}>What caught their eye?</Text>
            <Text style={styles.lead}>
              Tell me what {child?.name ?? 'they'} {child ? 'is' : 'are'} curious about right now and I will
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

            <View style={styles.inputWrap}>
              <TextInput
                ref={inputRef}
                value={prompt}
                onChangeText={(t) => { setPrompt(t); if (error) setError(null); }}
                placeholder={`e.g. ${child?.name ?? 'They'} is mad about volcanoes and how they erupt`}
                placeholderTextColor={lightTheme.textMuted}
                multiline
                style={styles.input}
                autoFocus
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dictateRow}
              onPress={() => { Haptics.selectionAsync(); inputRef.current?.focus(); }}
            >
              <View style={styles.micCircle}>
                <Mic size={16} color={lightTheme.accent} />
              </View>
              <Text style={styles.dictateText}>
                Prefer to talk? Tap the microphone on your keyboard and just say it.
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}
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
              <Sparkles size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>Shape it for {child?.name ?? 'them'}</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── The alive loading state: a pulsing spark, a filling progress arc and a
// rotating, curriculum-aware status line, so it never reads as frozen. ────────
function SparkLoading({ name }: { name: string }) {
  const lines = loadingLines(name);
  const [lineIndex, setLineIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // gentle pulse of the spark
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    // progress bar eases toward ~95% over ~16s (the real result usually lands first)
    Animated.timing(progress, { toValue: 1, duration: 16000, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pulse, progress]);

  useEffect(() => {
    const t = setInterval(() => {
      // cross-fade the status line
      Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setLineIndex((i) => (i + 1) % lines.length);
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 2400);
    const s = setInterval(() => setSeconds((x) => x + 1), 1000);
    return () => { clearInterval(t); clearInterval(s); };
  }, [fade, lines.length]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });
  const widthPct = progress.interpolate({ inputRange: [0, 1], outputRange: ['6%', '95%'] });

  return (
    <View style={styles.loadingWrap}>
      <Animated.View style={[styles.loadGlow, { opacity: glow, transform: [{ scale }] }]} />
      <Animated.View style={[styles.loadIcon, { transform: [{ scale }] }]}>
        <Sparkles size={40} color={lightTheme.accent} strokeWidth={1.6} />
      </Animated.View>

      <Text style={styles.loadHeadline}>Shaping something for {name}</Text>

      <Animated.Text style={[styles.loadLine, { opacity: fade }]}>
        {lines[lineIndex]}
      </Animated.Text>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: widthPct }]} />
      </View>
      <Text style={styles.loadTimer}>
        {seconds < 18 ? 'This usually takes a few seconds' : 'Nearly there, thanks for your patience'}
      </Text>
    </View>
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
  heroIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  bigTitle: { ...typography.h1, color: lightTheme.text, marginBottom: spacing.sm },
  lead: { ...typography.body, color: lightTheme.textSecondary, marginBottom: spacing.lg, lineHeight: 23 },
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
  childRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
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
  inputWrap: { marginTop: spacing.xs },
  input: {
    ...typography.body,
    color: lightTheme.text,
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dictateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  micCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  dictateText: { ...typography.bodySmall, color: lightTheme.textSecondary, flex: 1, lineHeight: 18 },
  error: { ...typography.bodySmall, color: '#C0392B', marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.accent,
    borderRadius: 16,
    paddingVertical: 17,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { ...typography.button, color: '#FFFFFF' },

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  loadGlow: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: lightTheme.accent,
    top: '32%',
  },
  loadIcon: {
    width: 104, height: 104, borderRadius: 34,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  loadHeadline: { ...typography.h2, color: lightTheme.text, textAlign: 'center', marginBottom: spacing.md },
  loadLine: {
    ...typography.body,
    color: lightTheme.accent,
    textAlign: 'center',
    minHeight: 48,
    lineHeight: 23,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    width: '78%',
    height: 6,
    borderRadius: 3,
    backgroundColor: lightTheme.border,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: lightTheme.accent },
  loadTimer: { ...typography.bodySmall, color: lightTheme.textMuted, marginTop: spacing.md },
});
