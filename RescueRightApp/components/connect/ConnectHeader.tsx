import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export function ConnectHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Vest</Text>
      <Text style={styles.subtitle}>
        Power on your RescueRight vest and bring it close to your device
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    lineHeight: 22,
  },
});
