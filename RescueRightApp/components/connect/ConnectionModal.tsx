import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface ConnectionModalProps {
  visible: boolean;
  deviceName: string;
  isConnecting: boolean;
  isSuccess: boolean;
}

export function ConnectionModal({
  visible,
  deviceName,
  isConnecting,
  isSuccess,
}: ConnectionModalProps) {
  const scale = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      if (isConnecting) {
        rotate.value = withRepeat(
          withTiming(360, { duration: 2000 }),
          -1,
          false
        );
      }
      if (isSuccess) {
        checkmarkScale.value = withSpring(1, { damping: 12 });
      }
    } else {
      scale.value = 0;
      checkmarkScale.value = 0;
      rotate.value = 0;
    }
  }, [visible, isConnecting, isSuccess]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, containerStyle]}>
          {isConnecting && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.title}>Connecting...</Text>
              <Text style={styles.subtitle}>{deviceName}</Text>
            </>
          )}

          {isSuccess && (
            <>
              <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
                <Text style={styles.checkmark}>✓</Text>
              </Animated.View>
              <Text style={styles.title}>Connected!</Text>
              <Text style={styles.subtitle}>Starting training session...</Text>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    ...theme.shadows.lg,
  },
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
});
