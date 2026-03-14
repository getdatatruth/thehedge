import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  Image,
  Calendar,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiPost } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface PortfolioEntry {
  id: string;
  child_id: string;
  title: string;
  description: string;
  date: string;
  curriculum_areas: string[];
  photo_count: number;
}

interface PortfolioData {
  entries: PortfolioEntry[];
}

interface CreateEntryBody {
  child_id: string;
  title: string;
  description: string;
  date: string;
  curriculum_areas: string[];
}

const CURRICULUM_AREAS = [
  'Well-being',
  'Identity & Belonging',
  'Communicating',
  'Exploring & Thinking',
  'Language',
  'Mathematics',
  'Science',
  'Arts',
  'SPHE',
  'PE',
] as const;

export default function PortfolioScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedChild, setSelectedChild] = useState<string | null>(
    children[0]?.id ?? null
  );

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const snapPoints = useMemo(() => ['80%'], []);

  const {
    data: portfolioData,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<PortfolioData>(
    ['educator', 'portfolio', selectedChild || 'all'],
    selectedChild
      ? `/educator/portfolio?child_id=${selectedChild}`
      : '/educator/portfolio'
  );

  const createEntry = useApiPost<PortfolioEntry, CreateEntryBody>(
    '/educator/portfolio',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['educator', 'portfolio'] });
        bottomSheetRef.current?.close();
        resetForm();
      },
      onError: (err) => Alert.alert('Error', err.message),
    }
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setSelectedAreas([]);
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (!selectedChild) {
      Alert.alert('Error', 'Please select a child first');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    createEntry.mutate({
      child_id: selectedChild,
      title: title.trim(),
      description: description.trim(),
      date: entryDate,
      curriculum_areas: selectedAreas,
    });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const entries = portfolioData?.entries || [];

  if (isLoading && !portfolioData) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
      </View>

      {/* Child Selector Chips */}
      {children.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.childSelector}
        >
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childChip,
                selectedChild === child.id && styles.childChipActive,
              ]}
              onPress={() => setSelectedChild(child.id)}
            >
              <Text
                style={[
                  styles.childChipText,
                  selectedChild === child.id && styles.childChipTextActive,
                ]}
              >
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.moss}
          />
        }
      >
        {entries.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={32} color={`${colors.clay}40`} />}
            title="No portfolio entries"
            message="Add learning observations, work samples, and milestones to build a portfolio."
            actionLabel="Add entry"
            onAction={() => bottomSheetRef.current?.snapToIndex(0)}
          />
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} variant="elevated" padding="lg">
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <View style={styles.entryDate}>
                  <Calendar size={12} color={colors.clay} />
                  <Text style={styles.entryDateText}>
                    {new Date(entry.date).toLocaleDateString('en-IE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>
              {entry.description ? (
                <Text style={styles.entryDescription} numberOfLines={2}>
                  {entry.description}
                </Text>
              ) : null}
              <View style={styles.entryFooter}>
                {entry.curriculum_areas && entry.curriculum_areas.length > 0 && (
                  <View style={styles.areaBadges}>
                    {entry.curriculum_areas.map((area) => (
                      <Badge key={area} variant="sage" size="sm">
                        {area}
                      </Badge>
                    ))}
                  </View>
                )}
                {entry.photo_count > 0 && (
                  <View style={styles.photoIndicator}>
                    <Image size={12} color={colors.clay} />
                    <Text style={styles.photoCount}>
                      {entry.photo_count} photo{entry.photo_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Entry FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => bottomSheetRef.current?.snapToIndex(0)}
          activeOpacity={0.8}
        >
          <Plus size={22} color={colors.parchment} />
        </TouchableOpacity>
      </View>

      {/* Add Entry Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sheetTitle}>Add portfolio entry</Text>

          {/* Title */}
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Nature walk observations"
            placeholderTextColor={`${colors.clay}60`}
          />

          {/* Description */}
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What happened? What did the child learn?"
            placeholderTextColor={`${colors.clay}60`}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Date */}
          <Text style={styles.fieldLabel}>Date</Text>
          <TextInput
            style={styles.textInput}
            value={entryDate}
            onChangeText={setEntryDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={`${colors.clay}60`}
          />

          {/* Curriculum Areas */}
          <Text style={styles.fieldLabel}>Curriculum areas</Text>
          <View style={styles.chipRow}>
            {CURRICULUM_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.chip,
                  selectedAreas.includes(area) && styles.chipActive,
                ]}
                onPress={() => toggleArea(area)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedAreas.includes(area) && styles.chipTextActive,
                  ]}
                >
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Photos placeholder */}
          <Text style={styles.fieldLabel}>Photos</Text>
          <View style={styles.photoPlaceholder}>
            <Image size={20} color={`${colors.clay}60`} />
            <Text style={styles.photoPlaceholderText}>
              Photo uploads coming soon
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={createEntry.isPending}
            onPress={handleSubmit}
          >
            Add entry
          </Button>
        </ScrollView>
      </BottomSheet>
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
  headerTitle: { fontSize: 20, fontWeight: '300', color: colors.ink },
  childSelector: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    marginRight: spacing.sm,
  },
  childChipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  childChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  childChipTextActive: {
    color: colors.parchment,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
    gap: spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
    flex: 1,
    marginRight: spacing.sm,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryDateText: {
    fontSize: 11,
    color: colors.clay,
  },
  entryDescription: {
    fontSize: 13,
    color: colors.clay,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  entryFooter: {
    gap: spacing.sm,
  },
  areaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoCount: {
    fontSize: 11,
    color: colors.clay,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackground: {
    backgroundColor: colors.parchment,
  },
  sheetIndicator: {
    backgroundColor: colors.stone,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: `${colors.clay}80`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.clay,
  },
  chipTextActive: {
    color: colors.parchment,
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: colors.stone,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: `${colors.clay}60`,
  },
});
