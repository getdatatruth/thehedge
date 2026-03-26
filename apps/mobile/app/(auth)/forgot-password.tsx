import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: 'thehedge://auth/reset-password' }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={darkTheme.text} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            <View style={styles.sentContainer}>
              <View style={styles.sentIcon}>
                <Mail size={32} color={darkTheme.accent} />
              </View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to {email}
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Back to sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a reset link.
              </Text>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                variant="dark"
              />

              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.8}
                disabled={!email.trim() || loading}
                style={[
                  styles.ctaButton,
                  (!email.trim() || loading) && styles.ctaDisabled,
                ]}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkTheme.background },
  flex: { flex: 1 },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  title: {
    ...typography.onboardingTitle,
    color: darkTheme.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: darkTheme.textSecondary,
    marginBottom: spacing['3xl'],
    lineHeight: 22,
  },
  form: { gap: spacing.lg },
  errorBox: {
    backgroundColor: `${darkTheme.error}15`,
    borderWidth: 1,
    borderColor: `${darkTheme.error}30`,
    borderRadius: 12,
    padding: spacing.md,
  },
  errorText: { fontSize: 13, color: darkTheme.error },
  ctaButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaDisabled: {
    backgroundColor: darkTheme.surfaceElevated,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  sentContainer: { alignItems: 'center' },
  sentIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: darkTheme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
