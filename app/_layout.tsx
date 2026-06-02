import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/hooks/useAuth';
import { useNotifications } from '../src/hooks/useNotifications';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/hooks/useTheme';

function RootLayoutNav() {
  const { isDark } = useTheme();
  useAuth();
  useNotifications();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="security" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="medications/new" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="medications/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="vitals/new" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="vitals/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="appointments/new" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="appointments/[id]" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
