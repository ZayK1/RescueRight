# ESP32 Bluetooth Integration Guide

**RescueRight Smart Vest - Hardware Integration**
**Version**: 1.0
**Last Updated**: October 11, 2025

---

## 📋 Table of Contents

1. [Hardware Requirements](#-hardware-requirements)
2. [ESP32 Setup](#-esp32-setup)
3. [Bluetooth Configuration](#-bluetooth-configuration)
4. [Sensor Data Format](#-sensor-data-format)
5. [Testing & Debugging](#-testing--debugging)
6. [App Integration](#-app-integration)
7. [Troubleshooting](#-troubleshooting)

---

## 🛠 Hardware Requirements

### Required Components

| Component | Specification | Purpose | Estimated Cost |
|-----------|--------------|---------|----------------|
| **ESP32 DevKit** | ESP32-WROOM-32 | Main controller with BLE | $8-12 |
| **Force Sensors** | FSR402 or Load Cell (0-200N) | Measure compression force | $15-25 |
| **Position Sensors** | 2x Capacitive or Hall Effect | Detect hand placement | $10-15 |
| **IMU Sensor** | MPU6050 or MPU9250 | Measure compression angle | $5-8 |
| **LiPo Battery** | 3.7V 2000mAh | Power supply | $10-15 |
| **Voltage Regulator** | AMS1117-3.3V | Stable power | $2-3 |
| **Misc** | Wires, resistors, PCB | Assembly | $10-15 |
| **Total** | | | **~$60-95** |

### Recommended ESP32 Board

**ESP32-WROOM-32D DevKit V1**
- Built-in Bluetooth Low Energy (BLE)
- 520KB SRAM
- 16MB Flash
- 18 ADC channels (for sensors)
- Low power consumption
- Arduino IDE compatible

---

## ⚙️ ESP32 Setup

### 1. Install Arduino IDE

```bash
# Download from: https://www.arduino.cc/en/software
# Version: 2.0 or later
```

### 2. Install ESP32 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32" and install **esp32 by Espressif Systems**

### 3. Install Required Libraries

```arduino
// In Arduino IDE: Sketch → Include Library → Manage Libraries
// Install these:

1. BLE (built-in with ESP32)
2. Wire (built-in, for I2C)
3. MPU6050 (by Electronic Cats)
4. HX711 (if using load cell)
```

---

## 📡 Bluetooth Configuration

### Service & Characteristic UUIDs

These UUIDs must match the ones in the app (`lib/bluetooth.ts`):

```cpp
// BLE Service UUID
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

// Characteristic UUIDs
#define FORCE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define POSITION_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define ANGLE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26aa"
```

### Basic ESP32 BLE Code Structure

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
BLECharacteristic* pForceCharacteristic = NULL;
BLECharacteristic* pPositionCharacteristic = NULL;
BLECharacteristic* pAngleCharacteristic = NULL;

bool deviceConnected = false;

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected");
      // Restart advertising
      BLEDevice::startAdvertising();
    }
};

void setup() {
  Serial.begin(115200);

  // Initialize BLE
  BLEDevice::init("RescueRight Vest #001");

  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create Force Characteristic
  pForceCharacteristic = pService->createCharacteristic(
    FORCE_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pForceCharacteristic->addDescriptor(new BLE2902());

  // Create Position Characteristic
  pPositionCharacteristic = pService->createCharacteristic(
    POSITION_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pPositionCharacteristic->addDescriptor(new BLE2902());

  // Create Angle Characteristic
  pAngleCharacteristic = pService->createCharacteristic(
    ANGLE_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pAngleCharacteristic->addDescriptor(new BLE2902());

  // Start service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("BLE Server ready, waiting for connections...");
}

void loop() {
  if (deviceConnected) {
    // Read sensors
    float force = readForceSensor();
    float posX = readPositionX();
    float posY = readPositionY();
    float angle = readAngleSensor();

    // Send data
    sendForceData(force);
    sendPositionData(posX, posY);
    sendAngleData(angle);

    delay(100); // Update rate: 10Hz
  }
}
```

---

## 📊 Sensor Data Format

All sensor data is sent as **32-bit floats** in **little-endian** format.

### Force Data (Single Float)

```cpp
void sendForceData(float force) {
  // Force in Newtons (0-200N range)
  uint8_t data[4];
  memcpy(data, &force, 4);
  pForceCharacteristic->setValue(data, 4);
  pForceCharacteristic->notify();
}

float readForceSensor() {
  // Example: FSR sensor on ADC pin
  int raw = analogRead(FORCE_SENSOR_PIN);
  float force = map(raw, 0, 4095, 0, 200); // Map to 0-200N
  return force;
}
```

### Position Data (Two Floats: X, Y)

```cpp
void sendPositionData(float x, float y) {
  // X and Y normalized to 0-1 range
  uint8_t data[8];
  memcpy(data, &x, 4);
  memcpy(data + 4, &y, 4);
  pPositionCharacteristic->setValue(data, 8);
  pPositionCharacteristic->notify();
}

float readPositionX() {
  int raw = analogRead(POSITION_X_PIN);
  return (float)raw / 4095.0; // Normalize to 0-1
}

float readPositionY() {
  int raw = analogRead(POSITION_Y_PIN);
  return (float)raw / 4095.0; // Normalize to 0-1
}
```

### Angle Data (Single Float)

```cpp
void sendAngleData(float angle) {
  // Angle in degrees (-45 to +45)
  uint8_t data[4];
  memcpy(data, &angle, 4);
  pAngleCharacteristic->setValue(data, 4);
  pAngleCharacteristic->notify();
}

float readAngleSensor() {
  // Example: MPU6050 IMU
  // This is simplified - use actual MPU6050 library
  // Return pitch angle in degrees
  return calculatePitchFromIMU();
}
```

---

## 🧪 Testing & Debugging

### Serial Monitor Testing

```cpp
void loop() {
  float force = readForceSensor();
  float posX = readPositionX();
  float posY = readPositionY();
  float angle = readAngleSensor();

  // Debug output
  Serial.print("Force: "); Serial.print(force); Serial.print("N | ");
  Serial.print("Pos: ("); Serial.print(posX); Serial.print(", ");
  Serial.print(posY); Serial.print(") | ");
  Serial.print("Angle: "); Serial.print(angle); Serial.println("°");

  if (deviceConnected) {
    sendForceData(force);
    sendPositionData(posX, posY);
    sendAngleData(angle);
  }

  delay(100);
}
```

### BLE Scanner Apps for Testing

**iOS:**
- LightBlue® (Nordic Semiconductor)
- nRF Connect (Nordic Semiconductor)

**Android:**
- nRF Connect (Nordic Semiconductor)
- BLE Scanner

**Steps:**
1. Upload code to ESP32
2. Open BLE scanner app
3. Look for "RescueRight Vest #001"
4. Connect and view characteristics
5. Enable notifications
6. Verify data updates

---

## 📱 App Integration

### Switch from Mock to Real Data

**File: `app/training.tsx`**

```typescript
// Before (Mock Data):
import { useTrainingData } from '../hooks/useTrainingData';

export default function TrainingScreen() {
  const data = useTrainingData();
  // ...
}
```

```typescript
// After (Real Bluetooth Data):
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';

export default function TrainingScreen() {
  const data = useBluetoothTrainingData(false); // false = use real BLE
  // ...
}
```

### Testing with Mock Data

```typescript
// For testing without hardware:
const data = useBluetoothTrainingData(true); // true = use mock simulation
```

---

## ⚠️ Troubleshooting

### Issue: ESP32 not advertising

**Solution:**
```cpp
// Add to loop():
if (!deviceConnected) {
  BLEDevice::startAdvertising();
  delay(500);
}
```

### Issue: App can't find vest

**Checklist:**
- ✓ ESP32 is powered on (check LED)
- ✓ Device name starts with "RescueRight"
- ✓ App has Bluetooth permissions
- ✓ Phone Bluetooth is enabled
- ✓ Location services enabled (Android)

### Issue: Data not updating

**Check:**
1. Notifications enabled for characteristics
2. `notify()` called after `setValue()`
3. Update rate not too fast (<100Hz)
4. Device still connected

### Issue: Incorrect data values

**Debug:**
```cpp
// Print raw sensor values
Serial.print("Raw ADC: ");
Serial.println(analogRead(SENSOR_PIN));

// Check data encoding
uint8_t data[4];
memcpy(data, &force, 4);
for(int i=0; i<4; i++) {
  Serial.print(data[i], HEX);
  Serial.print(" ");
}
Serial.println();
```

---

## 🔋 Power Management

### Battery Life Optimization

```cpp
// Reduce BLE power
esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_ADV, ESP_PWR_LVL_N12);

// Sleep when not connected
if (!deviceConnected) {
  esp_sleep_enable_timer_wakeup(5000000); // 5 seconds
  esp_light_sleep_start();
}

// Reduce sensor sampling rate
delay(200); // 5Hz instead of 10Hz
```

---

## 📚 Additional Resources

### ESP32 Documentation
- Official: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/
- Arduino: https://github.com/espressif/arduino-esp32

### BLE Tutorials
- https://randomnerdtutorials.com/esp32-bluetooth-low-energy-ble-arduino-ide/
- https://www.electronicshub.org/esp32-ble-tutorial/

### Sensor Guides
- FSR Force Sensors: https://learn.adafruit.com/force-sensitive-resistor-fsr
- MPU6050 IMU: https://github.com/ElectronicCats/mpu6050

---

## 📞 Support

For hardware integration questions:
- Email: idp.studentsclub.ideate@u.nus.edu
- Project: IDEATE 2025 Team 8 (AKSD2103)

---

**Document Version**: 1.0
**Last Updated**: October 11, 2025
**Author**: RescueRight Development Team
