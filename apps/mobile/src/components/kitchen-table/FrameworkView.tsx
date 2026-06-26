import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import type { KTFramework } from '@/lib/kitchen-table';
import type { Theme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

// The one-page Family Framework, read back warmly. Theme-agnostic so it can be
// shown on the dark onboarding reveal and again later in the light profile area.
export function FrameworkView({
  framework,
  theme,
}: {
  framework: KTFramework;
  theme: Theme;
}) {
  const s = makeStyles(theme);
  return (
    <View>
      <View style={s.header}>
        <View style={s.leafCircle}>
          <Leaf size={26} color={theme.accent} strokeWidth={1.5} />
        </View>
        <Text style={s.title}>Your Family Framework</Text>
        <Text style={s.opening}>{framework.opening}</Text>
      </View>

      <Section theme={theme} title="What you told me">
        <Text style={s.body}>{framework.whatYouToldMe}</Text>
      </Section>

      <Section theme={theme} title="How The Hedge will work for you">
        {framework.commitments.map((c, i) => (
          <View key={i} style={s.bulletRow}>
            <Leaf size={15} color={theme.accent} strokeWidth={1.8} style={s.bulletIcon} />
            <Text style={[s.body, s.bulletText]}>{c}</Text>
          </View>
        ))}
      </Section>

      <Section theme={theme} title="The quiet floor">
        <Text style={s.body}>{framework.quietFloor}</Text>
      </Section>

      <Section theme={theme} title="For your worry">
        <Text style={s.body}>{framework.forYourWorry}</Text>
      </Section>

      <Section theme={theme} title="Three things you can do today">
        {framework.thingsToday.map((t, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={s.numeral}>{i + 1}</Text>
            <Text style={[s.body, s.bulletText]}>{t}</Text>
          </View>
        ))}
      </Section>
    </View>
  );
}

function Section({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: Theme;
}) {
  const s = makeStyles(theme);
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    leafCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.onboardingTitle,
      color: theme.text,
      textAlign: 'center',
    },
    opening: {
      ...typography.body,
      color: theme.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: spacing.sm,
      maxWidth: 320,
    },
    section: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: spacing.xl,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.caption,
      color: theme.accent,
      marginBottom: spacing.md,
    },
    body: {
      ...typography.body,
      color: theme.text,
      lineHeight: 23,
    },
    bulletRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    bulletIcon: {
      marginTop: 3,
    },
    bulletText: {
      flex: 1,
    },
    numeral: {
      ...typography.uiBold,
      color: theme.accent,
      width: 16,
      textAlign: 'center',
    },
  });
}
