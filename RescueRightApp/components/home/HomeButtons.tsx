import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface HomeButtonsProps {
  visible: boolean;
}

export function HomeButtons({ visible }: HomeButtonsProps) {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleConnect = () => {
    router.push('/connect');
  };

  const handleAbout = () => {
    // TODO: Navigate to About screen
    console.log('About RescueRight');
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Primary Button */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleConnect}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Connect With Vest</Text>
      </TouchableOpacity>

      {/* Secondary Button */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleAbout}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>About RescueRight</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.lg,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
