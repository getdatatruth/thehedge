import { useEffect, useRef, useState } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);
  const wasDisconnected = useRef(false);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected ?? true;
      setIsConnected(connected);

      // Flush offline queue when reconnecting
      if (connected && wasDisconnected.current) {
        try {
          const { useOfflineQueue } = await import('@/stores/offline-queue');
          useOfflineQueue.getState().flush();
        } catch {}
      }
      wasDisconnected.current = !connected;
    };

    check();

    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected };
}
