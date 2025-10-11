import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useDerivedValue, withSpring } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const GAUGE_WIDTH = 300;
const GAUGE_HEIGHT = 180;
const STROKE_WIDTH = 25;
const RADIUS = (GAUGE_WIDTH / 2) - (STROKE_WIDTH / 2);
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ForceGaugeProps {
  force: number;
  targetMin: number;
  targetMax: number;
}

export function ForceGauge({ force, targetMin, targetMax }: ForceGaugeProps) {
  // Normalize force to a 0-100 scale for simplicity
  const normalizedForce = Math.min(Math.max(force, 0), 100);
  const progress = useDerivedValue(() => withSpring(normalizedForce / 100, { damping: 15, stiffness: 100 }));

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value * 0.75), // 0.75 for 270 degrees
    };
  });

  const getStatus = () => {
    if (force < targetMin) return { text: 'Too Soft', color: theme.colors.warning };
    if (force > targetMax) return { text: 'Too Hard', color: theme.colors.error };
    return { text: 'Optimal', color: theme.colors.success };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      <Svg width={GAUGE_WIDTH} height={GAUGE_HEIGHT} viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}>
        {/* Background Track */}
        <Path
          d={`M ${STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2} A ${RADIUS} ${RADIUS} 0 1 1 ${GAUGE_WIDTH - STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2}`}
          stroke="#E5E7EB"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        {/* Optimal Zone Indicator */}
        <Path
          d={`M ${STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2} A ${RADIUS} ${RADIUS} 0 1 1 ${GAUGE_WIDTH - STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2}`}
          stroke={theme.colors.success}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - (targetMax / 100) * 0.75)}
          strokeOpacity={0.2}
        />
        <Path
          d={`M ${STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2} A ${RADIUS} ${RADIUS} 0 1 1 ${GAUGE_WIDTH - STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2}`}
          stroke={theme.colors.success}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - (targetMin / 100) * 0.75) + (CIRCUMFERENCE * ((targetMax - targetMin) / 100) * 0.75)}
          strokeOpacity={0.2}
        />
        {/* Animated Progress */}
        <AnimatedPath
          d={`M ${STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2} A ${RADIUS} ${RADIUS} 0 1 1 ${GAUGE_WIDTH - STROKE_WIDTH / 2} ${GAUGE_HEIGHT - STROKE_WIDTH / 2}`}
          stroke={status.color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.forceValue}>{Math.round(force)}<Text style={styles.unit}> mm</Text></Text>
        <Text style={[styles.statusText, { color: status.color, backgroundColor: `${status.color}20` }]}>
          {status.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 30,
  },
  forceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  unit: {
    fontSize: 18,
    fontWeight: 'normal',
    color: theme.colors.text.secondary,
  },
  statusText: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
});