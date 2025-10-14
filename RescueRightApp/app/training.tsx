import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusHeader } from '../components/training/StatusHeader';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { ForceGauge } from '../components/training/ForceGauge';
import { FeedbackCard } from '../components/training/FeedbackCard';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';
import { sessionStorage } from '../lib/sessionStorage';
import { theme } from '../styles/theme';

const getFeedbackType = (feedback: string): 'success' | 'info' | 'error' => {
  if (feedback.includes('Good thrust') || feedback.includes('Perfect')) return 'success';
  if (feedback.includes('Reduce pressure') || feedback.includes('Risk of injury')) return 'error';
  return 'info';
};

export default function TrainingScreen() {
  const router = useRouter();
  // Use the real bluetooth data hook
  const data = useBluetoothTrainingData(false);

  // Add a local timer since the hook doesn't provide it
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (data.isConnected) {
      const timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data.isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleComplete = () => {
    // End session and save data
    const sessionData = sessionStorage.endSession();
    console.log('[Training] Session completed:', sessionData);
    router.push('/analytics');
  };

  const feedbackMessage = data.feedback || "Waiting for vest data...";
  const feedbackType = getFeedbackType(feedbackMessage);

  // Adjusted target range for current calibration (will be refined)
  const targetMin = 20; // N (Newtons) - adjusted for prototype
  const targetMax = 60; // N (Newtons) - adjusted for prototype

  return (
    <View style={styles.container}>
      <StatusHeader isConnected={data.isConnected} batteryLevel={87} duration={formatDuration(duration)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Hand Position</Text>
          <HeatmapModule position={data.handPosition} force={data.compressionDepth} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Thrust Force</Text>
          <ForceGauge force={data.compressionDepth} targetMin={targetMin} targetMax={targetMax} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Live Feedback</Text>
          <FeedbackCard message={feedbackMessage} type={feedbackType} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Session Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Thrusts</Text>
              <Text style={styles.statValue}>{data.thrusts}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Rate</Text>
              <Text style={styles.statValue}>{data.compressionRate}/min</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Peak Force</Text>
              <Text style={styles.statValue}>{data.compressionDepth.toFixed(0)}N</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>
      <DevBypassButton nextScreen="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 135, paddingBottom: 150, paddingHorizontal: theme.spacing.md, gap: theme.spacing.lg },
  module: { gap: theme.spacing.sm },
  moduleTitle: { ...theme.typography.h3, color: theme.colors.text.primary, paddingHorizontal: 4, marginBottom: theme.spacing.sm },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  completeButton: { backgroundColor: theme.colors.success, height: 60, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.md, ...theme.shadows.lg },
  completeButtonText: { ...theme.typography.bodySemibold, color: theme.colors.text.inverse },
});