import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Award, Clock, TrendingUp } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedStyle,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 2 * Math.PI * 58; // 2 * PI * R

interface HeroSuccessCardProps {
  score: number;
  duration: number;
}

export function HeroSuccessCard({ score, duration }: HeroSuccessCardProps) {
  const progress = useDerivedValue(() => {
    return withTiming(score / 100, { duration: 1400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  });

  const scale = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    // Badge entrance animation
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Score entrance animation with slight overshoot
    scale.value = withSequence(
      withTiming(0, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Determine performance level
  const getPerformanceLevel = () => {
    if (score >= 90) return { text: 'Excellent Technique', color: theme.colors.success, emoji: '🎉' };
    if (score >= 75) return { text: 'Good Technique', color: theme.colors.primary, emoji: '👍' };
    if (score >= 60) return { text: 'Fair Technique', color: theme.colors.warning, emoji: '💪' };
    return { text: 'Needs Improvement', color: theme.colors.error, emoji: '📈' };
  };

  const performance = getPerformanceLevel();

  return (
    <View style={styles.card}>
      {/* Background Glow Effect */}
      <View style={[styles.glowEffect, { backgroundColor: `${performance.color}15` }]} />

      {/* Badge with Animation */}
      <Animated.View style={[styles.badge, { backgroundColor: performance.color }, badgeAnimatedStyle]}>
        <Check size={36} color="#FFFFFF" strokeWidth={3.5} />
        <View style={[styles.award, { backgroundColor: theme.colors.warning }]}>
          <Award size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      </Animated.View>

      {/* Title & Subtitle */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{performance.text}</Text>
        <Text style={styles.subtitle}>Heimlich maneuver performed with precision</Text>
      </View>

      {/* Score Circle with Enhanced Design */}
      <View style={styles.scoreContainer}>
        {/* Outer decorative ring */}
        <View style={styles.decorativeRing} />

        <Svg width="160" height="160" viewBox="0 0 160 160">
          <Defs>
            <LinearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={theme.colors.success} stopOpacity="1" />
              <Stop offset="50%" stopColor={theme.colors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F3F4F6" stopOpacity="1" />
              <Stop offset="1" stopColor="#E5E7EB" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <G rotation="0" origin="80, 80">
            {/* Background Circle with Gradient */}
            <Circle
              cx="80"
              cy="80"
              r="58"
              stroke="url(#bgGrad)"
              strokeWidth="10"
              fill="none"
            />
            {/* Progress Circle with Gradient */}
            <AnimatedCircle
              cx="80"
              cy="80"
              r="58"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              fill="none"
            />
            {/* Inner decorative circle */}
            <Circle
              cx="80"
              cy="80"
              r="46"
              stroke={`${performance.color}20`}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
            />
          </G>
        </Svg>

        {/* Score Text with Animation */}
        <Animated.View style={[styles.scoreTextContainer, scoreAnimatedStyle]}>
          <Text style={[styles.scoreText, { color: performance.color }]}>{score}</Text>
          <View style={styles.scoreLabelRow}>
            <View style={[styles.scoreDot, { backgroundColor: performance.color }]} />
            <Text style={styles.scoreLabel}>SCORE</Text>
            <View style={[styles.scoreDot, { backgroundColor: performance.color }]} />
          </View>
        </Animated.View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Clock size={16} color={theme.colors.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: `${theme.colors.success}15` }]}>
            <TrendingUp size={16} color={theme.colors.success} strokeWidth={2.5} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>Performance</Text>
            <Text style={styles.statValue}>{performance.emoji} {score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Fair'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 150,
    borderRadius: 200,
    opacity: 0.5,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...theme.shadows.lg,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  award: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...theme.shadows.md,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  scoreContainer: {
    width: 160,
    height: 160,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorativeRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.08)',
    borderStyle: 'dashed',
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: 2,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1.2,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.border,
  },
});
