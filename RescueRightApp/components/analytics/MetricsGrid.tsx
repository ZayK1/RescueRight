import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gauge, Zap, Target, Activity } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

const MetricCard = ({ icon, label, value, unit, color }: MetricCardProps) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      {icon}
    </View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueContainer}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  </View>
);

interface MetricsGridProps {
  data: {
    overallScore: number;
    effectiveThrusts: number;
    totalThrusts: number;
    averageForce: number;
    positionAccuracy: number;
  };
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      icon: <Gauge size={20} color={theme.colors.primary} />,
      label: 'Avg. Depth',
      value: data.averageForce,
      unit: 'mm',
      color: theme.colors.primary,
    },
    {
      icon: <Zap size={20} color={theme.colors.success} />,
      label: 'Effective',
      value: `${Math.round((data.effectiveThrusts / data.totalThrusts) * 100)}`,
      unit: '%',
      color: theme.colors.success,
    },
    {
      icon: <Target size={20} color={theme.colors.warning} />,
      label: 'Position',
      value: data.positionAccuracy,
      unit: '%',
      color: theme.colors.warning,
    },
    {
      icon: <Activity size={20} color={theme.colors.error} />,
      label: 'Total',
      value: data.totalThrusts,
      unit: 'comp.',
      color: theme.colors.error,
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
});