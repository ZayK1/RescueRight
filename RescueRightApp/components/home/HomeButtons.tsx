import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Info } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface HomeButtonsProps {
  visible: boolean;
}

export function HomeButtons({ visible }: HomeButtonsProps) {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      translateY.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleConnect = () => {
    router.push('/connect');
  };

  const handleAbout = () => {
    console.log('About RescueRight');
  };

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>RescueRight</Text>
          <Text style={styles.subtitle}>Smart Heimlich Training Vest</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Primary Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleConnect}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.primaryButtonText}>Connect With Vest</Text>
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleAbout}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Info size={18} color={theme.colors.primary} strokeWidth={2} />
              <Text style={styles.secondaryButtonText}>About RescueRight</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>IDEATE 2025 • Innovation in Healthcare</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 24,
  },
  titleSection: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    height: 60,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.lg,
  },
  primaryButtonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    ...theme.typography.micro,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
  },
});
