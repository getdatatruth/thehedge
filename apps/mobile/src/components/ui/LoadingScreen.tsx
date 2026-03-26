import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { lightTheme } from '@/theme/colors';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={lightTheme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.background,
  },
});
