import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withSpring } from 'react-native-reanimated';
import { Zap, Target } from 'lucide-react-native';
import { theme } from '../../styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GAUGE_SIZE = 240;
const STROKE_WIDTH = 24;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ForceGaugeProps {
  force: number;
  targetMin: number;
  targetMax: number;
}

export function ForceGauge({ force, targetMin, targetMax }: ForceGaugeProps) {
  const progress = useSharedValue(0);

  // Peak hold state - holds the displayed force value
  const [displayedForce, setDisplayedForce] = useState(0);
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastForceTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    // If new force is detected
    if (force > 0) {
      // Update displayed force immediately if it's higher
      if (force > displayedForce) {
        setDisplayedForce(force);
      }
      lastForceTimeRef.current = now;

      // Clear any existing decay timer
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
        decayIntervalRef.current = null;
      }
    } else {
      // Force is 0 - start decay after 500ms hold time
      const timeSinceLastForce = now - lastForceTimeRef.current;

      if (timeSinceLastForce > 500 && !decayIntervalRef.current) {
        // Start gradual decay - reduce by 10% every 100ms
        decayIntervalRef.current = setInterval(() => {
          setDisplayedForce(prev => {
            const newValue = prev * 0.9; // Decay by 10%
            if (newValue < 1) {
              // Stop decay when very close to 0
              if (decayIntervalRef.current) {
                clearInterval(decayIntervalRef.current);
                decayIntervalRef.current = null;
              }
              return 0;
            }
            return newValue;
          });
        }, 100); // Update every 100ms for smooth decay
      }
    }

    // Cleanup on unmount
    return () => {
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
      }
    };
  }, [force, displayedForce]);

  // Update progress animation based on displayed force
  useEffect(() => {
    const normalizedProgress = Math.min(Math.max(displayedForce / 200, 0), 1);
    progress.value = withSpring(normalizedProgress, {
      damping: 15,
      stiffness: 80,
    });
  }, [displayedForce]);

  const animatedProps = useAnimatedProps(() => {
    // Start from bottom-left, fill clockwise to bottom-right
    const offset = CIRCUMFERENCE / 8; // Start position (bottom-left)
    const arcLength = (CIRCUMFERENCE * 270) / 360; // 270 degree arc length
    const strokeDashoffset = offset + arcLength - (arcLength * progress.value);

    return { strokeDashoffset };
  });

  const getStatus = () => {
    if (displayedForce < 60) return { text: 'Too Low', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    if (displayedForce < targetMin) return { text: 'Low', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    if (displayedForce <= targetMax) return { text: 'Optimal', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    if (displayedForce <= 150) return { text: 'High', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Too High', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Zap size={16} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Compression Force</Text>
        </View>
        <View style={styles.targetBadge}>
          <Target size={11} color="#10B981" strokeWidth={2} />
          <Text style={styles.targetText}>{targetMin}-{targetMax}N optimal</Text>
        </View>
      </View>

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}>
          <Defs>
            <LinearGradient id="optimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#6BCF7F" stopOpacity="1" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFD93D" stopOpacity="1" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
              <Stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background Track */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke="rgba(0, 0, 0, 0.04)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${(CIRCUMFERENCE * 270) / 360} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE / 8}
            strokeLinecap="round"
          />

          {/* Animated Progress */}
          <AnimatedCircle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={status.color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${(CIRCUMFERENCE * 270) / 360} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE / 8}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>

        {/* Center Display */}
        <View style={styles.centerDisplay}>
          <Text style={styles.forceValue}>{Math.round(displayedForce)}</Text>
          <Text style={styles.forceUnit}>Newtons</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
      </View>

      {/* Tip for calibration */}
      {force === 0 && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>💡 Apply pressure to see real-time force</Text>
        </View>
      )}
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
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667EEA',
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
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forceValue: {
    fontSize: 58,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 64,
  },
  forceUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginTop: -4,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  tipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
