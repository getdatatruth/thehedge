import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';
import { useNetwork } from '@/hooks/use-network';
import { useOfflineQueue } from '@/stores/offline-queue';

export function OfflineBanner() {
  const { isConnected } = useNetwork();
  const { queue, isProcessing } = useOfflineQueue();

  // Show syncing banner when back online and processing queued actions
  if (isConnected && isProcessing) {
    return (
      <View style={[styles.container, styles.syncingContainer]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.text}>
          Syncing {queue.length} {queue.length === 1 ? 'action' : 'actions'}...
        </Text>
      </View>
    );
  }

  // Show pending count when online with unprocessed items (waiting for next flush)
  if (isConnected && queue.length > 0) {
    return (
      <View style={[styles.container, styles.pendingContainer]}>
        <RefreshCw size={14} color="#FFFFFF" />
        <Text style={styles.text}>
          {queue.length} pending {queue.length === 1 ? 'action' : 'actions'} to sync
        </Text>
      </View>
    );
  }

  if (isConnected) return null;

  const queueLabel =
    queue.length > 0
      ? ` - ${queue.length} ${queue.length === 1 ? 'action' : 'actions'} queued`
      : '';

  return (
    <View style={styles.container}>
      <WifiOff size={14} color={'#FFFFFF'} />
      <Text style={styles.text}>You're offline - showing cached data{queueLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightTheme.textSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  syncingContainer: {
    backgroundColor: '#3D6142', // moss - positive syncing state
  },
  pendingContainer: {
    backgroundColor: '#C4623A', // terracotta - attention needed
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
