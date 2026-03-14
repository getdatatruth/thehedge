import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowLeft,
  Crown,
  Check,
  Sparkles,
  BookOpen,
  CalendarDays,
  Heart,
  Star,
  GraduationCap,
  FileText,
  Zap,
  Smartphone,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { apiPost } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'forever',
    features: ['5 AI suggestions/week', 'Limited activity library', 'Basic timeline'],
  },
  {
    id: 'family',
    name: 'Family',
    price: '6.99',
    period: '/month',
    features: [
      'Unlimited AI suggestions',
      'Full activity library',
      'Weekly planner',
      'Favourites & collections',
      'iOS & Android app',
    ],
    popular: true,
  },
  {
    id: 'educator',
    name: 'Educator',
    price: '14.99',
    period: '/month',
    features: [
      'Everything in Family',
      'Educator suite',
      'Tusla compliance',
      'Portfolio & PDF reports',
      'Curriculum tracking',
    ],
  },
];

export default function BillingScreen() {
  const router = useRouter();
  const { family } = useAuthStore();
  const effectiveTier = useAuthStore((s) => s.effectiveTier());
  const trialDaysLeft = useAuthStore((s) => s.trialDaysLeft());

  const handleUpgrade = async (plan: string) => {
    try {
      const { data } = await apiPost<{ url: string }>('/../../stripe/checkout', {
        plan,
        interval: 'monthly',
      });
      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (e) {
      // Handle error
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data } = await apiPost<{ url: string }>('/../../stripe/portal', {});
      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch {
      // Handle error
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Billing</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Current plan */}
        <Card variant="elevated" padding="xl">
          <View style={styles.currentPlan}>
            <Crown size={24} color={colors.amber} />
            <Text style={styles.currentPlanName}>
              {effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)}{' '}
              Plan
            </Text>
            <Badge
              variant={
                family?.subscription_status === 'active'
                  ? 'sage'
                  : family?.subscription_status === 'trialing'
                  ? 'sage'
                  : 'terra'
              }
            >
              {family?.subscription_status === 'trialing'
                ? `Trial - ${trialDaysLeft}d left`
                : family?.subscription_status || 'free'}
            </Badge>
          </View>
          {family?.stripe_customer_id && (
            <Button
              variant="secondary"
              size="sm"
              onPress={handleManageBilling}
              style={{ marginTop: spacing.lg }}
            >
              Manage billing
            </Button>
          )}
        </Card>

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const isCurrent = plan.id === effectiveTier;
          return (
            <Card
              key={plan.id}
              variant="elevated"
              padding="xl"
            >
              {plan.popular && !isCurrent && (
                <Badge variant="moss" size="sm">
                  Most popular
                </Badge>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{'\u20AC'}{plan.price}</Text>
                <Text style={styles.pricePeriod}>{plan.period}</Text>
              </View>
              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Check size={14} color={colors.moss} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              {isCurrent ? (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current plan</Text>
                </View>
              ) : plan.id !== 'free' ? (
                <Button
                  variant="primary"
                  onPress={() => handleUpgrade(plan.id)}
                  fullWidth
                >
                  Upgrade to {plan.name}
                </Button>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '300', color: colors.ink },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  currentPlan: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.ink,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: spacing.lg,
  },
  price: { fontSize: 28, fontWeight: '300', color: colors.ink },
  pricePeriod: { fontSize: 14, color: colors.clay },
  featureList: { gap: spacing.sm, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { fontSize: 14, color: colors.clay },
  currentBadge: {
    backgroundColor: `${colors.stone}30`,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  currentBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: `${colors.clay}80`,
  },
});
