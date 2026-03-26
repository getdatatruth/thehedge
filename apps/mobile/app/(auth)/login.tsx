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
import { Leaf } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : signInError.message
      );
    }
    setLoading(false);
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Leaf size={36} color={darkTheme.accent} strokeWidth={1.5} />
            </View>
            <Text style={styles.logoText}>The Hedge</Text>
            <Text style={styles.tagline}>
              Your family's next adventure starts here
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              autoCorrect={false}
              textContentType="emailAddress"
              variant="dark"
            />

            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              variant="dark"
            />

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={!canSubmit || loading}
              style={[
                styles.signInButton,
                (!canSubmit || loading) && styles.signInDisabled,
              ]}
            >
              <Text style={styles.signInText}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpText}>Create an account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: darkTheme.accent,
  },
  logoText: {
    fontFamily: 'CormorantGaramond-Light',
    fontSize: 32,
    color: darkTheme.text,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    color: darkTheme.textSecondary,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  errorBox: {
    backgroundColor: `${darkTheme.error}15`,
    borderWidth: 1,
    borderColor: `${darkTheme.error}30`,
    borderRadius: 12,
    padding: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: darkTheme.error,
  },
  signInButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signInDisabled: {
    backgroundColor: darkTheme.surfaceElevated,
  },
  signInText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  linkButton: {
    alignSelf: 'center',
    padding: spacing.sm,
  },
  linkText: {
    ...typography.uiSmall,
    color: darkTheme.accent,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkTheme.border,
  },
  dividerText: {
    ...typography.uiSmall,
    color: darkTheme.textMuted,
    marginHorizontal: spacing.lg,
  },
  signUpButton: {
    borderWidth: 1.5,
    borderColor: darkTheme.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpText: {
    ...typography.button,
    color: darkTheme.text,
  },
});
