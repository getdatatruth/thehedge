import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Clock, ChevronRight } from 'lucide-react-native';
import { useApiQuery } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface FavouriteActivity {
  id: string;
  title: string;
  slug: string;
  category: string;
  duration_minutes: number;
  description: string;
}

export default function FavouritesScreen() {
  const router = useRouter();
  const { data: favourites, isLoading } = useApiQuery<FavouriteActivity[]>(
    ['favourites'],
    '/favourites'
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Favourites</Text>
      </View>

      <FlatList
        data={favourites || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/browse/${item.slug}` as any)}
          >
            <Card variant="interactive" padding="lg">
              <View style={styles.row}>
                <View style={styles.info}>
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
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Heart size={32} color={`${colors.clay}40`} />
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyBody}>
              Tap the heart icon on any activity to save it here.
            </Text>
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1, gap: 6 },
  activityTitle: { fontSize: 15, fontWeight: '500', color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.clay },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '300', color: colors.ink },
  emptyBody: { fontSize: 14, color: colors.clay, textAlign: 'center', maxWidth: 260 },
});
