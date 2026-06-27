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
import { StatusBar } from 'expo-status-bar';
import { Leaf, ArrowRight, Plus, X } from 'lucide-react-native';
import { apiRootPost, apiGet, ApiError } from '@/lib/api';
import { supabase } from '@/lib/supabase';
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
  buildLocalFramework,
  type KTChild,
  type KTAnswers,
  type KTFramework,
  type KTTranscript,
} from '@/lib/kitchen-table';
import { lightTheme } from '@/theme/colors';
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
import { CountyDropdown } from '@/components/kitchen-table/CountyDropdown';

// Pills read nicer with a capital first letter; we still store the lowercase key.
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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
  // Per-child draft text for the "anything else?" free-text interest box.
  const [interestDraft, setInterestDraft] = useState<Record<number, string>>({});

  const isHomeEdLeaning = HOME_ED_WHY_KEYS.includes(answers.whyKey || '');

  // Add a typed interest to a child, normalised to a lowercase key so it stores
  // and reads back like the preset chips. Dedupes against what is already there.
  const addCustomInterest = (i: number) => {
    const raw = (interestDraft[i] || '').trim().toLowerCase();
    if (!raw) return;
    setChildren((cs) =>
      cs.map((x, j) =>
        j === i && !x.interests.includes(raw) ? { ...x, interests: [...x.interests, raw] } : x,
      ),
    );
    setInterestDraft((d) => ({ ...d, [i]: '' }));
  };

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
      const withAges: Child[] = (data.children || []).map((c) => {
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

    // 1. Bootstrap the family + children. This is the ONLY call that may block:
    // if it fails, nothing was created, the family is not onboarded, and the
    // user safely stays here to retry. A 200 means they are genuinely set up.
    //
    // Make sure we hold a LIVE token first. getSession() returns the in-memory
    // session, but if it is stale (e.g. the account was removed server-side) the
    // bootstrap 401s. We refresh, and on a hard auth failure we sign out so the
    // router lands the user on a clean signup instead of trapping them here.
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData.session?.access_token;
      if (token) {
        // Proactively refresh so a borderline-expired token never 401s mid-setup.
        const { data: refreshed } = await supabase.auth.refreshSession();
        token = refreshed.session?.access_token ?? token;
      }
      if (!token) {
        await supabase.auth.signOut();
        setError('Your session expired. Please sign in again to finish setting up.');
        setThinking(false);
        return;
      }

      await apiRootPost('/onboarding', answersToOnboardingPayload(full, familyName));
    } catch (e) {
      console.error('[kitchen-table] bootstrap failed:', e);
      const status = e instanceof ApiError ? e.status : undefined;
      if (status === 401 || status === 403) {
        // Dead session: the token is structurally valid but the user no longer
        // exists / is not authorised. Escape the trap with a fresh sign-in.
        await supabase.auth.signOut();
        setError('Your session is no longer valid. Please sign in again to finish setting up.');
      } else {
        const detail = e instanceof Error ? e.message : String(e);
        setError(`We could not reach The Hedge (${status ?? 'no response'}: ${detail}). Tap to try again.`);
      }
      setThinking(false);
      return;
    }

    // 2. Author the Family Framework. The server has its own warm fallback, but
    // a fresh family must never be stranded by a slow function or a network
    // blip, so if the server call fails for ANY reason we build the same warm
    // framework on-device from the answers we already hold. This step cannot
    // fail the flow.
    let fw: KTFramework;
    try {
      fw = (await postKitchenTable(full, exchanges as KTTranscript)).framework;
    } catch (e) {
      console.warn('[kitchen-table] framework server call failed, using local fallback:', e);
      fw = buildLocalFramework(full);
    }

    // 3. Reveal the framework. We deliberately do NOT refresh the auth store
    // here: doing so flips onboarding_completed in the store and the root
    // navigator would immediately replace this screen with the tabs, skipping
    // the welcome entirely. The store is refreshed only when the parent taps
    // through from the reveal (see the CTA below).
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFramework(fw);
    setThinking(false);
  }

  // ── Framework reveal ──────────────────────────────────────────────────────
  if (framework) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.frameworkScroll}
          showsVerticalScrollIndicator={false}
        >
          <FrameworkView framework={framework} theme={lightTheme} />
          <Text style={styles.frameworkFooter}>
            This is yours. You can shape any of it from your profile whenever you like.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryCta}
            onPress={async () => {
              // Now sync the store (onboarding is complete) and enter the app.
              await refreshAuth();
              router.replace('/(tabs)');
            }}
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
        <StatusBar style="dark" />
        <ActivityIndicator color={lightTheme.accent} size="large" />
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
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* One question at a time with a calm progress bar - no growing
              transcript pushing the question and button off-screen. */}
          {step >= 1 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (step / (isHomeEdLeaning ? 7 : 6)) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.min(step, isHomeEdLeaning ? 7 : 6)} of {isHomeEdLeaning ? 7 : 6}
              </Text>
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
                <Leaf size={28} color={lightTheme.accent} strokeWidth={1.5} />
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
                      placeholderTextColor={lightTheme.textMuted}
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
                      placeholderTextColor={lightTheme.textMuted}
                      keyboardType="number-pad"
                      style={[styles.field, styles.fieldAge]}
                    />
                    {children.length > 1 && (
                      <TouchableOpacity
                        onPress={() => setChildren((cs) => cs.filter((_, j) => j !== i))}
                        style={styles.removeBtn}
                      >
                        <X size={18} color={lightTheme.textMuted} />
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
                            {cap(opt)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {c.interests
                      .filter((t) => !INTEREST_OPTIONS.includes(t as (typeof INTEREST_OPTIONS)[number]))
                      .map((t) => (
                        <TouchableOpacity
                          key={t}
                          activeOpacity={0.85}
                          onPress={() =>
                            setChildren((cs) =>
                              cs.map((x, j) =>
                                j === i ? { ...x, interests: x.interests.filter((v) => v !== t) } : x,
                              ),
                            )
                          }
                          style={[styles.interest, styles.interestOn]}
                        >
                          <Text style={[styles.interestText, styles.interestTextOn]}>
                            {cap(t)}  ×
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>

                  <View style={styles.interestAddRow}>
                    <TextInput
                      value={interestDraft[i] || ''}
                      onChangeText={(t) => setInterestDraft((d) => ({ ...d, [i]: t }))}
                      onSubmitEditing={() => addCustomInterest(i)}
                      returnKeyType="done"
                      placeholder="Anything else they're mad about?"
                      placeholderTextColor={lightTheme.textMuted}
                      style={[styles.field, styles.interestInput]}
                    />
                    {(interestDraft[i] || '').trim().length > 0 && (
                      <TouchableOpacity
                        onPress={() => addCustomInterest(i)}
                        style={styles.interestAddBtn}
                        activeOpacity={0.85}
                      >
                        <Plus size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addChild}
                onPress={() =>
                  setChildren((cs) => [...cs, { name: '', age: null, interests: [] }])
                }
              >
                <Plus size={16} color={lightTheme.accent} />
                <Text style={styles.addChildText}>Add another</Text>
              </TouchableOpacity>

              <PrimaryButton
                label="That's our crew"
                // Every child needs a name AND an age before we move on.
                disabled={
                  children.filter((c) => c.name.trim()).length === 0 ||
                  children.some((c) => c.name.trim() && c.age == null)
                }
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
              <Text style={styles.question}>Last bit, where are you?</Text>

              <Text style={styles.fieldLabel}>Your county</Text>
              <CountyDropdown
                value={answers.county}
                onChange={(c) => setAnswers((a) => ({ ...a, county: c }))}
              />

              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                Any outdoor space?
              </Text>
              <View style={styles.outdoorWrap}>
                {OUTDOOR_CHIPS.map((c) => {
                  const on = answers.outdoor === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      activeOpacity={0.85}
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
                // Both county and outdoor space must be chosen before continuing.
                disabled={!answers.county || !answers.outdoor}
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
  container: { flex: 1, backgroundColor: lightTheme.background },
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

  progressWrap: {
    marginBottom: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightTheme.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: lightTheme.accent,
  },
  progressText: {
    ...typography.bodySmall,
    color: lightTheme.textMuted,
    fontWeight: '600',
  },

  leafCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.accentLight,
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
    color: lightTheme.text,
  },
  lede: {
    ...typography.bodyLarge,
    color: lightTheme.textSecondary,
    marginTop: spacing.md,
  },

  question: {
    ...typography.onboardingTitle,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    marginBottom: spacing.lg,
  },

  childCard: {
    backgroundColor: lightTheme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  field: {
    ...typography.body,
    color: lightTheme.text,
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightTheme.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  fieldName: { flex: 1 },
  fieldAge: { width: 64, textAlign: 'center' },
  fieldFull: { marginTop: spacing.xs },
  fieldLabel: {
    ...typography.uiBold,
    color: lightTheme.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  fieldLabelSpaced: { marginTop: spacing['2xl'] },
  removeBtn: { padding: spacing.sm },

  interestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interest: {
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  interestOn: { backgroundColor: lightTheme.accent },
  interestText: { ...typography.uiSmall, color: lightTheme.textSecondary },
  interestTextOn: { color: '#FFFFFF', fontWeight: '600' },
  interestAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  interestInput: { flex: 1 },
  interestAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: lightTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addChildText: { ...typography.uiBold, color: lightTheme.accent },

  outdoorWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  outdoor: {
    backgroundColor: lightTheme.surface,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  outdoorOn: { backgroundColor: lightTheme.accentLight, borderColor: lightTheme.accent },
  outdoorText: { ...typography.bodySmall, color: lightTheme.textSecondary },
  outdoorTextOn: { color: lightTheme.text, fontWeight: '600' },

  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: spacing['2xl'],
  },
  ctaDisabled: { opacity: 0.4 },
  primaryCtaText: { ...typography.button, color: '#FFFFFF' },

  thinkingTitle: {
    ...typography.h3,
    color: lightTheme.text,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  thinkingSub: {
    ...typography.bodySmall,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },

  frameworkFooter: {
    ...typography.bodySmall,
    color: lightTheme.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  errorBox: {
    backgroundColor: `${lightTheme.error}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${lightTheme.error}30`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { ...typography.bodySmall, color: lightTheme.error },
});
