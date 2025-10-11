import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bluetooth, Info } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface StatusHeaderProps {
  isConnected: boolean;
  batteryLevel: number;
  duration: number;
}

export function StatusHeader({ isConnected, batteryLevel, duration }: StatusHeaderProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <View style={styles.headerPill}>
        <View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
          <Bluetooth size={14} color={isConnected ? theme.colors.success : theme.colors.error} />
          <Text style={[styles.connectionText, isConnected ? styles.connectedText : styles.disconnectedText]}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        <Text style={styles.title}>{formatDuration(duration)}</Text>

        <TouchableOpacity style={styles.infoButton}>
          <Info size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
  },
  statusBarSpacer: {
    height: 59, // Safe area
  },
  headerPill: {
    height: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    ...theme.shadows.lg,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
  },
  connected: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  disconnected: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  connectedText: {
    color: theme.colors.success,
  },
  disconnectedText: {
    color: theme.colors.error,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});