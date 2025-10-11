import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { PairingNavigation } from '../components/connect/PairingNavigation';
import { VestIllustration } from '../components/connect/VestIllustration';
import { ConnectionStates } from '../components/connect/ConnectionStates';
import { ConnectingModal } from '../components/connect/ConnectingModal';
import { ManualPairing } from '../components/connect/ManualPairing';
import { HelpSection } from '../components/connect/HelpSection';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockDevices } from '../lib/mockData';
import { theme } from '../styles/theme';

export default function ConnectScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setIsConnecting(true);
  };

  const handleConnectionSuccess = () => {
    setIsConnecting(false);
    setTimeout(() => {
      router.push('/training');
    }, 500);
  };

  const handleConnectionCancel = () => {
    setIsConnecting(false);
    setSelectedDevice(null);
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
            devices={mockDevices}
            onDeviceSelect={handleDeviceSelect}
          />
          <ManualPairing />
          <HelpSection />
        </View>
      </ScrollView>
      <ConnectingModal
        isVisible={isConnecting}
        deviceName={mockDevices.find(d => d.id === selectedDevice)?.name}
        onCancel={handleConnectionCancel}
        onSuccess={handleConnectionSuccess}
      />
      <DevBypassButton nextScreen="training" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingTop: 112, paddingBottom: 34 },
  heroSection: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  title: { ...theme.typography.h2, textAlign: 'center', marginTop: 24, marginBottom: 8 },
  subtitle: { ...theme.typography.caption, textAlign: 'center', color: theme.colors.text.secondary, maxWidth: 300 },
  connectionSection: { paddingHorizontal: 20, gap: 24 },
});