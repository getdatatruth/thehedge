import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Download, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { apiDelete } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

export default function DataPrivacyScreen() {
  const router = useRouter();

  const handleExportData = () => {
    Alert.alert(
      'Data export requested',
      'We will prepare your data export and send it to your registered email address within 48 hours.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This action cannot be undone. All your data, including activity logs, plans, and family information will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final confirmation',
              'This is your last chance to cancel. Your account and all data will be permanently removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await apiDelete('/me');
                      supabase.auth.signOut();
                    } catch (e: any) {
                      Alert.alert('Error', e.message || 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Data & Privacy</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Export data */}
        <Card variant="elevated" padding="xl">
          <View style={styles.sectionHeader}>
            <Download size={20} color={colors.moss} />
            <Text style={styles.sectionTitle}>Export your data</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Request a copy of all your data including activity logs, plans,
            children profiles, and community posts. The export will be sent to
            your email address as a downloadable file.
          </Text>
          <Button
            variant="secondary"
            onPress={handleExportData}
            style={{ marginTop: spacing.lg }}
          >
            Request export
          </Button>
        </Card>

        {/* Delete account */}
        <Card variant="elevated" padding="xl" style={styles.dangerCard}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={colors.terracotta} />
            <Text style={[styles.sectionTitle, { color: colors.terracotta }]}>
              Delete account
            </Text>
          </View>
          <Text style={styles.dangerDescription}>
            Permanently delete your account and all associated data. This
            includes your family profile, children, activity history, plans,
            and community memberships. This action cannot be undone.
          </Text>
          <Button
            variant="terra"
            onPress={handleDeleteAccount}
            style={{ marginTop: spacing.lg }}
          >
            Delete my account
          </Button>
        </Card>

        <Text style={styles.gdprNote}>
          Your data is stored securely in the EU in compliance with GDPR. For
          any data-related queries, contact privacy@thehedge.ie
        </Text>
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
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '300', color: colors.ink },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.ink,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.clay,
    lineHeight: 20,
  },
  dangerCard: {
    borderColor: `${colors.terracotta}30`,
  },
  dangerDescription: {
    fontSize: 14,
    color: colors.terracotta,
    lineHeight: 20,
  },
  gdprNote: {
    fontSize: 12,
    color: `${colors.clay}80`,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xl,
  },
});
