/**
 * ════════════════════════════════════════════════════════════
 *  RescueRight Smart Vest - ESP32 Firmware (OPTIMIZED)
 *  MVP Version with 4x MPU6500 IMU sensors
 *
 *  Hardware: ESP32 DevKit V1 + 4x MPU6500
 *  Communication: Bluetooth Low Energy (BLE)
 *  Foam Pad: 27cm wide x 13cm tall
 *  Sensor spacing: 25cm diagonal (corners of foam)
 * ════════════════════════════════════════════════════════════
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ────────────────────────────────────────────────────────────
// I2C BUS CONFIGURATION (MATCHING YOUR WORKING TEST CODE)
// ────────────────────────────────────────────────────────────

#define BUS1_SDA 21
#define BUS1_SCL 22
#define BUS2_SDA 25
#define BUS2_SCL 26
#define I2C_FREQ 100000  // 100kHz - tested and working

// Use hardware I2C1 controller for second bus (same as your test code)
TwoWire I2C_Bus2 = TwoWire(1);

// ────────────────────────────────────────────────────────────
// MPU6500 CONFIGURATION
// ────────────────────────────────────────────────────────────

// MPU6500 I2C Addresses
#define MPU_ADDR_LOW  0x68  // AD0 = LOW
#define MPU_ADDR_HIGH 0x69  // AD0 = HIGH

// MPU6500 Register Map
#define MPU6500_WHO_AM_I        0x75
#define MPU6500_PWR_MGMT_1      0x6B
#define MPU6500_CONFIG          0x1A
#define MPU6500_GYRO_CONFIG     0x1B
#define MPU6500_ACCEL_CONFIG    0x1C
#define MPU6500_ACCEL_CONFIG_2  0x1D
#define MPU6500_ACCEL_XOUT_H    0x3B
#define MPU6500_GYRO_XOUT_H     0x43

// MPU6500 Expected WHO_AM_I values
#define MPU6500_ID              0x70
#define MPU6500_ID_ALT          0x71

// ────────────────────────────────────────────────────────────
// BLE CONFIGURATION
// ────────────────────────────────────────────────────────────

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define FORCE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define POSITION_CHAR_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define ANGLE_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26aa"

// ────────────────────────────────────────────────────────────
// CALIBRATION CONSTANTS (OPTIMIZED FOR 27x13cm FOAM PAD)
// ────────────────────────────────────────────────────────────

// Force calibration - optimized for center Heimlich strikes
#define FORCE_SCALE 0.8        // Increased sensitivity for foam compression
#define ACCEL_THRESHOLD 1.5    // Lower threshold for faster detection
#define NOISE_FILTER_ALPHA 0.4 // Faster response (higher = more responsive)

// Accelerometer sensitivity (±2g range)
#define ACCEL_SENSITIVITY 16384.0  // LSB/g for ±2g
#define GRAVITY 9.81               // m/s²

// Gyroscope sensitivity (±250°/s range)
#define GYRO_SENSITIVITY 131.0     // LSB/(°/s)

// Position calibration for 27cm x 13cm foam with sensors at corners
// Sensors are 25cm apart diagonally
#define FOAM_WIDTH_CM  27.0
#define FOAM_HEIGHT_CM 13.0
#define CENTER_BIAS 0.6  // Higher value = more bias toward center (Heimlich target)

// ────────────────────────────────────────────────────────────
// SENSOR MAPPING (OPTIMIZED FOR YOUR PHYSICAL SETUP)
// ────────────────────────────────────────────────────────────

// Physical layout on 27cm x 13cm foam:
//   Top-Left (0,0)─────────────Top-Right (27,0)
//        │                           │
//        │        CENTER (13.5, 6.5) │
//        │                           │
//   Bot-Left (0,13)────────────Bot-Right (27,13)

struct SensorConfig {
  TwoWire* bus;
  uint8_t addr;
  const char* name;
  float physicalX_cm;  // Physical position in cm
  float physicalY_cm;
};

SensorConfig sensors[4] = {
  {&Wire,      MPU_ADDR_LOW,  "MPU #1 (Top-Left)",   0.0,   0.0},   // Top-Left corner
  {&Wire,      MPU_ADDR_HIGH, "MPU #2 (Top-Right)", 27.0,   0.0},   // Top-Right corner
  {&I2C_Bus2,  MPU_ADDR_LOW,  "MPU #3 (Bot-Left)",   0.0,  13.0},   // Bottom-Left corner
  {&I2C_Bus2,  MPU_ADDR_HIGH, "MPU #4 (Bot-Right)", 27.0,  13.0}    // Bottom-Right corner
};

// ────────────────────────────────────────────────────────────
// GLOBAL VARIABLES
// ────────────────────────────────────────────────────────────

struct SensorData {
  float accelX, accelY, accelZ;
  float gyroX, gyroY, gyroZ;
  float magnitude;
  float filtered;
  bool active;
};

SensorData sensorData[4];
float baselineAccel[4] = {0, 0, 0, 0};

// BLE objects
BLEServer* pServer = NULL;
BLECharacteristic* pForceCharacteristic = NULL;
BLECharacteristic* pPositionCharacteristic = NULL;
BLECharacteristic* pAngleCharacteristic = NULL;
bool deviceConnected = false;

// ────────────────────────────────────────────────────────────
// MPU6500 I2C FUNCTIONS
// ────────────────────────────────────────────────────────────

void writeMPU6500(TwoWire* bus, uint8_t addr, uint8_t reg, uint8_t value) {
  bus->beginTransmission(addr);
  bus->write(reg);
  bus->write(value);
  bus->endTransmission();
}

uint8_t readMPU6500(TwoWire* bus, uint8_t addr, uint8_t reg) {
  bus->beginTransmission(addr);
  bus->write(reg);
  bus->endTransmission(false);
  bus->requestFrom(addr, (uint8_t)1, true);
  if (bus->available()) {
    return bus->read();
  }
  return 0;
}

void readMPU(TwoWire* bus, uint8_t addr, float &ax, float &ay, float &az,
             float &gx, float &gy, float &gz) {
  bus->beginTransmission(addr);
  bus->write(MPU6500_ACCEL_XOUT_H);
  bus->endTransmission(false);
  bus->requestFrom(addr, (uint8_t)14, true);

  int16_t rawAx = (bus->read() << 8) | bus->read();
  int16_t rawAy = (bus->read() << 8) | bus->read();
  int16_t rawAz = (bus->read() << 8) | bus->read();
  bus->read(); bus->read(); // Skip temperature
  int16_t rawGx = (bus->read() << 8) | bus->read();
  int16_t rawGy = (bus->read() << 8) | bus->read();
  int16_t rawGz = (bus->read() << 8) | bus->read();

  // Convert to g's (±2g sensitivity)
  ax = rawAx / ACCEL_SENSITIVITY;
  ay = rawAy / ACCEL_SENSITIVITY;
  az = rawAz / ACCEL_SENSITIVITY;

  // Convert to degrees/s
  gx = rawGx / GYRO_SENSITIVITY;
  gy = rawGy / GYRO_SENSITIVITY;
  gz = rawGz / GYRO_SENSITIVITY;
}

bool initializeMPU6500(int sensorIndex) {
  TwoWire* bus = sensors[sensorIndex].bus;
  uint8_t addr = sensors[sensorIndex].addr;
  const char* name = sensors[sensorIndex].name;

  // Check WHO_AM_I register
  uint8_t whoami = readMPU6500(bus, addr, MPU6500_WHO_AM_I);

  if (whoami != MPU6500_ID && whoami != MPU6500_ID_ALT) {
    Serial.print("  ❌ ");
    Serial.print(name);
    Serial.print(" - WHO_AM_I: 0x");
    Serial.print(whoami, HEX);
    Serial.println(" (expected 0x70 or 0x71)");
    sensorData[sensorIndex].active = false;
    return false;
  }

  // Reset device
  writeMPU6500(bus, addr, MPU6500_PWR_MGMT_1, 0x80);
  delay(100);

  // Wake up device
  writeMPU6500(bus, addr, MPU6500_PWR_MGMT_1, 0x00);
  delay(10);

  // Configure accelerometer (±2g range for sensitivity)
  writeMPU6500(bus, addr, MPU6500_ACCEL_CONFIG, 0x00);
  delay(10);

  // Configure gyroscope (±250°/s range)
  writeMPU6500(bus, addr, MPU6500_GYRO_CONFIG, 0x00);
  delay(10);

  // Configure DLPF (Digital Low Pass Filter) - 20Hz bandwidth
  writeMPU6500(bus, addr, MPU6500_CONFIG, 0x04);
  delay(10);

  // Configure accelerometer DLPF - 21.2Hz bandwidth
  writeMPU6500(bus, addr, MPU6500_ACCEL_CONFIG_2, 0x04);
  delay(10);

  sensorData[sensorIndex].active = true;
  sensorData[sensorIndex].filtered = 0.0;

  Serial.print("  ✓ ");
  Serial.print(name);
  Serial.print(" (WHO_AM_I: 0x");
  Serial.print(whoami, HEX);
  Serial.println(")");

  return true;
}

void readSensor(int sensorIndex) {
  if (!sensorData[sensorIndex].active) {
    return;
  }

  TwoWire* bus = sensors[sensorIndex].bus;
  uint8_t addr = sensors[sensorIndex].addr;

  float ax, ay, az, gx, gy, gz;
  readMPU(bus, addr, ax, ay, az, gx, gy, gz);

  // Convert to m/s²
  sensorData[sensorIndex].accelX = ax * GRAVITY;
  sensorData[sensorIndex].accelY = ay * GRAVITY;
  sensorData[sensorIndex].accelZ = az * GRAVITY;
  sensorData[sensorIndex].gyroX = gx;
  sensorData[sensorIndex].gyroY = gy;
  sensorData[sensorIndex].gyroZ = gz;

  // Calculate acceleration magnitude
  float magnitude = sqrt(
    sq(sensorData[sensorIndex].accelX) +
    sq(sensorData[sensorIndex].accelY) +
    sq(sensorData[sensorIndex].accelZ)
  );

  // Subtract baseline (to get relative change)
  magnitude = abs(magnitude - baselineAccel[sensorIndex]);

  // Apply low-pass filter (faster response with higher alpha)
  sensorData[sensorIndex].filtered =
    (NOISE_FILTER_ALPHA * magnitude) +
    ((1 - NOISE_FILTER_ALPHA) * sensorData[sensorIndex].filtered);

  sensorData[sensorIndex].magnitude = magnitude;
}

// ────────────────────────────────────────────────────────────
// CALCULATION FUNCTIONS (OPTIMIZED FOR CENTER HEIMLICH)
// ────────────────────────────────────────────────────────────

float calculateTotalForce() {
  float totalForce = 0;

  for (int i = 0; i < 4; i++) {
    if (!sensorData[i].active) continue;

    if (sensorData[i].filtered > ACCEL_THRESHOLD) {
      // Increased scale for better force readings
      float force = sensorData[i].filtered * FORCE_SCALE * 60;
      totalForce += force;
    }
  }

  return constrain(totalForce, 0, 400);
}

float calculatePositionX() {
  float weightedX = 0;
  float totalWeight = 0;

  for (int i = 0; i < 4; i++) {
    if (!sensorData[i].active) continue;

    float weight = sensorData[i].filtered;
    if (weight > ACCEL_THRESHOLD) {
      // Normalize to 0-1 range (0 = left edge, 1 = right edge)
      float normalizedX = sensors[i].physicalX_cm / FOAM_WIDTH_CM;
      weightedX += normalizedX * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight < ACCEL_THRESHOLD) {
    return 0.5; // Center default
  }

  // Calculate weighted average position
  float posX = weightedX / totalWeight;

  // Apply center bias for Heimlich targeting
  float centerX = 0.5;
  posX = centerX + (posX - centerX) * (1.0 - CENTER_BIAS);

  return constrain(posX, 0.0, 1.0);
}

float calculatePositionY() {
  float weightedY = 0;
  float totalWeight = 0;

  for (int i = 0; i < 4; i++) {
    if (!sensorData[i].active) continue;

    float weight = sensorData[i].filtered;
    if (weight > ACCEL_THRESHOLD) {
      // Normalize to 0-1 range (0 = top edge, 1 = bottom edge)
      float normalizedY = sensors[i].physicalY_cm / FOAM_HEIGHT_CM;
      weightedY += normalizedY * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight < ACCEL_THRESHOLD) {
    return 0.5; // Center default
  }

  // Calculate weighted average position
  float posY = weightedY / totalWeight;

  // Apply center bias for Heimlich targeting
  float centerY = 0.5;
  posY = centerY + (posY - centerY) * (1.0 - CENTER_BIAS);

  return constrain(posY, 0.0, 1.0);
}

float calculateAngle() {
  float avgZ = 0;
  float avgY = 0;
  int activeCount = 0;

  for (int i = 0; i < 4; i++) {
    if (sensorData[i].active) {
      avgZ += sensorData[i].accelZ;
      avgY += sensorData[i].accelY;
      activeCount++;
    }
  }

  if (activeCount == 0) return 0;

  avgZ /= activeCount;
  avgY /= activeCount;

  float angle = atan2(avgY, avgZ) * 180.0 / PI;
  return constrain(angle, -90, 90);
}

// ────────────────────────────────────────────────────────────
// CALIBRATION
// ────────────────────────────────────────────────────────────

void calibrateSensors() {
  const int samples = 100;
  float sum[4] = {0, 0, 0, 0};
  int validSamples[4] = {0, 0, 0, 0};

  for (int i = 0; i < samples; i++) {
    for (int j = 0; j < 4; j++) {
      readSensor(j);
      if (sensorData[j].active) {
        float mag = sqrt(
          sq(sensorData[j].accelX) +
          sq(sensorData[j].accelY) +
          sq(sensorData[j].accelZ)
        );
        sum[j] += mag;
        validSamples[j]++;
      }
    }
    delay(10);
  }

  for (int i = 0; i < 4; i++) {
    if (validSamples[i] > 0) {
      baselineAccel[i] = sum[i] / validSamples[i];
      Serial.print("  Sensor ");
      Serial.print(i + 1);
      Serial.print(" baseline: ");
      Serial.print(baselineAccel[i], 2);
      Serial.println(" m/s²");
    } else {
      Serial.print("  Sensor ");
      Serial.print(i + 1);
      Serial.println(" - INACTIVE");
    }
  }
}

// ────────────────────────────────────────────────────────────
// BLE FUNCTIONS
// ────────────────────────────────────────────────────────────

class ServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("📱 Device connected");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("📱 Device disconnected - restarting advertising");
    BLEDevice::startAdvertising();
  }
};

void setupBLE() {
  BLEDevice::init("RescueRight Vest #001");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Force characteristic
  pForceCharacteristic = pService->createCharacteristic(
    FORCE_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pForceCharacteristic->addDescriptor(new BLE2902());

  // Position characteristic
  pPositionCharacteristic = pService->createCharacteristic(
    POSITION_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pPositionCharacteristic->addDescriptor(new BLE2902());

  // Angle characteristic
  pAngleCharacteristic = pService->createCharacteristic(
    ANGLE_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pAngleCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
}

void sendForceData(float force) {
  uint8_t data[4];
  memcpy(data, &force, 4);
  pForceCharacteristic->setValue(data, 4);
  pForceCharacteristic->notify();
}

void sendPositionData(float x, float y) {
  uint8_t data[8];
  memcpy(data, &x, 4);
  memcpy(data + 4, &y, 4);
  pPositionCharacteristic->setValue(data, 8);
  pPositionCharacteristic->notify();
}

void sendAngleData(float angle) {
  uint8_t data[4];
  memcpy(data, &angle, 4);
  pAngleCharacteristic->setValue(data, 4);
  pAngleCharacteristic->notify();
}

// ────────────────────────────────────────────────────────────
// DEBUG OUTPUT
// ────────────────────────────────────────────────────────────

void printDebugInfo(float force, float x, float y, float angle) {
  Serial.print("Force: ");
  Serial.print(force, 1);
  Serial.print("N | Pos: (");
  Serial.print(x, 2);
  Serial.print(", ");
  Serial.print(y, 2);
  Serial.print(") | Angle: ");
  Serial.print(angle, 1);
  Serial.print("° | Sensors: [");

  for (int i = 0; i < 4; i++) {
    if (sensorData[i].active) {
      Serial.print(sensorData[i].filtered, 1);
    } else {
      Serial.print("--");
    }
    if (i < 3) Serial.print(", ");
  }
  Serial.println("]");
}

// ────────────────────────────────────────────────────────────
// SETUP & LOOP
// ────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("════════════════════════════════════════");
  Serial.println("  RescueRight Smart Vest - MVP OPTIMIZED");
  Serial.println("  4x MPU6500 + ESP32");
  Serial.println("  27cm x 13cm Foam Pad");
  Serial.println("════════════════════════════════════════\n");

  // Initialize I2C buses (EXACT SAME AS YOUR WORKING TEST CODE)
  Serial.println("[1/4] Initializing I2C buses...");
  Wire.begin(BUS1_SDA, BUS1_SCL, I2C_FREQ);
  I2C_Bus2.begin(BUS2_SDA, BUS2_SCL, I2C_FREQ);
  delay(500);
  Serial.println("  ✓ Bus 1: GPIO 21 (SDA), GPIO 22 (SCL)");
  Serial.println("  ✓ Bus 2: GPIO 25 (SDA), GPIO 26 (SCL)");

  // Initialize MPU sensors
  Serial.println("\n[2/4] Initializing MPU6500 sensors...");
  int activeSensors = 0;
  for (int i = 0; i < 4; i++) {
    if (initializeMPU6500(i)) {
      activeSensors++;
    }
  }

  Serial.print("  ✓ ");
  Serial.print(activeSensors);
  Serial.println(" sensors active");

  if (activeSensors == 0) {
    Serial.println("\n❌ ERROR: No sensors detected!");
    Serial.println("Check wiring and I2C connections.");
    while(1) { delay(1000); }
  }

  // Calibrate sensors
  Serial.println("\n[3/4] Calibrating sensors...");
  Serial.println("  Keep vest flat and still for 3 seconds...");
  calibrateSensors();
  Serial.println("  ✓ Calibration complete");

  // Initialize Bluetooth
  Serial.println("\n[4/4] Starting Bluetooth...");
  setupBLE();
  Serial.println("  ✓ Bluetooth ready");
  Serial.println("  📡 Advertising as 'RescueRight Vest #001'");

  Serial.println("\n════════════════════════════════════════");
  Serial.println("System ready! Waiting for connection...");
  Serial.println("════════════════════════════════════════\n");
}

void loop() {
  // Read all sensors
  for (int i = 0; i < 4; i++) {
    readSensor(i);
  }

  // Calculate metrics
  float totalForce = calculateTotalForce();
  float posX = calculatePositionX();
  float posY = calculatePositionY();
  float angle = calculateAngle();

  // Send via Bluetooth if connected
  if (deviceConnected) {
    sendForceData(totalForce);
    sendPositionData(posX, posY);
    sendAngleData(angle);
  }

  // Debug output (every 500ms)
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 500) {
    printDebugInfo(totalForce, posX, posY, angle);
    lastPrint = millis();
  }

  delay(50); // 20Hz update rate (INCREASED from 10Hz for faster response)
}
