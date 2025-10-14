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
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingTop: 130,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  accentBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#0284C7',
    marginRight: 12,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  accentBarGreen: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  headerTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.inverse,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
    fontSize: 16,
  },
});
