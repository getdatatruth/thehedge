import { Stack } from 'expo-router';
import { lightTheme } from '@/theme/colors';

export default function BrowseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: lightTheme.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[slug]"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
