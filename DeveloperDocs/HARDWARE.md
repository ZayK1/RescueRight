# RescueRight - Hardware Integration

## Overview

The RescueRight smart vest uses an ESP32 microcontroller with 4x MPU6500 IMU sensors to capture real-time force, position, and angle data during Heimlich maneuver training. Data is transmitted to the mobile app via Bluetooth Low Energy (BLE).

---

## Hardware Components

### Microcontroller
- **Model**: ESP32 DevKit V1 (ESP32-WROOM-32)
- **Features**:
  - Dual-core Xtensa LX6 @ 240MHz
  - 520KB SRAM, 16MB Flash
  - Built-in Bluetooth 4.2 BLE
  - 18 ADC channels, 2 I2C buses
  - Low power consumption (~80mA active)

### IMU Sensors
- **Model**: MPU6500 (6-axis IMU)
- **Quantity**: 4 sensors
- **Capabilities**:
  - 3-axis accelerometer (±2g range, 16384 LSB/g sensitivity)
  - 3-axis gyroscope (±250°/s range, 131 LSB/°/s sensitivity)
  - I2C communication
  - WHO_AM_I register: 0x70 or 0x71

### Physical Layout
```
Vest Dimensions: 27cm wide × 13cm tall

      27cm
   ├─────────┤
┌──────────────┐ ─┐
│  MPU1  MPU2  │  │
│              │  │ 13cm
│   CENTER     │  │
│  MPU3  MPU4  │  │
└──────────────┘ ─┘

Sensor Positions:
- MPU #1 (Top-Left):     (0cm, 0cm)
- MPU #2 (Top-Right):    (27cm, 0cm)
- MPU #3 (Bottom-Left):  (0cm, 13cm)
- MPU #4 (Bottom-Right): (27cm, 13cm)
```

---

## Wiring Schematic

### I2C Bus Configuration

**Bus 1** (GPIO 21/22):
```
ESP32 Pin       MPU Sensor       Address
GPIO 21 (SDA) → MPU #1 (SDA)  →  0x68 (AD0 → GND)
GPIO 21 (SDA) → MPU #2 (SDA)  →  0x69 (AD0 → 3.3V)
GPIO 22 (SCL) → MPU #1 (SCL)
GPIO 22 (SCL) → MPU #2 (SCL)
```

**Bus 2** (GPIO 25/26):
```
ESP32 Pin       MPU Sensor       Address
GPIO 25 (SDA) → MPU #3 (SDA)  →  0x68 (AD0 → GND)
GPIO 25 (SDA) → MPU #4 (SDA)  →  0x69 (AD0 → 3.3V)
GPIO 26 (SCL) → MPU #3 (SCL)
GPIO 26 (SCL) → MPU #4 (SCL)
```

### Power Distribution
```
ESP32 3.3V → All MPU VCC pins (4x sensors)
ESP32 GND  → All MPU GND pins (4x sensors)
```

### I2C Address Selection
- **AD0 pin → GND**: I2C address 0x68
- **AD0 pin → 3.3V**: I2C address 0x69

---

## Firmware Architecture

### Main Firmware Files

**Location**: `RescueRightApp/firmware/`

- **mvp2.ino**: Main production firmware
- **mvp2_optimized.ino**: Performance-optimized version (2x faster)

### Firmware Configuration

```cpp
// I2C Configuration
#define I2C1_SDA 21
#define I2C1_SCL 22
#define I2C2_SDA 25
#define I2C2_SCL 26
#define I2C_FREQ 100000  // 100kHz

// Sensor Addresses
#define MPU_ADDR_LOW  0x68
#define MPU_ADDR_HIGH 0x69

// Physical Layout
#define FOAM_WIDTH_CM  27.0
#define FOAM_HEIGHT_CM 13.0

// Calibration Constants
#define FORCE_SCALE 0.8           // Acceleration to Newtons conversion
#define ACCEL_THRESHOLD 1.5       // Minimum detection threshold (m/s²)
#define NOISE_FILTER_ALPHA 0.4    // Low-pass filter coefficient
#define CENTER_BIAS 0.6           // Heimlich center-bias factor
#define GRAVITY 9.81              // m/s²

// BLE Configuration
#define BLE_DEVICE_NAME "RescueRight Vest #001"
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define FORCE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define POSITION_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define ANGLE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26aa"
```

### Firmware Loop (50ms cycle)

```cpp
void loop() {
  // 1. Read all 4 MPU6500 sensors (via I2C)
  readAllSensors();

  // 2. Calculate metrics
  float totalForce = calculateTotalForce();
  float posX = calculatePositionX();
  float posY = calculatePositionY();
  float angle = calculateAngle();

  // 3. Transmit via BLE (if connected)
  if (deviceConnected) {
    sendForceData(totalForce);
    sendPositionData(posX, posY);
    sendAngleData(angle);
  }

  // 4. Debug output to serial (500ms throttled)
  printDebugInfo(totalForce, posX, posY, angle);

  delay(50);  // 20Hz update rate
}
```

---

## Sensor Data Processing

### Force Calculation

```cpp
float calculateTotalForce() {
  float totalForce = 0;

  for (int i = 0; i < 4; i++) {
    if (sensorData[i].filtered > ACCEL_THRESHOLD) {
      // F = ma, with calibrated scaling
      float force = sensorData[i].filtered * FORCE_SCALE * 60;
      totalForce += force;
    }
  }

  return constrain(totalForce, 0, 500);  // 0-500N range
}
```

**Formula**: `Force (N) = acceleration_magnitude × FORCE_SCALE × mass_estimate`

Where:
- `acceleration_magnitude = √(ax² + ay² + az²) - baseline`
- `FORCE_SCALE = 0.8` (calibration factor)
- `mass_estimate = 60g` (sensor + foam assembly)

### Position Calculation (Weighted Average)

```cpp
float calculatePositionX() {
  float weightedX = 0;
  float totalWeight = 0;

  for (int i = 0; i < 4; i++) {
    float weight = sensorData[i].filtered;
    float normalizedX = sensors[i].physicalX_cm / FOAM_WIDTH_CM;
    weightedX += normalizedX * weight;
    totalWeight += weight;
  }

  float posX = weightedX / totalWeight;

  // Apply center bias for Heimlich targeting
  float centerX = 0.5;
  posX = centerX + (posX - centerX) * (1.0 - CENTER_BIAS);

  return constrain(posX, 0.0, 1.0);
}
```

**Center Bias**: Pulls position readings toward center (0.5, 0.45) to match Heimlich target zone.

### Angle Calculation

```cpp
float calculateAngle() {
  // Average Z-axis (perpendicular to vest)
  float avgZ = (sensorData[0].accelZ + sensorData[1].accelZ +
                sensorData[2].accelZ + sensorData[3].accelZ) / 4.0;

  // Average Y-axis (forward/back)
  float avgY = (sensorData[0].accelY + sensorData[1].accelY +
                sensorData[2].accelY + sensorData[3].accelY) / 4.0;

  // Calculate pitch angle
  float angle = atan2(avgY, avgZ) * 180.0 / PI;

  return constrain(angle, -90, 90);
}
```

**Formula**: `Pitch Angle = atan2(accel_y, accel_z) × (180/π)`

### Noise Filtering

```cpp
void readSensor(MPU6050 &mpu, int index) {
  // Read raw values from MPU6500
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Convert to m/s² (16384 LSB/g for ±2g range)
  sensorData[index].accelX = ax / 16384.0 * GRAVITY;
  sensorData[index].accelY = ay / 16384.0 * GRAVITY;
  sensorData[index].accelZ = az / 16384.0 * GRAVITY;

  // Calculate magnitude
  float magnitude = sqrt(
    sq(sensorData[index].accelX) +
    sq(sensorData[index].accelY) +
    sq(sensorData[index].accelZ)
  );

  // Subtract baseline (calibrated at startup)
  magnitude = abs(magnitude - baselineAccel[index]);

  // Apply EMA low-pass filter
  sensorData[index].filtered =
    (NOISE_FILTER_ALPHA * magnitude) +
    ((1 - NOISE_FILTER_ALPHA) * sensorData[index].filtered);
}
```

---

## BLE Protocol

### GATT Service Structure

```
Service: CPR Training Data
UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
│
├─ Characteristic: Force
│  UUID: beb5483e-36e1-4688-b7f5-ea07361b26a8
│  Properties: READ, NOTIFY
│  Data Type: Float32 (4 bytes)
│  Range: 0-500 N
│
├─ Characteristic: Position
│  UUID: beb5483e-36e1-4688-b7f5-ea07361b26a9
│  Properties: READ, NOTIFY
│  Data Type: Float32[2] (8 bytes: X, Y)
│  Range: 0.0-1.0 (normalized)
│
└─ Characteristic: Angle
   UUID: beb5483e-36e1-4688-b7f5-ea07361b26aa
   Properties: READ, NOTIFY
   Data Type: Float32 (4 bytes)
   Range: -180° to 180°
```

### Data Encoding

```cpp
// Force (single float)
void sendForceData(float force) {
  uint8_t data[4];
  memcpy(data, &force, 4);
  pForceCharacteristic->setValue(data, 4);
  pForceCharacteristic->notify();
}

// Position (two floats: X, Y)
void sendPositionData(float x, float y) {
  uint8_t data[8];
  memcpy(data, &x, 4);
  memcpy(data + 4, &y, 4);
  pPositionCharacteristic->setValue(data, 8);
  pPositionCharacteristic->notify();
}

// Angle (single float)
void sendAngleData(float angle) {
  uint8_t data[4];
  memcpy(data, &angle, 4);
  pAngleCharacteristic->setValue(data, 4);
  pAngleCharacteristic->notify();
}
```

**Encoding**: 32-bit floats (little-endian) transmitted as raw binary via BLE.

**Decoding** (App side):
```typescript
function decodeFloat(base64: string): number {
  const buffer = Buffer.from(base64, 'base64');
  return buffer.readFloatLE(0);
}

function decodePosition(base64: string): { x: number; y: number } {
  const buffer = Buffer.from(base64, 'base64');
  return {
    x: buffer.readFloatLE(0),
    y: buffer.readFloatLE(4)
  };
}
```

---

## Calibration Procedure

### 1. Baseline Calibration (Automatic on Startup)

```cpp
void calibrateSensors() {
  const int samples = 100;
  float sum[4] = {0, 0, 0, 0};

  for (int i = 0; i < samples; i++) {
    readAllSensors();
    for (int j = 0; j < 4; j++) {
      sum[j] += sensorData[j].magnitude;
    }
    delay(10);
  }

  for (int i = 0; i < 4; i++) {
    baselineAccel[i] = sum[i] / samples;  // Should be ~9.81 m/s²
  }
}
```

**Procedure**: Place vest flat, restart ESP32, wait 3 seconds for calibration.

### 2. Force Scale Adjustment

**Test Method**:
1. Apply known force (using scale or known weight)
2. Check Serial Monitor output
3. Adjust `FORCE_SCALE` constant
4. Re-upload firmware

**Target**: Medium press (40N) should read 30-50N on Serial Monitor.

### 3. Position Mapping Verification

**Test Positions**:
- Top-left → (0.2-0.4, 0.2-0.4)
- Top-right → (0.6-0.8, 0.2-0.4)
- Bottom-left → (0.2-0.4, 0.6-0.8)
- Bottom-right → (0.6-0.8, 0.6-0.8)
- Center → (0.45-0.55, 0.40-0.50)

**Adjustment**: If positions are inverted, modify `calculatePositionX/Y()` formulas.

---

## Serial Monitor Output

**Expected Output** (115200 baud):
```
════════════════════════════════════════
  RescueRight Smart Vest - MVP
  4x MPU6500 + ESP32
════════════════════════════════════════

[1/4] Initializing I2C...
  ✓ I2C ready

[2/4] Initializing MPU6500 sensors...
  ✓ MPU #1 (Top-Left) (WHO_AM_I: 0x70)
  ✓ MPU #2 (Top-Right) (WHO_AM_I: 0x70)
  ✓ MPU #3 (Bot-Left) (WHO_AM_I: 0x70)
  ✓ MPU #4 (Bot-Right) (WHO_AM_I: 0x70)

[3/4] Calibrating sensors...
  Sensor 1 baseline: 9.81 m/s²
  Sensor 2 baseline: 9.82 m/s²
  Sensor 3 baseline: 9.80 m/s²
  Sensor 4 baseline: 9.81 m/s²
  ✓ Calibration complete

[4/4] Starting Bluetooth...
  ✓ Bluetooth ready
  📡 Advertising as 'RescueRight Vest #001'

════════════════════════════════════════
System ready! Waiting for connection...
════════════════════════════════════════

Force: 0.0N | Pos: (0.50, 0.45) | Angle: 0.0° | Sensors: [0.0, 0.0, 0.0, 0.0]
Force: 25.3N | Pos: (0.48, 0.52) | Angle: -0.5° | Sensors: [5.2, 6.1, 4.8, 5.9]
```

---

## Troubleshooting

### Sensor Not Detected

**Symptom**: Serial Monitor shows "❌ MPU #X - not found"

**Solutions**:
1. Check wiring: VCC → 3.3V, GND → GND, SDA/SCL connected
2. Verify I2C address (AD0 pin: GND=0x68, 3.3V=0x69)
3. Test I2C scanner:
   ```cpp
   Wire.beginTransmission(0x68);
   if (Wire.endTransmission() == 0) Serial.println("Found at 0x68");
   ```
4. Swap sensor physically to isolate hardware vs wiring issue

### Force Always Zero

**Symptom**: Force reads 0N even when pressing

**Solutions**:
1. Increase `FORCE_SCALE` (try 1.0 or 1.5)
2. Lower `ACCEL_THRESHOLD` (try 1.0 or 0.5)
3. Check foam thickness (2-3cm optimal)
4. Verify sensors are on TOP of foam (not underneath)

### Position Not Changing

**Symptom**: Position stuck at (0.50, 0.45)

**Solutions**:
1. Verify all 4 sensors initialized (check Serial Monitor)
2. Press harder (test with strong compression)
3. Check physical sensor placement matches code positions
4. Disable `CENTER_BIAS` temporarily (set to 0.0) to test raw readings

### BLE Connection Fails

**Symptom**: App can't find "RescueRight Vest #001"

**Solutions**:
1. Restart ESP32 (press EN button)
2. Check Serial Monitor shows "Advertising..."
3. Verify phone Bluetooth is ON
4. Enable Location Services (Android BLE requirement)
5. Re-upload firmware to reset BLE stack

---

## Performance Specifications

| Metric | Standard Firmware | Optimized Firmware |
|--------|------------------|-------------------|
| Update Rate | 10Hz (100ms) | 20Hz (50ms) |
| BLE Latency | ~150ms | ~100ms |
| Force Range | 0-500N | 0-500N |
| Force Resolution | 0.1N | 0.1N |
| Position Range | 0.0-1.0 (normalized) | 0.0-1.0 (normalized) |
| Angle Range | -90° to 90° | -90° to 90° |
| Power Consumption | ~80mA (active) | ~85mA (active) |
| Battery Life | 4-6 hours (2000mAh) | 3.5-5 hours (2000mAh) |

---

## Firmware Upload Instructions

### Arduino IDE Setup

1. **Install ESP32 Board Support**:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

2. **Install MPU6050 Library**:
   - Sketch → Include Library → Manage Libraries
   - Search "MPU6050" → Install "MPU6050 by Electronic Cats"

3. **Configure Board**:
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → (select your ESP32 port)

4. **Upload**:
   - Open `RescueRightApp/firmware/mvp2.ino`
   - Click Upload (→) button
   - Wait for "Done uploading"

5. **Verify**:
   - Open Serial Monitor (Tools → Serial Monitor)
   - Set baud rate to 115200
   - Press EN button on ESP32
   - Check for successful initialization

---

## Hardware Bill of Materials (BOM)

| Component | Quantity | Estimated Cost |
|-----------|----------|----------------|
| ESP32 DevKit V1 | 1 | $8-12 |
| MPU6500 IMU Sensor | 4 | $20-30 |
| Breadboard/PCB | 1 | $5-10 |
| Jumper Wires | 20+ | $3-5 |
| Foam Padding (2-3cm thick) | 4 pieces | $5-10 |
| LiPo Battery (3.7V 2000mAh) | 1 | $10-15 |
| Voltage Regulator (optional) | 1 | $2-3 |
| **Total** | | **~$50-85** |

---

## Safety Considerations

1. **Voltage**: ESP32 operates at 3.3V logic. Do NOT connect 5V to sensors.
2. **Current**: Each MPU6500 draws ~3.5mA. Total sensor draw: ~14mA (safe for ESP32).
3. **Power Supply**: Use regulated 3.3V or 5V (via ESP32's onboard regulator).
4. **ESD Protection**: Handle sensors with anti-static precautions.
5. **Force Limits**: Firmware constrains force to 0-500N to prevent unrealistic readings.

---

## Future Hardware Enhancements

**Potential Upgrades**:
1. Custom PCB (replace breadboard wiring)
2. Rechargeable battery with USB-C charging
3. Waterproof enclosure (IP54+ rating)
4. Hall effect force sensors (for direct force measurement)
5. Haptic feedback motors (vibration alerts)
6. OLED display (on-vest status display)

---

## Additional Resources

- **ESP32 Datasheet**: https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf
- **MPU6500 Datasheet**: https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6500/
- **BLE GATT Specification**: https://www.bluetooth.com/specifications/specs/core-specification/

---

For app-side integration, see `DeveloperDocs/ARCHITECTURE.md` and `DeveloperDocs/API_REFERENCE.md`.
