import { useEffect, useRef, useState } from 'react';
import * as Network from 'expo-network';
import { useOfflineQueue } from '@/stores/offline-queue';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);
  const wasDisconnected = useRef(false);
  const flush = useOfflineQueue((s) => s.flush);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected ?? true;
      setIsConnected(connected);

      // Flush offline queue when reconnecting
      if (connected && wasDisconnected.current) {
        try {
          await flush();
        } catch {
          // Flush errors are handled internally by the queue store
        }
      }
      wasDisconnected.current = !connected;
    };

    check();

    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [flush]);

  return { isConnected };
}
