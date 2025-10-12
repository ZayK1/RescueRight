import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { VestAnimation3D } from '../components/home/VestAnimation3D';
import { HomeButtons } from '../components/home/HomeButtons';
import { DevBypassButton } from '../components/shared/DevBypassButton';

export default function HomeScreen() {
  const [showButtons, setShowButtons] = useState(false);

  const handleAnimationComplete = () => {
    setShowButtons(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 3D Vest */}
      <View style={styles.vestContainer}>
        <VestAnimation3D onAnimationComplete={handleAnimationComplete} />
      </View>

      {/* Buttons at bottom */}
      <HomeButtons visible={showButtons} />

      {/* Dev Bypass */}
      <DevBypassButton nextScreen="connect" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Clinical soft white from medical theme
  },
  vestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});