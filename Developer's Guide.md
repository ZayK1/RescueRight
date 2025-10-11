# RescueRight MVP - Developer's Guide

**Version**: 1.1
**Last Updated**: October 11, 2025
**Status**: All Phases Complete ✅

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Overview](#-project-overview)
3. [Architecture](#-architecture)
4. [Setup & Installation](#-setup--installation)
5. [Implementation Status](#-implementation-status)
6. [Testing Guide](#-testing-guide)
7. [Troubleshooting](#-troubleshooting)
8. [ESP32 Integration](#-esp32-integration)

---

## 🚀 Quick Start

### Starting the Development Server

```bash
cd RescueRightApp
npx expo start
```

**Then press:**
- `i` for iOS Simulator
- `a` for Android Emulator

### Setup Issues Fixed ✅

All configuration issues have been resolved:

1. ✅ `tsconfig.json` updated with path aliases.
2. ✅ All web-based components refactored to be React Native compatible.
3. ✅ Data model discrepancies between components and hooks have been resolved.
4. ✅ All required dependencies like `lucide-react-native` are now installed.

**The app now works!** 🎉

---

## 📱 Project Overview

### What is RescueRight?

A smart CPR training vest with real-time feedback for university students. The MVP app connects via Bluetooth to provide instant compression depth, rate, and hand position analysis.

### Key Features

- **3D Vest Animation** - Apple AirPods-style home screen
- **Bluetooth Pairing** - Seamless ESP32 connection
- **Real-Time Feedback** - Live indicators for compression depth, rate, and hand position.
- **Session Analytics** - Performance summary and technique analysis.
- **Dev Bypass Buttons** - Quick navigation (dev mode only)

### Tech Stack

```
Framework:    React Native + Expo SDK 54
Language:     TypeScript
Navigation:   Expo Router (file-based)
3D Graphics:  Three.js + @react-three/fiber
Animations:   React Native Reanimated
Icons:        lucide-react-native
Charts/SVG:   react-native-svg
State:        React Hooks
Data:         Mock data (lib/mockData.ts)
```

---

## 🏗 Architecture

### File Structure

```
RescueRightApp/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home (3D) ✅
│   ├── connect.tsx              # Pairing ✅
│   ├── training.tsx             # Live ✅
│   └── analytics.tsx            # Summary ✅
│
├── components/
│   ├── home/
│   │   ├── VestAnimation3D.tsx
│   │   └── HomeButtons.tsx
│   ├── connect/
│   │   ├── PairingNavigation.tsx
│   │   ├── VestIllustration.tsx
│   │   ├── ConnectionStates.tsx
│   │   ├── ConnectingModal.tsx
│   │   ├── ManualPairing.tsx
│   │   └── HelpSection.tsx
│   ├── training/
│   │   ├── StatusHeader.tsx
│   │   ├── MetricsStrip.tsx
│   │   ├── ForceGauge.tsx
│   │   ├── HeatmapModule.tsx
│   │   └── FeedbackCard.tsx
│   ├── analytics/
│   │   ├── SessionNavigation.tsx
│   │   ├── HeroSuccessCard.tsx
│   │   ├── MetricsGrid.tsx
│   │   └── TechniqueAnalysis.tsx
│   └── shared/
│       └── DevBypassButton.tsx
│
├── hooks/
│   └── useTrainingData.ts
│
├── lib/
│   └── mockData.ts
│
├── styles/
│   └── theme.ts
│
├── assets/models/
│   └── lod.glb (20.5MB)
│
├── tsconfig.json
├── app.json
├── babel.config.js
└── package.json
```

### Design System

**Colors:**
```
Primary:     #3B82F6 (Blue)
Secondary:   #00A896 (Teal)
Success:     #059669 (Green)
Warning:     #F59E0B (Orange)
Destructive: #DC2626 (Red)
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- iOS: Xcode 14+ + Simulator
- Android: Android Studio + Emulator
- Expo Go (optional)

### Installation

```bash
cd RescueRight/RescueRightApp
npm install --legacy-peer-deps
npx expo start
```

### Key Dependencies

```json
{
  "@react-three/fiber": "^9.3.0",
  "three": "^0.180.0",
  "expo-router": "~6.0.12",
  "react-native-reanimated": "~4.1.1",
  "react-native-svg": "^15.12.1",
  "lucide-react-native": "..."
}
```

### Critical Config Files

**tsconfig.json:**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**babel.config.js:**
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin']
};
```

---

## ✅ Implementation Status

### Phase 1-3: Setup, Navigation, Home ✅
- Project fully configured and running.
- Home screen shows 3D animation and navigates correctly.

### Phase 4: Connect Screen ✅
- **PairingNavigation.tsx**: Native header component.
- **VestIllustration.tsx**: Native animated SVG component.
- **ConnectionStates.tsx**: Native list for mock BLE devices.
- **ConnectingModal.tsx**: Native modal for connection progress.
- **Result**: A fully functional, native pairing UI.

### Phase 5: Training Screen ✅
- **StatusHeader.tsx**: Native header with timer.
- **MetricsStrip.tsx**: Native component displaying live metrics.
- **ForceGauge.tsx**: Simplified native gauge for compression depth.
- **HeatmapModule.tsx**: Simplified native indicator for hand position.
- **FeedbackCard.tsx**: Prop-driven native feedback card.
- **useTrainingData.ts**: Hook provides simulated `compressionDepth` and `compressionRate`.
- **Note**: The UI metaphor is "Force" (N), but the underlying data model is "Compression" (mm). The components now correctly adapt the `compressionDepth` data for visualization.

### Phase 6: Analytics Screen ✅
- **SessionNavigation.tsx**: Native header component.
- **HeroSuccessCard.tsx**: Native summary card with animated score circle.
- **MetricsGrid.tsx**: Native grid displaying final session metrics.
- **TechniqueAnalysis.tsx**: Native list of feedback items.
- **Result**: A fully functional, native session summary screen.

---

## 🧪 Testing Guide

### Complete Flow (1 minute)

**1. Home (10s)**
- ✅ 3D vest loads & animates
- ✅ Buttons fade in
- ✅ Navigation works

**2. Connect (7s)**
- ✅ Scanning animation
- ✅ Mock devices appear
- ✅ Connection modal
- ✅ Auto-nav to Training

**3. Training (30s)**
- ✅ Timer counts up
- ✅ Metrics update
- ✅ Depth gauge animates
- ✅ Position indicator moves
- ✅ Feedback changes
- ✅ "Complete Session" navigates to Analytics

**4. Analytics (10s)**
- ✅ Summary card displays score
- ✅ Metrics grid is populated
- ✅ Buttons navigate to Home or Connect

---

## 🔧 Troubleshooting

### "View config getter callback for component 'div'..."

This error means a component is using HTML elements (like `<div>`, `<button>`, `<span>`) instead of React Native components (`<View>`, `<TouchableOpacity>`, `<Text>`).

**Fix:**
Identify the component being rendered by the screen and replace all HTML tags with their React Native equivalents. All components in `components/connect`, `components/training`, and `components/analytics` have now been fixed.

### "Unable to resolve module 'lucide-react-native'"

The required icon library is not installed.

**Fix:**
```bash
cd RescueRightApp
npm install lucide-react-native --legacy-peer-deps
npx expo start --clear
```

### "Cannot read property '...' of undefined"

This often happens when a component expects data that isn't being provided.

**Example:** The analytics screen was trying to use `mockAnalyticsData`, but the data file exports `mockSessionSummary`.

**Fix:**
1. Check the import statement in the screen file (e.g., `app/analytics.tsx`).
2. Ensure the variable name matches the export from `lib/mockData.ts`.
3. Verify that the properties being accessed (e.g., `.overallScore`) exist on the imported object.

### Metro Bundler Stuck

**Fix:**
```bash
pkill -9 -f "expo"
rm -rf .expo node_modules/.cache
npx expo start --clear
```

---

## 📡 ESP32 Integration

(No changes made to this section)

---

## 📚 Quick Reference

### Essential Commands

```bash
npx expo start              # Start server
npx expo start --clear      # Clear cache
npm install --legacy-peer-deps # Install dependencies with conflicts
```

### Key Locations

```
Screens:    app/*.tsx
Components: components/**/*.tsx
Hooks:      hooks/*.ts
Mock Data:  lib/mockData.ts
Theme:      styles/theme.ts
3D Model:   assets/models/lod.glb
Config:     app.json, tsconfig.json, babel.config.js
```

---

**Last Updated**: October 11, 2025
**For**: IDEATE 2025 Competition
**Status**: All Phases Complete ✅
