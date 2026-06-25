import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';
import { lightTheme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface TierGateProps {
  requiredTier: 'family' | 'educator';
  children: React.ReactNode;
  featureName?: string;
}

const TIER_RANK = { free: 0, family: 1, educator: 2 } as const;

export function TierGate({ requiredTier, children, featureName }: TierGateProps) {
  const router = useRouter();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());

  if (TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Crown size={28} color={lightTheme.warning} />
      </View>
      <Text style={styles.title}>
        {featureName || 'This part of the hedge'} opens with the {requiredTier} plan
      </Text>
      <Text style={styles.body}>
        It's here whenever you're ready. Have a look at the plans and see what
        suits your family.
      </Text>
      <Button
        variant="primary"
        size="md"
        onPress={() => router.push('/(stack)/settings/billing' as any)}
      >
        Have a look at the plans
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${lightTheme.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '300',
    color: lightTheme.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
