import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Leaf, ArrowRight, Plus, X } from 'lucide-react-native';
import { apiRootPost, apiGet } from '@/lib/api';
import {
  WHY_CHIPS,
  WORRY_CHIPS,
  APPROACH_CHIPS,
  RHYTHM_CHIPS,
  OUTDOOR_CHIPS,
  TUSLA_CHIPS,
  INTEREST_OPTIONS,
  HOME_ED_WHY_KEYS,
  chipLabel,
  answersToOnboardingPayload,
  postKitchenTable,
  type KTChild,
  type KTAnswers,
  type KTFramework,
  type KTTranscript,
} from '@/lib/kitchen-table';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import {
  useAuthStore,
  type UserProfile,
  type Family,
  type Child,
} from '@/stores/auth-store';
import { ChipTurn } from '@/components/kitchen-table/ChipTurn';
import { FrameworkView } from '@/components/kitchen-table/FrameworkView';

type Exchange = { q: string; a: string };

// The Kitchen Table: a warm, calm onboarding chat that writes the family's
// Framework. Same conversation as the web flow, in the dark onboarding theme.
export default function KitchenTableScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { setProfile, setFamily, setChildren: setAuthChildren } = useAuthStore();

  const [step, setStep] = useState(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [children, setChildren] = useState<KTChild[]>([{ name: '', age: null, interests: [] }]);
  const [answers, setAnswers] = useState<Partial<KTAnswers>>({});
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [framework, setFramework] = useState<KTFramework | null>(null);

  const isHomeEdLeaning = HOME_ED_WHY_KEYS.includes(answers.whyKey || '');

  const record = (q: string, a: string) => setExchanges((e) => [...e, { q, a }]);

  // The family name comes from the signed-up user's name (set at signup).
  const familyName =
    (session?.user?.user_metadata?.name as string | undefined)?.trim() || 'My family';

  async function refreshAuth() {
    try {
      const { data } = await apiGet<{
        user: UserProfile;
        family: Family;
        children: Array<{
          id: string;
          name: string;
          date_of_birth: string;
          interests: string[];
          school_status: string;
        }>;
      }>('/me');
      setProfile({
        ...data.user,
        onboarding_completed: (data.family as { onboarding_completed?: boolean }).onboarding_completed ?? true,
      });
      setFamily(data.family);
      const withAges: Child[] = data.children.map((c) => {
        const dob = new Date(c.date_of_birth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return { ...c, age };
      });
      setAuthChildren(withAges);
    } catch {
      // Non-critical: routing still flips once onboarding_completed is set.
    }
  }

  async function finish(final: Partial<KTAnswers>) {
    setThinking(true);
    setError(null);

    const full: KTAnswers = {
      children: children.filter((c) => c.name.trim()),
      whyKey: final.whyKey || answers.whyKey || 'do_more',
      whyText: final.whyText ?? answers.whyText,
      worryKey: final.worryKey || answers.worryKey || 'enough',
      worryText: final.worryText ?? answers.worryText,
      approachKey: final.approachKey || answers.approachKey || 'blended',
      approachText: final.approachText ?? answers.approachText,
      rhythmKey: final.rhythmKey || answers.rhythmKey,
      rhythmText: final.rhythmText ?? answers.rhythmText,
      county: final.county ?? answers.county,
      outdoor: final.outdoor || answers.outdoor,
      tuslaKey: final.tuslaKey || answers.tuslaKey,
    };

    try {
      // 1. Bootstrap the family + children. A fresh mobile signup has no family
      // yet, and /api/kitchen-table requires one. The existing onboarding route
      // creates the family, links the user, and marks onboarding complete.
      await apiRootPost('/onboarding', answersToOnboardingPayload(full, familyName));

      // 2. Author the Family Framework (deterministic fallback server-side, so a
      // 2xx always returns something warm to show).
      const { framework: fw } = await postKitchenTable(full, exchanges as KTTranscript);

      // 3. Refresh the auth store so the root navigator knows onboarding is done.
      await refreshAuth();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFramework(fw);
    } catch (e) {
      setError(
        e instanceof Error
          ? 'Something went sideways setting things up. Have another go in a moment.'
          : 'Something went sideways. Have another go in a moment.',
      );
    } finally {
      setThinking(false);
    }
  }

  // ── Framework reveal ──────────────────────────────────────────────────────
  if (framework) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.frameworkScroll}
          showsVerticalScrollIndicator={false}
        >
          <FrameworkView framework={framework} theme={darkTheme} />
          <Text style={styles.frameworkFooter}>
            This is yours. You can shape any of it from your profile whenever you like.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryCta}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.primaryCtaText}>This is us, into The Hedge</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Thinking state ────────────────────────────────────────────────────────
  if (thinking) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={darkTheme.accent} size="large" />
        <Text style={styles.thinkingTitle}>Let me read that back to you...</Text>
        <Text style={styles.thinkingSub}>
          Gathering what you said into something that feels like your family.
        </Text>
      </SafeAreaView>
    );
  }

  // ── Conversation ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Past exchanges, like handwritten notes */}
          {exchanges.length > 0 && (
            <View style={styles.history}>
              {exchanges.map((e, i) => (
                <View key={i} style={styles.exchange}>
                  <Text style={styles.exchangeQ}>{e.q}</Text>
                  <Text style={styles.exchangeA}>{e.a}</Text>
                </View>
              ))}
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Step 0: soft open */}
          {step === 0 && (
            <View>
              <View style={styles.leafCircle}>
                <Leaf size={28} color={darkTheme.accent} strokeWidth={1.5} />
              </View>
              <Text style={styles.bigTitle}>Pull up a chair.</Text>
              <Text style={styles.lede}>
                Before The Hedge does anything, I'd love to understand your family a
                little. Just a handful of questions, and you can say as much or as
                little as you like.
              </Text>
              <PrimaryButton label="Let's begin" onPress={() => setStep(1)} />
            </View>
          )}

          {/* Step 1: who is at the table */}
          {step === 1 && (
            <View>
              <Text style={styles.question}>Who are we doing this for?</Text>
              <Text style={styles.sub}>Their name, their age, and what they're mad about lately.</Text>

              {children.map((c, i) => (
                <View key={i} style={styles.childCard}>
                  <View style={styles.childRow}>
                    <TextInput
                      value={c.name}
                      onChangeText={(t) =>
                        setChildren((cs) => cs.map((x, j) => (j === i ? { ...x, name: t } : x)))
                      }
                      placeholder="Name"
                      placeholderTextColor={darkTheme.textMuted}
                      style={[styles.field, styles.fieldName]}
                    />
                    <TextInput
                      value={c.age != null ? String(c.age) : ''}
                      onChangeText={(t) =>
                        setChildren((cs) =>
                          cs.map((x, j) =>
                            j === i ? { ...x, age: t ? parseInt(t, 10) || null : null } : x,
                          ),
                        )
                      }
                      placeholder="Age"
                      placeholderTextColor={darkTheme.textMuted}
                      keyboardType="number-pad"
                      style={[styles.field, styles.fieldAge]}
                    />
                    {children.length > 1 && (
                      <TouchableOpacity
                        onPress={() => setChildren((cs) => cs.filter((_, j) => j !== i))}
                        style={styles.removeBtn}
                      >
                        <X size={18} color={darkTheme.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.interestWrap}>
                    {INTEREST_OPTIONS.map((opt) => {
                      const on = c.interests.includes(opt);
                      return (
                        <TouchableOpacity
                          key={opt}
                          onPress={() =>
                            setChildren((cs) =>
                              cs.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      interests: on
                                        ? x.interests.filter((t) => t !== opt)
                                        : [...x.interests, opt],
                                    }
                                  : x,
                              ),
                            )
                          }
                          style={[styles.interest, on && styles.interestOn]}
                        >
                          <Text style={[styles.interestText, on && styles.interestTextOn]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addChild}
                onPress={() =>
                  setChildren((cs) => [...cs, { name: '', age: null, interests: [] }])
                }
              >
                <Plus size={16} color={darkTheme.accent} />
                <Text style={styles.addChildText}>Add another</Text>
              </TouchableOpacity>

              <PrimaryButton
                label="That's our crew"
                disabled={!children.some((c) => c.name.trim())}
                onPress={() => {
                  const named = children.filter((c) => c.name.trim());
                  record(
                    'Who are we doing this for?',
                    named
                      .map((c) => (c.age != null ? `${c.name} (${c.age})` : c.name))
                      .join(', '),
                  );
                  setStep(2);
                }}
              />
            </View>
          )}

          {step === 2 && (
            <ChipTurn
              question="What made you go looking for something like this?"
              chips={WHY_CHIPS}
              placeholder="or say it your own way..."
              onSubmit={(key, text) => {
                setAnswers((a) => ({ ...a, whyKey: key, whyText: text }));
                record(
                  'What made you go looking for something like this?',
                  text || chipLabel(WHY_CHIPS, key),
                );
                setStep(3);
              }}
            />
          )}

          {step === 3 && (
            <ChipTurn
              question="And honestly, what's the worry in the back of your mind?"
              chips={WORRY_CHIPS}
              placeholder="or in your own words..."
              onSubmit={(key, text) => {
                setAnswers((a) => ({ ...a, worryKey: key, worryText: text }));
                record("What's the worry in the back of your mind?", text || chipLabel(WORRY_CHIPS, key));
                setStep(4);
              }}
            />
          )}

          {step === 4 && (
            <ChipTurn
              question="When you picture a good day's learning, what does it look like?"
              chips={APPROACH_CHIPS}
              placeholder="describe a good day..."
              onSubmit={(key, text) => {
                setAnswers((a) => ({ ...a, approachKey: key, approachText: text }));
                record("A good day's learning looks like...", text || chipLabel(APPROACH_CHIPS, key));
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <ChipTurn
              question="When does learning usually happen for you?"
              chips={RHYTHM_CHIPS}
              placeholder="or describe your week..."
              onSubmit={(key, text) => {
                setAnswers((a) => ({ ...a, rhythmKey: key, rhythmText: text }));
                record('When does learning happen?', text || chipLabel(RHYTHM_CHIPS, key));
                setStep(6);
              }}
            />
          )}

          {/* Step 6: place + outdoor space */}
          {step === 6 && (
            <View>
              <Text style={styles.question}>Last bit, where are you, and is there outdoor space?</Text>
              <TextInput
                value={answers.county || ''}
                onChangeText={(t) => setAnswers((a) => ({ ...a, county: t }))}
                placeholder="Your county"
                placeholderTextColor={darkTheme.textMuted}
                style={[styles.field, styles.fieldFull]}
              />
              <View style={styles.outdoorWrap}>
                {OUTDOOR_CHIPS.map((c) => {
                  const on = answers.outdoor === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      onPress={() => setAnswers((a) => ({ ...a, outdoor: c.key }))}
                      style={[styles.outdoor, on && styles.outdoorOn]}
                    >
                      <Text style={[styles.outdoorText, on && styles.outdoorTextOn]}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <PrimaryButton
                label={isHomeEdLeaning ? 'Nearly there' : 'Read me my framework'}
                onPress={() => {
                  const outdoorLabel = chipLabel(OUTDOOR_CHIPS, answers.outdoor);
                  record(
                    'Where are you?',
                    `${answers.county?.trim() || 'Ireland'}${outdoorLabel ? `, ${outdoorLabel.toLowerCase()}` : ''}`,
                  );
                  if (isHomeEdLeaning) setStep(7);
                  else finish({});
                }}
              />
            </View>
          )}

          {/* Step 7: gentle Tusla question (home-ed leaning only) */}
          {step === 7 && (
            <ChipTurn
              question="And where are you with Tusla, if at all?"
              note="AEARS sets no minimum hours and no attendance bar, and I'll never pretend it does."
              chips={TUSLA_CHIPS}
              submitLabel="Read me my framework"
              onSubmit={(key) => {
                record('Where are you with Tusla?', chipLabel(TUSLA_CHIPS, key));
                finish({ tuslaKey: key });
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.primaryCta, disabled && styles.ctaDisabled]}
    >
      <Text style={styles.primaryCtaText}>{label}</Text>
      <ArrowRight size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  frameworkScroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },

  history: { marginBottom: spacing['2xl'], gap: spacing.lg },
  exchange: {},
  exchangeQ: {
    ...typography.body,
    color: darkTheme.textSecondary,
    fontStyle: 'italic',
  },
  exchangeA: {
    ...typography.bodySmall,
    color: darkTheme.accent,
    fontWeight: '600',
    marginTop: 4,
  },

  leafCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  bigTitle: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: darkTheme.text,
  },
  lede: {
    ...typography.bodyLarge,
    color: darkTheme.textSecondary,
    marginTop: spacing.md,
  },

  question: {
    ...typography.onboardingTitle,
    color: darkTheme.text,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.bodySmall,
    color: darkTheme.textSecondary,
    marginBottom: spacing.lg,
  },

  childCard: {
    backgroundColor: darkTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  field: {
    ...typography.body,
    color: darkTheme.text,
    backgroundColor: darkTheme.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  fieldName: { flex: 1 },
  fieldAge: { width: 64, textAlign: 'center' },
  fieldFull: { marginTop: spacing.xs },
  removeBtn: { padding: spacing.sm },

  interestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interest: {
    backgroundColor: darkTheme.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  interestOn: { backgroundColor: darkTheme.accent },
  interestText: { ...typography.uiSmall, color: darkTheme.textSecondary },
  interestTextOn: { color: '#FFFFFF', fontWeight: '600' },

  addChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addChildText: { ...typography.uiBold, color: darkTheme.accent },

  outdoorWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  outdoor: {
    backgroundColor: darkTheme.surface,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: darkTheme.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  outdoorOn: { backgroundColor: darkTheme.accentLight, borderColor: darkTheme.accent },
  outdoorText: { ...typography.bodySmall, color: darkTheme.textSecondary },
  outdoorTextOn: { color: darkTheme.text, fontWeight: '600' },

  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: spacing['2xl'],
  },
  ctaDisabled: { opacity: 0.4 },
  primaryCtaText: { ...typography.button, color: '#FFFFFF' },

  thinkingTitle: {
    ...typography.h3,
    color: darkTheme.text,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  thinkingSub: {
    ...typography.bodySmall,
    color: darkTheme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },

  frameworkFooter: {
    ...typography.bodySmall,
    color: darkTheme.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  errorBox: {
    backgroundColor: `${darkTheme.error}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${darkTheme.error}30`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { ...typography.bodySmall, color: darkTheme.error },
});
