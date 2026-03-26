import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, X } from 'lucide-react-native';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { ProgressBar } from './ProgressBar';

interface OnboardingLayoutProps {
  /** Current step index (0-based) */
  step: number;
  /** Total steps */
  totalSteps: number;
  /** Bold headline - keep it short */
  title: string;
  /** Optional subtitle explaining why this info is needed */
  subtitle?: string;
  /** Continue button label */
  continueLabel?: string;
  /** Whether continue is enabled */
  canContinue?: boolean;
  /** Loading state for continue button */
  loading?: boolean;
  /** Called when continue is pressed */
  onContinue: () => void;
  /** Hide the back button (e.g. on first screen) */
  hideBack?: boolean;
  /** Show X close button instead of back */
  showClose?: boolean;
  /** Whether to use ScrollView for content */
  scrollable?: boolean;
  /** Optional skip text below continue */
  skipLabel?: string;
  onSkip?: () => void;
  children: React.ReactNode;
}

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  continueLabel = 'Continue',
  canContinue = true,
  loading = false,
  onContinue,
  hideBack = false,
  showClose = false,
  scrollable = true,
  skipLabel,
  onSkip,
  children,
}: OnboardingLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContinue = () => {
    if (!canContinue || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent, keyboardShouldPersistTaps: 'handled' as const }
    : { style: styles.staticContent };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation row */}
      <View style={styles.navRow}>
        {!hideBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.navButton}>
            <ChevronLeft size={28} color={darkTheme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButton} />
        )}

        {/* Progress bar takes center space */}
        <View style={styles.progressContainer}>
          <ProgressBar current={step} total={totalSteps} />
        </View>

        {showClose ? (
          <TouchableOpacity onPress={handleBack} style={styles.navButton}>
            <X size={24} color={darkTheme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButton} />
        )}
      </View>

      {/* Content area */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        {/* Title + Subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Scrollable content */}
        <ContentWrapper {...contentProps}>
          {children}
        </ContentWrapper>

        {/* Bottom button area */}
        <SafeAreaView edges={['bottom']} style={styles.bottomArea}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!canContinue || loading}
            style={[
              styles.continueButton,
              (!canContinue || loading) && styles.continueDisabled,
            ]}
          >
            <Text
              style={[
                styles.continueText,
                (!canContinue || loading) && styles.continueTextDisabled,
              ]}
            >
              {loading ? 'Loading...' : continueLabel}
            </Text>
          </TouchableOpacity>

          {skipLabel && onSkip && (
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{skipLabel}</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.onboardingTitle,
    color: darkTheme.text,
  },
  subtitle: {
    ...typography.body,
    color: darkTheme.textSecondary,
    marginTop: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
  },
  bottomArea: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  continueButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: {
    backgroundColor: darkTheme.surfaceElevated,
  },
  continueText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  continueTextDisabled: {
    color: darkTheme.textMuted,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...typography.uiBold,
    color: darkTheme.textSecondary,
  },
});
