import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import { BluetoothDevice } from '../../lib/mockData';

interface DeviceListItemProps {
  device: BluetoothDevice;
  onPress: (device: BluetoothDevice) => void;
}

export function DeviceListItem({ device, onPress }: DeviceListItemProps) {
  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { label: 'Excellent', color: theme.colors.success };
    if (rssi > -70) return { label: 'Good', color: theme.colors.primary };
    return { label: 'Fair', color: theme.colors.warning };
  };

  const signal = getSignalStrength(device.rssi);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={styles.iconText}>📡</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{device.name}</Text>
        <View style={styles.signalRow}>
          <View style={[styles.signalDot, { backgroundColor: signal.color }]} />
          <Text style={styles.signalText}>{signal.label} Signal</Text>
        </View>
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  signalText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    color: theme.colors.mutedForeground,
    fontWeight: '300',
  },
});
