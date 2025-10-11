import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { VestAnimation3D } from '../components/home/VestAnimation3D';
import { HomeButtons } from '../components/home/HomeButtons';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { theme } from '../styles/theme';

export default function HomeScreen() {
  const [showButtons, setShowButtons] = useState(false);

  const handleAnimationComplete = () => {
    setShowButtons(true);
  };

  return (
    <View style={styles.container}>
      <VestAnimation3D onAnimationComplete={handleAnimationComplete} />
      <HomeButtons visible={showButtons} />
      <DevBypassButton nextScreen="connect" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});