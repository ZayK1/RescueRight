import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Award, Clock } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 2 * Math.PI * 52; // 2 * PI * R

interface HeroSuccessCardProps {
  score: number;
  duration: number;
}

export function HeroSuccessCard({ score, duration }: HeroSuccessCardProps) {
  const progress = useDerivedValue(() => {
    return withTiming(score / 100, { duration: 1000 });
  });

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Check size={32} color="#FFFFFF" strokeWidth={3} />
        <View style={styles.award}>
          <Award size={12} color="#FFFFFF" strokeWidth={3} />
        </View>
      </View>

      <Text style={styles.title}>Exceptional Performance</Text>
      <Text style={styles.subtitle}>CPR technique validated successfully</Text>

      <View style={styles.scoreContainer}>
        <Svg width="128" height="128" viewBox="0 0 128 128">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.success} />
              <Stop offset="1" stopColor={theme.colors.primary} />
            </LinearGradient>
          </Defs>
          <Circle cx="64" cy="64" r="52" stroke="#E5E7EB" strokeWidth="8" />
          <AnimatedCircle
            cx="64"
            cy="64"
            r="52"
            stroke="url(#grad)"
            strokeWidth="8"
            strokeDasharray={CIRCLE_LENGTH}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
          />
        </Svg>
        <View style={styles.scoreTextContainer}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>SCORE</Text>
        </View>
      </View>

      <View style={styles.durationContainer}>
        <Clock size={14} color={theme.colors.text.secondary} />
        <Text style={styles.durationText}>Duration: {formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.md,
  },
  award: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
  scoreContainer: {
    width: 128,
    height: 128,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
});