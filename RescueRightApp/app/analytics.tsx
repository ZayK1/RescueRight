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
    forceConsistency: 85, // Placeholder
    positionAccuracy: mockSessionSummary.correctTechnique,
    angleAccuracy: 88, // Placeholder
    feedback: [ // Create some mock feedback
      { type: 'success', message: 'Excellent compression depth', detail: `Maintained an average of ${mockSessionSummary.averageDepth}mm.` },
      { type: 'warning', message: 'Compression rate slightly fast', detail: `Average rate was ${mockSessionSummary.averageRate} CPM.` },
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingTop: 120, paddingBottom: 40, paddingHorizontal: 24, gap: 32 },
  section: { gap: 16 },
  sectionTitle: { ...theme.typography.h3 },
  actions: { gap: 12, marginTop: 16 },
  button: { height: 56, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  primaryButton: { backgroundColor: theme.colors.primary, ...theme.shadows.md },
  primaryButtonText: { ...theme.typography.body, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', ...theme.shadows.sm },
  secondaryButtonText: { ...theme.typography.body, fontWeight: '600', color: theme.colors.primary },
});