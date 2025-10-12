import 'react-native-get-random-values';
// @ts-ignore - base-64 doesn't have TypeScript definitions
import { decode, encode } from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="training" />
        <Stack.Screen name="analytics" />
      </Stack>
    </GestureHandlerRootView>
  );
}