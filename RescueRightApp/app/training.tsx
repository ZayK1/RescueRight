import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusHeader } from '../components/training/StatusHeader';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { ForceGauge } from '../components/training/ForceGauge';
import { FeedbackCard } from '../components/training/FeedbackCard';
import { MetricsStrip } from '../components/training/MetricsStrip';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';
import { theme } from '../styles/theme';

const getFeedbackType = (feedback: string): 'success' | 'info' | 'error' => {
  if (feedback.startsWith("Excellent")) return 'success';
  if (feedback.includes("Too forceful") || feedback.includes("Too fast") || feedback.includes("Risk of injury")) return 'error';
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
    router.push('/analytics');
  };

  const feedbackMessage = data.feedback || "Waiting for vest data...";
  const feedbackType = getFeedbackType(feedbackMessage);

  // Define target range for Heimlich thrust force
  const targetMin = 80; // N (Newtons)
  const targetMax = 120; // N (Newtons)

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
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>
      <MetricsStrip thrusts={data.thrusts} avgForce={data.compressionDepth} accuracy={data.compressionRate} />
      <DevBypassButton nextScreen="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 135, paddingBottom: 150, paddingHorizontal: theme.spacing.md, gap: theme.spacing.lg },
  module: { gap: theme.spacing.sm },
  moduleTitle: { ...theme.typography.h3, color: theme.colors.text.primary, paddingHorizontal: 4, marginBottom: theme.spacing.sm },
  completeButton: { backgroundColor: theme.colors.success, height: 60, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.md, ...theme.shadows.lg },
  completeButtonText: { ...theme.typography.bodySemibold, color: theme.colors.text.inverse },
});