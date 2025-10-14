import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface MetricsStripProps {
  thrusts: number;
  avgForce: number;
  accuracy: number;
}

const MetricItem = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <View style={styles.metricValueContainer}>
      <Text style={styles.metricValue}>{value}</Text>
      {unit && <Text style={styles.metricUnit}>{unit}</Text>}
    </View>
  </View>
);

export function MetricsStrip({ thrusts, avgForce, accuracy }: MetricsStripProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stripWrapper}>
        <View style={styles.strip}>
          <MetricItem label="Thrusts" value={thrusts} unit="" />
          <View style={styles.separator} />
          <MetricItem label="Avg. Force" value={Math.round(avgForce)} unit="N" />
          <View style={styles.separator} />
          <MetricItem label="Rate" value={Math.round(accuracy)} unit="TPM" />
        </View>
      </View>
      <View style={styles.safeAreaSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
  stripWrapper: {
    marginHorizontal: theme.spacing.md,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  strip: {
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginLeft: 2,
  },
  separator: {
    width: 1,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  safeAreaSpacer: {
    height: 34,
  },
});
