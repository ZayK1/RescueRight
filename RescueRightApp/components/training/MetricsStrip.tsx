import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface MetricsStripProps {
  depth: number; // mm
  rate: number; // CPM
  compressions: number;
}

export function MetricsStrip({ depth, rate, compressions }: MetricsStripProps) {
  const getDepthStatus = (depth: number) => {
    if (depth >= 50 && depth <= 60) return 'good';
    if (depth >= 45 && depth <= 65) return 'warning';
    return 'bad';
  };

  const getRateStatus = (rate: number) => {
    if (rate >= 100 && rate <= 120) return 'good';
    if (rate >= 90 && rate <= 130) return 'warning';
    return 'bad';
  };

  const depthStatus = getDepthStatus(depth);
  const rateStatus = getRateStatus(rate);

  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <Text style={styles.label}>Depth</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, styles[`value_${depthStatus}`]]}>{depth}</Text>
          <Text style={styles.unit}>mm</Text>
        </View>
        <View style={[styles.indicator, styles[`indicator_${depthStatus}`]]} />
      </View>

      <View style={styles.divider} />

      <View style={styles.metric}>
        <Text style={styles.label}>Rate</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, styles[`value_${rateStatus}`]]}>{rate}</Text>
          <Text style={styles.unit}>CPM</Text>
        </View>
        <View style={[styles.indicator, styles[`indicator_${rateStatus}`]]} />
      </View>

      <View style={styles.divider} />

      <View style={styles.metric}>
        <Text style={styles.label}>Total</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{compressions}</Text>
          <Text style={styles.unit} />
        </View>
        <View style={styles.indicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...theme.typography.h2,
    color: theme.colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  value_good: {
    color: theme.colors.success,
  },
  value_warning: {
    color: theme.colors.warning,
  },
  value_bad: {
    color: theme.colors.destructive,
  },
  unit: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginLeft: 4,
  },
  indicator: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginTop: 8,
  },
  indicator_good: {
    backgroundColor: theme.colors.success,
  },
  indicator_warning: {
    backgroundColor: theme.colors.warning,
  },
  indicator_bad: {
    backgroundColor: theme.colors.destructive,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 12,
  },
});
