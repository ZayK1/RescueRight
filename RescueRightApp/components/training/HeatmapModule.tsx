import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withRepeat, withSequence, interpolate } from 'react-native-reanimated';
import { Activity, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '../../styles/theme';

interface HeatmapModuleProps {
  position: 'correct' | 'too-high' | 'too-low' | 'too-left' | 'too-right';
  force: number;
}

export function HeatmapModule({ position, force }: HeatmapModuleProps) {
  const offsetY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulseAnim = useSharedValue(0);

  // Peak hold state for position and force
  const [displayedPosition, setDisplayedPosition] = useState<typeof position>(position);
  const [displayedForce, setDisplayedForce] = useState(0);
  const decayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Peak-hold mechanism: update displayed values immediately, then decay after hold time
  useEffect(() => {
    const now = Date.now();

    // If force is detected, update immediately
    if (force > 0) {
      setDisplayedPosition(position);
      setDisplayedForce(force);
      lastUpdateTimeRef.current = now;

      // Clear any existing decay timer
      if (decayTimeoutRef.current) {
        clearTimeout(decayTimeoutRef.current);
        decayTimeoutRef.current = null;
      }
    } else {
      // Force is 0 - start decay to 'correct' position after 1 second hold
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

      if (timeSinceLastUpdate > 1000 && !decayTimeoutRef.current) {
        // Gradually return to center position after 1 second
        decayTimeoutRef.current = setTimeout(() => {
          setDisplayedPosition('correct');
          setDisplayedForce(0);
          decayTimeoutRef.current = null;
        }, 800); // Additional 800ms before resetting
      }
    }

    return () => {
      if (decayTimeoutRef.current) {
        clearTimeout(decayTimeoutRef.current);
      }
    };
  }, [force, position]);

  // Animate based on displayed position (not raw position)
  useEffect(() => {
    const positionOffsets = {
      'too-high': { x: 0, y: -55 },
      'too-low': { x: 0, y: 55 },
      'too-left': { x: -55, y: 0 },
      'too-right': { x: 55, y: 0 },
      'correct': { x: 0, y: 0 },
    };

    const offset = positionOffsets[displayedPosition] || { x: 0, y: 0 };

    offsetY.value = withSpring(offset.y, {
      damping: 20,
      stiffness: 140,
    });

    offsetX.value = withSpring(offset.x, {
      damping: 20,
      stiffness: 140,
    });

    // Scale effect for correct positioning with gentle pulse
    if (displayedPosition === 'correct') {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });

      // Gentle pulse animation when correct
      pulseAnim.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 10, stiffness: 80 }),
          withSpring(0, { damping: 10, stiffness: 80 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 100,
      });
      pulseAnim.value = withSpring(0, { damping: 10, stiffness: 80 });
    }
  }, [displayedPosition]);

  const handAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: offsetY.value },
      { translateX: offsetX.value },
      { scale: scale.value },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(pulseAnim.value, [0, 1], [1, 1.08]);
    const opacityValue = interpolate(pulseAnim.value, [0, 1], [0.3, 0.15]);

    return {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };
  });

  const isCorrect = displayedPosition === 'correct';
  const handColor = isCorrect ? theme.colors.success : theme.colors.warning;
  const handStrokeColor = isCorrect ? '#059669' : '#D97706';

  const getAccuracy = () => {
    if (displayedPosition === 'correct' && displayedForce >= 80 && displayedForce <= 120) return 98;
    if (displayedPosition === 'correct') return 85;
    return 65;
  };

  const getDirectionArrow = () => {
    const arrowColor = theme.colors.warning;
    const iconSize = 24;
    const iconStroke = 3;

    switch (displayedPosition) {
      case 'too-high':
        return (
          <View style={[styles.directionArrow, styles.arrowAbove]}>
            <ArrowDown size={iconSize} color={arrowColor} strokeWidth={iconStroke} />
          </View>
        );
      case 'too-low':
        return (
          <View style={[styles.directionArrow, styles.arrowBelow]}>
            <ArrowUp size={iconSize} color={arrowColor} strokeWidth={iconStroke} />
          </View>
        );
      case 'too-left':
        return (
          <View style={[styles.directionArrow, styles.arrowLeft]}>
            <ArrowRight size={iconSize} color={arrowColor} strokeWidth={iconStroke} />
          </View>
        );
      case 'too-right':
        return (
          <View style={[styles.directionArrow, styles.arrowRight]}>
            <ArrowLeft size={iconSize} color={arrowColor} strokeWidth={iconStroke} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Activity size={16} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Hand Placement</Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Tracking</Text>
        </View>
      </View>

      {/* Hand Position Visualization */}
      <View style={styles.visualizationContainer}>
        {/* Target Area Background */}
        <View style={styles.targetArea}>
          {/* Concentric Target Rings */}
          <View style={[styles.targetRing, styles.targetRingOuter]} />
          <View style={[styles.targetRing, styles.targetRingMiddle]} />
          <View style={[styles.targetRing, styles.targetRingInner]} />

          {/* Center Optimal Zone with Pulse Effect */}
          <View style={styles.optimalZone}>
            {isCorrect && (
              <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />
            )}
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairHorizontal} />
          </View>

          {/* Hand Position Ghost (shows correct position) */}
          {!isCorrect && (
            <View style={styles.ghostHandsContainer}>
              <View style={styles.handsWrapper}>
                {/* Ghost Left Hand */}
                <Svg width="36" height="52" viewBox="0 0 36 52">
                  <Defs>
                    <RadialGradient id="ghostGradient" cx="50%" cy="50%">
                      <Stop offset="0%" stopColor={theme.colors.success} stopOpacity="0.15" />
                      <Stop offset="100%" stopColor={theme.colors.success} stopOpacity="0.05" />
                    </RadialGradient>
                  </Defs>
                  <Path
                    d="M 4 12 Q 4 4 12 4 L 24 4 Q 32 4 32 12 L 32 40 Q 32 48 24 48 L 12 48 Q 4 48 4 40 Z"
                    fill="url(#ghostGradient)"
                    stroke={theme.colors.success}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                </Svg>

                {/* Ghost Right Hand */}
                <Svg width="36" height="52" viewBox="0 0 36 52">
                  <Path
                    d="M 4 12 Q 4 4 12 4 L 24 4 Q 32 4 32 12 L 32 40 Q 32 48 24 48 L 12 48 Q 4 48 4 40 Z"
                    fill="url(#ghostGradient)"
                    stroke={theme.colors.success}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                </Svg>
              </View>
            </View>
          )}

          {/* Animated Hand Position (Current) */}
          <Animated.View style={[styles.handsContainer, handAnimatedStyle]}>
            <View style={styles.handsWrapper}>
              {/* Left Hand - SVG Palm */}
              <Svg width="36" height="52" viewBox="0 0 36 52">
                <Defs>
                  <RadialGradient id="palmGradient" cx="50%" cy="50%">
                    <Stop offset="0%" stopColor={handColor} stopOpacity="0.9" />
                    <Stop offset="100%" stopColor={handColor} stopOpacity="0.7" />
                  </RadialGradient>
                </Defs>
                {/* Palm Shape */}
                <Path
                  d="M 4 12 Q 4 4 12 4 L 24 4 Q 32 4 32 12 L 32 40 Q 32 48 24 48 L 12 48 Q 4 48 4 40 Z"
                  fill="url(#palmGradient)"
                  stroke={handStrokeColor}
                  strokeWidth="3"
                />
                {/* Palm Detail Line */}
                <Path
                  d="M 12 16 Q 18 20 12 36"
                  stroke={handStrokeColor}
                  strokeWidth="1.5"
                  opacity="0.4"
                  fill="none"
                />
              </Svg>

              {/* Gap for realism */}
              <View style={{ width: 4 }} />

              {/* Right Hand - SVG Palm */}
              <Svg width="36" height="52" viewBox="0 0 36 52">
                {/* Palm Shape */}
                <Path
                  d="M 4 12 Q 4 4 12 4 L 24 4 Q 32 4 32 12 L 32 40 Q 32 48 24 48 L 12 48 Q 4 48 4 40 Z"
                  fill="url(#palmGradient)"
                  stroke={handStrokeColor}
                  strokeWidth="3"
                />
                {/* Palm Detail Line */}
                <Path
                  d="M 24 16 Q 18 20 24 36"
                  stroke={handStrokeColor}
                  strokeWidth="1.5"
                  opacity="0.4"
                  fill="none"
                />
              </Svg>
            </View>
          </Animated.View>

          {/* Directional Arrows */}
          {getDirectionArrow()}
        </View>

        {/* Accuracy Badge */}
        <View style={styles.accuracyBadge}>
          <Text style={[styles.accuracyText, { color: isCorrect ? theme.colors.success : theme.colors.warning }]}>
            {getAccuracy()}%
          </Text>
          <Text style={styles.accuracyLabel}>accuracy</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={[styles.metric, styles.metricPurple]}>
          <Text style={styles.metricValue}>{displayedPosition === 'correct' ? '✓' : '⚠'}</Text>
          <Text style={styles.metricLabel}>Position</Text>
        </View>
        <View style={[styles.metric, styles.metricGreen]}>
          <Text style={styles.metricValue}>{Math.round(displayedForce)}N</Text>
          <Text style={styles.metricLabel}>Force</Text>
        </View>
        <View style={[styles.metric, styles.metricOrange]}>
          <Text style={styles.metricValue}>2.1s</Text>
          <Text style={styles.metricLabel}>Rhythm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
  },
  visualizationContainer: {
    height: 300,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetArea: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  targetRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 1000,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  targetRingOuter: {
    width: 240,
    height: 240,
  },
  targetRingMiddle: {
    width: 180,
    height: 180,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  targetRingInner: {
    width: 120,
    height: 120,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  optimalZone: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1.5,
    height: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 20,
    height: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  ghostHandsContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  handsContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  handsWrapper: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'center',
  },
  directionArrow: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: theme.colors.warning,
  },
  arrowAbove: {
    top: 35,
  },
  arrowBelow: {
    bottom: 35,
  },
  arrowLeft: {
    left: 35,
  },
  arrowRight: {
    right: 35,
  },
  accuracyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  accuracyLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  metricPurple: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  metricGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  metricOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
  },
});
