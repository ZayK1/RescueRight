import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface MetricsStripProps {
  thrusts: number;
  avgForce: number; // Will be compression depth
  accuracy: number; // Will be compression rate
}

const MetricItem = ({ label, value, unit }) => (
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
        <MetricItem label="Compressions" value={thrusts} unit="" />
        <View style={styles.separator} />
        <MetricItem label="Avg. Depth" value={avgForce} unit="mm" />
        <View style={styles.separator} />
        <MetricItem label="Rate" value={accuracy} unit="CPM" />
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
    marginHorizontal: 16,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...theme.shadows.lg,
  },
  metricItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  separator: {
    width: 1,
    height: '50%',
    backgroundColor: '#E5E7EB',
  },
  safeAreaSpacer: {
    height: 34, // Standard safe area bottom inset
  },
});