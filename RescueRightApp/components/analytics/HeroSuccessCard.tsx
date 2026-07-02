import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Award, Clock, TrendingUp } from 'lucide-react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';
import { ThrustData } from '../../lib/sessionStorage';
import { ForceChart } from './ForceChart';

interface HeroSuccessCardProps {
  score: number;
  duration: number;
  thrustHistory: ThrustData[];
}

export function HeroSuccessCard({ score, duration, thrustHistory }: HeroSuccessCardProps) {
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

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

      {/* Per-thrust peak force vs the 40–65N clinical band */}
      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>Peak Force per Thrust</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{score}% SCORE</Text>
          </View>
        </View>
        <ForceChart thrustHistory={thrustHistory} />
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
    fontSize: 9,
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
