import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface MetricsStripProps {
  thrusts: number;
  avgForce: number; // Will be compression depth
  accuracy: number; // Will be compression rate
}

const MetricItem = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {value}
      <Text style={styles.metricUnit}> {unit}</Text>
    </Text>
  </View>
);

export function MetricsStrip({ thrusts, avgForce, accuracy }: MetricsStripProps) {
  return (
    <View style={styles.container}>
      <View style={styles.strip}>
        <MetricItem label="Thrusts" value={thrusts} unit="" />
        <View style={styles.separator} />
        <MetricItem label="Avg. Force" value={Math.round(avgForce)} unit="N" />
        <View style={styles.separator} />
        <MetricItem label="Rate" value={Math.round(accuracy)} unit="TPM" />
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
  strip: {
    marginHorizontal: theme.spacing.md,
    height: 72,
    backgroundColor: theme.colors.surface,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...theme.shadows.xl,
  },
  metricItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  metricLabel: {
    ...theme.typography.micro,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  metricValue: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  metricUnit: {
    ...theme.typography.caption2,
    color: theme.colors.text.tertiary,
  },
  separator: {
    width: 1.5,
    height: '50%',
    backgroundColor: theme.colors.border,
  },
  safeAreaSpacer: {
    height: 34, // Standard safe area bottom inset
  },
});