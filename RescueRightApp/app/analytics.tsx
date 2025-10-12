import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockSessionSummary } from '../lib/mockData'; // Correct import
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const handleNewSession = () => { router.push('/connect'); };
  const handleViewHistory = () => { console.log('View history'); };
  const handleDone = () => { router.push('/'); };

  // Adapt the imported data to the structure the components will expect
  const analyticsData = {
    overallScore: mockSessionSummary.score,
    duration: mockSessionSummary.duration,
    totalThrusts: mockSessionSummary.totalCompressions,
    effectiveThrusts: Math.round(mockSessionSummary.totalCompressions * (mockSessionSummary.correctTechnique / 100)),
    averageForce: mockSessionSummary.averageDepth,
    forceConsistency: 88, // Consistency metric
    positionAccuracy: mockSessionSummary.correctTechnique,
    angleAccuracy: 92, // Angle accuracy
    feedback: [ // Create feedback for Heimlich technique
      { type: 'success' as const, message: 'Optimal thrust force', detail: `Maintained an average of ${mockSessionSummary.averageDepth}N with excellent control.` },
      { type: 'success' as const, message: 'Perfect hand positioning', detail: `Consistently placed hands above navel, below ribcage.` },
      { type: 'warning' as const, message: 'Thrust rhythm slightly fast', detail: `Average rate was ${mockSessionSummary.averageRate} thrusts/min. Aim for more controlled rhythm.` },
    ]
  };

  return (
    <View style={styles.container}>
      <SessionNavigation onBack={handleDone} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroSuccessCard score={analyticsData.overallScore} duration={analyticsData.duration} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          <MetricsGrid data={analyticsData} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Assessment</Text>
          <TechniqueAnalysis feedback={analyticsData.feedback} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNewSession}>
            <Text style={styles.primaryButtonText}>Start New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleViewHistory}>
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <DevBypassButton nextScreen="index" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingTop: 120, paddingBottom: 40, paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xl },
  section: { gap: theme.spacing.md },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text.primary },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  button: { height: 60, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  primaryButton: { backgroundColor: theme.colors.primary, ...theme.shadows.lg },
  primaryButtonText: { ...theme.typography.bodySemibold, color: theme.colors.text.inverse },
  secondaryButton: { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.borderLight, ...theme.shadows.sm },
  secondaryButtonText: { ...theme.typography.bodySemibold, color: theme.colors.primary },
});