import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface FeedbackCardProps {
  handPosition: 'correct' | 'too-high' | 'too-low';
  recoilComplete: boolean;
}

export function FeedbackCard({ handPosition, recoilComplete }: FeedbackCardProps) {
  const handPositionData = {
    correct: {
      icon: '✓',
      text: 'Hand Position: Correct',
      color: theme.colors.success,
      bgColor: theme.colors.success + '15',
    },
    'too-high': {
      icon: '⬆',
      text: 'Hand Position: Too High',
      color: theme.colors.warning,
      bgColor: theme.colors.warning + '15',
    },
    'too-low': {
      icon: '⬇',
      text: 'Hand Position: Too Low',
      color: theme.colors.warning,
      bgColor: theme.colors.warning + '15',
    },
  };

  const positionInfo = handPositionData[handPosition];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-Time Feedback</Text>

      {/* Hand Position */}
      <View style={[styles.feedbackItem, { backgroundColor: positionInfo.bgColor }]}>
        <Text style={[styles.icon, { color: positionInfo.color }]}>
          {positionInfo.icon}
        </Text>
        <Text style={[styles.feedbackText, { color: positionInfo.color }]}>
          {positionInfo.text}
        </Text>
      </View>

      {/* Recoil */}
      <View
        style={[
          styles.feedbackItem,
          {
            backgroundColor: recoilComplete
              ? theme.colors.success + '15'
              : theme.colors.destructive + '15',
          },
        ]}
      >
        <Text
          style={[
            styles.icon,
            { color: recoilComplete ? theme.colors.success : theme.colors.destructive },
          ]}
        >
          {recoilComplete ? '✓' : '⚠'}
        </Text>
        <Text
          style={[
            styles.feedbackText,
            { color: recoilComplete ? theme.colors.success : theme.colors.destructive },
          ]}
        >
          {recoilComplete ? 'Full Recoil: Complete' : 'Full Recoil: Incomplete'}
        </Text>
      </View>
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
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  feedbackText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
});
