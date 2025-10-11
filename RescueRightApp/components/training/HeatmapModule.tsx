import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { theme } from '../../styles/theme';

interface HeatmapModuleProps {
  handPosition: 'correct' | 'too-high' | 'too-low';
}

export function HeatmapModule({ handPosition }: HeatmapModuleProps) {
  // Torso SVG dimensions
  const width = 200;
  const height = 280;

  // Define pressure zones
  const zones = [
    { id: 'too-high', cy: 80, label: 'Too High' },
    { id: 'correct', cy: 140, label: 'Correct' },
    { id: 'too-low', cy: 200, label: 'Too Low' },
  ];

  const getZoneColor = (zoneId: string) => {
    if (zoneId === handPosition) {
      if (handPosition === 'correct') return theme.colors.success;
      return theme.colors.warning;
    }
    return theme.colors.border;
  };

  const getZoneOpacity = (zoneId: string) => {
    return zoneId === handPosition ? 0.6 : 0.2;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hand Position Heatmap</Text>

      <View style={styles.heatmapContainer}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Torso outline */}
          <Path
            d={`
              M ${width / 2} 20
              Q ${width / 2 - 40} 30, ${width / 2 - 50} 60
              L ${width / 2 - 55} 140
              Q ${width / 2 - 55} 180, ${width / 2 - 50} 220
              L ${width / 2 - 45} 260
              L ${width / 2 + 45} 260
              L ${width / 2 + 50} 220
              Q ${width / 2 + 55} 180, ${width / 2 + 55} 140
              L ${width / 2 + 50} 60
              Q ${width / 2 + 40} 30, ${width / 2} 20
            `}
            stroke={theme.colors.border}
            strokeWidth="2"
            fill="none"
          />

          {/* Sternum centerline */}
          <Path
            d={`M ${width / 2} 40 L ${width / 2} 240`}
            stroke={theme.colors.mutedForeground}
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity={0.3}
          />

          {/* Pressure zones */}
          {zones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle
                cx={width / 2}
                cy={zone.cy}
                r="35"
                fill={getZoneColor(zone.id)}
                opacity={getZoneOpacity(zone.id)}
              />
              <Circle
                cx={width / 2}
                cy={zone.cy}
                r="35"
                stroke={getZoneColor(zone.id)}
                strokeWidth="2"
                fill="none"
                opacity={zone.id === handPosition ? 0.8 : 0.3}
              />
            </React.Fragment>
          ))}

          {/* Active hand position marker */}
          {handPosition && (
            <Circle
              cx={width / 2}
              cy={zones.find((z) => z.id === handPosition)?.cy || 140}
              r="8"
              fill={handPosition === 'correct' ? theme.colors.success : theme.colors.warning}
            />
          )}
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          {zones.map((zone) => (
            <View key={zone.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: getZoneColor(zone.id),
                    opacity: zone.id === handPosition ? 1 : 0.3,
                  },
                ]}
              />
              <Text
                style={[
                  styles.legendText,
                  { fontWeight: zone.id === handPosition ? '600' : '400' },
                ]}
              >
                {zone.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.hint}>
        {handPosition === 'correct'
          ? 'Maintain this hand position'
          : 'Adjust hand position to center of chest'}
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
  title: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  heatmapContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    ...theme.typography.small,
    color: theme.colors.foreground,
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
});
