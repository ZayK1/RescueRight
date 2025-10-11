import React, { useRef, useEffect, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Animated Vest Component
function AnimatedVest({ onComplete }: { onComplete?: () => void }) {
  const vestRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const completedRef = useRef(false);

  // Load 3D model
  const gltf = useLoader(GLTFLoader, require('../../assets/models/lod.glb'));

  // Animate on each frame
  useFrame((state, delta) => {
    if (!vestRef.current) return;

    timeRef.current += delta;
    const time = timeRef.current;

    // Animation duration: 3 seconds
    const duration = 3.0;
    const progress = Math.min(time / duration, 1);

    // Ease-out function for smooth animation
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(progress);

    // Animate position (from bottom to center)
    const startY = -2.5;
    const endY = 0;
    vestRef.current.position.y = startY + (endY - startY) * easedProgress;

    // Animate rotation (360 degrees)
    vestRef.current.rotation.y = Math.PI * 2 * easedProgress;

    // Animate scale (from 0.8 to 1.0)
    const scale = 0.8 + 0.2 * easedProgress;
    vestRef.current.scale.set(scale, scale, scale);

    // Call onComplete when animation finishes
    if (progress >= 1 && !completedRef.current && onComplete) {
      completedRef.current = true;
      setTimeout(onComplete, 200);
    }
  });

  return (
    <group ref={vestRef} position={[0, -2.5, 0]} scale={0.8}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Main 3D Canvas Component
export function VestAnimation3D({ onAnimationComplete }: { onAnimationComplete?: () => void }) {
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
          color="#f0f8ff"
        />

        {/* 3D Model with Loading Fallback */}
        <Suspense fallback={null}>
          <AnimatedVest onComplete={onAnimationComplete} />
        </Suspense>
      </Canvas>

      {/* Loading Indicator (shows while model loads) */}
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '70%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
});
