import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Leaf, CheckCircle } from 'lucide-react-native';
import { apiRootPost, apiGet } from '@/lib/api';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAuthStore, type UserProfile, type Family, type Child } from '@/stores/auth-store';

export default function CompleteScreen() {
  const router = useRouter();
  const getApiPayload = useOnboardingStore((s) => s.getApiPayload);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const familyName = useOnboardingStore((s) => s.familyName);
  const { setProfile, setFamily, setChildren } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiRootPost('/onboarding', getApiPayload());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);

      // Refresh auth store with the newly created profile/family/children
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
          onboarding_completed: (data.family as any).onboarding_completed ?? true,
        });
        setFamily(data.family);
        const childrenWithAges: Child[] = data.children.map((c) => {
          const dob = new Date(c.date_of_birth);
          const age = Math.floor(
            (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          );
          return { ...c, age };
        });
        setChildren(childrenWithAges);
      } catch {
        // Non-critical - the routing will still work
      }

      // Reset onboarding store
      resetOnboarding();

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 800);
    } catch (err) {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {submitted ? (
            <CheckCircle size={56} color={darkTheme.accent} strokeWidth={1.5} />
          ) : (
            <Sparkles size={56} color={darkTheme.accent} strokeWidth={1.5} />
          )}
        </Animated.View>

        <Text style={styles.title}>
          {submitted
            ? 'Welcome aboard!'
            : `You're all set, ${familyName || 'family'}!`}
        </Text>

        <Text style={styles.subtitle}>
          {submitted
            ? 'Your personalised activities are ready.'
            : 'We have everything we need to create your personalised learning experience.'}
        </Text>

        {error && (
          <Text style={{ color: darkTheme.error, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            {error}
          </Text>
        )}

        {!submitted && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Leaf size={16} color={darkTheme.accent} />
              <Text style={styles.summaryText}>
                Personalised activity suggestions
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Leaf size={16} color={darkTheme.accent} />
              <Text style={styles.summaryText}>
                Weekly learning plan
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Leaf size={16} color={darkTheme.accent} />
              <Text style={styles.summaryText}>
                Progress tracking for each child
              </Text>
            </View>
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomArea}>
        {!submitted && (
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.8}
            disabled={loading}
            style={[styles.ctaButton, loading && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {loading ? 'Setting up...' : "Let's go!"}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: darkTheme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.onboardingTitle,
    color: darkTheme.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: darkTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  summaryCard: {
    backgroundColor: darkTheme.surface,
    borderRadius: 14,
    padding: spacing.xl,
    marginTop: spacing['2xl'],
    width: '100%',
    gap: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryText: {
    ...typography.body,
    color: darkTheme.text,
  },
  bottomArea: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  ctaButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
