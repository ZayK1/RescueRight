import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export function VestAnimation3D({ onAnimationComplete }: { onAnimationComplete?: () => void }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const rotateZ = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 1000 });

    // Scale up with bounce
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 80,
    });

    // Gentle continuous rotation
    rotateZ.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2000 }),
        withTiming(-3, { duration: 2000 })
      ),
      -1, // infinite
      true // reverse
    );

    // Trigger callback
    if (onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require('../../assets/vest.png')}
          style={styles.vestImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  imageContainer: {
    width: '75%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vestImage: {
    width: '100%',
    height: '100%',
  },
});
