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
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  successContainer: {
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  warningContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  successText: {
    color: theme.colors.success,
  },
  warningText: {
    color: theme.colors.warning,
  },
});