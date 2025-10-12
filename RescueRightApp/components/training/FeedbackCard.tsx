import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import { theme } from '../../styles/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type FeedbackType = 'success' | 'warning' | 'error' | 'info';

interface FeedbackCardProps {
  message: string;
  type: FeedbackType;
}

const iconMap = {
  success: <CheckCircle size={24} color={theme.colors.success} />,
  warning: <AlertTriangle size={24} color={theme.colors.warning} />,
  error: <XCircle size={24} color={theme.colors.error} />,
  info: <Info size={24} color={theme.colors.primary} />,
};

const styleMap = {
  success: {
    backgroundColor: `${theme.colors.success}12`,
    borderColor: theme.colors.success,
  },
  warning: {
    backgroundColor: `${theme.colors.warning}12`,
    borderColor: theme.colors.warning,
  },
  error: {
    backgroundColor: `${theme.colors.error}12`,
    borderColor: theme.colors.error,
  },
  info: {
    backgroundColor: `${theme.colors.info}12`,
    borderColor: theme.colors.info,
  },
};

export function FeedbackCard({ message, type }: FeedbackCardProps) {
  const cardStyle = styleMap[type] || styleMap.info;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.container, cardStyle]}>
      <View style={styles.iconContainer}>
        {iconMap[type] || iconMap.info}
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 5,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  iconContainer: {
    flexShrink: 0,
  },
  messageText: {
    flex: 1,
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
});