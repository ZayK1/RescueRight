import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';

import { sessionStorage, SessionData } from '../lib/sessionStorage';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    // Get the most recent session data
    const session = sessionStorage.getCurrentSession();
    if (session && session.totalThrusts !== undefined) {
      // Convert to SessionData
      setSessionData({
        id: session.id!,
        startTime: session.startTime!,
        endTime: Date.now(),
        duration: Math.floor((Date.now() - session.startTime!) / 1000),
        totalThrusts: session.totalThrusts!,
        averageForce: session.averageForce!,
        maxForce: session.maxForce!,
        averageRate: session.averageRate!,
        thrustHistory: session.thrustHistory!,
        positionAccuracy: session.positionAccuracy!,
      });
    }
  }, []);

  const handleNewSession = () => { router.push('/connect'); };
  const handleViewHistory = () => { console.log('View history'); };
  const handleDone = () => { router.push('/'); };

  // Calculate score based on real data
  const calculateScore = (): number => {
    if (!sessionData) return 0;

    let score = 0;

    // Force quality (40 points)
    const targetForce = { min: 20, max: 60 };
    if (sessionData.averageForce >= targetForce.min && sessionData.averageForce <= targetForce.max) {
      score += 40;
    } else if (sessionData.averageForce > 0) {
      const deviation = sessionData.averageForce < targetForce.min
        ? (targetForce.min - sessionData.averageForce) / targetForce.min
        : (sessionData.averageForce - targetForce.max) / targetForce.max;
      score += Math.max(0, 40 - deviation * 40);
    }

    // Position accuracy (30 points)
    score += (sessionData.positionAccuracy / 100) * 30;

    // Rate consistency (20 points) - ideal rate is around 5 thrusts/min
    const targetRate = 5;
    const rateDeviation = Math.abs(sessionData.averageRate - targetRate);
    const rateScore = Math.max(0, 20 - rateDeviation * 2);
    score += rateScore;

    // Completion (10 points) - at least 3 thrusts
    if (sessionData.totalThrusts >= 3) {
      score += 10;
    } else {
      score += (sessionData.totalThrusts / 3) * 10;
    }

    return Math.round(Math.min(100, score));
  };

  // Calculate force consistency from thrust history
  const calculateForceConsistency = (): number => {
    if (!sessionData || sessionData.thrustHistory.length < 2) return 0;

    const forces = sessionData.thrustHistory.map(t => t.force);
    const avgForce = forces.reduce((sum, f) => sum + f, 0) / forces.length;

    // Calculate standard deviation
    const squaredDiffs = forces.map(f => Math.pow(f - avgForce, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / forces.length;
    const stdDev = Math.sqrt(variance);

    // Convert to consistency percentage (lower std dev = higher consistency)
    // Assume std dev of 10N = 50% consistency, 0N = 100%
    const consistency = Math.max(0, 100 - (stdDev / 10) * 50);
    return Math.round(consistency);
  };

  // Calculate angle accuracy from thrust history
  const calculateAngleAccuracy = (): number => {
    if (!sessionData || sessionData.thrustHistory.length === 0) return 0;

    // Target angle for Heimlich is roughly 45° upward (negative in our system)
    const targetAngle = -45;
    const angleThreshold = 20; // ±20° is acceptable

    const accurateAngles = sessionData.thrustHistory.filter(t => {
      const angleDiff = Math.abs(t.angle - targetAngle);
      return angleDiff <= angleThreshold;
    });

    return Math.round((accurateAngles.length / sessionData.thrustHistory.length) * 100);
  };

  const generateFeedback = () => {
    if (!sessionData) return [];

    const feedback: Array<{ type: 'success' | 'warning' | 'error'; message: string; detail: string }> = [];

    // Force feedback
    const targetForce = { min: 20, max: 60 };
    if (sessionData.averageForce >= targetForce.min && sessionData.averageForce <= targetForce.max) {
      feedback.push({
        type: 'success',
        message: 'Excellent force control',
        detail: `Average force of ${sessionData.averageForce.toFixed(1)}N is within optimal range (${targetForce.min}-${targetForce.max}N).`
      });
    } else if (sessionData.averageForce < targetForce.min && sessionData.averageForce > 0) {
      feedback.push({
        type: 'warning',
        message: 'Increase thrust force',
        detail: `Average force was ${sessionData.averageForce.toFixed(1)}N. Target range is ${targetForce.min}-${targetForce.max}N for effective thrusts.`
      });
    } else if (sessionData.averageForce > targetForce.max) {
      feedback.push({
        type: 'warning',
        message: 'Reduce excessive force',
        detail: `Average force was ${sessionData.averageForce.toFixed(1)}N. Stay within ${targetForce.min}-${targetForce.max}N to avoid injury risk.`
      });
    }

    // Position feedback
    if (sessionData.positionAccuracy >= 80) {
      feedback.push({
        type: 'success',
        message: 'Excellent hand positioning',
        detail: `${sessionData.positionAccuracy}% of thrusts were in the optimal zone. Great consistency!`
      });
    } else if (sessionData.positionAccuracy >= 60) {
      feedback.push({
        type: 'warning',
        message: 'Improve hand positioning',
        detail: `${sessionData.positionAccuracy}% accuracy. Focus on placing hands in the center of the target area.`
      });
    } else {
      feedback.push({
        type: 'error',
        message: 'Hand position needs attention',
        detail: `Only ${sessionData.positionAccuracy}% accuracy. Review proper hand placement technique.`
      });
    }

    // Rate feedback
    const targetRate = 5;
    if (sessionData.averageRate >= targetRate - 2 && sessionData.averageRate <= targetRate + 2) {
      feedback.push({
        type: 'success',
        message: 'Good rhythm maintained',
        detail: `Average rate of ${sessionData.averageRate.toFixed(0)} thrusts/min is appropriate for Heimlich maneuver.`
      });
    } else if (sessionData.averageRate > targetRate + 2) {
      feedback.push({
        type: 'warning',
        message: 'Slow down your rhythm',
        detail: `Rate of ${sessionData.averageRate.toFixed(0)} thrusts/min is too fast. Aim for controlled, deliberate thrusts.`
      });
    } else if (sessionData.averageRate > 0) {
      feedback.push({
        type: 'warning',
        message: 'Increase thrust frequency',
        detail: `Rate of ${sessionData.averageRate.toFixed(0)} thrusts/min is too slow. Aim for ${targetRate} thrusts per minute.`
      });
    }

    // Consistency feedback
    const consistency = calculateForceConsistency();
    if (consistency >= 80) {
      feedback.push({
        type: 'success',
        message: 'Excellent force consistency',
        detail: `${consistency}% consistency shows controlled, repeatable technique.`
      });
    } else if (consistency < 60) {
      feedback.push({
        type: 'warning',
        message: 'Improve thrust consistency',
        detail: `${consistency}% consistency. Focus on applying similar force for each thrust.`
      });
    }

    return feedback;
  };

  const analyticsData = sessionData ? {
    overallScore: calculateScore(),
    duration: sessionData.duration,
    totalThrusts: sessionData.totalThrusts,
    effectiveThrusts: Math.round(sessionData.totalThrusts * (sessionData.positionAccuracy / 100)),
    averageForce: parseFloat(sessionData.averageForce.toFixed(1)),
    forceConsistency: calculateForceConsistency(), // Real calculation
    positionAccuracy: sessionData.positionAccuracy,
    angleAccuracy: calculateAngleAccuracy(), // Real calculation
    feedback: generateFeedback()
  } : {
    overallScore: 0,
    duration: 0,
    totalThrusts: 0,
    effectiveThrusts: 0,
    averageForce: 0,
    forceConsistency: 0,
    positionAccuracy: 0,
    angleAccuracy: 0,
    feedback: [{
      type: 'warning' as const,
      message: 'No session data available',
      detail: 'Complete a training session to see your analytics.'
    }]
  };

  return (
    <View style={styles.container}>
      <SessionNavigation
        onBack={handleDone}
        showBypass={true}
        onBypass={() => router.push('/')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Card */}
        <View style={styles.section}>
          <HeroSuccessCard 
            score={analyticsData.overallScore} 
            duration={analyticsData.duration} 
            thrustHistory={sessionData?.thrustHistory || []} 
          />
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

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.md,
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
