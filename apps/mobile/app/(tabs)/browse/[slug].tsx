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
  Lightbulb,
  BookOpen,
  Zap,
  Droplets,
  MessageCircle,
  Eye,
  GraduationCap,
  Layers,
} from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SimpleBottomSheetRef } from '@/components/ui/SimpleBottomSheet';
import { useApiQuery, useApiPost, useApiDelete } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
  parent_guide: {
    knowledge: { topic: string; content: string }[];
    conversation_starters: string[];
    watch_for: string[];
  } | null;
  curriculum_tags: {
    outcome_codes: string[];
    aistear_themes: string[];
    ncca_areas: string[];
    educator_quality: string;
    quality_notes: string;
  } | null;
}

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<SimpleBottomSheetRef>(null);
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
    bottomSheetRef.current?.expand();
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

        {/* Curriculum Links */}
        {activity.curriculum_tags && (activity.curriculum_tags.aistear_themes?.length > 0 || activity.curriculum_tags.ncca_areas?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Curriculum links</Text>
            <Text style={styles.sectionSubtitle}>
              How this activity maps to the Irish curriculum
            </Text>

            {activity.curriculum_tags.aistear_themes?.length > 0 && (
              <View style={styles.curriculumGroup}>
                <View style={styles.curriculumLabelRow}>
                  <View style={[styles.curriculumIcon, { backgroundColor: `${colors.sage}20` }]}>
                    <Layers size={12} color={colors.sage} />
                  </View>
                  <Text style={styles.curriculumLabel}>Aistear</Text>
                </View>
                <View style={styles.tagRow}>
                  {activity.curriculum_tags.aistear_themes.map((theme, i) => (
                    <View key={i} style={[styles.tag, styles.tagAistear]}>
                      <Text style={styles.tagTextAistear}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activity.curriculum_tags.ncca_areas?.length > 0 && (
              <View style={styles.curriculumGroup}>
                <View style={styles.curriculumLabelRow}>
                  <View style={[styles.curriculumIcon, { backgroundColor: `${colors.forest}12` }]}>
                    <GraduationCap size={12} color={colors.forest} />
                  </View>
                  <Text style={styles.curriculumLabel}>Primary Curriculum</Text>
                </View>
                <View style={styles.tagRow}>
                  {activity.curriculum_tags.ncca_areas.map((area, i) => (
                    <View key={i} style={[styles.tag, styles.tagNcca]}>
                      <Text style={styles.tagTextNcca}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activity.curriculum_tags.outcome_codes?.length > 0 && (
              <Text style={styles.outcomeCodeText}>
                {activity.curriculum_tags.outcome_codes.length} curriculum outcomes covered
              </Text>
            )}
          </View>
        )}

        {/* Parent Guide - AI-generated teaching content */}
        {activity.parent_guide ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent guide</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to know to teach this activity confidently
            </Text>

            {/* Knowledge topics */}
            {activity.parent_guide.knowledge.map((item, i) => (
              <Card key={i} variant="elevated" padding="lg">
                <View style={styles.knowledgeHeader}>
                  <View style={styles.tipIcon}>
                    <BookOpen size={14} color={colors.forest} />
                  </View>
                  <Text style={styles.knowledgeTopic}>{item.topic}</Text>
                </View>
                <Text style={styles.knowledgeContent}>{item.content}</Text>
              </Card>
            ))}

            {/* Conversation starters */}
            {activity.parent_guide.conversation_starters.length > 0 && (
              <Card variant="elevated" padding="lg">
                <View style={styles.knowledgeHeader}>
                  <View style={[styles.tipIcon, { backgroundColor: `${colors.moss}12` }]}>
                    <MessageCircle size={14} color={colors.moss} />
                  </View>
                  <Text style={styles.knowledgeTopic}>Questions to ask</Text>
                </View>
                {activity.parent_guide.conversation_starters.map((q, i) => (
                  <View key={i} style={styles.starterRow}>
                    <Text style={styles.starterBullet}>"</Text>
                    <Text style={styles.starterText}>{q}</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Watch for */}
            {activity.parent_guide.watch_for.length > 0 && (
              <Card variant="elevated" padding="lg">
                <View style={styles.knowledgeHeader}>
                  <View style={[styles.tipIcon, { backgroundColor: `${colors.sage}20` }]}>
                    <Eye size={14} color={colors.sage} />
                  </View>
                  <Text style={styles.knowledgeTopic}>Signs of learning</Text>
                </View>
                {activity.parent_guide.watch_for.map((item, i) => (
                  <View key={i} style={styles.watchRow}>
                    <Sparkles size={12} color={colors.sage} />
                    <Text style={styles.watchText}>{item}</Text>
                  </View>
                ))}
              </Card>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent tips</Text>
            <Card variant="elevated" padding="lg">
              <View style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Lightbulb size={14} color={colors.amber} />
                </View>
                <Text style={styles.tipText}>
                  Let your child lead the pace. If they want to spend longer on one step,
                  that's great - curiosity-driven learning sticks better than rushing through.
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Lightbulb size={14} color={colors.amber} />
                </View>
                <Text style={styles.tipText}>
                  Ask open-ended questions like "What do you notice?" or "Why do you think
                  that happens?" to deepen their understanding.
                </Text>
              </View>
              <View style={[styles.tipRow, { borderBottomWidth: 0 }]}>
                <View style={styles.tipIcon}>
                  <Lightbulb size={14} color={colors.amber} />
                </View>
                <Text style={styles.tipText}>
                  Don't worry about getting it perfect. The goal is engagement and
                  exploration, not a polished result.
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Activity Info Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Good to know</Text>
          <View style={styles.infoBadgesRow}>
            {activity.energy_level && (
              <View style={styles.infoBadge}>
                <View style={[styles.infoBadgeIcon, { backgroundColor: `${colors.terracotta}12` }]}>
                  <Zap size={14} color={colors.terracotta} />
                </View>
                <View>
                  <Text style={styles.infoBadgeLabel}>Energy</Text>
                  <Text style={styles.infoBadgeValue}>{activity.energy_level}</Text>
                </View>
              </View>
            )}
            {activity.mess_level && (
              <View style={styles.infoBadge}>
                <View style={[styles.infoBadgeIcon, { backgroundColor: `${colors.moss}12` }]}>
                  <Droplets size={14} color={colors.moss} />
                </View>
                <View>
                  <Text style={styles.infoBadgeLabel}>Mess</Text>
                  <Text style={styles.infoBadgeValue}>{activity.mess_level}</Text>
                </View>
              </View>
            )}
            {activity.screen_free && (
              <View style={styles.infoBadge}>
                <View style={[styles.infoBadgeIcon, { backgroundColor: `${colors.forest}12` }]}>
                  <BookOpen size={14} color={colors.forest} />
                </View>
                <View>
                  <Text style={styles.infoBadgeLabel}>Screen</Text>
                  <Text style={styles.infoBadgeValue}>Screen-free</Text>
                </View>
              </View>
            )}
          </View>
        </View>

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
  sectionSubtitle: {
    fontSize: 13,
    color: `${colors.clay}80`,
    marginTop: -spacing.sm,
    lineHeight: 18,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  knowledgeTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  knowledgeContent: {
    fontSize: 14,
    color: colors.clay,
    lineHeight: 21,
    paddingLeft: 36,
  },
  starterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 36,
    paddingVertical: 4,
    gap: 2,
  },
  starterBullet: {
    fontSize: 18,
    color: colors.moss,
    fontWeight: '600',
    lineHeight: 20,
  },
  starterText: {
    flex: 1,
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: 36,
    paddingVertical: 4,
  },
  watchText: {
    flex: 1,
    fontSize: 13,
    color: colors.clay,
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.stone}30`,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.amber}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
  },
  infoBadgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: `${colors.clay}80`,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBadgeValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  curriculumGroup: {
    gap: spacing.sm,
  },
  curriculumLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  curriculumIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 28,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagAistear: {
    backgroundColor: `${colors.sage}18`,
    borderWidth: 1,
    borderColor: `${colors.sage}30`,
  },
  tagTextAistear: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.moss,
  },
  tagNcca: {
    backgroundColor: `${colors.forest}10`,
    borderWidth: 1,
    borderColor: `${colors.forest}20`,
  },
  tagTextNcca: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.forest,
  },
  outcomeCodeText: {
    fontSize: 12,
    color: `${colors.clay}90`,
    paddingLeft: 28,
    marginTop: 2,
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
