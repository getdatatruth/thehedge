import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Clock, Leaf, Palette, FlaskConical, Calculator, BookOpen, Music, UtensilsCrossed, TreePine, Footprints, Globe, Shapes, FolderOpen } from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

const COLLECTION_ICON_MAP: Record<string, { icon: any; color: string }> = {
  nature: { icon: TreePine, color: colors.sage },
  outdoor: { icon: TreePine, color: colors.sage },
  science: { icon: FlaskConical, color: colors.moss },
  art: { icon: Palette, color: colors.terracotta },
  craft: { icon: Palette, color: colors.terracotta },
  math: { icon: Calculator, color: colors.umber },
  language: { icon: BookOpen, color: colors.forest },
  reading: { icon: BookOpen, color: colors.forest },
  music: { icon: Music, color: colors.clay },
  cook: { icon: UtensilsCrossed, color: colors.terracotta },
  bak: { icon: UtensilsCrossed, color: colors.terracotta },
  physical: { icon: Footprints, color: colors.moss },
  movement: { icon: Footprints, color: colors.moss },
  irish: { icon: Globe, color: colors.forest },
  sensory: { icon: Shapes, color: colors.sage },
  play: { icon: Shapes, color: colors.sage },
};

function getCollectionIcon(title: string) {
  const lower = title.toLowerCase();
  for (const [keyword, config] of Object.entries(COLLECTION_ICON_MAP)) {
    if (lower.includes(keyword)) return config;
  }
  return { icon: Leaf, color: colors.moss };
}

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  activity_count: number;
  activities?: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    duration_minutes: number;
  }>;
}

export default function CollectionsScreen() {
  const router = useRouter();
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const {
    data: collections,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<Collection[]>(['collections'], '/collections');

  if (isLoading) return <LoadingScreen />;

  // If a collection is selected, show its activities
  if (selectedCollection) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedCollection(null)}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {(() => {
              const { icon: Icon, color } = getCollectionIcon(selectedCollection.title);
              return <Icon size={22} color={color} />;
            })()}
            <Text style={styles.title}>{selectedCollection.title}</Text>
          </View>
        </View>

        <FlatList
          data={selectedCollection.activities || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/browse/${item.slug}` as any)}
            >
              <Card variant="interactive" padding="lg">
                <View style={styles.activityRow}>
                  <View style={styles.activityInfo}>
                    <Badge variant="sage" size="sm">{item.category}</Badge>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <View style={styles.meta}>
                      <Clock size={12} color={colors.clay} />
                      <Text style={styles.metaText}>{item.duration_minutes} min</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.stone} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Collections</Text>
      </View>

      <FlatList
        data={collections || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionCard}
            onPress={() => setSelectedCollection(item)}
            activeOpacity={0.8}
          >
            <Card variant="elevated" padding="lg">
              <View style={styles.collectionContent}>
                {(() => {
                  const { icon: Icon, color } = getCollectionIcon(item.title);
                  return (
                    <View style={[styles.iconWrap, { backgroundColor: color + '12' }]}>
                      <Icon size={24} color={color} />
                    </View>
                  );
                })()}
                <Text style={styles.collectionTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.collectionCount}>
                  {item.activity_count} activit{item.activity_count === 1 ? 'y' : 'ies'}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon={<FolderOpen size={32} color={`${colors.clay}40`} />}
            title="No collections yet"
            message="Collections will appear here as they are curated."
          />
        )}
      />
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  gridRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  collectionCard: {
    flex: 1,
    maxWidth: '50%',
  },
  collectionContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
  },
  collectionCount: {
    fontSize: 11,
    color: colors.clay,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityInfo: { flex: 1, gap: 6 },
  activityTitle: { fontSize: 15, fontWeight: '500', color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.clay },
});
