# RescueRight

**Smart Heimlich training vest with real-time sensor feedback | Top 3, NUS IDEATE 2025**

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![ESP32](https://img.shields.io/badge/ESP32-DevKit_V1-E7352C?logo=espressif)](https://www.espressif.com/)

---

## Project Overview

RescueRight is a wearable training system for Heimlich maneuver practice, built for the **NUS IDEATE 2025** innovation competition. The vest integrates 4x MPU6500 IMU sensors with an ESP32 microcontroller, transmitting real-time force, position, and angle data via Bluetooth to a React Native mobile app that provides instant performance coaching.

**Problem**: Current Heimlich training relies on subjective instructor observation with no quantitative feedback.

**Solution**: Hardware-software system providing objective, data-driven training metrics with <200ms feedback latency.

---

## Recognition & Funding

🏆 **Top 3 Finish** - NUS IDEATE 2025 (National innovation competition, 100+ teams)

💰 **S$10,000 Grant** - NUS Venture Initiation Programme (VIP)

🚀 **BLOCK71 Incubation** - Accepted into The Hangar @ NUS startup program (1,600+ ventures ecosystem)

---

## Technical Implementation

### System Architecture

**Hardware**
- ESP32 DevKit V1 microcontroller
- 4x MPU6500 6-axis IMU sensors
- Dual I2C buses (GPIO 21/22, GPIO 25/26) @ 100kHz
- BLE 4.2 GATT server with 3 characteristics
- 10-20Hz sensor sampling rate

**Mobile Application**
- React Native 0.81.4 + TypeScript 5.9.2
- Expo SDK 54 (cross-platform iOS/Android)
- 6 screens, 41 components, 2 custom hooks
- Real-time BLE data processing pipeline
- AsyncStorage for session persistence
- Three.js for 3D vest visualization

**Data Pipeline**
```
ESP32 Sensors → BLE (Base64) → BluetoothManager →
EMA/Median Filtering → Thrust Detection → UI Updates
```

### Key Technical Features

**Real-Time Processing**
- BLE data decoding and validation (0-500N force, 0-1 position, ±180° angle)
- EMA filtering (force, position: α=0.2-0.3) for noise reduction
- Median filtering (angle: window=5) for outlier removal
- Thrust detection algorithm: 2.5N threshold with 400ms cooldown
- Compression rate calculation over 60-second sliding window

**Calibration System**
- CSV-based calibration data collection
- Python visualization scripts (force/position/angle analysis)
- TypeScript analysis scripts (auto-generate calibration constants)
- Statistical validation (R², RMSE, MAE)

**Performance Analytics**
- 0-100 scoring algorithm: Force quality (40pts) + Position accuracy (30pts) + Rate consistency (20pts) + Completion bonus (10pts)
- Session history with detailed thrust-by-thrust breakdowns
- Average force, max force, position accuracy metrics

**Accuracy** (post-calibration)
- Force: ±5N
- Position: ±2cm
- Angle: ±5°
- Processing latency: <200ms

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────┐
│  Physical Vest (ESP32 + 4x MPU6500 Sensors)     │
│  • Reads acceleration/gyro from all sensors      │
│  • Calculates force, position, angle            │
│  • Transmits via BLE @ 10-20Hz                  │
└──────────────┬───────────────────────────────────┘
               │ Bluetooth LE (3 characteristics)
               ↓
┌──────────────────────────────────────────────────┐
│  Mobile App (React Native + TypeScript)         │
│  ┌────────────────────────────────────────────┐ │
│  │ lib/bluetooth.ts (BLE Manager)             │ │
│  │ • Device scanning & pairing                │ │
│  │ • Base64 decoding                          │ │
│  │ • Data validation                          │ │
│  └──────────────┬─────────────────────────────┘ │
│                 ↓                                │
│  ┌──────────────────────────────────────────┐   │
│  │ hooks/useBluetoothTrainingData.ts        │   │
│  │ • EMA/Median filtering                   │   │
│  │ • Thrust detection                       │   │
│  │ • Feedback generation                    │   │
│  └──────────────┬───────────────────────────┘   │
│                 ↓                                │
│  ┌──────────────────────────────────────────┐   │
│  │ UI Components                            │   │
│  │ • Force gauge (0-150N display)           │   │
│  │ • Position heatmap (2D visualization)    │   │
│  │ • Real-time feedback cards               │   │
│  │ • Performance analytics (0-100 score)    │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## Project Structure

```
RescueRight/
├── DeveloperDocs/          # Technical documentation
│   ├── ARCHITECTURE.md     # System design & data flow
│   ├── HARDWARE.md         # ESP32 firmware & BLE protocol
│   ├── API_REFERENCE.md    # Core modules & components
│   ├── DEPLOYMENT.md       # Build & deployment
│   └── CALIBRATION.md      # Sensor calibration
│
├── RescueRightApp/
│   ├── app/                # Screens (6 files)
│   ├── components/         # UI components (41 files)
│   ├── hooks/              # Custom hooks (2 files)
│   ├── lib/                # Core logic (bluetooth, calibration, session, mock)
│   ├── firmware/           # ESP32 Arduino code (mvp2.ino, mvp2_optimized.ino)
│   └── styles/             # Design system (medical-grade color palette)
│
└── README.md
```

---

## Technical Skills Demonstrated

**Full-Stack IoT Development**
- Hardware integration (ESP32, I2C communication, sensor fusion)
- Embedded firmware (C/C++, Arduino framework)
- Mobile development (React Native, TypeScript)
- BLE protocol implementation (GATT services, characteristics)

**Real-Time Systems**
- Signal processing (EMA/Median filtering, noise reduction)
- Data validation and quality assessment
- Sub-200ms latency optimization
- Efficient BLE data subscriptions

**Software Architecture**
- Singleton pattern for BLE management
- Custom hooks for state management
- TypeScript type safety throughout
- Modular, testable design
- Clean separation of concerns (hardware, data, UI)

**Data Engineering**
- Sensor calibration methodology
- CSV data analysis and visualization (Python)
- Statistical validation (R², RMSE, MAE)
- Automated constant generation (TypeScript)

**UI/UX Design**
- Medical-grade design system (Apple Health-inspired)
- Real-time data visualization (force gauge, heatmap)
- Cross-platform responsive design
- Accessibility considerations

---

## Quick Start

### Installation
```bash
git clone https://github.com/ZayK1/RescueRight.git
cd RescueRight/RescueRightApp
npm install
npm start
```

### Hardware Setup
1. Flash `firmware/mvp2.ino` to ESP32 DevKit V1
2. Connect 4x MPU6500 sensors to dual I2C buses
3. Verify sensor detection in Serial Monitor (115200 baud)
4. Pair "RescueRight Vest #001" via app

**Detailed setup**: See `DeveloperDocs/HARDWARE.md` and `DeveloperDocs/DEPLOYMENT.md`

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| BLE Update Rate | 10-20Hz |
| Processing Latency | <200ms |
| Force Accuracy | ±5N |
| Position Accuracy | ±2cm |
| Angle Accuracy | ±5° |
| App Startup | ~2s |

---

## Development Context

**Role**: Sole software developer (entire codebase)

**Timeline**: Built for NUS IDEATE 2025 competition (Oct 2024 - Jan 2025)

**Team**: 5-person interdisciplinary team (1 software, 1 hardware, 1 mechanical, 2 business)

**Outcome**:
- Top 3 finish among 100+ teams
- S$10,000 NUS VIP grant awarded
- Accepted into BLOCK71 incubation program at The Hangar @ NUS

**Current Status**: Functional MVP with production-ready code architecture. Grant funding active, pursuing commercialization through BLOCK71.

---

## Documentation

Technical documentation available in [`DeveloperDocs/`](DeveloperDocs/):
- [ARCHITECTURE.md](DeveloperDocs/ARCHITECTURE.md) - System design, tech stack, data flow
- [HARDWARE.md](DeveloperDocs/HARDWARE.md) - ESP32 firmware, sensors, BLE protocol
- [API_REFERENCE.md](DeveloperDocs/API_REFERENCE.md) - Core modules, hooks, components
- [DEPLOYMENT.md](DeveloperDocs/DEPLOYMENT.md) - Build & deployment instructions
- [CALIBRATION.md](DeveloperDocs/CALIBRATION.md) - Sensor calibration procedures

---

## Contact

**Kasim Zayan**

Full-stack developer specializing in IoT systems and real-time data processing.

Open to opportunities in embedded systems, mobile development, or full-stack engineering roles.

---

**Last Updated**: November 2025
