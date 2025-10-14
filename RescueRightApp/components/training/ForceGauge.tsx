import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withSpring } from 'react-native-reanimated';
import { Zap, Target } from 'lucide-react-native';
import { theme } from '../../styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GAUGE_SIZE = 240;
const STROKE_WIDTH = 24;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ForceGaugeProps {
  force: number;
  targetMin: number;
  targetMax: number;
}

export function ForceGauge({ force, targetMin, targetMax }: ForceGaugeProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const normalizedProgress = Math.min(Math.max(force / 200, 0), 1);
    progress.value = withSpring(normalizedProgress, {
      damping: 20,
      stiffness: 90,
    });
  }, [force]);

  const animatedProps = useAnimatedProps(() => {
    const angle = progress.value * 270; // 270 degrees for 3/4 circle
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * angle) / 360;
    return { strokeDashoffset };
  });

  const getStatus = () => {
    if (force < 60) return { text: 'Too Low', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    if (force < targetMin) return { text: 'Low', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    if (force <= targetMax) return { text: 'Optimal', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    if (force <= 150) return { text: 'High', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Too High', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Zap size={16} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Compression Force</Text>
        </View>
        <View style={styles.targetBadge}>
          <Target size={11} color="#10B981" strokeWidth={2} />
          <Text style={styles.targetText}>{targetMin}-{targetMax}N optimal</Text>
        </View>
      </View>

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}>
          <Defs>
            <LinearGradient id="optimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#6BCF7F" stopOpacity="1" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFD93D" stopOpacity="1" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
              <Stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background Track */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke="rgba(0, 0, 0, 0.04)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${(CIRCUMFERENCE * 270) / 360} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE / 8}
            strokeLinecap="round"
          />

          {/* Animated Progress */}
          <AnimatedCircle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={status.color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${(CIRCUMFERENCE * 270) / 360} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE / 8}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>

        {/* Center Display */}
        <View style={styles.centerDisplay}>
          <Text style={styles.forceValue}>{Math.round(force)}</Text>
          <Text style={styles.forceUnit}>Newtons</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forceValue: {
    fontSize: 58,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 64,
  },
  forceUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginTop: -4,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
