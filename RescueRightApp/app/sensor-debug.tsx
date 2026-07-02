/**
 * Sensor Debug Screen
 *
 * Developer tool for testing and debugging sensor data
 * Shows raw and calibrated values in real-time
 *
 * Features:
 * - Real-time sensor value display
 * - Data quality indicators
 * - Connection status
 * - Data logging capabilities
 * - Visual graphs for trends
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';
import { bluetoothManager } from '../lib/bluetooth';
import { Activity, Wifi, WifiOff, Download, Trash2, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function SensorDebugScreen() {
  const [useMockData, setUseMockData] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState<any[]>([]);
  const trainingData = useBluetoothTrainingData(useMockData);

  // Connection status
  const isConnected = trainingData.isConnected || bluetoothManager.isConnected();

  // Start/stop data logging
  const toggleLogging = () => {
    if (isLogging) {
      setIsLogging(false);
    } else {
      setLogData([]);
      setIsLogging(true);
    }
  };

  // Export log data as CSV
  const exportLogData = () => {
    if (logData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(logData[0]).join(',');
    const rows = logData.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    console.log('[Export] CSV data ready for export:');
    console.log(csv);

    alert(`Exported ${logData.length} samples. Check console for CSV data.`);
  };

  // Clear log data
  const clearLogData = () => {
    setLogData([]);
  };

  // Log data at regular intervals
  useEffect(() => {
    if (!isLogging) return;

    const interval = setInterval(() => {
      const logEntry = {
        timestamp: Date.now(),
        force: trainingData.force,
        sumMagDelta: trainingData.sumMagDelta || 0,
        magTL: trainingData.rawMagDelta?.[0] ?? 0,
        magTR: trainingData.rawMagDelta?.[1] ?? 0,
        magBL: trainingData.rawMagDelta?.[2] ?? 0,
        magBR: trainingData.rawMagDelta?.[3] ?? 0,
        positionX: trainingData.handPosition.x,
        positionY: trainingData.handPosition.y,
        angle: trainingData.angle,
        compressionRate: trainingData.compressionRate,
        thrusts: trainingData.thrusts,
      };

      setLogData((prev) => [...prev, logEntry]);
    }, 100);

    return () => clearInterval(interval);
  }, [isLogging, trainingData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Debug</Text>
        <Text style={styles.subtitle}>Developer tool for sensor testing and calibration</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Connection Status</Text>
          {isConnected ? (
            <Wifi size={24} color={theme.colors.success} />
          ) : (
            <WifiOff size={24} color={theme.colors.error} />
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.statusDot, isConnected ? styles.statusDotConnected : styles.statusDotDisconnected]} />
          <Text style={styles.bodyText}>
            {isConnected ? 'Connected to vest' : 'Not connected'}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.labelText}>Use Mock Data:</Text>
          <Switch
            value={useMockData}
            onValueChange={setUseMockData}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={useMockData ? theme.colors.surface : theme.colors.text.disabled}
          />
        </View>
      </View>

      {/* Real-time Sensor Values */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Real-time Sensor Data</Text>

        {/* Force */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Force</Text>
            <Text style={styles.metricValue}>{trainingData.force.toFixed(1)} N</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, styles.progressBlue, { width: `${Math.min((trainingData.force / 100) * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Raw corner signal — press on a force scale and tune FORCE_GAIN so a
            firm thrust reads ~55 N. See lib/vestCalibration.ts */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Σ magDelta (raw)</Text>
            <Text style={styles.metricValue}>{(trainingData.sumMagDelta ?? 0).toFixed(1)} µT</Text>
          </View>
          <View style={styles.metricDetails}>
            <Text style={styles.metricDetailText}>TL {(trainingData.rawMagDelta?.[0] ?? 0).toFixed(1)}</Text>
            <Text style={styles.metricDetailText}>TR {(trainingData.rawMagDelta?.[1] ?? 0).toFixed(1)}</Text>
            <Text style={styles.metricDetailText}>BL {(trainingData.rawMagDelta?.[2] ?? 0).toFixed(1)}</Text>
            <Text style={styles.metricDetailText}>BR {(trainingData.rawMagDelta?.[3] ?? 0).toFixed(1)}</Text>
          </View>
        </View>

        {/* Position */}
        <View style={styles.metricContainer}>
          <Text style={styles.metricLabel}>Hand Position</Text>
          <View style={styles.positionRow}>
            <View style={styles.positionAxis}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricDetailText}>X</Text>
                <Text style={styles.metricDetailValue}>{trainingData.handPosition.x.toFixed(3)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, styles.progressPurple, { width: `${trainingData.handPosition.x * 100}%` }]} />
              </View>
            </View>
            <View style={styles.positionAxis}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricDetailText}>Y</Text>
                <Text style={styles.metricDetailValue}>{trainingData.handPosition.y.toFixed(3)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, styles.progressPurple, { width: `${trainingData.handPosition.y * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Angle */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Angle</Text>
            <Text style={styles.metricValue}>{trainingData.angle.toFixed(1)}°</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, styles.progressYellow, { width: `${((trainingData.angle + 180) / 360) * 100}%` }]} />
          </View>
        </View>

        {/* Compression Rate */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Compression Rate</Text>
            <Text style={styles.metricValue}>{trainingData.compressionRate} /min</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, styles.progressOrange, { width: `${Math.min((trainingData.compressionRate / 120) * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Thrusts */}
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>Total Thrusts</Text>
          <Text style={styles.thrustCount}>{trainingData.thrusts}</Text>
        </View>

        {/* Frame reliability */}
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>Frames dropped</Text>
          <Text style={styles.metricValue}>{trainingData.droppedFrames ?? 0}</Text>
        </View>
      </View>

      {/* Feedback */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Feedback</Text>
        <Text style={styles.feedbackText}>{trainingData.feedback}</Text>
      </View>

      {/* Data Logging Controls */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Data Logging</Text>
          <Activity size={24} color={isLogging ? theme.colors.success : theme.colors.text.disabled} />
        </View>

        <View style={styles.metricHeader}>
          <Text style={styles.labelText}>Status:</Text>
          <Text style={[styles.bodyText, isLogging ? styles.statusActive : styles.statusInactive]}>
            {isLogging ? 'Recording...' : 'Stopped'}
          </Text>
        </View>

        <View style={styles.metricHeader}>
          <Text style={styles.labelText}>Samples Logged:</Text>
          <Text style={styles.sampleCount}>{logData.length}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={toggleLogging}
            style={[styles.button, styles.buttonPrimary, isLogging ? styles.buttonDanger : styles.buttonSuccess]}
          >
            <Text style={styles.buttonText}>{isLogging ? 'Stop Logging' : 'Start Logging'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={exportLogData}
            disabled={logData.length === 0}
            style={[styles.iconButton, styles.buttonInfo, logData.length === 0 && styles.buttonDisabled]}
          >
            <Download size={20} color={theme.colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearLogData}
            disabled={logData.length === 0}
            style={[styles.iconButton, styles.buttonSecondary, logData.length === 0 && styles.buttonDisabled]}
          >
            <Trash2 size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Developer Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Developer Notes</Text>
        <Text style={styles.noteText}>• Use "Start Logging" to record sensor data for analysis</Text>
        <Text style={styles.noteText}>• Export button copies CSV data to console (check logs)</Text>
        <Text style={styles.noteText}>• Mock data simulates sensor readings for testing without hardware</Text>
        <Text style={styles.noteText}>• Data quality indicators help diagnose sensor issues</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  statusDotConnected: {
    backgroundColor: theme.colors.success,
  },
  statusDotDisconnected: {
    backgroundColor: theme.colors.error,
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  labelText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  metricContainer: {
    marginBottom: theme.spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  metricValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressBlue: {
    backgroundColor: theme.colors.info,
  },
  progressGreen: {
    backgroundColor: theme.colors.success,
  },
  progressPurple: {
    backgroundColor: '#8B5CF6',
  },
  progressYellow: {
    backgroundColor: '#FFE66D',
  },
  progressOrange: {
    backgroundColor: theme.colors.warning,
  },
  progressRed: {
    backgroundColor: theme.colors.error,
  },
  metricDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  metricDetailText: {
    ...theme.typography.caption2,
    color: theme.colors.text.tertiary,
  },
  metricDetailValue: {
    ...theme.typography.caption2,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  positionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  positionAxis: {
    flex: 1,
  },
  thrustCount: {
    ...theme.typography.display,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  issuesContainer: {
    marginTop: theme.spacing.md,
  },
  issuesTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.warning,
    marginBottom: theme.spacing.sm,
  },
  issueText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  feedbackText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  statusActive: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  statusInactive: {
    color: theme.colors.text.secondary,
  },
  sampleCount: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    marginRight: theme.spacing.sm,
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonInfo: {
    backgroundColor: theme.colors.info,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.text.secondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.inverse,
  },
  noteText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
});
