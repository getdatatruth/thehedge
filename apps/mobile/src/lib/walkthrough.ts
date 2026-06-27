import AsyncStorage from '@react-native-async-storage/async-storage';

// First-run guided walkthrough. We track "seen" locally so it auto-starts once,
// the first time a family lands in the app, and can be replayed from Settings.
const KEY = 'hedge_walkthrough_seen_v1';

export async function hasSeenWalkthrough(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return true; // on storage error, do not nag
  }
}

export async function markWalkthroughSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // non-critical
  }
}
