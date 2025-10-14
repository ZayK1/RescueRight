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
      <View style={styles.headerPillWrapper}>
        <View style={styles.headerPill}>
          {/* Connection Status */}
          <View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
            <Bluetooth size={13} color={isConnected ? '#10B981' : '#EF4444'} strokeWidth={2.5} />
            <Text style={[styles.connectionText, isConnected ? styles.connectedText : styles.disconnectedText]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          {/* Center Title (Timer) */}
          <Text style={styles.title}>
            {formatDuration(duration)}
          </Text>

          {/* Info Button */}
          <TouchableOpacity
            style={styles.infoButton}
            activeOpacity={0.7}
          >
            <Info size={16} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
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
  },
  statusBarSpacer: {
    height: 59, // Safe area
  },
  headerPillWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerPill: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
  },
  connected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  disconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  connectedText: {
    color: '#10B981',
  },
  disconnectedText: {
    color: '#EF4444',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
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
