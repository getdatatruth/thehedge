import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useAuthStore, Child } from '@/stores/auth-store';
import { useApiPost, useApiPut, useApiDelete } from '@/hooks/use-api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

const SCHOOL_STATUSES = ['mainstream', 'homeschool', 'considering'];

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ChildrenScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useAuthStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childSchoolStatus, setChildSchoolStatus] = useState('mainstream');
  const [childInterests, setChildInterests] = useState('');

  const invalidateMe = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  const addChild = useApiPost<any, any>('/settings/children', {
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidateMe();
      bottomSheetRef.current?.close();
      resetForm();
    },
    onError: (err) => Alert.alert('Error', err.message || 'Failed to add child'),
  });

  const updateChild = useApiPut<any, any>('/settings/children', {
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidateMe();
      bottomSheetRef.current?.close();
      resetForm();
    },
    onError: (err) => Alert.alert('Error', err.message || 'Failed to update child'),
  });

  const deleteChild = useApiDelete<any, { id: string }>('/settings/children', {
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      invalidateMe();
    },
    onError: (err) => Alert.alert('Error', err.message || 'Failed to remove child'),
  });

  const resetForm = () => {
    setEditingChild(null);
    setChildName('');
    setChildDob('');
    setChildSchoolStatus('mainstream');
    setChildInterests('');
  };

  const openAddSheet = () => {
    resetForm();
    bottomSheetRef.current?.snapToIndex(0);
  };

  const openEditSheet = (child: Child) => {
    setEditingChild(child);
    setChildName(child.name);
    setChildDob(child.date_of_birth || '');
    setChildSchoolStatus(child.school_status || 'mainstream');
    setChildInterests(child.interests?.join(', ') || '');
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSave = () => {
    if (!childName.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    const interests = childInterests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: childName.trim(),
      date_of_birth: childDob.trim() || undefined,
      school_status: childSchoolStatus,
      interests,
    };

    if (editingChild) {
      updateChild.mutate({ id: editingChild.id, ...payload });
    } else {
      addChild.mutate(payload);
    }
  };

  const handleDelete = (child: Child) => {
    Alert.alert(
      'Remove child',
      `Are you sure you want to remove ${child.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteChild.mutate({ id: child.id }),
        },
      ]
    );
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

  const schoolStatusBadge = (status: string) => {
    switch (status) {
      case 'homeschool':
        return 'moss';
      case 'considering':
        return 'amber';
      default:
        return 'stone';
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Children</Text>
      </View>

      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <Card variant="interactive" padding="lg">
            <View style={styles.childRow}>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{item.name}</Text>
                <View style={styles.childMeta}>
                  {item.date_of_birth && (
                    <Text style={styles.childAge}>
                      {calculateAge(item.date_of_birth)} years old
                    </Text>
                  )}
                  <Badge
                    variant={schoolStatusBadge(item.school_status) as any}
                    size="sm"
                  >
                    {item.school_status}
                  </Badge>
                </View>
                {item.interests && item.interests.length > 0 && (
                  <Text style={styles.childInterests}>
                    {item.interests.join(', ')}
                  </Text>
                )}
              </View>
              <View style={styles.childActions}>
                <TouchableOpacity
                  onPress={() => openEditSheet(item)}
                  style={styles.actionBtn}
                >
                  <Pencil size={16} color={colors.clay} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.actionBtn}
                >
                  <Trash2 size={16} color={colors.terracotta} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={() => (
          <Button
            variant="secondary"
            fullWidth
            icon={<Plus size={16} color={colors.ink} />}
            onPress={openAddSheet}
            style={{ marginTop: spacing.lg }}
          >
            Add child
          </Button>
        )}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={{ backgroundColor: colors.stone }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContent}
        >
          <Text style={styles.sheetTitle}>
            {editingChild ? 'Edit child' : 'Add child'}
          </Text>

          <Input
            label="Name"
            value={childName}
            onChangeText={setChildName}
            placeholder="Child's name"
            autoCapitalize="words"
          />

          <Input
            label="Date of birth"
            value={childDob}
            onChangeText={setChildDob}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />

          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>School status</Text>
            <View style={styles.chips}>
              {SCHOOL_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setChildSchoolStatus(status)}
                  style={[
                    styles.chip,
                    childSchoolStatus === status && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      childSchoolStatus === status && styles.chipTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Interests"
            value={childInterests}
            onChangeText={setChildInterests}
            placeholder="e.g. dinosaurs, art, science"
          />

          <Button
            variant="primary"
            fullWidth
            loading={addChild.isPending || updateChild.isPending}
            onPress={handleSave}
          >
            {editingChild ? 'Save changes' : 'Add child'}
          </Button>
        </KeyboardAvoidingView>
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
  title: { fontSize: 20, fontWeight: '300', color: colors.ink },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childInfo: { flex: 1, gap: 6 },
  childName: { fontSize: 16, fontWeight: '500', color: colors.ink },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childAge: { fontSize: 13, color: colors.clay },
  childInterests: { fontSize: 12, color: `${colors.clay}80` },
  childActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackground: {
    backgroundColor: colors.parchment,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  statusSection: { gap: spacing.sm },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.linen,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.clay,
  },
  chipTextActive: {
    color: colors.parchment,
  },
});
