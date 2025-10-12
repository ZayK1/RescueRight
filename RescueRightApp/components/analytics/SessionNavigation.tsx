import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { theme } from '../../styles/theme';

interface SessionNavigationProps {
  onBack?: () => void;
  onMore?: () => void;
}

export function SessionNavigation({ onBack, onMore }: SessionNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.button} activeOpacity={0.7}>
          <ChevronLeft size={18} strokeWidth={2.5} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Session Complete</Text>
          <View style={styles.subtitleContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.subtitle}>Training Validated</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onMore} style={styles.button} activeOpacity={0.7}>
          <MoreHorizontal size={16} strokeWidth={2.5} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(249, 250, 251, 0.85)', // F9FAFB with opacity
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusBarSpacer: {
    height: 59, // Safe area
  },
  navBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
});