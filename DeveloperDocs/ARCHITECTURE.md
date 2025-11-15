# RescueRight - System Architecture

## Overview

RescueRight is a real-time Heimlich maneuver training system combining IoT sensors with mobile feedback. The system uses an ESP32-powered smart vest with 4x MPU6500 IMU sensors to capture compression force, hand position, and body angle, delivering instant coaching through a React Native mobile application.

---

## Technology Stack

### Frontend
- **Framework**: React Native 0.81.4 with Expo SDK 54
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router 6.0.12 (file-based routing)
- **State Management**: React hooks + singleton storage pattern
- **UI Library**: React Native Paper 5.14.5
- **Styling**: Tailwind CSS 4.1.14 via NativeWind 4.2.1
- **Animations**: React Native Reanimated 4.1.1
- **Icons**: Lucide React Native 0.545.0
- **3D Graphics**: Three.js 0.180.0 + React Three Fiber 9.3.0

### Hardware Communication
- **BLE**: react-native-ble-plx 3.5.0
- **Data Encoding**: Base64 for binary sensor data
- **Update Rate**: 10Hz (100ms intervals)

### Build & Deploy
- **iOS**: Expo development builds + Xcode
- **Android**: Expo development builds + Android Studio
- **Bundler**: Metro (React Native default)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PHYSICAL HARDWARE                          │
│  ESP32 DevKit V1 + 4x MPU6500 IMU Sensors                      │
│  • Dual I2C buses (GPIO 21/22, GPIO 25/26)                     │
│  • 10Hz sensor sampling and data aggregation                   │
│  • BLE GATT server with 3 characteristics                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                  Bluetooth LE
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   MOBILE APPLICATION                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  lib/bluetooth.ts - BluetoothManager (Singleton)        │  │
│  │  • Device scanning & connection management              │  │
│  │  • Characteristic subscriptions (Force, Position, Angle)│  │
│  │  • Base64 decoding & data validation                    │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │  hooks/useBluetoothTrainingData.ts                          │  │
│  │  • EMA filtering (force, position: α=0.2-0.3)             │  │
│  │  • Median filtering (angle: window=5)                      │  │
│  │  • Thrust detection (2.5N threshold, 400ms cooldown)      │  │
│  │  • Compression rate calculation (60s window)              │  │
│  │  • Real-time feedback generation                          │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │  app/*.tsx - Screen Components                            │  │
│  │  • index.tsx: 3D vest animation & entry point            │  │
│  │  • connect.tsx: BLE device pairing                        │  │
│  │  • training.tsx: Real-time metrics & feedback             │  │
│  │  • analytics.tsx: Post-session scoring (0-100 points)    │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │  lib/sessionStorage.ts - Session Persistence              │  │
│  │  • Thrust history tracking                                 │  │
│  │  • Performance metrics aggregation                         │  │
│  │  • AsyncStorage for local persistence                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Sensor → App Pipeline

```typescript
// Hardware (ESP32) → BLE Transmission
Force:    Float32 (0-500N)
Position: Float32[2] (X, Y normalized 0-1)
Angle:    Float32 (-180° to 180°)

// BLE → Bluetooth Manager
Base64 decode → Float32 values
Data validation (range checks)

// Bluetooth Manager → Training Hook
Raw sensor data → Noise filtering
EMA filter (force, position)
Median filter (angle)

// Training Hook → UI Components
Filtered data → Thrust detection
Session tracking → Real-time feedback
```

### 2. Sensor Data Processing

**Force Processing**:
```typescript
// lib/bluetooth.ts
rawForce = decodeFloat(bleCharacteristic.value)

// hooks/useBluetoothTrainingData.ts
filteredForce = emaFilter.update(rawForce)  // α=0.3, scaled 0.25
isThrust = filteredForce > 2.5N && (now - lastThrust) > 400ms
```

**Position Processing**:
```typescript
rawPosition = decodePosition(bleCharacteristic.value)  // {x, y}
filteredX = emaFilterX.update(rawPosition.x)  // α=0.2
filteredY = emaFilterY.update(rawPosition.y)  // α=0.2
```

**Angle Processing**:
```typescript
rawAngle = decodeFloat(bleCharacteristic.value)
filteredAngle = medianFilter.update(rawAngle)  // window=5
```

### 3. Session Lifecycle

```
User Flow:
  Home → Connect → Training → Analytics → Home

Data Flow:
  1. Connect: BLE pairing + subscription setup
  2. Training Start: sessionStorage.start()
  3. Real-time: Each thrust → sessionStorage.recordThrust()
  4. Training End: sessionStorage.complete()
  5. Analytics: Retrieve session data → Calculate score
```

---

## Core Modules

### `lib/bluetooth.ts` (600+ lines)
**BluetoothManager Singleton**

Key Methods:
- `initialize()`: Setup BLE and permissions
- `scanForDevices()`: Discover "RescueRight" devices
- `connect(deviceId)`: Establish BLE connection
- `subscribeToAllSensors(callback)`: Subscribe to 3 characteristics
- `disconnect()`: Clean BLE disconnection

BLE Configuration:
```typescript
SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
CHAR_FORCE_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
CHAR_POSITION_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9"
CHAR_ANGLE_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26aa"
```

### `hooks/useBluetoothTrainingData.ts` (350+ lines)
**Real-time Training Data Hook**

Features:
- Data validation (0-500N force, 0-1 position, ±180° angle)
- Noise filtering (EMA + Median)
- Thrust detection with cooldown
- Compression rate calculation (thrusts/min over 60s window)
- Real-time feedback generation
- Data quality metrics

### `lib/sessionStorage.ts`
**Session Persistence Manager**

Interfaces:
```typescript
interface SessionData {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  totalThrusts: number;
  averageForce: number;
  maxForce: number;
  averageRate: number;
  thrustHistory: ThrustData[];
  positionAccuracy: number;
}
```

### `lib/calibration.ts` (850+ lines)
**Sensor Calibration Engine**

Capabilities:
- CSV data parsing
- Hall sensor force calibration
- MPU position/angle calibration
- Data quality validation
- Filter implementations (EMA, Moving Average, Median)

---

## Screen Components

### Home Screen (`app/index.tsx`)
- Animated 3D vest with rotation effect (Three.js)
- Entry point to connect flow
- About modal

### Connect Screen (`app/connect.tsx`)
- BLE device scanning with RSSI display
- Device list with connection status
- Manual MAC address entry
- Connection progress modal

### Training Screen (`app/training.tsx`)
**Primary Interface - Real-time Feedback**

Components:
- `StatusHeader`: Connection status, timer, battery
- `ForceGauge`: Circular gauge with target zones (0-150N scale)
- `HeatmapModule`: 2D hand position visualization
- `FeedbackCard`: Dynamic coaching messages
- `MetricsStrip`: Live thrust count, rate, current force

Target Thresholds:
- Force: 20-60N (optimal range)
- Position: (0.5, 0.45) ± 8% tolerance
- Angle: ~-45° (upward thrust)
- Rate: 5 thrusts/minute

### Analytics Screen (`app/analytics.tsx`)
**Post-Session Performance Analysis**

Scoring Algorithm (0-100 points):
- Force Quality: 40 points
- Position Accuracy: 30 points
- Rate Consistency: 20 points
- Completion Bonus: 10 points

Displays:
- Hero success card with animated score
- 6-metric performance grid
- Technique analysis with recommendations
- Session history navigation

### Debug Screen (`app/sensor-debug.tsx`)
**Developer Testing Tool**

Features:
- Real-time sensor value display
- Raw vs filtered comparison
- Data logging with CSV export
- Mock data toggle
- Quality metrics visualization

---

## Design System

### Color Palette (Medical-Grade)
```typescript
// styles/theme.ts
PRIMARY = "#0066CC"      // Clinical blue
SUCCESS = "#00C48C"      // Optimal performance
WARNING = "#FF8B00"      // Needs attention
ERROR = "#FF3B30"        // Critical
BACKGROUND = "#F5F7FA"   // Clinical white
```

### Typography Scale
- Display: 48px (critical metrics)
- H1-H4: 34-18px (hierarchy)
- Body: 17px (main content)
- Caption: 15px, 13px
- Micro: 11px (labels)

### Spacing System
- XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px, XXL: 48px

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| BLE Update Rate | 10Hz | ESP32 transmission frequency |
| Processing Latency | <200ms | Sensor to UI display |
| Force Accuracy | ±5N | Post-calibration target |
| Position Accuracy | ±2cm | Real-world measurement |
| Angle Accuracy | ±5° | Gyroscope-based |
| App Startup | ~2s | Cold start to home screen |
| Session Persistence | Local | AsyncStorage, no cloud dependency |

---

## Security & Privacy

- **Data Storage**: All health data stored locally on-device
- **Network**: No internet required for core functionality
- **Bluetooth**: BLE pairing with standard security
- **Permissions**: Minimal (Bluetooth, Location for Android BLE)

---

## Scalability Considerations

**Current Capacity**:
- Single-vest connection per session
- Local data storage only
- No multi-user support

**Future Enhancements** (Architecture-Ready):
- Cloud sync infrastructure hooks present
- Multi-device connection capability in BLE manager
- Session data format supports user profiles
- API-ready data models for backend integration

---

## Development Environment

**Prerequisites**:
- Node.js 18+
- npm or yarn
- Expo CLI
- Xcode (iOS) or Android Studio (Android)

**Project Structure**:
```
RescueRightApp/
├── app/                 # Expo Router screens
├── components/          # React components (41 total)
├── hooks/              # Custom hooks (2)
├── lib/                # Core business logic (4 modules)
├── firmware/           # ESP32 Arduino code (2 files)
├── styles/             # Design system
├── types/              # TypeScript definitions
└── assets/             # Images, 3D models
```

**Build Commands**:
```bash
npm install              # Install dependencies
npm start                # Start Expo dev server
npm run ios              # Build iOS (macOS only)
npm run android          # Build Android
```

---

## Testing Strategy

**Mock Data Mode**:
- Toggle in sensor-debug screen
- Simulates realistic sensor values
- Enables UI/UX testing without hardware

**Hardware Integration**:
- Real-time BLE connection testing
- Sensor calibration validation
- Data quality monitoring

**Quality Assurance**:
- TypeScript type checking
- Data validation at BLE layer
- Filter stability testing
- Session persistence verification

---

## Deployment

**iOS**:
- Expo development builds
- Free Apple Developer account (7-day certificates)
- Physical device deployment via Xcode

**Android**:
- Expo development builds
- APK generation for sideloading
- Google Play Store ready

See `DeveloperDocs/DEPLOYMENT.md` for detailed instructions.

---

## Technical Decisions

**Why React Native + Expo**:
- Cross-platform support (iOS + Android from single codebase)
- Fast iteration with hot reload
- Strong BLE library ecosystem
- Native performance for real-time updates

**Why Singleton Pattern (BluetoothManager)**:
- Single BLE connection lifecycle management
- Prevents multiple connection attempts
- Global state for device pairing status

**Why EMA Filtering**:
- Low computational overhead
- Smooth real-time data without lag
- Configurable responsiveness (α parameter)

**Why Base64 for BLE**:
- Binary data transmission over BLE characteristics
- Compact encoding for float32 values
- Standard decoding in JavaScript

---

## Known Limitations

1. **Single-device connection**: One vest per app instance
2. **Local storage only**: No cloud backup currently
3. **Manual calibration**: Requires calibration procedure per vest
4. **iOS certificate expiry**: Free developer certificates last 7 days

---

## Further Reading

- **Hardware Details**: `DeveloperDocs/HARDWARE.md`
- **API Reference**: `DeveloperDocs/API_REFERENCE.md`
- **Deployment**: `DeveloperDocs/DEPLOYMENT.md`
- **Calibration**: `DeveloperDocs/CALIBRATION.md`
