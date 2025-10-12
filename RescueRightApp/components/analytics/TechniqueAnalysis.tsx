import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertTriangle } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface FeedbackItem {
  type: 'success' | 'warning' | 'error';
  message: string;
  detail: string;
}

interface TechniqueAnalysisProps {
  feedback: FeedbackItem[];
}

const FeedbackItemCard = ({ item }: { item: FeedbackItem }) => {
  const isSuccess = item.type === 'success';
  const icon = isSuccess ? <CheckCircle size={20} color={theme.colors.success} /> : <AlertTriangle size={20} color={theme.colors.warning} />;
  const containerStyle = isSuccess ? styles.successContainer : styles.warningContainer;
  const textStyle = isSuccess ? styles.successText : styles.warningText;

  return (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.detail}>{item.detail}</Text>
      </View>
    </View>
  );
};

export function TechniqueAnalysis({ feedback }: TechniqueAnalysisProps) {
  return (
    <View style={styles.container}>
      {feedback.map((item, index) => (
        <FeedbackItemCard key={index} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  successContainer: {
    backgroundColor: `${theme.colors.success}08`,
    borderColor: theme.colors.success,
  },
  warningContainer: {
    backgroundColor: `${theme.colors.warning}08`,
    borderColor: theme.colors.warning,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  detail: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  successText: {
    color: theme.colors.success,
  },
  warningText: {
    color: theme.colors.warning,
  },
});