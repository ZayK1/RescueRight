/**
 * ════════════════════════════════════════════════════════════
 *  RescueRight Smart Vest - ESP32 Firmware
 *  MVP Version with 4x MPU6500 IMU sensors
 *
 *  Hardware: ESP32 DevKit V1 + 4x MPU6500
 *  Communication: Bluetooth Low Energy (BLE)
 *  I2C: Two separate buses (tested and working)
 * ════════════════════════════════════════════════════════════
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ────────────────────────────────────────────────────────────
// I2C BUS CONFIGURATION (YOUR WORKING SETUP)
// ────────────────────────────────────────────────────────────

#define BUS1_SDA 21
#define BUS1_SCL 22
#define BUS2_SDA 25
#define BUS2_SCL 26
#define I2C_FREQ 100000  // 100kHz (your tested frequency)

TwoWire I2C_Bus2 = TwoWire(1);  // Second I2C bus

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
// CALIBRATION CONSTANTS
// ────────────────────────────────────────────────────────────

#define FORCE_SCALE 0.5        // Convert acceleration to Newtons
#define ACCEL_THRESHOLD 2.0    // Minimum acceleration to register (m/s²)
#define NOISE_FILTER_ALPHA 0.3 // Low-pass filter coefficient (0-1)

// Accelerometer sensitivity (±2g range per your working code)
#define ACCEL_SENSITIVITY 16384.0  // LSB/g for ±2g
#define GRAVITY 9.81               // m/s²

// Gyroscope sensitivity (±250°/s range)
#define GYRO_SENSITIVITY 131.0     // LSB/(°/s)

// ────────────────────────────────────────────────────────────
// SENSOR MAPPING
// ────────────────────────────────────────────────────────────

// Sensor layout:
// Bus 1 (GPIO 21/22): MPU @ 0x68 (Top-Left), MPU @ 0x69 (Top-Right)
// Bus 2 (GPIO 25/26): MPU @ 0x68 (Bot-Left), MPU @ 0x69 (Bot-Right)

struct SensorConfig {
  TwoWire* bus;
  uint8_t addr;
  const char* name;
  float posX, posY;  // Relative position on vest
};

SensorConfig sensors[4] = {
  {&Wire,     MPU_ADDR_LOW,  "MPU #1 (Top-Left)",  -0.08,  0.05},
  {&Wire,     MPU_ADDR_HIGH, "MPU #2 (Top-Right)",  0.08,  0.05},
  {&I2C_Bus2, MPU_ADDR_LOW,  "MPU #3 (Bot-Left)",  -0.08, -0.05},
  {&I2C_Bus2, MPU_ADDR_HIGH, "MPU #4 (Bot-Right)",  0.08, -0.05}
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
// MPU6500 I2C FUNCTIONS (USING YOUR WORKING CODE)
// ────────────────────────────────────────────────────────────

/**
 * Write a byte to MPU6500 register
 */
void writeMPU6500(TwoWire* bus, uint8_t addr, uint8_t reg, uint8_t value) {
  bus->beginTransmission(addr);
  bus->write(reg);
  bus->write(value);
  bus->endTransmission();
}

/**
 * Read a byte from MPU6500 register
 */
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

/**
 * Read sensor data from MPU6500 (using your working readMPU function)
 */
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

  // Convert to g's (using ±2g sensitivity per your code)
  ax = rawAx / ACCEL_SENSITIVITY;
  ay = rawAy / ACCEL_SENSITIVITY;
  az = rawAz / ACCEL_SENSITIVITY;

  // Convert to degrees/s
  gx = rawGx / GYRO_SENSITIVITY;
  gy = rawGy / GYRO_SENSITIVITY;
  gz = rawGz / GYRO_SENSITIVITY;
}

/**
 * Initialize a single MPU6500 sensor
 */
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

  // Wake up device (clear sleep bit)
  writeMPU6500(bus, addr, MPU6500_PWR_MGMT_1, 0x00);
  delay(10);

  // Configure accelerometer (±2g range - matching your working code)
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

/**
 * Read sensor and update data structure
 */
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

  // Apply low-pass filter to reduce noise
  sensorData[sensorIndex].filtered =
    (NOISE_FILTER_ALPHA * magnitude) +
    ((1 - NOISE_FILTER_ALPHA) * sensorData[sensorIndex].filtered);

  sensorData[sensorIndex].magnitude = magnitude;
}

// ────────────────────────────────────────────────────────────
// CALCULATION FUNCTIONS
// ────────────────────────────────────────────────────────────

float calculateTotalForce() {
  float totalForce = 0;

  for (int i = 0; i < 4; i++) {
    if (!sensorData[i].active) continue;

    if (sensorData[i].filtered > ACCEL_THRESHOLD) {
      float force = sensorData[i].filtered * FORCE_SCALE * 50; // ~50g per sensor
      totalForce += force;
    }
  }

  return constrain(totalForce, 0, 300);
}

float calculatePositionX() {
  float leftForce = 0;
  float rightForce = 0;

  if (sensorData[0].active) leftForce += sensorData[0].filtered;
  if (sensorData[2].active) leftForce += sensorData[2].filtered;
  if (sensorData[1].active) rightForce += sensorData[1].filtered;
  if (sensorData[3].active) rightForce += sensorData[3].filtered;

  float totalForce = leftForce + rightForce;

  if (totalForce < ACCEL_THRESHOLD) {
    return 0.5;
  }

  float posX = rightForce / totalForce;
  return constrain(posX, 0.0, 1.0);
}

float calculatePositionY() {
  float topForce = 0;
  float bottomForce = 0;

  if (sensorData[0].active) topForce += sensorData[0].filtered;
  if (sensorData[1].active) topForce += sensorData[1].filtered;
  if (sensorData[2].active) bottomForce += sensorData[2].filtered;
  if (sensorData[3].active) bottomForce += sensorData[3].filtered;

  float totalForce = topForce + bottomForce;

  if (totalForce < ACCEL_THRESHOLD) {
    return 0.45;
  }

  float posY = bottomForce / totalForce;
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
  Serial.println("  RescueRight Smart Vest - MVP");
  Serial.println("  4x MPU6500 + ESP32");
  Serial.println("  Dual I2C Bus Configuration");
  Serial.println("════════════════════════════════════════\n");

  // Initialize I2C buses (using your working configuration)
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

  delay(100); // 10Hz update rate
}
