# RescueRight - API Reference

## Overview

Technical reference for RescueRight's core modules, hooks, components, and data structures.

---

## Core Modules

### `lib/bluetooth.ts` - BluetoothManager

Singleton class managing BLE communication with the ESP32 vest.

#### Initialization

```typescript
import { bluetoothManager } from '../lib/bluetooth';

// Initialize Bluetooth and check permissions
await bluetoothManager.initialize();
```

#### Methods

**`initialize(): Promise<void>`**
- Initializes BLE and requests permissions
- Checks device BLE capability
- Should be called once at app startup

**`scanForDevices(callback: (device: Device) => void): Promise<void>`**
- Scans for BLE devices with "RescueRight" in name
- Calls callback for each discovered device
- Filters by RSSI > -100dBm

Parameters:
- `callback`: Function called for each discovered device

Example:
```typescript
await bluetoothManager.scanForDevices((device) => {
  console.log(`Found: ${device.name} (${device.id})`);
});
```

**`connect(deviceId: string): Promise<void>`**
- Establishes BLE connection to specified device
- Discovers services and characteristics
- Sets up for characteristic subscriptions

Parameters:
- `deviceId`: BLE device ID from scan results

Throws:
- Error if device not found
- Error if service/characteristics missing

**`subscribeToForce(callback: (force: number) => void): Promise<void>`**
- Subscribes to force characteristic notifications
- Decodes base64 to Float32

Parameters:
- `callback`: Function called with force value (Newtons)

**`subscribeToPosition(callback: (position: { x: number; y: number }) => void): Promise<void>`**
- Subscribes to position characteristic notifications
- Decodes base64 to two Float32 values

Parameters:
- `callback`: Function called with {x, y} normalized 0-1

**`subscribeToAngle(callback: (angle: number) => void): Promise<void>`**
- Subscribes to angle characteristic notifications
- Decodes base64 to Float32

Parameters:
- `callback`: Function called with angle in degrees

**`subscribeToAllSensors(callback: (data: SensorData) => void): Promise<void>`**
- Subscribes to all three characteristics simultaneously
- Aggregates data into single callback

Parameters:
- `callback`: Function called with complete sensor data

Data Structure:
```typescript
interface SensorData {
  force: number;
  position: { x: number; y: number };
  angle: number;
  timestamp: number;
}
```

**`disconnect(): Promise<void>`**
- Cleanly disconnects from BLE device
- Unsubscribes from all characteristics
- Resets connection state

**`isConnected(): boolean`**
- Returns current connection status

Returns:
- `true` if connected, `false` otherwise

#### Properties

```typescript
connectedDevice: Device | null  // Currently connected device
isScanning: boolean             // Scan in progress
```

#### BLE Constants

```typescript
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_FORCE_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const CHAR_POSITION_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";
const CHAR_ANGLE_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26aa";
```

---

### `lib/sessionStorage.ts` - Session Management

Manages training session data persistence and analytics.

#### Session Lifecycle

```typescript
import { sessionStorage } from '../lib/sessionStorage';

// Start new session
sessionStorage.startSession();

// Record thrust during training
sessionStorage.recordThrust({
  timestamp: Date.now(),
  force: 45.2,
  position: { x: 0.52, y: 0.48 },
  angle: -2.5
});

// Complete session
const sessionData = sessionStorage.completeSession();

// Retrieve last completed session
const lastSession = sessionStorage.getLastCompletedSession();
```

#### Data Structures

**`SessionData`**
```typescript
interface SessionData {
  id: string;                    // Unique session ID
  startTime: number;             // Unix timestamp (ms)
  endTime: number;               // Unix timestamp (ms)
  duration: number;              // Session duration (seconds)
  totalThrusts: number;          // Count of thrusts
  averageForce: number;          // Average force (N)
  maxForce: number;              // Maximum force (N)
  averageRate: number;           // Thrusts per minute
  thrustHistory: ThrustData[];   // Array of individual thrusts
  positionAccuracy: number;      // Percentage (0-100)
}
```

**`ThrustData`**
```typescript
interface ThrustData {
  timestamp: number;             // Unix timestamp (ms)
  force: number;                 // Force at thrust (N)
  position: { x: number; y: number };  // Hand position (0-1)
  angle: number;                 // Body angle (degrees)
}
```

#### Methods

**`startSession(): void`**
- Initializes new session with unique ID
- Resets thrust history and metrics

**`recordThrust(thrustData: ThrustData): void`**
- Adds thrust to current session history
- Updates running statistics

**`completeSession(): SessionData`**
- Finalizes session with end time and duration
- Calculates final metrics
- Stores to AsyncStorage
- Returns complete session data

**`getLastCompletedSession(): SessionData | null`**
- Retrieves most recent completed session
- Returns null if no sessions exist

**`getCurrentSession(): Partial<SessionData> | null`**
- Returns in-progress session data
- Returns null if no active session

---

### `lib/calibration.ts` - Calibration Engine

Handles sensor calibration and data quality assessment.

#### Data Structures

**`RawSensorData`**
```typescript
interface RawSensorData {
  hall: [number, number, number, number];  // ADC values (0-4095)
  mpu: {
    accel: { x: number; y: number; z: number };
    gyro: { x: number; y: number; z: number };
  }[];
  timestamp: number;
}
```

**`CalibratedSensorData`**
```typescript
interface CalibratedSensorData {
  force: number;                       // Calibrated force (N)
  position: { x: number; y: number };  // Normalized position (0-1)
  angle: number;                       // Pitch angle (degrees)
  depth: number;                       // Estimated compression depth (cm)
  quality: DataQuality;
}
```

**`DataQuality`**
```typescript
interface DataQuality {
  confidence: number;        // 0-1 scale
  issues: string[];          // List of quality issues
  sensorBalance: number;     // Standard deviation of sensor readings
  noiseLevel: number;        // Gyroscope noise magnitude
}
```

#### Filters

**`EMAFilter`** - Exponential Moving Average
```typescript
class EMAFilter {
  constructor(alpha: number);  // Smoothing factor (0-1)
  update(value: number): number;
  reset(): void;
}

// Usage
const forceFilter = new EMAFilter(0.3);
const smoothedForce = forceFilter.update(rawForce);
```

**`MedianFilter`** - Removes outliers
```typescript
class MedianFilter {
  constructor(windowSize: number);  // Sliding window size
  update(value: number): number;
  reset(): void;
}

// Usage
const angleFilter = new MedianFilter(5);
const filteredAngle = angleFilter.update(rawAngle);
```

**`MovingAverageFilter`** - Simple moving average
```typescript
class MovingAverageFilter {
  constructor(windowSize: number);
  update(value: number): number;
  reset(): void;
}
```

#### CalibrationEngine

```typescript
import { calibrationEngine } from '../lib/calibration';

// Calibrate raw sensor data
const calibrated = calibrationEngine.calibrate(rawData);

// Update calibration constants
calibrationEngine.updateConstants({
  hallSensorCalibration: {
    baselineADC: [2048, 2048, 2048, 2048],
    forcePerADCUnit: [0.05, 0.05, 0.05, 0.05],
    maxForce: 200
  }
});
```

---

## Custom Hooks

### `hooks/useBluetoothTrainingData.ts`

Primary hook for real-time training data with filtering and feedback generation.

#### Usage

```typescript
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';

function TrainingScreen() {
  const data = useBluetoothTrainingData(false);  // false = real data

  return (
    <View>
      <Text>Force: {data.compressionDepth}N</Text>
      <Text>Position: ({data.handPosition.x}, {data.handPosition.y})</Text>
      <Text>Thrusts: {data.thrusts}</Text>
      <Text>Rate: {data.compressionRate}/min</Text>
      <Text>Feedback: {data.feedback}</Text>
    </View>
  );
}
```

#### Parameters

- `useMockData: boolean` - If true, generates simulated sensor data

#### Return Value

```typescript
interface TrainingData {
  compressionDepth: number;          // Filtered force (N)
  compressionRate: number;            // Thrusts per minute
  handPosition: { x: number; y: number };  // Filtered position (0-1)
  angle: number;                      // Filtered angle (degrees)
  feedback: string;                   // Real-time coaching message
  thrusts: number;                    // Total thrust count
  isConnected: boolean;               // BLE connection status
  dataQuality?: DataQuality;          // Quality metrics
  rawForce?: number;                  // Unfiltered force (debug)
  filteredForce?: number;             // EMA filtered force (debug)
}
```

#### Features

1. **Data Validation**
   - Range checks: 0-500N force, 0-1 position, ±180° angle
   - Invalid data rejection with logging

2. **Noise Filtering**
   - EMA filter for force (α=0.3, scaled 0.25)
   - EMA filter for position X/Y (α=0.2)
   - Median filter for angle (window=5)

3. **Thrust Detection**
   ```typescript
   Conditions:
   - filteredForce > 2.5N (threshold)
   - (currentTime - lastThrustTime) > 400ms (cooldown)
   - Data passes validation
   ```

4. **Compression Rate Calculation**
   - Tracks thrusts in last 60 seconds
   - Calculates thrusts per minute
   - Sliding window updates

5. **Feedback Generation**
   - Force too low: "Increase pressure"
   - Force too high: "⚠️ Reduce pressure - risk of injury!"
   - Position off-center: "Move hands Xcm [direction]"
   - Optimal: "✓ Perfect technique!"

---

## Screen Components

### Home Screen (`app/index.tsx`)

Entry point with 3D vest animation.

**Key Components**:
- `VestAnimation3D`: Three.js animated vest
- `HomeButtons`: Navigation buttons with animations

**Navigation**:
```typescript
router.push('/connect');  // Navigate to connect screen
```

---

### Connect Screen (`app/connect.tsx`)

BLE device discovery and pairing.

**Props**: None (uses global BluetoothManager)

**State Management**:
```typescript
const [devices, setDevices] = useState<Device[]>([]);
const [isScanning, setIsScanning] = useState(false);
const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
```

**Key Functions**:
```typescript
const startScan = async () => {
  await bluetoothManager.scanForDevices((device) => {
    setDevices(prev => [...prev, device]);
  });
};

const handleConnect = async (deviceId: string) => {
  await bluetoothManager.connect(deviceId);
  router.push('/training');
};
```

---

### Training Screen (`app/training.tsx`)

Real-time training interface.

**Components Used**:
- `StatusHeader`: Connection, timer, battery
- `ForceGauge`: Circular force visualization (0-150N)
- `HeatmapModule`: Hand position heatmap
- `FeedbackCard`: Dynamic coaching messages
- `MetricsStrip`: Thrusts, rate, peak force

**Position Status Conversion**:
```typescript
function getPositionStatus(position: { x: number; y: number }) {
  const targetX = 0.5;
  const targetY = 0.45;
  const threshold = 0.08;

  const xDiff = position.x - targetX;
  const yDiff = position.y - targetY;

  if (Math.abs(xDiff) < threshold && Math.abs(yDiff) < threshold) {
    return 'correct';
  }

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    return xDiff > 0 ? 'too-right' : 'too-left';
  } else {
    return yDiff > 0 ? 'too-low' : 'too-high';
  }
}
```

**Session Completion**:
```typescript
const handleComplete = () => {
  const sessionData = sessionStorage.completeSession();
  router.push('/analytics');
};
```

---

### Analytics Screen (`app/analytics.tsx`)

Post-session performance analysis.

**Props**: None (retrieves session from sessionStorage)

**Scoring Algorithm**:
```typescript
function calculateScore(session: SessionData): number {
  let score = 0;

  // Force Quality (40 points)
  const optimalForce = session.averageForce >= 20 && session.averageForce <= 60;
  score += optimalForce ? 40 : (40 - Math.abs(session.averageForce - 40));

  // Position Accuracy (30 points)
  score += session.positionAccuracy * 0.3;

  // Rate Consistency (20 points)
  const idealRate = 5;  // thrusts/minute
  const rateDeviation = Math.abs(session.averageRate - idealRate);
  score += Math.max(0, 20 - (rateDeviation * 2));

  // Completion Bonus (10 points)
  score += session.totalThrusts >= 3 ? 10 : (session.totalThrusts / 3) * 10;

  return Math.min(100, Math.max(0, score));
}
```

**Components Used**:
- `HeroSuccessCard`: Animated score display
- `MetricsGrid`: 6-metric performance breakdown
- `TechniqueAnalysis`: Detailed feedback
- `SessionNavigation`: History navigation

---

## Utility Components

### `components/training/ForceGauge.tsx`

Circular force gauge with target zones.

**Props**:
```typescript
interface ForceGaugeProps {
  force: number;        // Current force (0-500N)
  maxForce?: number;    // Maximum scale (default: 150N)
}
```

**Usage**:
```typescript
<ForceGauge force={data.compressionDepth} maxForce={150} />
```

---

### `components/training/HeatmapModule.tsx`

Hand position visualization.

**Props**:
```typescript
interface HeatmapModuleProps {
  position: 'correct' | 'too-high' | 'too-low' | 'too-left' | 'too-right';
  force: number;  // For color intensity
}
```

**Usage**:
```typescript
const positionStatus = getPositionStatus(data.handPosition);
<HeatmapModule position={positionStatus} force={data.compressionDepth} />
```

---

### `components/training/FeedbackCard.tsx`

Real-time coaching messages.

**Props**:
```typescript
interface FeedbackCardProps {
  feedback: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}
```

**Usage**:
```typescript
<FeedbackCard feedback={data.feedback} type="success" />
```

---

## Design System (`styles/theme.ts`)

### Colors

```typescript
const theme = {
  colors: {
    primary: '#0066CC',
    secondary: '#00B8A9',
    success: '#00C48C',
    warning: '#FF8B00',
    error: '#FF3B30',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: {
      primary: '#1A1D1F',
      secondary: '#6F767E',
      tertiary: '#9A9FA5'
    }
  }
};
```

### Typography

```typescript
const typography = {
  display: { fontSize: 48, fontWeight: 'bold' },
  h1: { fontSize: 34, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: '600' },
  h3: { fontSize: 22, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  caption: { fontSize: 15, fontWeight: '400' },
  captionSmall: { fontSize: 13, fontWeight: '400' },
  micro: { fontSize: 11, fontWeight: '400' }
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};
```

---

## Constants & Configuration

### Thresholds

```typescript
// hooks/useBluetoothTrainingData.ts
const THRUST_THRESHOLD = 2.5;         // Newtons
const THRUST_COOLDOWN = 400;          // milliseconds
const RATE_WINDOW = 60000;            // 60 seconds

const TARGET_POSITION = { x: 0.5, y: 0.45 };
const POSITION_TOLERANCE = 0.08;      // ±8%

const OPTIMAL_FORCE_MIN = 20;         // Newtons
const OPTIMAL_FORCE_MAX = 60;         // Newtons
const MAX_SAFE_FORCE = 150;           // Newtons
```

### Data Validation Ranges

```typescript
const VALIDATION = {
  force: { min: 0, max: 500 },        // Newtons
  position: { min: 0, max: 1 },       // Normalized
  angle: { min: -180, max: 180 }      // Degrees
};
```

---

## Error Handling

### BLE Connection Errors

```typescript
try {
  await bluetoothManager.connect(deviceId);
} catch (error) {
  if (error.message.includes('Device not found')) {
    // Handle device not found
  } else if (error.message.includes('Service not found')) {
    // Handle wrong firmware/UUIDs
  } else {
    // Generic connection error
  }
}
```

### Data Validation Errors

```typescript
const data = useBluetoothTrainingData(false);

if (data.dataQuality) {
  if (data.dataQuality.confidence < 0.5) {
    // Low confidence - warn user
  }
  if (data.dataQuality.issues.length > 0) {
    // Display specific issues
    console.warn('Data issues:', data.dataQuality.issues);
  }
}
```

---

## Best Practices

### 1. Always Check Connection Status

```typescript
if (data.isConnected) {
  // Use real data
} else {
  // Show disconnected state
}
```

### 2. Handle Session Lifecycle Properly

```typescript
useEffect(() => {
  sessionStorage.startSession();

  return () => {
    // Don't auto-complete on unmount
    // Let user explicitly complete session
  };
}, []);
```

### 3. Debounce UI Updates

```typescript
const [displayForce, setDisplayForce] = useState(0);

useEffect(() => {
  const timer = setTimeout(() => {
    setDisplayForce(data.compressionDepth);
  }, 100);  // 100ms debounce

  return () => clearTimeout(timer);
}, [data.compressionDepth]);
```

### 4. Clean Up BLE Connections

```typescript
useEffect(() => {
  return () => {
    bluetoothManager.disconnect();
  };
}, []);
```

---

## Testing Utilities

### Mock Data Mode

```typescript
// Enable mock data for UI testing
const data = useBluetoothTrainingData(true);  // true = mock

// Mock data generates:
// - Realistic force fluctuations (0-100N)
// - Random position drift (0.4-0.6 range)
// - Simulated thrusts every 5-10 seconds
```

### Sensor Debug Screen

Navigate to `/sensor-debug` for:
- Real-time sensor value display
- Raw vs filtered comparison
- Data logging with CSV export
- Quality metrics visualization

---

For architecture overview, see `DeveloperDocs/ARCHITECTURE.md`.
For hardware details, see `DeveloperDocs/HARDWARE.md`.
