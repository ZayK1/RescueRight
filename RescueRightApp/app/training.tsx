import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusHeader } from '../components/training/StatusHeader';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { ForceGauge } from '../components/training/ForceGauge';
import { FeedbackCard } from '../components/training/FeedbackCard';

import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';
import { sessionStorage } from '../lib/sessionStorage';
import { TARGET_FORCE, POSITION_TARGET } from '../lib/vestCalibration';
import { theme } from '../styles/theme';

const getFeedbackType = (feedback: string): 'success' | 'info' | 'error' | 'warning' => {
  if (feedback.includes('✓') || feedback.includes('expelled') || feedback.includes('🎉')) return 'success';
  if (feedback.includes('⚠') || feedback.includes('Too much force')) return 'error';
  if (feedback.includes('Push harder') || feedback.includes('Move hands')) return 'warning';
  return 'info';
};

const getPositionStatus = (position: { x: number; y: number }): 'correct' | 'too-high' | 'too-low' | 'too-left' | 'too-right' => {
  const targetX = POSITION_TARGET.x;
  const targetY = POSITION_TARGET.y;
  const threshold = 0.04; // 4% display threshold so demo movements are visible

  const xDiff = position.x - targetX;
  const yDiff = position.y - targetY;

  // Check if within acceptable range
  if (Math.abs(xDiff) < threshold && Math.abs(yDiff) < threshold) {
    return 'correct';
  }

  // Determine primary direction of error
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    return xDiff > 0 ? 'too-right' : 'too-left';
  } else {
    return yDiff > 0 ? 'too-low' : 'too-high';
  }
};

export default function TrainingScreen() {
  const router = useRouter();
  // ?mock=1 (from the home-screen self-test button) runs the whole flow on
  // simulated sensor data, so the app can be verified without the vest.
  const { mock } = useLocalSearchParams<{ mock?: string }>();
  const useMock = mock === '1';
  const data = useBluetoothTrainingData(useMock);

  // Session is "active" when connected to the vest OR running the mock self-test.
  const active = data.isConnected || useMock;

  // Add a local timer since the hook doesn't provide it
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (active && !startTime) {
      setStartTime(Date.now());
    }
  }, [active, startTime]);

  useEffect(() => {
    if (active && startTime) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [active, startTime]);

  // Log data updates for debugging (throttled)
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.isConnected) {
        const posStatus = getPositionStatus(data.handPosition);
        console.log('[Training UI Update]', {
          force: data.force?.toFixed(1) + 'N',
          thrusts: data.thrusts,
          rate: data.compressionRate + '/min',
          position: `(${data.handPosition?.x?.toFixed(2)}, ${data.handPosition?.y?.toFixed(2)})`,
          positionStatus: posStatus,
          angle: data.angle?.toFixed(1) + '°',
        });
      }
    }, 3000); // Log every 3 seconds

    return () => clearInterval(interval);
  }, [data]);

  const handleComplete = () => {
    // End session and save data
    const sessionData = sessionStorage.endSession();
    console.log('[Training] Session completed:', sessionData);
    router.push('/analytics');
  };

  const feedbackMessage = data.feedback || "Waiting for vest data...";
  const feedbackType = getFeedbackType(feedbackMessage);

  // Clinical training band (see lib/vestCalibration.ts) — single source of truth.
  const targetMin = TARGET_FORCE.min; // 40 N
  const targetMax = TARGET_FORCE.max; // 65 N

  return (
    <View style={styles.container}>
      <StatusHeader
        isConnected={data.isConnected}
        demoMode={useMock}
        batteryLevel={87}
        duration={duration}
        showBypass={true}
        onBypass={() => router.push('/analytics')}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Hand Position</Text>
          <HeatmapModule position={getPositionStatus(data.handPosition)} force={data.force} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Thrust Force</Text>
          <ForceGauge force={data.force} targetMin={targetMin} targetMax={targetMax} />
        </View>
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Live Feedback</Text>
          <FeedbackCard message={feedbackMessage} type={feedbackType} />
        </View>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Stats Bar */}
      <View style={styles.floatingStatsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statItemValue}>{data.thrusts}</Text>
          <Text style={styles.statItemLabel}>Thrusts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statItemValue}>{data.compressionRate}</Text>
          <Text style={styles.statItemLabel}>Rate/min</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statItemValue}>{data.force.toFixed(0)}N</Text>
          <Text style={styles.statItemLabel}>Peak Force</Text>
        </View>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 135, paddingBottom: 100, paddingHorizontal: theme.spacing.md, gap: theme.spacing.lg },
  module: { gap: theme.spacing.sm },
  moduleTitle: { ...theme.typography.h3, color: theme.colors.text.primary, paddingHorizontal: 4, marginBottom: theme.spacing.sm },
  completeButton: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.lg
  },
  completeButtonText: { ...theme.typography.bodySemibold, color: theme.colors.text.inverse },

  // Floating Stats Bar
  floatingStatsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});
