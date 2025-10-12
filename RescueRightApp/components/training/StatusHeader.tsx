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
    height: 60,
    backgroundColor: theme.colors.text.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    ...theme.shadows.xl,
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
    backgroundColor: `${theme.colors.success}30`,
  },
  disconnected: {
    backgroundColor: `${theme.colors.error}30`,
  },
  connectionText: {
    ...theme.typography.micro,
  },
  connectedText: {
    color: theme.colors.success,
  },
  disconnectedText: {
    color: theme.colors.error,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.text.inverse,
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