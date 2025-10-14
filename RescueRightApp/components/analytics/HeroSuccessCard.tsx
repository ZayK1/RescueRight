import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Award, Clock, TrendingUp } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G, Polyline } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  useSharedValue,
  withSpring,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';
import { ThrustData } from '../../lib/sessionStorage';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 2 * Math.PI * 58; // 2 * PI * R

interface HeroSuccessCardProps {
  score: number;
  duration: number;
  thrustHistory: ThrustData[];
}

// Function to generate SVG path from thrust history
const generateGraphPath = (history: ThrustData[], width: number, height: number) => {
  if (history.length < 2) return '0,0';

  const maxForce = Math.max(...history.map(t => t.force), 0) || 100;
  const minTime = history[0].timestamp;
  const maxTime = history[history.length - 1].timestamp;
  const timeRange = maxTime - minTime;

  if (timeRange === 0) return `0,${height}`;

  return history
    .map(thrust => {
      const x = ((thrust.timestamp - minTime) / timeRange) * width;
      const y = height - (thrust.force / maxForce) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};

export function HeroSuccessCard({ score, duration, thrustHistory }: HeroSuccessCardProps) {
  const progress = useDerivedValue(() => {
    return withTiming(score / 100, { duration: 1400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  });

  const scale = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    scale.value = withSequence(
      withTiming(0, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 120 })
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const scoreAnimatedStyle = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
    text: `${score}`
  }));

  const badgeAnimatedStyle = useAnimatedProps(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceLevel = () => {
    if (score >= 90) return { text: 'Excellent Technique', color: theme.colors.success, emoji: '🎉' };
    if (score >= 75) return { text: 'Good Technique', color: theme.colors.primary, emoji: '👍' };
    if (score >= 60) return { text: 'Fair Technique', color: theme.colors.warning, emoji: '💪' };
    return { text: 'Needs Improvement', color: theme.colors.error, emoji: '📈' };
  };

  const performance = getPerformanceLevel();
  const graphPoints = generateGraphPath(thrustHistory, 280, 100);

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
        <Text style={styles.subtitle}>Session performance analysis</Text>
      </View>

      {/* Thrust History Graph */}
      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>Thrust Force Over Time</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{score}% SCORE</Text>
          </View>
        </View>
        
        {thrustHistory.length > 1 ? (
          <Svg width="100%" height={120}>
            <Defs>
              <LinearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={performance.color} stopOpacity={0.4} />
                <Stop offset="100%" stopColor={performance.color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Polyline
              points={graphPoints}
              fill="url(#graphGradient)"
              stroke={performance.color}
              strokeWidth={2.5}
            />
          </Svg>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Not enough data to display graph.</Text>
          </View>
        )}
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
  graphContainer: {
    width: '100%',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  scorePill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  noDataContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
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
