import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  G,
  Circle,
} from 'react-native-svg';
import { theme } from '../../styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Wave = ({ delay }: { delay: number }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    const animation = withRepeat(
      withTiming(2, {
        duration: 2400,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false
    );
    const opacityAnim = withRepeat(
      withTiming(0, {
        duration: 2400,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false
    );
    
    setTimeout(() => {
        scale.value = animation;
        opacity.value = opacityAnim;
    }, delay);
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[styles.wave, animatedStyle]}
    />
  );
};

export function VestIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {[0, 800, 1600].map((delay) => (
          <Wave key={delay} delay={delay} />
        ))}

        <View style={[styles.vestContainer, theme.shadows.lg]}>
          <Svg width="160" height="180" viewBox="0 0 160 180">
            <Defs>
              <LinearGradient id="vestGradient" x1="0" y1="0" x2="160" y2="180">
                <Stop offset="0" stopColor="#FAFBFC" />
                <Stop offset="1" stopColor="#EDF1F7" />
              </LinearGradient>
              <LinearGradient id="accentGradient" x1="0" y1="0" x2="50" y2="80">
                <Stop offset="0" stopColor="#0066CC" />
                <Stop offset="1" stopColor="#004C99" />
              </LinearGradient>
            </Defs>

            <Path
              d="M50 30 C50 25, 55 20, 60 20 L100 20 C105 20, 110 25, 110 30 L120 50 L120 160 C120 165, 115 170, 110 170 L50 170 C45 170, 40 165, 40 160 L40 50 Z"
              fill="url(#vestGradient)"
              stroke="#E5E9F0"
              strokeWidth="1"
            />
            <Rect x="55" y="40" width="50" height="80" rx="8" fill="url(#accentGradient)" opacity="0.1" />

            <G transform="translate(75, 70)">
              <Path d="M5 0 L5 8 L9 4 L5 0 Z M5 8 L5 16 L9 12 L5 8 Z M1 6 L9 14 M1 10 L9 2" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </G>

            {[
              { x: 65, y: 55 }, { x: 95, y: 55 }, { x: 65, y: 105 }, { x: 95, y: 105 }, { x: 80, y: 125 }
            ].map((dot, index) => (
              <Circle key={index} cx={dot.x} cy={dot.y} r="3" fill="#00C48C" opacity={0.9} />
            ))}

            <Rect x="25" y="45" width="15" height="8" rx="4" fill="#E5E9F0" />
            <Rect x="120" y="45" width="15" height="8" rx="4" fill="#E5E9F0" />
            <Rect x="25" y="90" width="15" height="8" rx="4" fill="#E5E9F0" />
            <Rect x="120" y="90" width="15" height="8" rx="4" fill="#E5E9F0" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  vestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});