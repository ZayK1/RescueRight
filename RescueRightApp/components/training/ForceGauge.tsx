import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface ForceGaugeProps {
  depth: number; // Current depth in mm
  targetMin?: number; // Target range minimum
  targetMax?: number; // Target range maximum
}

export function ForceGauge({ depth, targetMin = 50, targetMax = 60 }: ForceGaugeProps) {
  const maxDepth = 80; // Maximum scale in mm
  const gaugeWidth = Dimensions.get('window').width - 48;

  const progress = useSharedValue(0);

  useEffect(() => {
    const percentage = Math.min((depth / maxDepth) * 100, 100);
    progress.value = withSpring(percentage, { damping: 15 });
  }, [depth]);

  const fillStyle = useAnimatedStyle(() => {
    const isInTarget = depth >= targetMin && depth <= targetMax;
    const isClose = depth >= targetMin - 10 && depth <= targetMax + 10;

    let color = theme.colors.destructive;
    if (isInTarget) color = theme.colors.success;
    else if (isClose) color = theme.colors.warning;

    return {
      width: `${progress.value}%`,
      backgroundColor: color,
    };
  });

  const targetStartPercent = (targetMin / maxDepth) * 100;
  const targetWidthPercent = ((targetMax - targetMin) / maxDepth) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Compression Force</Text>
        <Text style={styles.depthValue}>
          {depth} <Text style={styles.unit}>mm</Text>
        </Text>
      </View>

      <View style={styles.gaugeContainer}>
        {/* Target zone indicator */}
        <View
          style={[
            styles.targetZone,
            {
              left: `${targetStartPercent}%`,
              width: `${targetWidthPercent}%`,
            },
          ]}
        />

        {/* Track */}
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>

        {/* Scale markers */}
        <View style={styles.scaleContainer}>
          <Text style={styles.scaleText}>0</Text>
          <Text style={styles.scaleText}>
            {targetMin}-{targetMax} mm
          </Text>
          <Text style={styles.scaleText}>{maxDepth}</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        {depth < targetMin && 'Press deeper'}
        {depth >= targetMin && depth <= targetMax && 'Perfect depth!'}
        {depth > targetMax && 'Too deep'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
  },
  depthValue: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  gaugeContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  targetZone: {
    position: 'absolute',
    height: 16,
    backgroundColor: theme.colors.success + '20',
    borderRadius: 8,
    top: 0,
  },
  track: {
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
});
