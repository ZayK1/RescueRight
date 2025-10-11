import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockAnalyticsData } from '../lib/mockData';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const handleNewSession = () => { router.push('/connect'); };
  const handleViewHistory = () => { console.log('View history'); };
  const handleDone = () => { router.push('/'); };

  return (
    <View style={styles.container}>
      <SessionNavigation onBack={handleDone} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroSuccessCard score={mockAnalyticsData.overallScore} duration={mockAnalyticsData.duration} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          <MetricsGrid data={mockAnalyticsData} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Assessment</Text>
          <TechniqueAnalysis feedback={mockAnalyticsData.feedback} />
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