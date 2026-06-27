import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Sprout,
  Sun,
  Sparkles,
  GraduationCap,
  BookHeart,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { markWalkthroughSeen } from '@/lib/walkthrough';

const { width } = Dimensions.get('window');

interface Step {
  Icon: typeof Sprout;
  eyebrow: string;
  title: string;
  body: string;
}

// The core USPs, in the order a parent meets them. Calm, benefit-led, brand voice.
const STEPS: Step[] = [
  {
    Icon: Sprout,
    eyebrow: 'Welcome to The Hedge',
    title: 'Learning that feels like a breath, not a battle',
    body: 'This is a calm home for your family\'s learning, your way. No scores, no streaks, no pressure. Let me show you around in a few taps.',
  },
  {
    Icon: Sun,
    eyebrow: 'Today',
    title: 'One gentle idea a day, shaped around your children',
    body: 'Every day, a lovely thing to do, matched to your children\'s ages and what they love. Never a timetable, never a to-do list. Just a good idea when you want one.',
  },
  {
    Icon: Sparkles,
    eyebrow: 'Follow the spark',
    title: 'Whatever they\'re curious about, we make it count',
    body: 'Mad about volcanoes this morning? Tell me at the table and I\'ll shape a real, screen-free activity around it in seconds. Following your child is the whole point.',
  },
  {
    Icon: GraduationCap,
    eyebrow: 'Quietly underpinned',
    title: 'Tied to Aistear and the curriculum, honestly',
    body: 'Behind every activity sits the real curriculum, Aistear for the early years and the primary curriculum after. So child-led still counts, and I\'ll always be honest about Tusla and AEARS, never inventing rules.',
  },
  {
    Icon: BookHeart,
    eyebrow: 'The record keeps itself',
    title: 'A portfolio that builds as you live',
    body: 'Tap "we did this" and it lands in your child\'s portfolio, already tied to the outcomes it touched. Real evidence for a Tusla review, with no data entry. And I keep a light eye on balance, a gentle nudge if a corner has gone quiet.',
  },
  {
    Icon: ShieldCheck,
    eyebrow: 'Yours, and private',
    title: 'Your family\'s information stays your family\'s',
    body: 'Everything here is private to you, stored in the EU, and never used to train anything or to help any other family. This is your hedge school. Let\'s begin.',
  },
];

export default function WalkthroughScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const last = index === STEPS.length - 1;

  function finish() {
    void markWalkthroughSeen();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, i));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  }

  function next() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (last) finish();
    else goTo(index + 1);
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) {
      setIndex(i);
      Haptics.selectionAsync();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        {!last && (
          <TouchableOpacity onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flex}
      >
        {STEPS.map((step, i) => {
          const Icon = step.Icon;
          return (
            <View key={i} style={[styles.page, { width }]}>
              <View style={styles.iconCircle}>
                <Icon size={44} color={lightTheme.accent} strokeWidth={1.6} />
              </View>
              <Text style={styles.eyebrow}>{step.eyebrow}</Text>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={next} style={styles.cta}>
          <Text style={styles.ctaText}>{last ? 'Start exploring' : 'Next'}</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightTheme.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: lightTheme.border,
  },
  dotActive: { backgroundColor: lightTheme.accent, width: 22 },
  skip: { ...typography.uiBold, color: lightTheme.textMuted },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 30,
    backgroundColor: lightTheme.accentLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  eyebrow: {
    ...typography.uiSmall,
    color: lightTheme.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: lightTheme.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    ...typography.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.accent,
    borderRadius: 16,
    paddingVertical: 17,
  },
  ctaText: { ...typography.button, color: '#FFFFFF' },
});
