import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Subtle self-test button (top-left of the home screen).
 *
 * Tapping it runs the ENTIRE app flow on simulated sensor data:
 *   Training (mock stream) -> Complete Session -> Analytics
 *
 * It's a one-tap way to confirm the app itself works end-to-end — screens,
 * gauge, feedback, scoring — without needing the vest connected. If this works,
 * the only remaining variable for a live demo is the Bluetooth link + firmware.
 *
 * Kept intentionally small and low-contrast so it doesn't distract on stage, but
 * with a generous hitSlop so it stays easy to tap.
 */
export function SelfTestButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/training?mock=1')}
      accessibilityLabel="Run app self-test with mock sensor data"
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
    >
      <Text style={styles.text}>▷</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: 'rgba(0, 0, 0, 0.28)',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 2, // optical centering of the triangle
  },
});
