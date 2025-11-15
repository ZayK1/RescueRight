# RescueRight

**Real-time Heimlich maneuver training system with IoT sensors and AI-powered feedback**

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![ESP32](https://img.shields.io/badge/ESP32-DevKit_V1-E7352C?logo=espressif)](https://www.espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

RescueRight is a smart training vest that provides real-time feedback during Heimlich maneuver practice. Using 4x MPU6500 IMU sensors embedded in a wearable vest, the system captures compression force, hand position, and body angle, delivering instant coaching through a mobile app.

**Built for**: Medical training centers, first aid courses, and individual practitioners

**Key Innovation**: Transforms subjective skill training into objective, data-driven learning with quantitative performance metrics.

---

## Features

### Hardware
- **ESP32-Based Sensor System**: 4x MPU6500 IMU sensors on dual I2C buses
- **Real-Time Data Transmission**: 10-20Hz update rate via Bluetooth Low Energy
- **Accurate Measurements**: Force (±5N), position (±2cm), angle (±5°)
- **Wearable Design**: 27cm × 13cm foam-backed sensor array

### Mobile Application
- **Cross-Platform**: iOS and Android support via React Native + Expo
- **Real-Time Feedback**: Instant coaching on force, position, and technique
- **Performance Analytics**: 0-100 scoring system with detailed breakdown
- **Session Tracking**: Persistent storage of training history
- **Professional UI**: Medical-grade design system (inspired by Apple Health)

### Technical Highlights
- **Data Processing Pipeline**: EMA/Median filtering for noise reduction
- **Thrust Detection Algorithm**: 2.5N threshold with 400ms cooldown
- **Calibration System**: CSV-based calibration with analysis scripts
- **Type-Safe Architecture**: Full TypeScript coverage
- **Modular Design**: Clean separation of hardware, data, and UI layers

---

## Tech Stack

**Frontend**
- React Native 0.81.4
- TypeScript 5.9.2
- Expo SDK 54
- Tailwind CSS + NativeWind
- Three.js (3D animations)

**Hardware**
- ESP32 DevKit V1
- 4x MPU6500 (6-axis IMU)
- Dual I2C buses (100kHz)
- BLE 4.2

**State & Data**
- React hooks
- AsyncStorage
- Custom session management
- Real-time BLE subscriptions

**Build & Deploy**
- Metro bundler
- Expo CLI
- Xcode / Android Studio

---

## Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/RescueRight.git
cd RescueRight/RescueRightApp

# Install dependencies
npm install

# Start development server
npm start
```

### Run on Device

**iOS** (macOS only):
```bash
npm run ios
```

**Android**:
```bash
npm run android
```

### Hardware Setup

1. **Flash ESP32 Firmware**:
   - Open `RescueRightApp/firmware/mvp2.ino` in Arduino IDE
   - Install ESP32 board support + MPU6050 library
   - Upload to ESP32 DevKit V1

2. **Connect Sensors**:
   - Wire 4x MPU6500 to dual I2C buses (see `DeveloperDocs/HARDWARE.md`)
   - Verify sensor detection in Serial Monitor

3. **Pair with App**:
   - Launch app → Connect screen
   - Scan for "RescueRight Vest #001"
   - Connect and start training

---

## Project Structure

```
RescueRight/
├── DeveloperDocs/          # Comprehensive technical documentation
│   ├── ARCHITECTURE.md     # System design & data flow
│   ├── HARDWARE.md         # ESP32 firmware & BLE protocol
│   ├── API_REFERENCE.md    # Core modules & components
│   ├── DEPLOYMENT.md       # Build & deployment guides
│   └── CALIBRATION.md      # Sensor calibration procedures
│
├── RescueRightApp/         # Mobile application
│   ├── app/                # Expo Router screens (5 screens)
│   ├── components/         # React components (41 components)
│   ├── hooks/              # Custom hooks (2)
│   ├── lib/                # Core logic (bluetooth, calibration, session)
│   ├── firmware/           # ESP32 Arduino code (2 versions)
│   ├── styles/             # Design system & theme
│   └── assets/             # Images, 3D models
│
└── README.md               # This file
```

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                  ESP32 + 4x MPU6500                    │
│  Force, Position, Angle @ 10-20Hz via BLE             │
└────────────────┬───────────────────────────────────────┘
                 │ Bluetooth LE (GATT)
                 │ 3 Characteristics: Force, Position, Angle
┌────────────────┴───────────────────────────────────────┐
│              Mobile App (React Native)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ lib/bluetooth.ts - BLE Manager                   │  │
│  │ • Device scanning & connection                   │  │
│  │ • Base64 decoding & data validation              │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │ hooks/useBluetoothTrainingData.ts                │  │
│  │ • EMA/Median filtering (noise reduction)         │  │
│  │ • Thrust detection (2.5N threshold)              │  │
│  │ • Real-time feedback generation                  │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │ UI Components (Training, Analytics, etc.)        │  │
│  │ • Real-time force gauge & heatmap                │  │
│  │ • Performance scoring (0-100 points)             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**For detailed architecture, see [`DeveloperDocs/ARCHITECTURE.md`](DeveloperDocs/ARCHITECTURE.md)**

---

## Key Algorithms

### Thrust Detection
```typescript
// Force must exceed threshold and respect cooldown period
const isThrust =
  filteredForce > 2.5  // Newtons
  && (now - lastThrust) > 400  // milliseconds
  && dataIsValid;
```

### Position Calculation
```cpp
// Weighted average based on sensor compression
float posX = (sensor1.force * pos1.x + sensor2.force * pos2.x + ...) / totalForce;
float posY = (sensor1.force * pos1.y + sensor2.force * pos2.y + ...) / totalForce;

// Apply center bias for Heimlich targeting
posX = centerX + (posX - centerX) * (1.0 - CENTER_BIAS);
```

### Performance Scoring
```typescript
// 0-100 point system
score =
  forceQuality * 0.4       // 40 points: 20-60N optimal
  + positionAccuracy * 0.3  // 30 points: center target ±8%
  + rateConsistency * 0.2   // 20 points: 5 thrusts/min ideal
  + completionBonus * 0.1;  // 10 points: minimum 3 thrusts
```

---

## Screenshots

### Training Screen
Real-time force gauge, hand position heatmap, and instant feedback

### Analytics Screen
Post-session performance breakdown with 0-100 scoring

### Connect Screen
Bluetooth device scanning and pairing interface

_(Screenshots to be added)_

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| BLE Update Rate | 10-20Hz |
| Processing Latency | <200ms |
| Force Accuracy | ±5N (post-calibration) |
| Position Accuracy | ±2cm |
| Angle Accuracy | ±5° |
| App Startup Time | ~2s (cold start) |

---

## Documentation

Comprehensive developer documentation available in [`DeveloperDocs/`](DeveloperDocs/):

- **[ARCHITECTURE.md](DeveloperDocs/ARCHITECTURE.md)** - System design, tech stack, data flow
- **[HARDWARE.md](DeveloperDocs/HARDWARE.md)** - ESP32 firmware, sensors, BLE protocol
- **[API_REFERENCE.md](DeveloperDocs/API_REFERENCE.md)** - Core modules, hooks, components
- **[DEPLOYMENT.md](DeveloperDocs/DEPLOYMENT.md)** - Build & deployment instructions
- **[CALIBRATION.md](DeveloperDocs/CALIBRATION.md)** - Sensor calibration procedures

---

## Development Workflow

### Local Development
```bash
npm start              # Start Expo dev server
npm run ios            # Build for iOS simulator
npm run android        # Build for Android emulator
npm run typecheck      # TypeScript validation
```

### Hardware Development
```bash
# Arduino IDE
# 1. Open RescueRightApp/firmware/mvp2.ino
# 2. Select Board: ESP32 Dev Module
# 3. Select Port: (your ESP32 port)
# 4. Upload

# Serial Monitor (115200 baud)
# Verify sensor initialization and real-time data output
```

### Calibration Workflow
```bash
# Collect calibration data (CSV format)
# Run visualization
python scripts/visualize_calibration.py data.csv

# Calculate calibration constants
npx ts-node scripts/analyze_calibration.ts data.csv

# Update lib/calibration.ts with new constants
```

---

## Known Limitations

- **Single-device connection**: One vest per app instance
- **Local storage only**: No cloud sync (architecture supports future implementation)
- **Manual calibration**: Requires one-time calibration per vest
- **iOS certificate expiry**: Free Apple Developer certificates last 7 days (commercial deployment would use paid account)

---

## Future Enhancements

**Potential Features** (architecture designed for extensibility):
- Cloud sync & coach dashboards
- Multi-user profiles
- Historical trend analysis
- Voice-guided feedback
- Video recording integration
- Custom threshold configuration
- Leaderboards & achievements

---

## Contributing

This is a personal project developed as a proof of concept. For questions or collaboration inquiries, please open an issue.

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Technical Achievements

This project demonstrates:

✅ **Full-stack IoT development**: Hardware (ESP32), firmware (C/C++), mobile (React Native + TypeScript)

✅ **Real-time data processing**: BLE communication, noise filtering, thrust detection

✅ **Professional app architecture**: Clean separation of concerns, TypeScript type safety, modular design

✅ **Sensor calibration**: CSV-based calibration system with statistical analysis scripts

✅ **Cross-platform deployment**: iOS and Android from single codebase

✅ **Medical-grade UI/UX**: Professional design system with accessibility considerations

✅ **Performance optimization**: EMA/Median filtering, efficient BLE subscriptions, <200ms latency

✅ **Comprehensive documentation**: 70+ KB of technical documentation (industry-standard quality)

---

## Author

**Kasim Zayan**

- Portfolio: _(add your portfolio link)_
- LinkedIn: _(add your LinkedIn)_
- Email: _(add your email)_

---

## Acknowledgments

- Built as a proof-of-concept for medical training innovation
- Designed following medical guidelines for Heimlich maneuver technique
- UI/UX inspired by Apple Health and medical EMR systems
- Sensor calibration methodology based on standard metrology practices

---

**Project Status**: Functional MVP with production-ready code architecture

**Last Updated**: November 2025
