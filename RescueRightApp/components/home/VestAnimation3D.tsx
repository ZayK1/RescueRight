import React, { useRef, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

function Box(props) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if(mesh.current){
      mesh.current.rotation.x += delta;
      mesh.current.rotation.y += delta;
    }
  });
  return (
    <mesh {...props} ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
}

// Main 3D Canvas Component
import { useEffect } from 'react';

export function VestAnimation3D({ onAnimationComplete }: { onAnimationComplete?: () => void }) {
  useEffect(() => {
    if (onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 1000); // Simulate a 1-second animation
      return () => clearTimeout(timer);
    }
  }, [onAnimationComplete]);
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting Setup (3-point lighting) */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.6} />
        <spotLight
          position={[0, 10, -5]}
          angle={0.3}
          intensity={1.0}
          color={"#f0f8ff"}
        />

        {/* 3D Model with Loading Fallback */}
        <Suspense fallback={null}>
          <Box />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '70%',
  },
});