import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusHeader } from '../components/training/StatusHeader';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { ForceGauge } from '../components/training/ForceGauge';
import { FeedbackCard } from '../components/training/FeedbackCard';
import { MetricsStrip } from '../components/training/MetricsStrip';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { useTrainingData } from '../hooks/useTrainingData';
import { theme } from '../styles/theme';

// Function to generate feedback based on metrics
const getFeedback = (metrics) => {
  const { compressionDepth, compressionRate, handPosition, recoilComplete } = metrics;
  if (compressionDepth < 50) return "Push harder. Aim for 5-6 cm depth.";
  if (compressionDepth > 60) return "Too deep. Ease up slightly.";
  if (compressionRate < 100) return "Push faster. Aim for 100-120 compressions per minute.";
  if (compressionRate > 120) return "Too fast. Slow down your compressions.";
  if (handPosition !== 'correct') return "Adjust hand position to the center of the chest.";
  if (!recoilComplete) return "Allow for full chest recoil between compressions.";
  return "Excellent technique. Keep it up!";
};

const getFeedbackType = (feedback) => {
  if (feedback.startsWith("Excellent")) return 'success';
  if (feedback.includes("Too deep") || feedback.includes("Too fast")) return 'error';
  return 'info';
};

export default function TrainingScreen() {
  const router = useRouter();
  // Correctly use the data from the hook
  const { metrics, duration, compressions } = useTrainingData();

  const handleComplete = () => {
    router.push('/analytics');
  };

  const feedbackMessage = getFeedback(metrics);
  const feedbackType = getFeedbackType(feedbackMessage);

  // Define target range for compression depth
  const targetMin = 50; // mm
  const targetMax = 60; // mm

  return (
    <View style={styles.container}>
      <StatusHeader isConnected={true} batteryLevel={87} duration={duration} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Hand Position</Text>
          {/* Pass the correct props */}
          <HeatmapModule position={metrics.handPosition} force={metrics.compressionDepth} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Compression Depth</Text>
          {/* Map compressionDepth to the ForceGauge */}
          <ForceGauge force={metrics.compressionDepth} targetMin={targetMin} targetMax={targetMax} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Live Feedback</Text>
          <FeedbackCard message={feedbackMessage} type={feedbackType} />
        </View>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Map correct data to the MetricsStrip */}
      <MetricsStrip thrusts={compressions} avgForce={metrics.compressionDepth} accuracy={metrics.compressionRate} />
      <DevBypassButton nextScreen="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { paddingTop: 135, paddingBottom: 150, paddingHorizontal: 16, gap: 24 },
  module: { gap: 8 },
  moduleTitle: { ...theme.typography.h3, paddingHorizontal: 4, marginBottom: 4 },
  completeButton: { backgroundColor: theme.colors.primary, height: 56, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginTop: 16, ...theme.shadows.md },
  completeButtonText: { ...theme.typography.body, fontWeight: '600', color: '#FFFFFF' },
});