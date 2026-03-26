import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { darkTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    }
    // Auth state change will redirect to onboarding
    setLoading(false);
  };

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Leaf size={28} color={darkTheme.accent} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Sign up to The Hedge</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="First name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              variant="dark"
            />

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
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              variant="dark"
            />

            <Text style={styles.terms}>
              By signing up, you agree to our Terms and Conditions. View our Privacy Policy.
            </Text>

            <TouchableOpacity
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={!canSubmit || loading}
              style={[
                styles.ctaButton,
                (!canSubmit || loading) && styles.ctaDisabled,
              ]}
            >
              <Text style={styles.ctaText}>
                {loading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social sign-in */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('Coming Soon', 'Apple sign-in will be available shortly.')}
          >
            <Text style={styles.socialText}>Sign up with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { marginTop: spacing.md }]}
            onPress={() => Alert.alert('Coming Soon', 'Google sign-in will be available shortly.')}
          >
            <Text style={styles.socialText}>Sign up with Google</Text>
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkTheme.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing['3xl'],
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.onboardingTitle,
    color: darkTheme.text,
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
  terms: {
    ...typography.uiSmall,
    color: darkTheme.textMuted,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: darkTheme.surfaceElevated,
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
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
  socialButton: {
    borderWidth: 1.5,
    borderColor: darkTheme.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: darkTheme.surface,
  },
  socialText: {
    ...typography.button,
    color: darkTheme.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['3xl'],
  },
  footerText: { ...typography.body, color: darkTheme.textSecondary },
  footerLink: { ...typography.uiBold, color: darkTheme.accent },
});
