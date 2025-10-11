import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ConnectHeader } from '../components/connect/ConnectHeader';
import { ScanningIndicator } from '../components/connect/ScanningIndicator';
import { DeviceListItem } from '../components/connect/DeviceListItem';
import { ConnectionModal } from '../components/connect/ConnectionModal';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { theme } from '../styles/theme';
import { mockDevices, BluetoothDevice } from '../lib/mockData';

export default function ConnectScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulate device discovery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDevices(mockDevices);
      setIsScanning(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDevicePress = (device: BluetoothDevice) => {
    setSelectedDevice(device);
    setIsConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsSuccess(true);

      // Navigate to training screen after success animation
      setTimeout(() => {
        router.push('/training');
      }, 1500);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <ConnectHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScanningIndicator isScanning={isScanning} />

        <View style={styles.deviceList}>
          {devices.map((device) => (
            <DeviceListItem
              key={device.id}
              device={device}
              onPress={handleDevicePress}
            />
          ))}
        </View>
      </ScrollView>

      <ConnectionModal
        visible={selectedDevice !== null}
        deviceName={selectedDevice?.name || ''}
        isConnecting={isConnecting}
        isSuccess={isSuccess}
      />

      <DevBypassButton nextScreen="training" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  deviceList: {
    marginTop: 8,
  },
});
