import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockSessionSummary } from '../lib/mockData';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const handleNewSession = () => { router.push('/connect'); };
  const handleViewHistory = () => { console.log('View history'); };
  const handleDone = () => { router.push('/'); };

  const analyticsData = {
    overallScore: mockSessionSummary.score,
    duration: mockSessionSummary.duration,
    totalThrusts: mockSessionSummary.totalCompressions,
    effectiveThrusts: Math.round(mockSessionSummary.totalCompressions * (mockSessionSummary.correctTechnique / 100)),
    averageForce: mockSessionSummary.averageDepth,
    forceConsistency: 88,
    positionAccuracy: mockSessionSummary.correctTechnique,
    angleAccuracy: 92,
    feedback: [
      { type: 'success' as const, message: 'Optimal thrust force', detail: `Maintained an average of ${mockSessionSummary.averageDepth}N with excellent control.` },
      { type: 'success' as const, message: 'Perfect hand positioning', detail: `Consistently placed hands above navel, below ribcage.` },
      { type: 'warning' as const, message: 'Thrust rhythm slightly fast', detail: `Average rate was ${mockSessionSummary.averageRate} thrusts/min. Aim for more controlled rhythm.` },
    ]
  };

  return (
    <View style={styles.container}>
      <SessionNavigation onBack={handleDone} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Card */}
        <View style={styles.section}>
          <HeroSuccessCard score={analyticsData.overallScore} duration={analyticsData.duration} />
        </View>

        {/* Performance Analytics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Performance Analytics</Text>
              <Text style={styles.sectionSubtitle}>Real-time assessment metrics</Text>
            </View>
          </View>
          <MetricsGrid data={analyticsData} />
        </View>

        {/* Clinical Assessment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.accentBar, styles.accentBarGreen]} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.sectionTitle}>Clinical Assessment</Text>
              <Text style={styles.sectionSubtitle}>Technique evaluation and recommendations</Text>
            </View>
          </View>
          <TechniqueAnalysis feedback={analyticsData.feedback} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNewSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewHistory}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DevBypassButton nextScreen="index" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  accentBar: {
    width: 5,
    height: 28,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  accentBarGreen: {
    backgroundColor: theme.colors.success,
    shadowColor: theme.colors.success,
  },
  headerTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: 20,
    paddingBottom: theme.spacing.lg,
  },
  button: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.lg,
    shadowColor: theme.colors.success,
    shadowOpacity: 0.35,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
});
