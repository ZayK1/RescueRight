# 🎯 RescueRight MVP App - Complete Development Roadmap

**Project**: RescueRight Smart Vest Training App
**Timeline**: 7-10 days
**Tech Stack**: React Native + TypeScript + Three.js + Expo
**Target**: University Competition MVP (IDEATE 2025)

**Progress**: ✅ Phase 1 Complete | ✅ Phase 2 Complete | ✅ Phase 3 Complete | ✅ Phase 4 Complete | ✅ Phase 5 Complete

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [App Architecture](#app-architecture)
4. [Phase 1: Project Setup](#phase-1-project-setup-day-1)
5. [Phase 2: Core Navigation](#phase-2-core-navigation-day-2)
6. [Phase 3: Home Screen with 3D Animation](#phase-3-home-screen-with-3d-animation-day-3)
7. [Phase 4: Connect Screen](#phase-4-connect-screen-day-4)
8. [Phase 5: Live Training Screen](#phase-5-live-training-screen-day-5-6)
9. [Phase 6: Session Analytics Screen](#phase-6-session-analytics-screen-day-6-7)
10. [Phase 7: Testing & Polish](#phase-7-testing--polish-day-8-9)
11. [Phase 8: ESP Integration Preparation](#phase-8-esp-integration-preparation-day-10)
12. [Success Criteria](#success-criteria)

---

## 📱 Project Overview

### App Flow
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. HOME SCREEN (NEW)                                       │
│     - 3D vest animation (Apple AirPods style)               │
│     - "Connect With Vest" button                            │
│     - "About RescueRight" button                            │
│     - [DEV BYPASS →]                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2. CONNECT SCREEN (Figma Design 1)                         │
│     - Bluetooth device scanning                             │
│     - Vest pairing interface                                │
│     - Manual pairing option                                 │
│     - [DEV BYPASS →]                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. LIVE TRAINING SCREEN (Figma Design 2)                   │
│     - Real-time force heatmap                               │
│     - Pressure gauge                                        │
│     - AI feedback cards                                     │
│     - "Complete Session" button                             │
│     - [DEV BYPASS →]                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4. SESSION ANALYTICS (Figma Design 3)                      │
│     - Performance metrics                                   │
│     - Technique analysis                                    │
│     - "New Session" / "View History" buttons                │
│     - [← BACK TO HOME]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### MVP Features
- ✅ Professional UI/UX (competition-ready)
- ✅ Smooth 3D vest animation
- ✅ Full navigation flow
- ✅ Template data visualization
- ✅ Dev bypass buttons for testing
- ✅ Bluetooth architecture (ready for ESP)
- ✅ Responsive design (iOS/Android)

---

## 🛠 Technology Stack

### Core Framework
```
React Native (Expo)          → Cross-platform (iOS/Android)
TypeScript                   → Type safety
Expo Router                  → Navigation
```

### 3D Graphics
```
React Native Three.js        → 3D vest rendering
@react-three/fiber           → React bindings for Three.js
@react-three/drei            → Helper components
expo-gl                      → OpenGL integration
```

### UI Components
```
React Native Paper           → Material Design components
React Native Reanimated      → Smooth animations
React Native SVG             → Charts/heatmaps
Tailwind CSS (NativeWind)    → Styling (matching Figma)
```

### Data & State
```
Zustand                      → State management
React Query                  → Data fetching
AsyncStorage                 → Local data persistence
```

### Bluetooth (Future)
```
react-native-ble-plx         → Bluetooth Low Energy
```

---

## 🏗 App Architecture

### Folder Structure
```
RescueRight/
├── App.tsx                          # Root component
├── app/                             # Expo Router screens
│   ├── index.tsx                    # Home (3D animation)
│   ├── connect.tsx                  # Connect screen
│   ├── training.tsx                 # Live training
│   └── analytics.tsx                # Session analytics
├── components/                      # Reusable components
│   ├── home/
│   │   ├── VestAnimation3D.tsx     # 3D vest component
│   │   └── HomeButtons.tsx          # CTA buttons
│   ├── connect/                     # From Figma Design 1
│   │   ├── PairingNavigation.tsx
│   │   ├── VestIllustration.tsx
│   │   ├── ConnectionStates.tsx
│   │   ├── ConnectingModal.tsx
│   │   ├── ManualPairing.tsx
│   │   └── HelpSection.tsx
│   ├── training/                    # From Figma Design 2
│   │   ├── StatusHeader.tsx
│   │   ├── HeatmapModule.tsx
│   │   ├── ForceGauge.tsx
│   │   ├── FeedbackCard.tsx
│   │   └── MetricsStrip.tsx
│   ├── analytics/                   # From Figma Design 3
│   │   ├── SessionNavigation.tsx
│   │   ├── HeroSuccessCard.tsx
│   │   ├── MetricsGrid.tsx
│   │   ├── TechniqueAnalysis.tsx
│   │   └── ActionButtons.tsx
│   ├── shared/                      # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── DevBypassButton.tsx     # Testing bypass
│   └── ui/                          # Radix UI primitives
│       └── ...
├── lib/                             # Utilities
│   ├── bluetooth.ts                 # BLE manager
│   ├── mockData.ts                  # Template/mock data
│   └── animations.ts                # Reanimated configs
├── assets/                          # Static assets
│   ├── models/
│   │   └── vest.glb                 # Optimized 3D model
│   ├── textures/
│   │   └── ...
│   └── images/
│       └── ...
└── styles/                          # Global styles
    └── theme.ts                     # Design tokens
```

---

## 🚀 Phase 1: Project Setup (Day 1)

### Step 1.1: Initialize Expo Project (30 minutes)

**Open Terminal:**

```bash
# Navigate to your project directory
cd ~/RescueRight

# Create new Expo app with TypeScript
npx create-expo-app@latest RescueRightApp --template expo-template-blank-typescript

# Navigate into the project
cd RescueRightApp
```

### Step 1.2: Install Dependencies (20 minutes)

```bash
# Core navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# 3D graphics
npm install three @react-three/fiber @react-three/drei
npx expo install expo-gl expo-file-system

# UI components
npm install nativewind tailwindcss
npm install react-native-paper react-native-vector-icons
npx expo install react-native-reanimated react-native-gesture-handler
npm install react-native-svg

# State management
npm install zustand
npm install @tanstack/react-query

# Utilities
npx expo install expo-font @expo-google-fonts/inter
npx expo install @react-native-async-storage/async-storage

# Future Bluetooth (install but don't use yet)
npm install react-native-ble-plx
```

### Step 1.3: Configure Expo Router (15 minutes)

**Edit `package.json`:**

```json
{
  "name": "rescuerightapp",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

**Create `app/_layout.tsx`:**

```typescript
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="training" />
        <Stack.Screen name="analytics" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

### Step 1.4: Setup Tailwind CSS (20 minutes)

**Create `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'rescue-blue': '#3B82F6',
        'rescue-teal': '#00A896',
        'medical-success': '#059669',
        'medical-warning': '#F59E0B',
        'medical-error': '#DC2626',
      },
    },
  },
  plugins: [],
}
```

**Create `babel.config.js`:**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
```

### Step 1.5: Create Theme Configuration (15 minutes)

**Create `styles/theme.ts`:**

```typescript
export const theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#00A896',
    success: '#059669',
    warning: '#F59E0B',
    error: '#DC2626',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.02,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.02,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      letterSpacing: -0.01,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
  },
};

export type Theme = typeof theme;
```

### Step 1.6: Test Installation (10 minutes)

```bash
# Start Expo development server
npm start

# Press 'i' for iOS simulator or 'a' for Android emulator
```

**Expected Result**: Blank screen with Expo logo

---

## 🧭 Phase 2: Core Navigation (Day 2)

### Step 2.1: Create Screen Placeholders (30 minutes)

**Create `app/index.tsx` (Home):**

```typescript
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={theme.typography.h1}>Home Screen</Text>
      <Text style={theme.typography.body}>3D Vest Animation will go here</Text>
    </View>
  );
}
```

**Create `app/connect.tsx`:**

```typescript
import { View, Text } from 'react-native';
import { theme } from '../styles/theme';

export default function ConnectScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={theme.typography.h1}>Connect Screen</Text>
      <Text style={theme.typography.body}>Bluetooth pairing will go here</Text>
    </View>
  );
}
```

**Create `app/training.tsx`:**

```typescript
import { View, Text } from 'react-native';
import { theme } from '../styles/theme';

export default function TrainingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
      <Text style={theme.typography.h1}>Live Training</Text>
      <Text style={theme.typography.body}>Real-time feedback will go here</Text>
    </View>
  );
}
```

**Create `app/analytics.tsx`:**

```typescript
import { View, Text } from 'react-native';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={theme.typography.h1}>Session Analytics</Text>
      <Text style={theme.typography.body}>Performance metrics will go here</Text>
    </View>
  );
}
```

### Step 2.2: Create Dev Bypass Button Component (20 minutes)

**Create `components/shared/DevBypassButton.tsx`:**

```typescript
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
```

### Step 2.3: Add Bypass Buttons to Screens (15 minutes)

**Update each screen to include bypass button:**

```typescript
// In app/index.tsx (Home)
import { DevBypassButton } from '../components/shared/DevBypassButton';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* ...existing content... */}
      <DevBypassButton nextScreen="connect" />
    </View>
  );
}

// In app/connect.tsx
<DevBypassButton nextScreen="training" />

// In app/training.tsx
<DevBypassButton nextScreen="analytics" />

// In app/analytics.tsx
<DevBypassButton nextScreen="index" />
```

### Step 2.4: Test Navigation (10 minutes)

1. Run `npm start`
2. Tap the bypass button on each screen
3. Verify smooth navigation between all 4 screens

---

## 🎨 Phase 3: Home Screen with 3D Animation (Day 3)

### Step 3.1: Optimize 3D Model (45 minutes)

**Option A: Use Online Tool (Recommended)**

1. Go to https://gltf.report/
2. Upload `3D Model/Vest Model/lod.fbx`
3. Convert to GLB format
4. Apply optimizations:
   - Reduce texture resolution to 1024x1024
   - Enable Draco compression
   - Target file size: <3MB
5. Download optimized `vest.glb`

**Option B: Use Blender**

```bash
# Install Blender from blender.org
# Open Blender → File → Import → FBX
# Select lod.fbx
# File → Export → glTF 2.0
# Settings:
#   - Format: glTF Binary (.glb)
#   - Include: Materials, Textures
#   - Compression: Draco
#   - Transform: +Y Up
# Save as vest.glb
```

**Save model:**
```bash
mkdir -p assets/models
# Move vest.glb to assets/models/
```

### Step 3.2: Create 3D Vest Component (1.5 hours)

**Create `components/home/VestAnimation3D.tsx`:**

```typescript
import React, { useRef, useEffect, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// Animated Vest Component
function AnimatedVest({ onComplete }: { onComplete?: () => void }) {
  const vestRef = useRef<THREE.Group>(null);

  // Load 3D model
  const gltf = useLoader(GLTFLoader, require('../../assets/models/vest.glb'));

  // Spring animation (Apple-style)
  const { position, rotation, scale } = useSpring({
    from: {
      position: [0, -2.5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 0.8,
    },
    to: {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, Math.PI * 2, 0] as [number, number, number],
      scale: 1.0,
    },
    config: {
      tension: 120,
      friction: 14,
      duration: 3000,
    },
    onRest: () => {
      if (onComplete) {
        setTimeout(onComplete, 200);
      }
    },
  });

  return (
    <animated.group
      ref={vestRef}
      position={position as any}
      rotation={rotation as any}
      scale={scale as any}
    >
      <primitive object={gltf.scene} />
    </animated.group>
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
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
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

      {/* Loading Indicator */}
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
```

### Step 3.3: Create Home Buttons Component (30 minutes)

**Create `components/home/HomeButtons.tsx`:**

```typescript
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface HomeButtonsProps {
  visible: boolean;
}

export function HomeButtons({ visible }: HomeButtonsProps) {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleConnect = () => {
    router.push('/connect');
  };

  const handleAbout = () => {
    // TODO: Navigate to About screen
    console.log('About RescueRight');
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Primary Button */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleConnect}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Connect With Vest</Text>
      </TouchableOpacity>

      {/* Secondary Button */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleAbout}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>About RescueRight</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.lg,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
```

### Step 3.4: Update Home Screen (20 minutes)

**Update `app/index.tsx`:**

```typescript
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
      {/* 3D Vest Animation */}
      <VestAnimation3D onAnimationComplete={handleAnimationComplete} />

      {/* CTA Buttons (fade in after animation) */}
      <HomeButtons visible={showButtons} />

      {/* Dev Bypass Button */}
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
```

### Step 3.5: Test Home Screen (15 minutes)

1. Run `npm start`
2. Verify:
   - 3D vest animates from bottom
   - 360° rotation is smooth
   - Buttons fade in after animation
   - Bypass button works

---

## 🔗 Phase 4: Connect Screen (Day 4)

### Step 4.1: Copy Figma Components (45 minutes)

**Copy components from Figma Designs/ConnectScreen/src/components/ to your project:**

```bash
# Create directory structure
mkdir -p components/connect

# Copy all connect screen components
cp "Figma Designs/ConnectScreen/src/components/PairingNavigation.tsx" components/connect/
cp "Figma Designs/ConnectScreen/src/components/VestIllustration.tsx" components/connect/
cp "Figma Designs/ConnectScreen/src/components/ConnectionStates.tsx" components/connect/
cp "Figma Designs/ConnectScreen/src/components/ConnectingModal.tsx" components/connect/
cp "Figma Designs/ConnectScreen/src/components/ManualPairing.tsx" components/connect/
cp "Figma Designs/ConnectScreen/src/components/HelpSection.tsx" components/connect/

# Copy UI components if needed
cp -r "Figma Designs/ConnectScreen/src/components/ui" components/
```

### Step 4.2: Create Mock Bluetooth Data (30 minutes)

**Create `lib/mockData.ts`:**

```typescript
export interface MockDevice {
  id: string;
  name: string;
  rssi: number;
  isConnecting?: boolean;
  isConnected?: boolean;
}

export const mockDevices: MockDevice[] = [
  {
    id: 'vest-001',
    name: 'RescueRight Vest #001',
    rssi: -45,
  },
  {
    id: 'vest-002',
    name: 'RescueRight Vest #002',
    rssi: -67,
  },
];

export const mockTrainingData = {
  forceReadings: Array.from({ length: 50 }, (_, i) => ({
    timestamp: Date.now() - (50 - i) * 100,
    force: 80 + Math.sin(i / 5) * 30 + Math.random() * 10,
  })),
  currentForce: 95,
  targetForce: { min: 80, max: 120 },
  handPosition: { x: 0.5, y: 0.45 },
  angle: 15,
  thrusts: 8,
  feedback: "Good pressure! Move hands 2cm higher for optimal position.",
};

export const mockAnalyticsData = {
  sessionId: 'session-' + Date.now(),
  duration: 125, // seconds
  totalThrusts: 12,
  effectiveThrusts: 9,
  averageForce: 98,
  forceConsistency: 85,
  positionAccuracy: 92,
  angleAccuracy: 88,
  overallScore: 91,
  feedback: [
    {
      type: 'success',
      message: 'Excellent force control',
      detail: 'Maintained optimal pressure for 75% of thrusts',
    },
    {
      type: 'warning',
      message: 'Hand position needs improvement',
      detail: 'Positioned 3cm too low on 3 occasions',
    },
  ],
};
```

### Step 4.3: Adapt Connect Screen Components (1 hour)

**Update imports in components to work with React Native:**

```typescript
// Example: components/connect/ConnectionStates.tsx
// Change web imports to React Native equivalents

// Before (Web):
import { useState } from 'react';
import { motion } from 'framer-motion';

// After (React Native):
import { useState } from 'react';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
```

**Key changes needed:**
- Replace `<div>` with `<View>`
- Replace `<span>`, `<p>` with `<Text>`
- Replace `<button>` with `<TouchableOpacity>`
- Replace `className` with `style` prop
- Convert Tailwind classes to StyleSheet

### Step 4.4: Build Connect Screen (1 hour)

**Update `app/connect.tsx`:**

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PairingNavigation } from '../components/connect/PairingNavigation';
import { VestIllustration } from '../components/connect/VestIllustration';
import { ConnectionStates } from '../components/connect/ConnectionStates';
import { ConnectingModal } from '../components/connect/ConnectingModal';
import { ManualPairing } from '../components/connect/ManualPairing';
import { HelpSection } from '../components/connect/HelpSection';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockDevices } from '../lib/mockData';
import { theme } from '../styles/theme';

export default function ConnectScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setIsConnecting(true);
  };

  const handleConnectionSuccess = () => {
    setIsConnecting(false);
    setTimeout(() => {
      router.push('/training');
    }, 500);
  };

  const handleConnectionCancel = () => {
    setIsConnecting(false);
    setSelectedDevice(null);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Header */}
        <PairingNavigation onBack={handleBack} />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <VestIllustration />

          <Text style={styles.title}>Connect Smart Vest</Text>
          <Text style={styles.subtitle}>
            Power on your RescueRight vest and hold nearby
          </Text>
        </View>

        {/* Connection Section */}
        <View style={styles.connectionSection}>
          <ConnectionStates
            devices={mockDevices}
            onDeviceSelect={handleDeviceSelect}
          />
          <ManualPairing />
          <HelpSection />
        </View>
      </ScrollView>

      {/* Connecting Modal */}
      <ConnectingModal
        isVisible={isConnecting}
        deviceName={mockDevices.find(d => d.id === selectedDevice)?.name}
        onCancel={handleConnectionCancel}
        onSuccess={handleConnectionSuccess}
      />

      {/* Dev Bypass */}
      <DevBypassButton nextScreen="training" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 112,
    paddingBottom: 34,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    maxWidth: 300,
  },
  connectionSection: {
    paddingHorizontal: 20,
    gap: 24,
  },
});
```

### Step 4.5: Test Connect Screen (20 minutes)

1. Navigate from Home → Connect
2. Test mock device selection
3. Verify connecting modal appears
4. Confirm auto-navigation to Training screen

---

## 📊 Phase 5: Live Training Screen (Day 5-6)

### Step 5.1: Copy Training Components (30 minutes)

```bash
mkdir -p components/training

cp "Figma Designs/WhileTrainingScreen/src/components/StatusHeader.tsx" components/training/
cp "Figma Designs/WhileTrainingScreen/src/components/HeatmapModule.tsx" components/training/
cp "Figma Designs/WhileTrainingScreen/src/components/ForceGauge.tsx" components/training/
cp "Figma Designs/WhileTrainingScreen/src/components/FeedbackCard.tsx" components/training/
cp "Figma Designs/WhileTrainingScreen/src/components/MetricsStrip.tsx" components/training/
```

### Step 5.2: Create Real-time Data Hook (45 minutes)

**Create `lib/useTrainingData.ts`:**

```typescript
import { useState, useEffect, useRef } from 'react';
import { mockTrainingData } from './mockData';

export function useTrainingData() {
  const [force, setForce] = useState(mockTrainingData.currentForce);
  const [thrusts, setThrusts] = useState(0);
  const [position, setPosition] = useState(mockTrainingData.handPosition);
  const [angle, setAngle] = useState(mockTrainingData.angle);
  const [feedback, setFeedback] = useState(mockTrainingData.feedback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Simulate force fluctuations
      setForce(prev => {
        const variation = (Math.random() - 0.5) * 20;
        return Math.max(60, Math.min(140, prev + variation));
      });

      // Simulate occasional thrust detection
      if (Math.random() > 0.95) {
        setThrusts(prev => prev + 1);
      }

      // Simulate position adjustments
      setPosition({
        x: 0.5 + (Math.random() - 0.5) * 0.1,
        y: 0.45 + (Math.random() - 0.5) * 0.1,
      });

      // Simulate angle changes
      setAngle(prev => prev + (Math.random() - 0.5) * 5);

      // Update feedback based on metrics
      if (force < 80) {
        setFeedback("Increase pressure - current force too low");
      } else if (force > 120) {
        setFeedback("Reduce pressure - risk of injury!");
      } else {
        setFeedback("Perfect pressure! Maintain this level.");
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    force,
    thrusts,
    position,
    angle,
    feedback,
    targetForce: mockTrainingData.targetForce,
  };
}
```

### Step 5.3: Create Heatmap Component (1.5 hours)

**Create `components/training/HeatmapModule.tsx`:**

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const HEATMAP_SIZE = width - 32;

interface HeatmapModuleProps {
  position: { x: number; y: number };
  force: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function HeatmapModule({ position, force }: HeatmapModuleProps) {
  const pulseRadius = useSharedValue(40);

  useEffect(() => {
    // Pulse animation based on force
    pulseRadius.value = withRepeat(
      withSequence(
        withTiming(force / 3, { duration: 400 }),
        withTiming((force / 3) * 0.9, { duration: 400 })
      ),
      -1,
      true
    );
  }, [force]);

  const animatedProps = useAnimatedProps(() => ({
    r: pulseRadius.value,
  }));

  // Convert normalized position (0-1) to SVG coordinates
  const x = position.x * HEATMAP_SIZE;
  const y = position.y * HEATMAP_SIZE;

  // Color based on force (green = optimal, red = too much, blue = too little)
  const color =
    force < 80 ? '#3B82F6' :  // Blue (too little)
    force > 120 ? '#DC2626' : // Red (too much)
    '#059669';                // Green (optimal)

  return (
    <View style={styles.container}>
      <Svg width={HEATMAP_SIZE} height={HEATMAP_SIZE}>
        <Defs>
          <RadialGradient id="heatGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </RadialGradient>
        </Defs>

        {/* Body outline (vest shape) */}
        <Rect
          x={HEATMAP_SIZE * 0.3}
          y={HEATMAP_SIZE * 0.2}
          width={HEATMAP_SIZE * 0.4}
          height={HEATMAP_SIZE * 0.5}
          rx={20}
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth={2}
        />

        {/* Pressure point heatmap */}
        <AnimatedCircle
          cx={x}
          cy={y}
          fill="url(#heatGradient)"
          animatedProps={animatedProps}
        />

        {/* Hand position indicator */}
        <Circle
          cx={x}
          cy={y}
          r={8}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

### Step 5.4: Create Force Gauge Component (1 hour)

**Create `components/training/ForceGauge.tsx`:**

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = width - 64;

interface ForceGaugeProps {
  force: number;
  targetMin: number;
  targetMax: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ForceGauge({ force, targetMin, targetMax }: ForceGaugeProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Map force (0-150N) to progress (0-1)
    const normalizedForce = Math.max(0, Math.min(150, force)) / 150;
    progress.value = withSpring(normalizedForce, {
      damping: 15,
      stiffness: 100,
    });
  }, [force]);

  // Calculate arc path
  const centerX = GAUGE_SIZE / 2;
  const centerY = GAUGE_SIZE / 2;
  const radius = GAUGE_SIZE / 2 - 40;
  const startAngle = -225; // degrees
  const endAngle = 45;     // degrees

  const animatedProps = useAnimatedProps(() => {
    const angle = startAngle + (endAngle - startAngle) * progress.value;
    const radian = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(radian);
    const y = centerY + radius * Math.sin(radian);

    return {
      d: `M ${centerX} ${centerY} L ${x} ${y}`,
    };
  });

  // Determine color zone
  const color =
    force < targetMin ? theme.colors.primary :
    force > targetMax ? theme.colors.error :
    theme.colors.success;

  return (
    <View style={styles.container}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
        {/* Background arc (gray) */}
        <Path
          d={`M ${centerX - radius * 0.7} ${centerY + radius * 0.7} A ${radius} ${radius} 0 1 1 ${centerX + radius * 0.7} ${centerY + radius * 0.7}`}
          stroke="#E5E7EB"
          strokeWidth={20}
          fill="none"
          strokeLinecap="round"
        />

        {/* Optimal zone indicator (green arc) */}
        <Path
          d={`M ${centerX} ${centerY} L ${centerX + radius} ${centerY}`}
          stroke={theme.colors.success}
          strokeWidth={8}
          strokeOpacity={0.3}
        />

        {/* Force indicator needle */}
        <AnimatedPath
          animatedProps={animatedProps}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Center circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={12}
          fill={color}
        />
      </Svg>

      {/* Force value display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>
          {Math.round(force)}N
        </Text>
        <Text style={styles.label}>Current Force</Text>
        <Text style={styles.range}>
          Target: {targetMin}-{targetMax}N
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  valueContainer: {
    position: 'absolute',
    top: '55%',
    alignItems: 'center',
  },
  value: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  range: {
    fontSize: 12,
    color: theme.colors.text.disabled,
    marginTop: 2,
  },
});
```

### Step 5.5: Build Training Screen (1.5 hours)

**Update `app/training.tsx`:**

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusHeader } from '../components/training/StatusHeader';
import { HeatmapModule } from '../components/training/HeatmapModule';
import { ForceGauge } from '../components/training/ForceGauge';
import { FeedbackCard } from '../components/training/FeedbackCard';
import { MetricsStrip } from '../components/training/MetricsStrip';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { useTrainingData } from '../lib/useTrainingData';
import { theme } from '../styles/theme';

export default function TrainingScreen() {
  const router = useRouter();
  const { force, thrusts, position, angle, feedback, targetForce } = useTrainingData();

  const handleComplete = () => {
    router.push('/analytics');
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <StatusHeader
        isConnected={true}
        batteryLevel={87}
        duration={125}
      />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heatmap Module */}
        <View style={styles.module}>
          <Text style={styles.moduleTitle}>Hand Position Heatmap</Text>
          <HeatmapModule position={position} force={force} />
        </View>

        {/* Force Gauge */}
        <View style={styles.module}>
          <ForceGauge
            force={force}
            targetMin={targetForce.min}
            targetMax={targetForce.max}
          />
        </View>

        {/* Real-time Feedback */}
        <View style={styles.module}>
          <FeedbackCard
            message={feedback}
            type={force < 80 ? 'info' : force > 120 ? 'error' : 'success'}
          />
        </View>

        {/* Complete Session Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Metrics */}
      <MetricsStrip
        thrusts={thrusts}
        avgForce={force}
        accuracy={85}
      />

      {/* Dev Bypass */}
      <DevBypassButton nextScreen="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingTop: 135,
    paddingBottom: 150,
    paddingHorizontal: 16,
    gap: 16,
  },
  module: {
    gap: 8,
  },
  moduleTitle: {
    ...theme.typography.h3,
    paddingHorizontal: 4,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...theme.shadows.md,
  },
  completeButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

### Step 5.6: Test Training Screen (30 minutes)

1. Navigate through flow: Home → Connect → Training
2. Verify real-time data updates
3. Check heatmap position changes
4. Test force gauge animation
5. Verify "Complete Session" navigation

---

## 📈 Phase 6: Session Analytics Screen (Day 6-7)

### Step 6.1: Copy Analytics Components (30 minutes)

```bash
mkdir -p components/analytics

cp "Figma Designs/SessionAnalyticsScreen/src/components/SessionNavigation.tsx" components/analytics/
cp "Figma Designs/SessionAnalyticsScreen/src/components/HeroSuccessCard.tsx" components/analytics/
cp "Figma Designs/SessionAnalyticsScreen/src/components/MetricsGrid.tsx" components/analytics/
cp "Figma Designs/SessionAnalyticsScreen/src/components/TechniqueAnalysis.tsx" components/analytics/
cp "Figma Designs/SessionAnalyticsScreen/src/components/ActionButtons.tsx" components/analytics/
```

### Step 6.2: Create Analytics Summary Component (1 hour)

**Create `components/analytics/MetricsGrid.tsx`:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'excellent' | 'good' | 'needs-improvement';
}

function MetricCard({ title, value, unit, status }: MetricCardProps) {
  const statusColor =
    status === 'excellent' ? theme.colors.success :
    status === 'good' ? theme.colors.warning :
    theme.colors.error;

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

interface MetricsGridProps {
  data: {
    overallScore: number;
    effectiveThrusts: number;
    totalThrusts: number;
    averageForce: number;
    forceConsistency: number;
    positionAccuracy: number;
    angleAccuracy: number;
  };
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const getStatus = (value: number): 'excellent' | 'good' | 'needs-improvement' => {
    if (value >= 90) return 'excellent';
    if (value >= 75) return 'good';
    return 'needs-improvement';
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MetricCard
          title="Overall Score"
          value={data.overallScore}
          unit="%"
          status={getStatus(data.overallScore)}
        />
        <MetricCard
          title="Effective Thrusts"
          value={`${data.effectiveThrusts}/${data.totalThrusts}`}
          status={getStatus((data.effectiveThrusts / data.totalThrusts) * 100)}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          title="Avg Force"
          value={data.averageForce}
          unit="N"
          status={data.averageForce >= 80 && data.averageForce <= 120 ? 'excellent' : 'needs-improvement'}
        />
        <MetricCard
          title="Consistency"
          value={data.forceConsistency}
          unit="%"
          status={getStatus(data.forceConsistency)}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          title="Position"
          value={data.positionAccuracy}
          unit="%"
          status={getStatus(data.positionAccuracy)}
        />
        <MetricCard
          title="Angle"
          value={data.angleAccuracy}
          unit="%"
          status={getStatus(data.angleAccuracy)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginBottom: 8,
  },
  cardTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.disabled,
  },
});
```

### Step 6.3: Create Technique Analysis Component (1 hour)

**Create `components/analytics/TechniqueAnalysis.tsx`:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface FeedbackItem {
  type: 'success' | 'warning' | 'error';
  message: string;
  detail: string;
}

interface TechniqueAnalysisProps {
  feedback: FeedbackItem[];
}

export function TechniqueAnalysis({ feedback }: TechniqueAnalysisProps) {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: theme.colors.success, bg: '#ECFDF5' };
      case 'warning':
        return { icon: '!', color: theme.colors.warning, bg: '#FEF3C7' };
      case 'error':
        return { icon: '✕', color: theme.colors.error, bg: '#FEE2E2' };
      default:
        return { icon: 'i', color: theme.colors.primary, bg: '#EFF6FF' };
    }
  };

  return (
    <View style={styles.container}>
      {feedback.map((item, index) => {
        const { icon, color, bg } = getIconAndColor(item.type);

        return (
          <View key={index} style={styles.feedbackCard}>
            <View style={[styles.iconContainer, { backgroundColor: bg }]}>
              <Text style={[styles.icon, { color }]}>{icon}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
          </View>
        );
      })}

      {/* Recommendations */}
      <View style={styles.recommendationsCard}>
        <Text style={styles.recommendationsTitle}>Next Steps</Text>
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.recommendationText}>
            Practice maintaining consistent force between 80-120N
          </Text>
        </View>
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.recommendationText}>
            Focus on hand positioning 2-3cm higher on the chest
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  feedbackCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  detail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  recommendation: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
});
```

### Step 6.4: Build Analytics Screen (1 hour)

**Update `app/analytics.tsx`:**

```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionNavigation } from '../components/analytics/SessionNavigation';
import { HeroSuccessCard } from '../components/analytics/HeroSuccessCard';
import { MetricsGrid } from '../components/analytics/MetricsGrid';
import { TechniqueAnalysis } from '../components/analytics/TechniqueAnalysis';
import { DevBypassButton } from '../components/shared/DevBypassButton';
import { mockAnalyticsData } from '../lib/mockData';
import { theme } from '../styles/theme';

export default function AnalyticsScreen() {
  const router = useRouter();

  const handleNewSession = () => {
    router.push('/connect');
  };

  const handleViewHistory = () => {
    // TODO: Navigate to history screen
    console.log('View history');
  };

  const handleDone = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <SessionNavigation onBack={handleDone} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Hero Card */}
        <HeroSuccessCard
          score={mockAnalyticsData.overallScore}
          duration={mockAnalyticsData.duration}
        />

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          <MetricsGrid data={mockAnalyticsData} />
        </View>

        {/* Technique Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Assessment</Text>
          <TechniqueAnalysis feedback={mockAnalyticsData.feedback} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNewSession}
          >
            <Text style={styles.primaryButtonText}>Start New Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewHistory}
          >
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dev Bypass (back to home) */}
      <DevBypassButton nextScreen="index" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
```

---

## ✅ Phase 7: Testing & Polish (Day 8-9)

### Step 7.1: Complete User Flow Testing (2 hours)

**Create testing checklist:**

```typescript
// Create tests/userFlow.test.ts
const testFlow = {
  'Home Screen': {
    '✓ 3D vest loads and animates': false,
    '✓ Animation completes in 3 seconds': false,
    '✓ Buttons fade in after animation': false,
    '✓ "Connect" button navigates correctly': false,
    '✓ Bypass button appears in top-right': false,
  },
  'Connect Screen': {
    '✓ Mock devices appear in list': false,
    '✓ Device selection shows connecting modal': false,
    '✓ Auto-navigates to training after 2s': false,
    '✓ Back button returns to home': false,
    '✓ Bypass button works': false,
  },
  'Training Screen': {
    '✓ Real-time data updates every 200ms': false,
    '✓ Heatmap position changes': false,
    '✓ Force gauge animates smoothly': false,
    '✓ Feedback updates based on force': false,
    '✓ Complete button navigates to analytics': false,
    '✓ Bypass button works': false,
  },
  'Analytics Screen': {
    '✓ Metrics display correctly': false,
    '✓ Feedback cards show': false,
    '✓ "New Session" navigates to connect': false,
    '✓ Navigation back button returns to home': false,
    '✓ Bypass button returns to home': false,
  },
};
```

**Manual Testing Steps:**

1. **Full Flow Test (10 times)**
   - Start app → Wait for animation → Tap Connect → Select device → Wait for connection → View training → Tap Complete → View analytics → New session
   - Record any crashes, glitches, or slow performance

2. **Bypass Flow Test**
   - Test each bypass button
   - Verify screens load with template data
   - Check for navigation bugs

3. **Performance Test**
   - Monitor FPS during 3D animation
   - Check memory usage during training screen
   - Test on older devices (if available)

### Step 7.2: UI Polish (3 hours)

**Polish checklist:**

```typescript
const polishTasks = [
  '✓ Consistent spacing across all screens',
  '✓ Typography matches Figma designs',
  '✓ Colors match RescueRight brand (#3B82F6, #00A896)',
  '✓ Button press states (opacity change)',
  '✓ Loading states for all async operations',
  '✓ Smooth transitions between screens',
  '✓ Safe area handling (notch, home indicator)',
  '✓ Landscape mode disabled (portrait only)',
  '✓ Status bar styling (dark text on light bg)',
];
```

**Apply polish:**

```typescript
// app/_layout.tsx - Add status bar config
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      {/* ...rest */}
    </>
  );
}

// app.json - Lock to portrait
{
  "expo": {
    "orientation": "portrait",
    "userInterfaceStyle": "light"
  }
}
```

### Step 7.3: Add Loading States (1.5 hours)

**Create `components/shared/LoadingSpinner.tsx`:**

```typescript
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
```

### Step 7.4: Error Handling (1 hour)

**Create `components/shared/ErrorView.tsx`:**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  message: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

## 🔌 Phase 8: ESP Integration Preparation (Day 10)

### Step 8.1: Install Bluetooth Library (20 minutes)

```bash
npm install react-native-ble-plx
npx expo install expo-device
```

### Step 8.2: Create Bluetooth Manager (1.5 hours)

**Create `lib/bluetooth.ts`:**

```typescript
import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform } from 'react-native';

// ESP32 Service and Characteristic UUIDs (update these with your actual UUIDs)
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_FORCE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const CHAR_POSITION_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const CHAR_ANGLE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';

class BluetoothManager {
  private manager: BleManager;
  private device: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  // Initialize Bluetooth
  async initialize(): Promise<boolean> {
    const state = await this.manager.state();
    if (state === State.PoweredOn) {
      return true;
    }
    return false;
  }

  // Scan for RescueRight vests
  async scanForDevices(onDeviceFound: (device: Device) => void): Promise<void> {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }

      // Filter for RescueRight vests
      if (device?.name?.startsWith('RescueRight')) {
        onDeviceFound(device);
      }
    });
  }

  // Stop scanning
  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  // Connect to device
  async connect(deviceId: string): Promise<boolean> {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.device = device;
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  // Subscribe to force sensor data
  async subscribeToForce(callback: (force: number) => void): Promise<void> {
    if (!this.device) return;

    this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHAR_FORCE_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Force monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          // Decode base64 value to number
          const force = this.decodeValue(characteristic.value);
          callback(force);
        }
      }
    );
  }

  // Subscribe to position data
  async subscribeToPosition(callback: (x: number, y: number) => void): Promise<void> {
    if (!this.device) return;

    this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHAR_POSITION_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Position monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          const [x, y] = this.decodePositionValue(characteristic.value);
          callback(x, y);
        }
      }
    );
  }

  // Subscribe to angle data
  async subscribeToAngle(callback: (angle: number) => void): Promise<void> {
    if (!this.device) return;

    this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHAR_ANGLE_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Angle monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          const angle = this.decodeValue(characteristic.value);
          callback(angle);
        }
      }
    );
  }

  // Disconnect
  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
    }
  }

  // Helper: Decode base64 to number
  private decodeValue(base64: string): number {
    const buffer = Buffer.from(base64, 'base64');
    return buffer.readFloatLE(0);
  }

  // Helper: Decode position (x, y)
  private decodePositionValue(base64: string): [number, number] {
    const buffer = Buffer.from(base64, 'base64');
    const x = buffer.readFloatLE(0);
    const y = buffer.readFloatLE(4);
    return [x, y];
  }
}

export const bluetoothManager = new BluetoothManager();
```

### Step 8.3: Create Bluetooth Integration Guide (30 minutes)

**Create `docs/ESP_INTEGRATION.md`:**

```markdown
# ESP32 Integration Guide

## Hardware Requirements
- ESP32 DevKit
- Force sensor (FSR or load cell)
- Position sensors (2x Hall effect or capacitive)
- Angle sensor (MPU6050 gyroscope)
- 3.7V LiPo battery

## ESP32 Code Structure

### Service UUIDs
Update `lib/bluetooth.ts` with your actual UUIDs:

```cpp
// ESP32 Arduino code
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define FORCE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define POSITION_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define ANGLE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26aa"
```

### Data Format
- **Force**: Float32 (Newtons, 0-200N)
- **Position**: 2x Float32 (x, y normalized 0-1)
- **Angle**: Float32 (degrees, -45 to +45)

## Testing with Mock Data
Until ESP is ready, use `lib/mockData.ts` and `lib/useTrainingData.ts`.

## Switching to Real Data

1. In `app/training.tsx`, replace:
```typescript
// Before:
import { useTrainingData } from '../lib/useTrainingData';

// After:
import { useBluetoothTrainingData } from '../lib/useBluetoothTrainingData';
```

2. Ensure Bluetooth permissions in `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "RescueRight needs Bluetooth to connect to smart vest"
      }
    },
    "android": {
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```
```

---

## ✨ Success Criteria

### Functionality Checklist
- [ ] App launches without crashes
- [ ] 3D vest animation plays smoothly (60 FPS)
- [ ] All 4 screens navigate correctly
- [ ] Bypass buttons work in dev mode
- [ ] Mock data displays realistically
- [ ] Buttons have proper touch feedback
- [ ] Loading states show during transitions
- [ ] Error handling works

### Visual Quality
- [ ] Matches Figma designs 90%+
- [ ] Consistent spacing and typography
- [ ] Smooth animations (no jank)
- [ ] Professional color scheme
- [ ] Safe area handling on all devices
- [ ] Icons and illustrations render correctly

### Performance
- [ ] Home screen loads in <2s
- [ ] 3D animation maintains 60 FPS
- [ ] Training screen updates smoothly (real-time)
- [ ] Navigation transitions are instant
- [ ] App size <50MB
- [ ] Memory usage <200MB

### Competition Readiness
- [ ] Demonstrates full user flow
- [ ] Professional UI/UX
- [ ] Shows technical capability (3D, real-time data)
- [ ] Easy to demo to judges
- [ ] Template data is realistic
- [ ] No obvious bugs or glitches

---

## 📊 Progress Tracking

### Daily Milestones

**Day 1**: ✅ Project setup complete, navigation working
**Day 2**: ✅ Dev bypass buttons, screen placeholders
**Day 3**: ✅ Home screen with 3D animation
**Day 4**: ✅ Connect screen functional
**Day 5**: ✅ Training screen with heatmap
**Day 6**: ✅ Training screen with force gauge
**Day 7**: ✅ Analytics screen complete
**Day 8**: ✅ Full testing done
**Day 9**: ✅ Polish and refinement
**Day 10**: ✅ ESP integration prep

---

## 🚨 Common Issues & Solutions

### Issue: 3D model won't load
**Solution**: Check file path in `VestAnimation3D.tsx`, ensure `vest.glb` is in `assets/models/`

### Issue: Navigation not working
**Solution**: Verify `expo-router` is properly configured in `package.json` main field

### Issue: Animations are choppy
**Solution**: Enable `react-native-reanimated` plugin in `babel.config.js`

### Issue: Bypass buttons don't appear
**Solution**: Check `__DEV__` flag, run in development mode (`npm start`)

### Issue: Styles don't match Figma
**Solution**: Review `theme.ts`, ensure Tailwind config is correct

---

## 📞 Next Steps After Roadmap

1. **Build APK/IPA for testing**:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

2. **Prepare demo video** (1-2 minutes):
   - Show full user flow
   - Highlight 3D animation
   - Demonstrate real-time feedback
   - Show analytics

3. **Create presentation slides**:
   - Problem statement
   - Solution overview
   - Live demo
   - Technical architecture
   - Market opportunity

4. **Practice pitch** (4 minutes):
   - Opening hook (30s)
   - Problem deep dive (55s)
   - Solution demo (50s)
   - Market opportunity (35s)
   - Differentiation (35s)
   - Impact & CTA (35s)

---

## 📊 Development Progress Tracker

### Completed ✅

**Phase 1: Project Setup** (Day 1)
- ✅ Step 1.1: Initialize Expo Project
- ✅ Step 1.2: Install Dependencies (including react-native-worklets-core fix)
- ✅ Step 1.3: Configure Expo Router
- ✅ Step 1.4: Setup Tailwind CSS
- ✅ Step 1.5: Create Theme Configuration
- ✅ Step 1.6: Test Installation

**Phase 2: Core Navigation** (Day 2)
- ✅ Step 2.1: Create Screen Placeholders (index, connect, training, analytics)
- ✅ Step 2.2: Create Dev Bypass Button Component
- ✅ Step 2.3: Add Bypass Buttons to All Screens
- ✅ Step 2.4: Test Navigation Flow

**Phase 3: Home Screen with 3D Animation** (Day 3)
- ✅ Step 3.1: 3D Model Ready (lod.glb in assets/models)
- ✅ Step 3.2: Create 3D Vest Component (VestAnimation3D.tsx)
- ✅ Step 3.3: Create Home Buttons Component (HomeButtons.tsx)
- ✅ Step 3.4: Update Home Screen (app/index.tsx)
- ✅ Step 3.5: Ready for Testing

### In Progress 🔄

**Phase 4: Connect Screen** (Day 4)
- ⏳ Copy Figma components
- ⏳ Create mock Bluetooth data
- ⏳ Build connect screen

### Pending ⏳

- Phase 5: Live Training Screen
- Phase 6: Session Analytics Screen
- Phase 7: Testing & Polish
- Phase 8: ESP Integration Preparation

---

**Good luck with your MVP development! You've got this! 🚀**

*RescueRight MVP Roadmap v1.1 | IDEATE 2025 | Last Updated: October 11, 2025*
