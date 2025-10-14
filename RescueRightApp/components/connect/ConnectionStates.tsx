import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Bluetooth, Check, ChevronRight } from 'lucide-react-native';
import { Device } from 'react-native-ble-plx';
import { theme } from '../../styles/theme';

interface ConnectionStatesProps {
  devices: Device[];
  onDeviceSelect: (deviceId: string) => void;
  isScanning?: boolean;
}

const DeviceItem = ({ device, onDeviceSelect, isSelected }: { device: Device, onDeviceSelect: (id: string) => void, isSelected: boolean }) => {
  return (
    <TouchableOpacity
      style={[styles.deviceCard, isSelected && styles.selectedCard]}
      onPress={() => onDeviceSelect(device.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.btIconContainer}>
          <Bluetooth size={24} color={theme.colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceRssi}>RSSI: {device.rssi || 0} dBm</Text>
        </View>

        <View style={{ marginLeft: 16 }}>
          {isSelected ? (
            <View style={styles.checkIconContainer}>
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          ) : (
            <ChevronRight size={20} color="#C7C7CC" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function ConnectionStates({ devices, onDeviceSelect }: ConnectionStatesProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [scanningDots, setScanningDots] = useState(1);

  useEffect(() => {
    const scanTimer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(scanTimer);
  }, []);

  useEffect(() => {
    if (isScanning) {
      const dotsInterval = setInterval(() => {
        setScanningDots(prev => (prev >= 3 ? 1 : prev + 1));
      }, 500);
      return () => clearInterval(dotsInterval);
    }
  }, [isScanning]);

  const handleSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    onDeviceSelect(deviceId);
  };

  if (isScanning) {
    return (
      <View style={styles.scanningContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.scanningText}>
          Searching for devices{'.'.repeat(scanningDots)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {devices.map((device) => (
        <DeviceItem
          key={device.id}
          device={device}
          onDeviceSelect={handleSelect}
          isSelected={selectedDeviceId === device.id}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scanningContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  scanningText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  listContainer: {
    width: '100%',
    maxWidth: 361,
    alignSelf: 'center',
    gap: 12,
  },
  deviceCard: {
    height: 88,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    ...theme.shadows.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  deviceName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  deviceRssi: {
    ...theme.typography.caption2,
    color: theme.colors.text.tertiary,
  },
  checkIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});