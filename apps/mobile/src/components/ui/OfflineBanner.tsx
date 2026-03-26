import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { lightTheme } from '@/theme/colors';

// Simplified - no offline queue import to avoid circular dependency chain
export function OfflineBanner() {
  // Inline network check to avoid importing use-network (which imports offline-queue)
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const Network = require('expo-network');
        const state = await Network.getNetworkStateAsync();
        if (mounted) setIsConnected(state.isConnected ?? true);
      } catch {}
    };
    check();
    const interval = setInterval(check, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={14} color="#FFFFFF" />
      <Text style={styles.text}>You're offline - showing cached data</Text>
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
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
