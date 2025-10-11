import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Bluetooth, Check, ChevronRight } from 'lucide-react-native';
import { theme } from '../../styles/theme';
import { mockDevices, MockDevice } from '../../lib/mockData'; // Using mock data as per the roadmap

interface ConnectionStatesProps {
  devices: MockDevice[];
  onDeviceSelect: (deviceId: string) => void;
}

const DeviceItem = ({ device, onDeviceSelect, isSelected }: { device: MockDevice, onDeviceSelect: (id: string) => void, isSelected: boolean }) => {
  return (
    <TouchableOpacity
      style={[styles.deviceCard, isSelected && styles.selectedCard]}
      onPress={() => onDeviceSelect(device.id)}
      className="active:scale-[0.99]"
    >
      <View style={styles.cardContent}>
        <View style={styles.btIconContainer}>
          <Bluetooth size={24} color={theme.colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceRssi}>RSSI: {device.rssi} dBm</Text>
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
    fontSize: 15,
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  selectedCard: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
    ...theme.shadows.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 13,
    color: theme.colors.text.secondary,
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