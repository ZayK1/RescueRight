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
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: theme.colors.success,
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: theme.colors.warning,
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: theme.colors.error,
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: theme.colors.primary,
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
    minHeight: 64,
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.sm,
  },
  iconContainer: {
    flexShrink: 0,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
});