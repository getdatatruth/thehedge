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
import { ArrowLeft, Mail } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
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
          <ArrowLeft size={20} color={colors.clay} />
          <Text style={styles.backText}>Back to sign in</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            <View style={styles.sentContainer}>
              <View style={styles.sentIcon}>
                <Mail size={32} color={colors.moss} />
              </View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to {email}
              </Text>
              <Button
                variant="secondary"
                onPress={() => router.back()}
                style={{ marginTop: spacing['3xl'] }}
              >
                Back to sign in
              </Button>
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
              />

              <Button
                onPress={handleReset}
                loading={loading}
                disabled={!email.trim()}
                fullWidth
                size="lg"
              >
                Send reset link
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  flex: { flex: 1 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.lg,
  },
  backText: { fontSize: 13, color: colors.clay },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.clay,
    marginBottom: spacing['3xl'],
    lineHeight: 22,
  },
  form: { gap: spacing.lg },
  errorBox: {
    backgroundColor: `${colors.terracotta}10`,
    borderWidth: 1,
    borderColor: `${colors.terracotta}20`,
    borderRadius: 4,
    padding: spacing.md,
  },
  errorText: { fontSize: 13, color: colors.terracotta },
  sentContainer: { alignItems: 'center' },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.moss}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
