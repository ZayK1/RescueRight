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

      <Text style={styles.title}>Excellent Technique</Text>
      <Text style={styles.subtitle}>Heimlich maneuver performed with precision</Text>

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
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.xl,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
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
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
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
    ...theme.typography.display,
    color: theme.colors.text.primary,
  },
  scoreLabel: {
    ...theme.typography.micro,
    color: theme.colors.text.tertiary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  durationText: {
    ...theme.typography.caption2,
    color: theme.colors.text.secondary,
  },
});