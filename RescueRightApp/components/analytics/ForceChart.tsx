import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../../styles/theme';
import { TARGET_FORCE } from '../../lib/vestCalibration';
import { ThrustData } from '../../lib/sessionStorage';

/**
 * Per-thrust peak-force chart with the 40–65N clinical training band.
 *
 * One bar per thrust (a Heimlich is a series of discrete thrusts, not a
 * continuous push). The shaded band is the target window derived from the
 * literature reference of 120–160 cmH₂O applied pressure; bar colour shows at
 * a glance which thrusts were too weak (amber), on target (green) or risked
 * injury (red).
 */

const CHART_HEIGHT = 150;
const AXIS_WIDTH = 30;
const TOP_PAD = 10;
const BOTTOM_PAD = 20;
const PLOT_HEIGHT = CHART_HEIGHT - TOP_PAD - BOTTOM_PAD;

interface ForceChartProps {
  thrustHistory: ThrustData[];
}

export function ForceChart({ thrustHistory }: ForceChartProps) {
  const [width, setWidth] = useState(0);

  if (thrustHistory.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No thrusts recorded this session</Text>
      </View>
    );
  }

  const maxForce = Math.max(TARGET_FORCE.max + 20, ...thrustHistory.map((t) => t.force));
  const yFor = (force: number) => TOP_PAD + PLOT_HEIGHT * (1 - force / maxForce);

  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const n = thrustHistory.length;
  const slot = plotWidth / n;
  const barWidth = Math.min(26, Math.max(8, slot * 0.55));

  const zoneColor = (force: number) => {
    if (force < TARGET_FORCE.min) return theme.colors.warning;
    if (force <= TARGET_FORCE.max) return theme.colors.success;
    return theme.colors.error;
  };

  const bandTop = yFor(TARGET_FORCE.max);
  const bandBottom = yFor(TARGET_FORCE.min);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.container}>
      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT}>
          {/* Target band (40–65N) */}
          <Rect
            x={AXIS_WIDTH}
            y={bandTop}
            width={plotWidth}
            height={bandBottom - bandTop}
            fill={theme.colors.success}
            opacity={0.1}
          />
          <Line
            x1={AXIS_WIDTH}
            x2={width}
            y1={bandTop}
            y2={bandTop}
            stroke={theme.colors.success}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.6}
          />
          <Line
            x1={AXIS_WIDTH}
            x2={width}
            y1={bandBottom}
            y2={bandBottom}
            stroke={theme.colors.success}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.6}
          />

          {/* Axis labels for the band bounds */}
          <SvgText
            x={AXIS_WIDTH - 6}
            y={bandTop + 4}
            fontSize={10}
            fontWeight="600"
            fill={theme.colors.text.tertiary}
            textAnchor="end"
          >
            {`${TARGET_FORCE.max}N`}
          </SvgText>
          <SvgText
            x={AXIS_WIDTH - 6}
            y={bandBottom + 4}
            fontSize={10}
            fontWeight="600"
            fill={theme.colors.text.tertiary}
            textAnchor="end"
          >
            {`${TARGET_FORCE.min}N`}
          </SvgText>

          {/* Baseline */}
          <Line
            x1={AXIS_WIDTH}
            x2={width}
            y1={TOP_PAD + PLOT_HEIGHT}
            y2={TOP_PAD + PLOT_HEIGHT}
            stroke={theme.colors.border}
            strokeWidth={1}
          />

          {/* One bar per thrust, coloured by zone */}
          {thrustHistory.map((thrust, i) => {
            const x = AXIS_WIDTH + slot * i + (slot - barWidth) / 2;
            const y = yFor(thrust.force);
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={TOP_PAD + PLOT_HEIGHT - y}
                  rx={3}
                  fill={zoneColor(thrust.force)}
                  opacity={0.9}
                />
                {n <= 12 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={CHART_HEIGHT - 6}
                    fontSize={10}
                    fontWeight="600"
                    fill={theme.colors.text.tertiary}
                    textAnchor="middle"
                  >
                    {`${i + 1}`}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendText}>Below {TARGET_FORCE.min}N</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendText}>On target</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.legendText}>Above {TARGET_FORCE.max}N</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
  },
  emptyText: {
    ...theme.typography.caption2,
    color: theme.colors.text.tertiary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
  },
});
