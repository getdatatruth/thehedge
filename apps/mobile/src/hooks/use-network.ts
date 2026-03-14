import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected ?? true);
    };

    check();

    // Check periodically
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected };
}
