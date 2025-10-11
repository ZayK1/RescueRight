import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface HeatmapModuleProps {
  position: 'correct' | 'too-high' | 'too-low';
  force: number; // This will be compressionDepth
}

const positionMap = {
  'too-high': -60,
  'correct': 0,
  'too-low': 60,
};

export function HeatmapModule({ position, force }: HeatmapModuleProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(positionMap[position] || 0) }],
    };
  });

  const getPositionColor = () => {
    if (position === 'correct') return theme.colors.success;
    return theme.colors.warning;
  };

  return (
    <View style={styles.container}>
      <View style={styles.visualization}>
        <View style={styles.guideTrack}>
          <Text style={styles.guideText}>Too High</Text>
          <View style={styles.targetZone}>
            <Text style={styles.targetText}>CORRECT ZONE</Text>
          </View>
          <Text style={styles.guideText}>Too Low</Text>
        </View>
        <Animated.View style={[styles.handIndicator, { backgroundColor: getPositionColor() }, animatedStyle]}>
          <Text style={styles.handIndicatorText}>HANDS</Text>
        </Animated.View>
      </View>
      <View style={styles.readout}>
        <Text style={styles.readoutLabel}>Compression Depth</Text>
        <Text style={styles.readoutValue}>{force} mm</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.md,
  },
  visualization: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guideTrack: {
    height: '100%',
    width: '80%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  targetZone: {
    width: '110%',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingVertical: 20,
    borderColor: theme.colors.success,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  targetText: {
    color: theme.colors.success,
    fontWeight: '700',
    fontSize: 12,
  },
  guideText: {
    color: theme.colors.text.disabled,
    fontSize: 12,
  },
  handIndicator: {
    position: 'absolute',
    width: 100,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  handIndicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  readout: {
    alignItems: 'center',
  },
  readoutLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  readoutValue: {
    color: theme.colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
});