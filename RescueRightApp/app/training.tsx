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

// Function to generate feedback based on metrics for Heimlich maneuver
const getFeedback = (metrics: any) => {
  const { compressionDepth, compressionRate, handPosition, recoilComplete } = metrics;
  // Heimlich maneuver feedback - force range 80-120N optimal
  if (compressionDepth < 40) return "Apply more force. Aim for quick, upward thrusts.";
  if (compressionDepth > 70) return "Too forceful. Risk of injury - reduce force.";
  if (compressionRate < 90) return "Increase thrust frequency. Aim for sustained rhythm.";
  if (compressionRate > 130) return "Too fast. Maintain controlled, deliberate thrusts.";
  if (handPosition !== 'correct') return "Adjust hand position to just above navel, below ribcage.";
  if (!recoilComplete) return "Release completely between thrusts. Allow chest to expand.";
  return "Excellent Heimlich technique. Maintain this form!";
};

const getFeedbackType = (feedback: string): 'success' | 'info' | 'error' => {
  if (feedback.startsWith("Excellent")) return 'success';
  if (feedback.includes("Too forceful") || feedback.includes("Too fast") || feedback.includes("Risk of injury")) return 'error';
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

  // Define target range for Heimlich thrust force
  const targetMin = 80; // N (Newtons)
  const targetMax = 120; // N (Newtons)

  return (
    <View style={styles.container}>
      <StatusHeader isConnected={true} batteryLevel={87} duration={duration} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Hand Position</Text>
          <HeatmapModule position={metrics.handPosition} force={metrics.compressionDepth} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Thrust Force</Text>
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
      <MetricsStrip thrusts={compressions} avgForce={metrics.compressionDepth} accuracy={metrics.compressionRate} />
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