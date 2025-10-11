import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

interface DevBypassButtonProps {
  nextScreen: 'connect' | 'training' | 'analytics' | 'index';
}

export function DevBypassButton({ nextScreen }: DevBypassButtonProps) {
  const router = useRouter();

  // Only show in development
  if (__DEV__ === false) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/${nextScreen === 'index' ? '' : nextScreen}`)}
    >
      <Text style={styles.text}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
