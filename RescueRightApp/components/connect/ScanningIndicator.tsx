import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface ScanningIndicatorProps {
  isScanning: boolean;
}

export function ScanningIndicator({ isScanning }: ScanningIndicatorProps) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isScanning) {
      opacity.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      opacity.value = 0.3;
      scale.value = 1;
    }
  }, [isScanning]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!isScanning) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulse, animatedStyle]} />
      <View style={styles.dot} />
      <Text style={styles.text}>Scanning for devices...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    marginBottom: 12,
  },
  text: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: 8,
  },
});
