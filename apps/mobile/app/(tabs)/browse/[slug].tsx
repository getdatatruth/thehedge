import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Heart,
  Check,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApiQuery, useApiPost } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface ActivityDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  duration_minutes: number;
  location: string;
  age_range: string;
  materials: string[];
  steps: string[];
  learning_outcomes: string[];
  variations: string[];
  tips: string[];
  is_premium: boolean;
}

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [checkedMaterials, setCheckedMaterials] = useState<Set<number>>(
    new Set()
  );

  const { data: activity, isLoading } = useApiQuery<ActivityDetail>(
    ['activity', slug],
    `/activities/${slug}`
  );

  const logMutation = useApiPost('/activity-logs', {
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleLog = () => {
    if (!activity) return;
    logMutation.mutate({
      activity_id: activity.id,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const toggleMaterial = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = new Set(checkedMaterials);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedMaterials(next);
  };

  if (isLoading || !activity) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartBtn}>
          <Heart size={20} color={colors.clay} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Badge variant="sage">{activity.category}</Badge>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.description}>{activity.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.clay} />
              <Text style={styles.metaText}>
                {activity.duration_minutes} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.clay} />
              <Text style={styles.metaText}>{activity.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={colors.clay} />
              <Text style={styles.metaText}>{activity.age_range}</Text>
            </View>
          </View>
        </View>

        {/* Materials */}
        {activity.materials?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you'll need</Text>
            <Card variant="elevated" padding="lg">
              {activity.materials.map((material, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleMaterial(i)}
                  style={styles.materialRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checkedMaterials.has(i) && styles.checkboxChecked,
                    ]}
                  >
                    {checkedMaterials.has(i) && (
                      <Check size={12} color={colors.parchment} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.materialText,
                      checkedMaterials.has(i) && styles.materialChecked,
                    ]}
                  >
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* Steps */}
        {activity.steps?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to do it</Text>
            {activity.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Learning Outcomes */}
        {activity.learning_outcomes?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What they'll learn</Text>
            <Card variant="elevated" padding="lg">
              {activity.learning_outcomes.map((outcome, i) => (
                <View key={i} style={styles.outcomeRow}>
                  <Sparkles size={14} color={colors.moss} />
                  <Text style={styles.outcomeText}>{outcome}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Variations */}
        {activity.variations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Try it differently</Text>
            {activity.variations.map((variation, i) => (
              <Card key={i} variant="elevated" padding="md">
                <Text style={styles.variationText}>{variation}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Log Button */}
      <View style={styles.stickyBottom}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleLog}
          loading={logMutation.isPending}
          icon={<Check size={18} color={colors.parchment} />}
        >
          {logMutation.isSuccess ? 'Logged!' : 'Log this activity'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  titleSection: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: colors.clay,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.clay,
    textTransform: 'capitalize',
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.ink,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}40`,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  materialText: {
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  materialChecked: {
    textDecorationLine: 'line-through',
    color: colors.clay,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.forest}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forest,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 6,
  },
  outcomeText: {
    flex: 1,
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
  },
  variationText: {
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.parchment,
    borderTopWidth: 1,
    borderTopColor: colors.stone,
  },
});
