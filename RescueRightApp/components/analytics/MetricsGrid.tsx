import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Hand, Zap, Target, Activity, TrendingUp, Shield } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'neutral';
  subtitle?: string;
  index: number;
}

const MetricCard = ({ icon, label, value, unit, status, subtitle, index }: MetricCardProps) => {
  const statusColors = {
    excellent: { bg: theme.colors.success, border: theme.colors.success, text: theme.colors.success },
    good: { bg: theme.colors.primary, border: theme.colors.primary, text: theme.colors.primary },
    warning: { bg: theme.colors.warning, border: theme.colors.warning, text: theme.colors.warning },
    neutral: { bg: theme.colors.text.secondary, border: theme.colors.border, text: theme.colors.text.primary },
  };

  const colors = statusColors[status];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify().damping(15)}
      style={[styles.card, { borderLeftColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.bg}15` }]}>
          {icon}
        </View>
        <View style={styles.statusDot}>
          <View style={[styles.dot, { backgroundColor: colors.bg }]} />
        </View>
      </View>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.unit, { color: colors.text }]}>{unit}</Text>
      </View>

      {subtitle && (
        <View style={[styles.subtitleContainer, { backgroundColor: `${colors.bg}08` }]}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
    </Animated.View>
  );
};

interface MetricsGridProps {
  data: {
    overallScore: number;
    effectiveThrusts: number;
    totalThrusts: number;
    averageForce: number;
    positionAccuracy: number;
    forceConsistency: number;
    angleAccuracy: number;
  };
}

export function MetricsGrid({ data }: MetricsGridProps) {
  // Calculate derived metrics
  const effectiveness = data.totalThrusts > 0
    ? Math.round((data.effectiveThrusts / data.totalThrusts) * 100)
    : 0;

  // Target force range is 20-60N (adjusted for Heimlich)
  const forceInRange = data.averageForce >= 20 && data.averageForce <= 60;

  const metrics = [
    {
      icon: <Hand size={22} color={theme.colors.primary} strokeWidth={2.5} />,
      label: 'Hand Position',
      value: data.positionAccuracy,
      unit: '%',
      status: (data.positionAccuracy >= 80 ? 'excellent' : data.positionAccuracy >= 60 ? 'good' : 'warning') as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: data.positionAccuracy >= 80 ? 'Excellent placement' : data.positionAccuracy >= 60 ? 'Good placement' : 'Needs improvement',
    },
    {
      icon: <Zap size={22} color={theme.colors.success} strokeWidth={2.5} />,
      label: 'Thrust Force',
      value: data.averageForce.toFixed(1),
      unit: 'N',
      status: (forceInRange ? 'excellent' : data.averageForce > 60 ? 'warning' : 'good') as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: forceInRange ? 'Optimal range' : data.averageForce > 60 ? 'Too forceful' : 'Increase force',
    },
    {
      icon: <Target size={22} color={theme.colors.warning} strokeWidth={2.5} />,
      label: 'Effectiveness',
      value: effectiveness,
      unit: '%',
      status: (effectiveness >= 85 ? 'excellent' : effectiveness >= 70 ? 'good' : 'warning') as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: `${data.effectiveThrusts}/${data.totalThrusts} effective`,
    },
    {
      icon: <Activity size={22} color={theme.colors.secondary} strokeWidth={2.5} />,
      label: 'Total Thrusts',
      value: data.totalThrusts,
      unit: 'thrusts',
      status: 'neutral' as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: 'Completed',
    },
    {
      icon: <TrendingUp size={22} color={theme.colors.primary} strokeWidth={2.5} />,
      label: 'Consistency',
      value: data.forceConsistency,
      unit: '%',
      status: (data.forceConsistency >= 80 ? 'excellent' : data.forceConsistency >= 60 ? 'good' : 'warning') as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: 'Force variance',
    },
    {
      icon: <Shield size={22} color={theme.colors.success} strokeWidth={2.5} />,
      label: 'Overall Score',
      value: data.overallScore,
      unit: '/100',
      status: (data.overallScore >= 85 ? 'excellent' : data.overallScore >= 70 ? 'good' : 'warning') as 'excellent' | 'good' | 'warning' | 'neutral',
      subtitle: data.overallScore >= 85 ? 'Excellent!' : data.overallScore >= 70 ? 'Good job' : 'Keep practicing',
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 14,
    ...theme.shadows.md,
    position: 'relative',
    minHeight: 150,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    opacity: 0.7,
  },
  subtitleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
});
