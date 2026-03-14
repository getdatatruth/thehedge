import React, { useState, useRef } from 'react';
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
import BottomSheet from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiPost, useApiDelete } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { LogActivityModal } from '@/components/shared/LogActivityModal';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface MaterialItem {
  name: string;
  household_common: boolean;
}

interface ActivityDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[]; variations?: string[]; tips?: string[] } | null;
  category: string;
  duration_minutes: number;
  location: string;
  age_min: number | null;
  age_max: number | null;
  materials: MaterialItem[];
  learning_outcomes: string[];
  energy_level: string;
  mess_level: string;
  screen_free: boolean;
  premium: boolean;
}

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [checkedMaterials, setCheckedMaterials] = useState<Set<number>>(
    new Set()
  );
  const [logged, setLogged] = useState(false);

  const { data: activity, isLoading } = useApiQuery<ActivityDetail>(
    ['activity', slug],
    `/activities/${slug}`
  );

  // Favourites
  const { data: favIds } = useApiQuery<{ activity_ids: string[] }>(
    ['favourites-ids'],
    '/favourites'
  );
  const isFavourited = favIds?.activity_ids?.includes(activity?.id || '') || false;

  const addFav = useApiPost('/favourites', {
    onSuccess: () => {
      hapticSuccess();
      queryClient.invalidateQueries({ queryKey: ['favourites-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const removeFav = useApiDelete<unknown, { activity_id: string }>('/favourites', {
    onSuccess: () => {
      hapticLight();
      queryClient.invalidateQueries({ queryKey: ['favourites-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const handleFavourite = () => {
    if (!activity) return;
    if (isFavourited) {
      removeFav.mutate({ activity_id: activity.id });
    } else {
      addFav.mutate({ activity_id: activity.id });
    }
  };

  const toggleMaterial = (index: number) => {
    hapticLight();
    const next = new Set(checkedMaterials);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedMaterials(next);
  };

  const handleLog = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  if (isLoading || !activity) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartBtn} onPress={handleFavourite}>
          <Heart
            size={20}
            color={isFavourited ? colors.terracotta : colors.clay}
            fill={isFavourited ? colors.terracotta : 'transparent'}
          />
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
            {(activity.age_min || activity.age_max) && (
              <View style={styles.metaItem}>
                <Users size={14} color={colors.clay} />
                <Text style={styles.metaText}>
                  {activity.age_min || '?'}-{activity.age_max || '?'} yrs
                </Text>
              </View>
            )}
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
                    {typeof material === 'string' ? material : material.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* Steps */}
        {(activity.instructions?.steps?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to do it</Text>
            {activity.instructions!.steps.map((step, i) => (
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
        {(activity.instructions?.variations?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Try it differently</Text>
            {activity.instructions!.variations!.map((variation, i) => (
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
          icon={<Check size={18} color={colors.parchment} />}
        >
          {logged ? 'Logged!' : 'Log this activity'}
        </Button>
      </View>

      {/* Log Activity Bottom Sheet */}
      <LogActivityModal
        activityId={activity.id}
        activityTitle={activity.title}
        bottomSheetRef={bottomSheetRef}
        onLogged={() => setLogged(true)}
      />
    </SafeAreaView>
  );
}

// Need Button import
import { Button } from '@/components/ui/Button';

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
