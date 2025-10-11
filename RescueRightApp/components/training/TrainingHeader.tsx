import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

interface TrainingHeaderProps {
  duration: number; // seconds
  onEndSession: () => void;
}

export function TrainingHeader({ duration, onEndSession }: TrainingHeaderProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
      </View>

      <TouchableOpacity onPress={onEndSession} style={styles.endButton}>
        <Text style={styles.endButtonText}>End</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: theme.colors.foreground,
    fontWeight: '300',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginBottom: 4,
  },
  timer: {
    ...theme.typography.h2,
    color: theme.colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  endButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.destructive,
  },
  endButtonText: {
    ...theme.typography.h4,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
