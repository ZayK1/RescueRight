import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TrainingHeader } from '../components/training/TrainingHeader';
import { MetricsStrip } from '../components/training/MetricsStrip';
import { ForceGauge } from '../components/training/ForceGauge';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { FeedbackCard } from '../components/training/FeedbackCard';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { useTrainingData } from '../hooks/useTrainingData';
import { theme } from '../styles/theme';

export default function TrainingScreen() {
  const router = useRouter();
  const { metrics, duration, compressions, endSession } = useTrainingData();

  const handleEndSession = () => {
    Alert.alert(
      'End Training Session?',
      'Your progress will be saved and you can review your performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            endSession();
            router.push('/analytics');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TrainingHeader duration={duration} onEndSession={handleEndSession} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Metrics */}
        <MetricsStrip
          depth={metrics.compressionDepth}
          rate={metrics.compressionRate}
          compressions={compressions}
        />

        {/* Force Gauge */}
        <ForceGauge depth={metrics.compressionDepth} />

        {/* Hand Position Heatmap */}
        <HeatmapModule handPosition={metrics.handPosition} />

        {/* Real-time Feedback */}
        <FeedbackCard
          handPosition={metrics.handPosition}
          recoilComplete={metrics.recoilComplete}
        />
      </ScrollView>

      <DevBypassButton nextScreen="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
});
