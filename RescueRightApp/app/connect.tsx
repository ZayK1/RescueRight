import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Device } from 'react-native-ble-plx';
import { PairingNavigation } from '../components/connect/PairingNavigation';
import { VestIllustration } from '../components/connect/VestIllustration';
import { ConnectionStates } from '../components/connect/ConnectionStates';
import { ConnectingModal } from '../components/connect/ConnectingModal';
import { ManualPairing } from '../components/connect/ManualPairing';
import { HelpSection } from '../components/connect/HelpSection';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { bluetoothManager } from '../lib/bluetooth';
import { theme } from '../styles/theme';

export default function ConnectScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);

  useEffect(() => {
    const startScan = async () => {
      setIsScanning(true);
      setDevices([]);
      try {
        await bluetoothManager.requestPermissions();
        await bluetoothManager.scanForDevices((device) => {
          if (device && device.name?.includes('RescueRight')) {
            setDevices((prev) => {
              if (!prev.find((d) => d.id === device.id)) {
                return [...prev, device];
              }
              return prev;
            });
          }
        }, 5000); // Scan for 5 seconds
      } catch (e) {
        Alert.alert("Bluetooth Error", "Please ensure Bluetooth is enabled and permissions are granted.");
      } finally {
        setIsScanning(false);
      }
    };

    startScan();

    return () => {
      bluetoothManager.stopScan();
    };
  }, []);

  const handleDeviceSelect = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    setIsConnecting(true);
    setSelectedDeviceName(device.name);

    const connected = await bluetoothManager.connect(deviceId);

    setIsConnecting(false);
    if (connected) {
      router.push('/training');
    } else {
      Alert.alert('Connection Failed', 'Could not connect to the device. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PairingNavigation onBack={handleBack} />
        <View style={styles.heroSection}>
          <VestIllustration />
          <Text style={styles.title}>Connect Smart Vest</Text>
          <Text style={styles.subtitle}>
            Power on your RescueRight vest and hold nearby
          </Text>
        </View>
        <View style={styles.connectionSection}>
          <ConnectionStates
            devices={devices}
            onDeviceSelect={handleDeviceSelect}
            isScanning={isScanning}
          />
          <ManualPairing />
          <HelpSection />
        </View>
      </ScrollView>
      <ConnectingModal
        isVisible={isConnecting}
        deviceName={selectedDeviceName || ''}
        onCancel={() => {
          setIsConnecting(false);
          bluetoothManager.disconnect();
        }}
        onSuccess={() => {}} // Not used in the real flow
      />
      <DevBypassButton nextScreen="training" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingTop: 112, paddingBottom: 40 },
  heroSection: { alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  title: { ...theme.typography.h2, textAlign: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  subtitle: { ...theme.typography.caption, textAlign: 'center', color: theme.colors.text.secondary, maxWidth: 320 },
  connectionSection: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
});