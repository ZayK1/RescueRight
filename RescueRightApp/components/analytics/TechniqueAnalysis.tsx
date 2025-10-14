import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface FeedbackItem {
  type: 'success' | 'warning' | 'error';
  message: string;
  detail: string;
}

interface TechniqueAnalysisProps {
  feedback: FeedbackItem[];
}

const FeedbackItemCard = ({ item, index }: { item: FeedbackItem; index: number }) => {
  const config = {
    success: {
      icon: <CheckCircle2 size={24} color={theme.colors.success} strokeWidth={2.5} />,
      bg: `${theme.colors.success}12`,
      border: theme.colors.success,
      iconBg: `${theme.colors.success}20`,
      badgeText: 'Excellent',
      badgeBg: theme.colors.success,
    },
    warning: {
      icon: <AlertTriangle size={24} color={theme.colors.warning} strokeWidth={2.5} />,
      bg: `${theme.colors.warning}12`,
      border: theme.colors.warning,
      iconBg: `${theme.colors.warning}20`,
      badgeText: 'Improve',
      badgeBg: theme.colors.warning,
    },
    error: {
      icon: <AlertCircle size={24} color={theme.colors.error} strokeWidth={2.5} />,
      bg: `${theme.colors.error}12`,
      border: theme.colors.error,
      iconBg: `${theme.colors.error}20`,
      badgeText: 'Critical',
      badgeBg: theme.colors.error,
    },
  };

  const style = config[item.type];

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 150).springify().damping(15)}
      style={[
        styles.card,
        {
          backgroundColor: style.bg,
          borderLeftColor: style.border,
        },
      ]}
    >
      {/* Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: style.iconBg }]}>
        {style.icon}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.message}>{item.message}</Text>
          <View style={[styles.badge, { backgroundColor: style.badgeBg }]}>
            <Text style={styles.badgeText}>{style.badgeText}</Text>
          </View>
        </View>

        <Text style={styles.detail}>{item.detail}</Text>

        {/* Action Indicator */}
        {item.type !== 'success' && (
          <View style={styles.actionRow}>
            <ArrowRight size={14} color={style.border} strokeWidth={2.5} />
            <Text style={[styles.actionText, { color: style.border }]}>
              {item.type === 'warning' ? 'Focus on this next session' : 'Requires immediate attention'}
            </Text>
          </View>
        )}

        {item.type === 'success' && (
          <View style={styles.successRow}>
            <Sparkles size={14} color={theme.colors.success} strokeWidth={2.5} />
            <Text style={[styles.actionText, { color: theme.colors.success }]}>
              Keep up the great work!
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export function TechniqueAnalysis({ feedback }: TechniqueAnalysisProps) {
  // Sort feedback: errors first, then warnings, then success
  const sortedFeedback = [...feedback].sort((a, b) => {
    const order = { error: 0, warning: 1, success: 2 };
    return order[a.type] - order[b.type];
  });

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.summaryLabel}>
              {feedback.filter(f => f.type === 'success').length} Excellent
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: theme.colors.warning }]} />
            <Text style={styles.summaryLabel}>
              {feedback.filter(f => f.type === 'warning').length} To Improve
            </Text>
          </View>
          {feedback.some(f => f.type === 'error') && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: theme.colors.error }]} />
                <Text style={styles.summaryLabel}>
                  {feedback.filter(f => f.type === 'error').length} Critical
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Feedback Cards */}
      <View style={styles.feedbackList}>
        {sortedFeedback.map((item, index) => (
          <FeedbackItemCard key={index} item={item} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
  },
  feedbackList: {
    gap: 14,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadows.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detail: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
