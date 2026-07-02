import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';

import { sessionStorage, SessionData } from '../lib/sessionStorage';
import { TARGET_FORCE } from '../lib/vestCalibration';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    // Get the most recent session data
    const session = sessionStorage.getCurrentSession();
    if (session && session.totalThrusts !== undefined) {
      // Convert to SessionData (prefer the stored duration if the session was
      // properly ended; only recompute for a still-active session)
      setSessionData({
        id: session.id!,
        startTime: session.startTime!,
        endTime: session.endTime ?? Date.now(),
        duration: session.duration ?? Math.floor((Date.now() - session.startTime!) / 1000),
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

  // Thrusts whose PEAK force landed in the 40–65N training band — the primary
  // per-thrust quality measure (a Heimlich is judged thrust by thrust, not on
  // average force).
  const countInBandThrusts = (): number => {
    if (!sessionData) return 0;
    return sessionData.thrustHistory.filter(
      (t) => t.force >= TARGET_FORCE.min && t.force <= TARGET_FORCE.max
    ).length;
  };

  // Median gap between consecutive thrusts (ms). Guidelines call for each
  // thrust to be a separate, distinct effort — not a rapid-fire push.
  const medianThrustGapMs = (): number | null => {
    if (!sessionData || sessionData.thrustHistory.length < 2) return null;
    const times = sessionData.thrustHistory.map((t) => t.timestamp);
    const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
    return gaps[Math.floor(gaps.length / 2)];
  };

  /**
   * Session score, weighted by what defines a correct thrust per the study
   * protocol (position, force, consistency) plus completing a full sequence:
   *   - 40 pts: % of thrusts with peak force inside the 40–65N band
   *   - 30 pts: hand-position accuracy
   *   - 20 pts: thrust-to-thrust force consistency
   *   - 10 pts: completed a full rescue sequence (≥5 thrusts, per guidelines'
   *             cycles of 5 abdominal thrusts)
   */
  const calculateScore = (): number => {
    if (!sessionData || sessionData.totalThrusts === 0) return 0;

    const inBandPct = (countInBandThrusts() / sessionData.totalThrusts) * 100;

    let score = 0;
    score += (inBandPct / 100) * 40;
    score += (sessionData.positionAccuracy / 100) * 30;
    score += (calculateForceConsistency() / 100) * 20;
    score += Math.min(1, sessionData.totalThrusts / 5) * 10;

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
    const inBand = countInBandThrusts();
    const total = sessionData.totalThrusts;
    const inBandPct = total > 0 ? Math.round((inBand / total) * 100) : 0;

    // Force feedback — judged per thrust against the 40–65N training band
    if (inBandPct >= 75) {
      feedback.push({
        type: 'success',
        message: 'Excellent force control',
        detail: `${inBand} of ${total} thrusts landed in the ${TARGET_FORCE.min}–${TARGET_FORCE.max}N target band. Strong enough to clear the airway, controlled enough to be safe.`
      });
    } else {
      const weak = sessionData.thrustHistory.filter((t) => t.force < TARGET_FORCE.min).length;
      const strong = sessionData.thrustHistory.filter((t) => t.force > TARGET_FORCE.max).length;
      if (strong > weak) {
        feedback.push({
          type: strong > total / 2 ? 'error' : 'warning',
          message: 'Reduce excessive force',
          detail: `${strong} of ${total} thrusts exceeded ${TARGET_FORCE.max}N. Excessive force risks internal injury — especially in elderly patients. Aim for the ${TARGET_FORCE.min}–${TARGET_FORCE.max}N band.`
        });
      } else {
        feedback.push({
          type: 'warning',
          message: 'Increase thrust force',
          detail: `${weak} of ${total} thrusts were below ${TARGET_FORCE.min}N — likely too weak to dislodge an obstruction. Drive inward and upward with more commitment.`
        });
      }
    }

    // Position feedback
    if (sessionData.positionAccuracy >= 80) {
      feedback.push({
        type: 'success',
        message: 'Excellent hand positioning',
        detail: `${sessionData.positionAccuracy}% placement accuracy — consistently above the navel and below the ribcage.`
      });
    } else if (sessionData.positionAccuracy >= 60) {
      feedback.push({
        type: 'warning',
        message: 'Improve hand positioning',
        detail: `${sessionData.positionAccuracy}% accuracy. Place the fist midline, just above the navel and well below the breastbone.`
      });
    } else {
      feedback.push({
        type: 'error',
        message: 'Hand position needs attention',
        detail: `Only ${sessionData.positionAccuracy}% accuracy. Misplaced thrusts are less effective and raise injury risk — review correct landmarking.`
      });
    }

    // Rhythm feedback — guidelines call for each thrust to be a separate,
    // distinct effort (not a continuous or rapid-fire push)
    const gap = medianThrustGapMs();
    if (gap !== null) {
      if (gap < 700) {
        feedback.push({
          type: 'warning',
          message: 'Deliver thrusts as distinct efforts',
          detail: `Median gap between thrusts was ${(gap / 1000).toFixed(1)}s. Fully release between thrusts — each one should be a separate, deliberate movement.`
        });
      } else if (gap <= 3000) {
        feedback.push({
          type: 'success',
          message: 'Good thrust rhythm',
          detail: `Distinct, deliberate thrusts ~${(gap / 1000).toFixed(1)}s apart, with full release between each — exactly as guidelines describe.`
        });
      } else {
        feedback.push({
          type: 'warning',
          message: 'Reduce pauses between thrusts',
          detail: `Median gap was ${(gap / 1000).toFixed(1)}s. In a real emergency every second counts — repeat thrusts promptly until the obstruction clears.`
        });
      }
    }

    // Consistency feedback
    const consistency = calculateForceConsistency();
    if (consistency >= 80) {
      feedback.push({
        type: 'success',
        message: 'Excellent force consistency',
        detail: `${consistency}% consistency shows controlled, repeatable technique.`
      });
    } else if (consistency < 60 && total >= 2) {
      feedback.push({
        type: 'warning',
        message: 'Improve thrust consistency',
        detail: `${consistency}% consistency. Focus on applying similar force with each thrust.`
      });
    }

    return feedback;
  };

  const analyticsData = sessionData ? {
    overallScore: calculateScore(),
    duration: sessionData.duration,
    totalThrusts: sessionData.totalThrusts,
    // "Effective" = peak force inside the 40–65N training band
    effectiveThrusts: countInBandThrusts(),
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
    backgroundColor: theme.colors.primary,
    ...theme.shadows.lg,
    shadowColor: theme.colors.primary,
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
