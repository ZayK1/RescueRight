# RescueRight Hardware Prototyping Guide
**From Zero to Working MVP - Arduino Uno R3 Edition**

**Version**: 2.0
**Last Updated**: October 12, 2025
**Status**: Complete Beginner's Guide
**Hardware**: Arduino Uno R3 + Bluetooth Module
**Team**: IDEATE 2025 Team Kiwi (AKSD2103)

---

## 📋 Table of Contents

1. [Introduction - Start Here](#-introduction---start-here)
2. [Understanding Your Hardware Components](#-understanding-your-hardware-components)
3. [How Everything Works Together](#-how-everything-works-together)
4. [Essential Electronics Concepts](#-essential-electronics-concepts)
5. [I²C Communication Deep Dive](#-ic-communication-deep-dive)
6. [Your Sensor Setup Explained](#-your-sensor-setup-explained)
7. [Step-by-Step Hardware Assembly](#-step-by-step-hardware-assembly)
8. [Programming the Arduino](#-programming-the-arduino)
9. [Testing Your Hardware](#-testing-your-hardware)
10. [Integrating with Your App](#-integrating-with-your-app)
11. [Troubleshooting Common Issues](#-troubleshooting-common-issues)
12. [Building Your MVP](#-building-your-mvp)

---

## 🎯 Introduction - Start Here

### What You're Building

You're creating a **smart choking-rescue training vest** that measures:
- **Hand position** during Heimlich maneuver (using gyroscopes)
- **Force applied** during thrusts (using Hall effect sensors)

The vest will send this data **wirelessly** to your mobile app in real-time, providing instant feedback to trainees.

### Your Current Status

✅ **What you have:**
- Working React Native app with Bluetooth integration
- Arduino Uno R3 microcontroller
- 4x MPU9250 gyroscope sensors (for position tracking)
- 4x SEN-CUR-006 Hall effect sensors (for force measurement)
- TCA9548A I²C multiplexer (REQUIRED - not optional!)
- HM-10 Bluetooth LE module (recommended) OR HC-05 (classic Bluetooth)

❓ **What you need to learn:**
- How these components work
- How to wire them together
- How to program the Arduino
- How to test and integrate with your app

### Expected Timeline

- **Hardware Assembly**: 4-5 hours (more complex than ESP32)
- **Software Setup**: 3-4 hours
- **Testing & Debugging**: 4-5 hours
- **App Integration**: 2-3 hours
- **Total**: 3-4 days (with breaks and learning)

---

## 🔧 Understanding Your Hardware Components

### 1. Arduino Uno R3 - Your Brain

```
┌─────────────────────────────────────┐
│         Arduino Uno R3              │
│                                     │
│  ┌──────────────────────────┐      │
│  │    ATmega328P Chip       │      │
│  │  • 14 Digital Pins       │      │
│  │  • 6 Analog Pins         │      │
│  │  • 2KB SRAM              │      │
│  │  • 32KB Flash            │      │
│  │  • 16MHz Clock           │      │
│  └──────────────────────────┘      │
│                                     │
│  USB Port ─────────────────────    │
│  (for power & programming)          │
│                                     │
│  5V  3.3V  GND  ← Power Pins       │
└─────────────────────────────────────┘
```

**What it does:**
- Collects data from all sensors
- Processes the data
- Sends it via Serial to Bluetooth module
- Powers everything

**Key specs:**
- **Logic Voltage**: 5V (important!)
- **Operating Voltage**: 7-12V (via barrel jack) or 5V (via USB)
- **3.3V Output**: Can provide 50mA max for 3.3V sensors
- **Digital Pins**: 0-13 (pins 0-1 used for Serial/Bluetooth)
- **Analog Pins**: A0-A5 (can also be used as digital)
- **I²C Pins**: A4 (SDA), A5 (SCL) - FIXED, cannot change

**Critical limitations:**
- **Only 2KB SRAM** - Must be memory-efficient!
- **Only ONE I²C bus** - Must use multiplexer for multiple sensors with same address
- **Pins 0 & 1** - Reserved for Serial (Bluetooth communication)

**Think of it as:** A reliable, simple workhorse - not as powerful as ESP32, but proven and stable.

---

### 2. HM-10 Bluetooth LE Module - Your Wireless Bridge

```
┌─────────────────────────┐
│      HM-10 BLE          │
│   Bluetooth 4.0 Module  │
│                         │
│  ┌───────────────────┐  │
│  │  TI CC2541 Chip   │  │
│  │  • BLE 4.0        │  │
│  │  • UART Serial    │  │
│  │  • Low Power      │  │
│  └───────────────────┘  │
│                         │
│  VCC  GND  TX  RX       │ ← Pins
│  STATE LED              │ ← Status indicator
└─────────────────────────┘
```

**Why HM-10?**
- ✅ **Bluetooth Low Energy** - matches your app's BLE code
- ✅ Appears as BLE device (like ESP32 did)
- ✅ Low power consumption
- ✅ Simple AT command configuration
- ✅ Works with existing app code (minimal changes)

**Alternative: HC-05 (Bluetooth Classic)**
- ⚠️ Uses Bluetooth Classic (not BLE)
- ⚠️ Would require significant app changes
- ⚠️ Higher power consumption
- ✅ Cheaper (~$5 vs ~$10 for HM-10)
- **Recommendation: Use HM-10 for easier integration**

**Pinout:**
```
HM-10 Pin  →  Arduino Pin
─────────────────────────
VCC (3.3V)  →  3.3V
GND         →  GND
TX          →  Pin 0 (RX)
RX          →  Pin 1 (TX)
```

**Important:** HM-10 operates at **3.3V logic**. Connecting Arduino's 5V TX directly to HM-10 RX can damage it! We'll need a voltage divider.

---

### 3. MPU9250 - Your Position Sensors

```
┌─────────────────────────┐
│      MPU9250            │
│   9-Axis Motion Sensor  │
│                         │
│  ┌───────────────────┐  │
│  │ 3-Axis Gyroscope  │  │ ← Measures rotation
│  │ 3-Axis Accel      │  │ ← Measures tilt
│  │ 3-Axis Magnetom   │  │ ← Measures direction
│  └───────────────────┘  │
│                         │
│  VCC  GND  SCL  SDA     │ ← I²C pins
│  AD0                    │ ← Address select
└─────────────────────────┘
```

**What it does:**
- Measures **orientation** (which way is it tilted?)
- Measures **movement** (is it moving up, down, left, right?)
- Measures **rotation** (is it spinning?)

**For your vest:**
You'll place 4 of these on different parts of the torso to track:
- Where the rescuer's hands are positioned
- The angle of thrust
- Movement during compressions

**Output data:**
- Roll, pitch, yaw angles (in degrees)
- Acceleration values (in m/s²)
- Angular velocity (degrees/second)

**I²C Address:**
- **Default**: 0x68 (AD0 pin LOW or floating)
- **Alternate**: 0x69 (AD0 pin HIGH)
- **Problem**: All 4 sensors have same address!
- **Solution**: Use TCA9548A multiplexer

**Power:** 3.3V (use Arduino's 3.3V pin)

**Think of it as:** A compass and level combined - tells you exactly how something is oriented in 3D space.

---

### 4. SEN-CUR-006 Hall Effect Sensor - Your Force Sensors

```
┌─────────────────────────┐
│   SEN-CUR-006           │
│   Hall Effect Sensor    │
│                         │
│  ┌───────────────────┐  │
│  │  Magnetic Field   │  │
│  │    Detector       │  │
│  └───────────────────┘  │
│                         │
│  Output: 0-5V signal    │ ← Analog voltage
│                         │
│  VCC  GND  OUT          │
└─────────────────────────┘
```

**What it does:**
- Detects **magnetic fields**
- Stronger field = higher voltage output
- Can measure current flowing through a wire (creates magnetic field)

**For your vest:**
You'll use these to measure the **force** of thrusts by:
1. Placing a flexible material between two magnetic layers
2. When pressure is applied, magnets get closer together
3. Hall sensor detects the stronger magnetic field
4. Stronger field = more force applied

**Output data:**
- Analog voltage (0-5V) proportional to magnetic field strength
- Arduino reads as 0-1023 (10-bit ADC)
- Can be calibrated to Newtons of force

**Pinout:**
```
Hall Sensor  →  Arduino Pin
──────────────────────────
VCC (5V)     →  5V
GND          →  GND
OUT          →  A0, A1, A2, A3 (one sensor per pin)
```

**Think of it as:** A bathroom scale, but for measuring thrust force instead of weight.

---

### 5. TCA9548A I²C Multiplexer - Your Traffic Controller

```
┌────────────────────────────────────────┐
│         TCA9548A Multiplexer           │
│         *** NOW REQUIRED! ***          │
│                                        │
│     Main I²C Bus (from Arduino)        │
│     A4 (SDA), A5 (SCL)                 │
│           │                            │
│     ┌─────┴─────┐                      │
│     │  Switch   │                      │
│     │  Control  │                      │
│     └─────┬─────┘                      │
│           │                            │
│    ┌──────┴──────┬──────┬──────┬───── │
│    │      │      │      │      │      │
│  SD0    SD1    SD2    SD3    SD4...   │
│  SC0    SC1    SC2    SC3    SC4      │
│    │      │      │      │      │      │
│  MPU#1  MPU#2  MPU#3  MPU#4  (empty) │
└────────────────────────────────────────┘
```

**What it does:**
- Allows **multiple sensors with the same address** to work together
- Acts like a switchboard - selects which sensor to talk to
- Has 8 channels (SD0-SD7, SC0-SC7)
- **ESSENTIAL** because Arduino Uno has only ONE I²C bus

**Why you MUST use it:**
- Problem: All MPU9250 sensors have address 0x68
- Problem: Arduino Uno cannot create multiple I²C buses (unlike ESP32)
- Solution: TCA9548A allows switching between sensors

**How it works:**
1. Arduino tells multiplexer: "Open channel 2"
2. Multiplexer connects only channel 2 sensor to the I²C bus
3. Arduino reads data from that sensor
4. Arduino tells multiplexer: "Close channel 2, open channel 3"
5. Repeat for all sensors

**I²C Address**: 0x70 (default)

**Pinout:**
```
TCA9548A Pin  →  Arduino Pin
────────────────────────────
VCC (5V)      →  5V
GND           →  GND
SDA           →  A4
SCL           →  A5

SD0/SC0       →  MPU9250 #1 (SDA/SCL)
SD1/SC1       →  MPU9250 #2 (SDA/SCL)
SD2/SC2       →  MPU9250 #3 (SDA/SCL)
SD3/SC3       →  MPU9250 #4 (SDA/SCL)
```

**Think of it as:** A telephone switchboard operator connecting different phone lines one at a time.

---

## 🔄 How Everything Works Together

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PHYSICAL VEST                            │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ MPU9250 │  │ MPU9250 │  │ MPU9250 │  │ MPU9250 │       │
│  │  #1     │  │  #2     │  │  #3     │  │  #4     │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │             │
│       └────────────┴────────────┴────────────┘             │
│                         │                                   │
│                  ┌──────┴──────┐                           │
│                  │  TCA9548A   │                           │
│                  │ Multiplexer │                           │
│                  │  (REQUIRED) │                           │
│                  └──────┬──────┘                           │
│                         │                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Hall   │  │  Hall   │  │  Hall   │  │  Hall   │       │
│  │   #1    │  │   #2    │  │   #3    │  │   #4    │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │             │
│       └────────────┴────────────┴────────────┘             │
│                         │                                   │
│              ┌──────────┴──────────┐                        │
│              │   Arduino Uno R3    │                        │
│              │  • Reads sensors    │                        │
│              │  • Processes data   │                        │
│              │  • Serial TX        │                        │
│              └──────────┬──────────┘                        │
│                         │                                   │
│              ┌──────────┴──────────┐                        │
│              │     HM-10 BLE       │                        │
│              │  • Receives Serial  │                        │
│              │  • Transmits BLE    │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼─────────────────────────────────┘
                          │
                   Bluetooth LE
                          │
┌─────────────────────────┼─────────────────────────────────┐
│                         ▼                                   │
│              ┌────────────────────┐                         │
│              │   YOUR PHONE       │                         │
│              │  RescueRight App   │                         │
│              │                    │                         │
│              │  • Receives data   │                         │
│              │  • Shows feedback  │                         │
│              │  • Analyzes tech   │                         │
│              └────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Trainee performs Heimlich maneuver on vest
                    ↓
2. Sensors detect:
   • Hand position (MPU9250s measure orientation)
   • Force applied (Hall sensors measure pressure)
                    ↓
3. Arduino reads sensors every 100ms:
   • Switches TCA9548A channels to read each MPU
   • Reads analog values from Hall sensors (A0-A3)
                    ↓
4. Arduino processes data:
   • Converts raw values to meaningful units
   • Applies calibration
   • Formats as comma-separated values (CSV)
                    ↓
5. Arduino sends via Serial (9600 baud) to HM-10
   Format: "force,posX,posY,angle\n"
   Example: "95.5,0.52,0.48,2.5\n"
                    ↓
6. HM-10 transmits via Bluetooth LE to phone
                    ↓
7. Your app receives data and displays:
   • Real-time heatmap of hand position
   • Force gauge showing thrust strength
   • AI feedback card with instructions
```

---

## ⚡ Essential Electronics Concepts

Before we start wiring, let's understand some basics.

### 1. Voltage (V) - Electrical Pressure

**Key differences from ESP32:**

```
Arduino Uno R3 operates at TWO voltages:

  5V  ████████████████  ← Logic level (HIGH = 5V)
                         ← Powers most components
                         ← Digital pins output 5V

  3.3V ██████████  ← Some sensors need this
                    ← MPU9250, HM-10 are 3.3V devices!
                    ← Arduino can provide 50mA max at 3.3V

  0V ─  ← Ground (GND)
```

**Critical warnings:**
- **MPU9250**: 3.3V device - connect to 3.3V pin, NOT 5V!
- **HM-10**: 3.3V device - needs voltage divider for RX pin!
- **Hall sensors**: 5V device - connect to 5V pin
- **Mixing voltages can damage components!**

---

### 2. Voltage Divider for HM-10

**Problem:** Arduino TX outputs 5V, but HM-10 RX expects 3.3V max

**Solution:** Voltage divider using 2 resistors

```
Arduino Pin 1 (TX) ─┬─── 1kΩ resistor ───┬─── HM-10 RX
                    │                     │
                                     2kΩ resistor
                                          │
                                         GND

Math: Vout = 5V × (2kΩ / (1kΩ + 2kΩ)) = 5V × 0.67 = 3.3V ✓
```

**Components needed:**
- 1x 1kΩ resistor (brown-black-red)
- 1x 2kΩ resistor (red-black-red)

---

### 3. Power Budget

```
Component Power Requirements:

• Arduino Uno R3:  45mA (idle)
• MPU9250 × 4:     14mA (3.5mA each)
• Hall sensors × 4: 20mA (5mA each)
• HM-10:           8mA (transmitting)
• TCA9548A:        5mA

Total: ~92mA

Available:
• USB power: 500mA ✓ (plenty of headroom)
• 9V battery: Limited, use USB for testing
```

---

## 🔌 I²C Communication Deep Dive

### What is I²C?

I²C (Inter-Integrated Circuit) is how your Arduino talks to sensors.

**On Arduino Uno R3:**
- **Fixed pins**: A4 (SDA), A5 (SCL) - CANNOT change!
- **Only ONE bus** - all I²C devices share these two wires
- **Multiple devices**: Uses unique addresses (0x00-0x7F)

```
Arduino Uno
    │
    ├─ A5 (SCL) ────┬────┬────── All I²C devices
    │               │    │
    ├─ A4 (SDA) ────┼────┼────── All I²C devices
    │               │    │
    └─ GND ─────────┴────┴────── All devices

    TCA9548A     MPU9250 #1   (via multiplexer)
  (Address 0x70) (Address 0x68)
```

### Why Multiplexer is REQUIRED

**Problem:** All MPU9250 sensors have the same I²C address (0x68)

**On ESP32:** Could create multiple I²C buses on different GPIO pairs ✓

**On Arduino Uno:** Only ONE I²C bus (A4/A5) - cannot create more! ✗

**Solution:** TCA9548A multiplexer acts as a "switch"

```
Arduino → TCA9548A (0x70) → Channel 0 → MPU #1 (0x68)
                          → Channel 1 → MPU #2 (0x68)
                          → Channel 2 → MPU #3 (0x68)
                          → Channel 3 → MPU #4 (0x68)
```

### Using the Multiplexer

```cpp
// Select channel 2 to talk to MPU #3
Wire.beginTransmission(0x70);  // TCA9548A address
Wire.write(1 << 2);            // Select channel 2 (bit 2 = 1)
Wire.endTransmission();

// Now Arduino can read from MPU on channel 2
mpu.update();  // Reads from MPU #3

// To disable all channels:
Wire.beginTransmission(0x70);
Wire.write(0);  // All channels off
Wire.endTransmission();
```

---

## 🎛️ Your Sensor Setup Explained

### Pin Allocation

**Arduino Uno R3 has limited pins - must plan carefully!**

```
Digital Pins (0-13):
├─ Pin 0 (RX)     → HM-10 TX (Bluetooth)      [RESERVED]
├─ Pin 1 (TX)     → HM-10 RX (via divider)    [RESERVED]
└─ Pins 2-13      → Available (not used in this project)

Analog Pins (A0-A5):
├─ A0             → Hall Sensor #1
├─ A1             → Hall Sensor #2
├─ A2             → Hall Sensor #3
├─ A3             → Hall Sensor #4
├─ A4 (SDA)       → I²C Data                  [RESERVED]
└─ A5 (SCL)       → I²C Clock                 [RESERVED]

I²C Bus (A4/A5):
├─ TCA9548A Multiplexer (0x70)
│  ├─ Channel 0   → MPU9250 #1
│  ├─ Channel 1   → MPU9250 #2
│  ├─ Channel 2   → MPU9250 #3
│  └─ Channel 3   → MPU9250 #4

Power:
├─ 5V             → Hall sensors, TCA9548A
├─ 3.3V           → MPU9250s, HM-10
└─ GND            → All devices (common ground)
```

### Complete Wiring Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Arduino Uno R3                            │
│                                                              │
│  [USB]                                                       │
│                                                              │
│  5V  ●───────┬────────┬─────────┬──────── Hall sensors VCC  │
│              │        │         │         TCA9548A VCC       │
│              │        │         │                            │
│  3.3V ●──────┼────────┼─────────┼──────── MPU9250 VCC (all) │
│              │        │         │         HM-10 VCC          │
│              │        │         │                            │
│  GND ●───────┴────────┴─────────┴──────── All devices GND   │
│                                                              │
│  Pin 0 (RX) ●─────────────────────────── HM-10 TX           │
│  Pin 1 (TX) ●───[1kΩ]───┬──────────────── HM-10 RX          │
│                          │                                   │
│                        [2kΩ]                                 │
│                          │                                   │
│                         GND                                  │
│                                                              │
│  A0 ●────────────────────────────────── Hall Sensor #1 OUT  │
│  A1 ●────────────────────────────────── Hall Sensor #2 OUT  │
│  A2 ●────────────────────────────────── Hall Sensor #3 OUT  │
│  A3 ●────────────────────────────────── Hall Sensor #4 OUT  │
│                                                              │
│  A4 (SDA) ●──────────────────────────── TCA9548A SDA        │
│  A5 (SCL) ●──────────────────────────── TCA9548A SCL        │
└──────────────────────────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │     TCA9548A (0x70)     │
            │                         │
            │  SD0/SC0 → MPU9250 #1   │
            │  SD1/SC1 → MPU9250 #2   │
            │  SD2/SC2 → MPU9250 #3   │
            │  SD3/SC3 → MPU9250 #4   │
            └─────────────────────────┘
```

---

## 🛠️ Step-by-Step Hardware Assembly

### Tools & Materials Needed

**Tools:**
- Soldering iron (if sensors don't have pins)
- Wire cutters
- Wire strippers
- Multimeter (essential!)
- Small screwdriver
- USB cable (Type B for Arduino Uno)

**Materials:**
- Breadboard (2x large recommended - lots of connections!)
- Jumper wires (male-to-male, lots of them)
- 1x 1kΩ resistor (for voltage divider)
- 1x 2kΩ resistor (for voltage divider)
- Power supply (USB is fine for testing)

**Optional but recommended:**
- Heat shrink tubing
- Electrical tape
- Cable ties
- Multimeter with continuity tester

---

### Assembly Steps

#### Step 1: Test the Arduino

**Before anything else, verify Arduino works:**

```cpp
// File → Examples → 01.Basics → Blink

void setup() {
  pinMode(13, OUTPUT);  // Pin 13 has built-in LED
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
```

1. Open Arduino IDE
2. Select **Tools → Board → Arduino Uno**
3. Select **Tools → Port → [Your Arduino Port]**
4. Upload the code
5. LED on Arduino should blink

**If LED blinks: ✓ Arduino is working!**

---

#### Step 2: Wire the TCA9548A Multiplexer

**Start with the multiplexer - it's the hub of your sensor network:**

```
TCA9548A Pin  →  Arduino Pin
────────────────────────────
VIN (or VCC)  →  5V
GND           →  GND
SDA           →  A4
SCL           →  A5
```

**Testing multiplexer:**

```cpp
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();

  Serial.println("Scanning for I2C devices...");

  for (byte addr = 0; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found device at 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
    }
  }
}

void loop() {}
```

**Expected output:**
```
Scanning for I2C devices...
Found device at 0x70    ← TCA9548A multiplexer
```

**If you see 0x70: ✓ Multiplexer is working!**

---

#### Step 3: Wire ONE MPU9250 (Test First!)

**Connect MPU #1 to TCA9548A Channel 0:**

```
MPU9250 #1    →  TCA9548A Channel 0
─────────────────────────────────
VCC (3.3V!)   →  Via Arduino 3.3V
GND           →  GND
SDA           →  SD0
SCL           →  SC0
```

**⚠️ CRITICAL: MPU9250 is 3.3V! Connect to 3.3V pin, NOT 5V!**

**Testing MPU via multiplexer:**

```cpp
#include <Wire.h>
#include <MPU9250.h>

MPU9250 mpu;

// Function to select TCA9548A channel
void tcaselect(uint8_t channel) {
  if (channel > 7) return;
  Wire.beginTransmission(0x70);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  delay(2000);

  Serial.println("RescueRight - MPU9250 Test via Multiplexer");
  Serial.println("══════════════════════════════════════════");

  // Select channel 0 (MPU #1)
  tcaselect(0);

  // Initialize MPU9250
  if (!mpu.setup(0x68)) {
    Serial.println("❌ MPU #1 connection failed!");
    Serial.println("Check:");
    Serial.println("  • VCC → 3.3V (NOT 5V!)");
    Serial.println("  • GND → GND");
    Serial.println("  • SDA → TCA SD0");
    Serial.println("  • SCL → TCA SC0");
    while (1) delay(1000);
  }

  Serial.println("✓ MPU #1 connected!");
  Serial.println("\nReading data...\n");
}

void loop() {
  tcaselect(0);  // Select channel 0

  if (mpu.update()) {
    Serial.print("Roll: ");
    Serial.print(mpu.getRoll(), 1);
    Serial.print("° | Pitch: ");
    Serial.print(mpu.getPitch(), 1);
    Serial.print("° | Yaw: ");
    Serial.print(mpu.getYaw(), 1);
    Serial.println("°");
  }

  delay(100);
}
```

**Try tilting the sensor - values should change!**

---

#### Step 4: Add Remaining MPU9250 Sensors

**Connect all 4 MPUs to TCA9548A channels:**

```
MPU #1: TCA Channel 0 (SD0/SC0)
MPU #2: TCA Channel 1 (SD1/SC1)
MPU #3: TCA Channel 2 (SD2/SC2)
MPU #4: TCA Channel 3 (SD3/SC3)

All share:
• 3.3V power rail
• GND rail
```

**Test code for all 4 MPUs:**

```cpp
#include <Wire.h>
#include <MPU9250.h>

MPU9250 mpu1, mpu2, mpu3, mpu4;

void tcaselect(uint8_t channel) {
  if (channel > 7) return;
  Wire.beginTransmission(0x70);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  delay(2000);

  Serial.println("Testing All 4 MPU9250 Sensors");
  Serial.println("══════════════════════════════");

  // Initialize all MPUs
  Serial.print("MPU #1 (Ch 0): ");
  tcaselect(0);
  if (mpu1.setup(0x68)) Serial.println("✓");
  else Serial.println("❌");

  Serial.print("MPU #2 (Ch 1): ");
  tcaselect(1);
  if (mpu2.setup(0x68)) Serial.println("✓");
  else Serial.println("❌");

  Serial.print("MPU #3 (Ch 2): ");
  tcaselect(2);
  if (mpu3.setup(0x68)) Serial.println("✓");
  else Serial.println("❌");

  Serial.print("MPU #4 (Ch 3): ");
  tcaselect(3);
  if (mpu4.setup(0x68)) Serial.println("✓");
  else Serial.println("❌");

  Serial.println("\n────────────────────────────────");
}

void loop() {
  // Update all sensors
  tcaselect(0); mpu1.update();
  tcaselect(1); mpu2.update();
  tcaselect(2); mpu3.update();
  tcaselect(3); mpu4.update();

  // Print readings
  Serial.println("┌──────────────────────────────────┐");
  Serial.print("│ MPU #1: ");
  printAngles(mpu1);
  Serial.print("│ MPU #2: ");
  printAngles(mpu2);
  Serial.print("│ MPU #3: ");
  printAngles(mpu3);
  Serial.print("│ MPU #4: ");
  printAngles(mpu4);
  Serial.println("└──────────────────────────────────┘\n");

  delay(500);
}

void printAngles(MPU9250 &mpu) {
  Serial.print("R:");
  Serial.print(mpu.getRoll(), 1);
  Serial.print("° P:");
  Serial.print(mpu.getPitch(), 1);
  Serial.print("° Y:");
  Serial.print(mpu.getYaw(), 1);
  Serial.println("° │");
}
```

---

#### Step 5: Add Hall Sensors

**Connect Hall sensors to analog pins:**

```
Hall Sensor #1:
VCC (5V)  → Arduino 5V
GND       → Arduino GND
OUT       → Arduino A0

Hall Sensor #2:
VCC (5V)  → Arduino 5V
GND       → Arduino GND
OUT       → Arduino A1

Hall Sensor #3:
VCC (5V)  → Arduino 5V
GND       → Arduino GND
OUT       → Arduino A2

Hall Sensor #4:
VCC (5V)  → Arduino 5V
GND       → Arduino GND
OUT       → Arduino A3
```

**Test code:**

```cpp
const int HALL1 = A0;
const int HALL2 = A1;
const int HALL3 = A2;
const int HALL4 = A3;

int baseline1, baseline2, baseline3, baseline4;

void setup() {
  Serial.begin(9600);
  delay(1000);

  Serial.println("Hall Sensor Calibration");
  Serial.println("═══════════════════════");
  Serial.println("Don't touch sensors...");
  delay(2000);

  // Calibrate baselines
  baseline1 = analogRead(HALL1);
  baseline2 = analogRead(HALL2);
  baseline3 = analogRead(HALL3);
  baseline4 = analogRead(HALL4);

  Serial.println("Baselines:");
  Serial.print("  H1: "); Serial.println(baseline1);
  Serial.print("  H2: "); Serial.println(baseline2);
  Serial.print("  H3: "); Serial.println(baseline3);
  Serial.print("  H4: "); Serial.println(baseline4);
  Serial.println("\nReading forces...\n");
}

void loop() {
  int val1 = analogRead(HALL1);
  int val2 = analogRead(HALL2);
  int val3 = analogRead(HALL3);
  int val4 = analogRead(HALL4);

  // Calculate force (simple conversion)
  float force1 = abs(val1 - baseline1) * 0.2;
  float force2 = abs(val2 - baseline2) * 0.2;
  float force3 = abs(val3 - baseline3) * 0.2;
  float force4 = abs(val4 - baseline4) * 0.2;

  Serial.print("Forces: ");
  Serial.print(force1, 1); Serial.print("N | ");
  Serial.print(force2, 1); Serial.print("N | ");
  Serial.print(force3, 1); Serial.print("N | ");
  Serial.print(force4, 1); Serial.println("N");

  delay(200);
}
```

---

#### Step 6: Add HM-10 Bluetooth Module

**⚠️ CRITICAL: HM-10 needs voltage divider!**

**Wiring:**

```
HM-10 Pin   →  Connection
──────────────────────────
VCC (3.3V)  →  Arduino 3.3V
GND         →  Arduino GND
TX          →  Arduino Pin 0 (RX) - direct connection OK
RX          →  Arduino Pin 1 (TX) - via voltage divider:

Voltage Divider:
Arduino Pin 1 ──[1kΩ resistor]──┬── HM-10 RX
                                 │
                            [2kΩ resistor]
                                 │
                                GND
```

**Physical assembly:**

1. Insert resistors into breadboard
2. Connect Pin 1 → 1kΩ → junction
3. Connect junction → 2kΩ → GND
4. Connect junction → HM-10 RX
5. Connect HM-10 TX → Pin 0 (direct)

**Testing Bluetooth:**

```cpp
// Upload this FIRST, then disconnect Arduino from computer
// (Serial pins 0/1 conflict with USB programming)

void setup() {
  // Serial uses pins 0 & 1 - connected to HM-10
  Serial.begin(9600);
  delay(1000);

  Serial.println("AT");  // Test command
  delay(500);
}

void loop() {
  Serial.println("Hello from Arduino!");
  delay(1000);
}
```

**To test:**
1. Upload code
2. Disconnect USB
3. Power Arduino with battery or wall adapter
4. Use phone BLE scanner app
5. Look for "HMSoft" or "BT05" device
6. Connect and monitor data

---

## 💻 Programming the Arduino

### Complete Arduino Code for Your MVP

Here's the full code that reads all sensors and sends data via Bluetooth:

```cpp
// ═══════════════════════════════════════════════════════════
//  RescueRight Smart Vest - Arduino Uno R3 Firmware
//  Version: 2.0 MVP (Arduino Edition)
//  IDEATE 2025 - Team Kiwi
// ═══════════════════════════════════════════════════════════

#include <Wire.h>
#include <MPU9250.h>

// ─────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────

// TCA9548A Multiplexer Address
#define TCA_ADDR 0x70

// Hall Sensor Pins (Analog)
const int HALL1_PIN = A0;
const int HALL2_PIN = A1;
const int HALL3_PIN = A2;
const int HALL4_PIN = A3;

// Calibration values
int hallBaseline1, hallBaseline2, hallBaseline3, hallBaseline4;
float hallToNewtons = 0.2;  // Adjust after calibration

// ─────────────────────────────────────────────────────────
// GLOBAL OBJECTS
// ─────────────────────────────────────────────────────────

// MPU9250 sensors
MPU9250 mpu1, mpu2, mpu3, mpu4;

// ─────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────

// Select TCA9548A multiplexer channel
void tcaselect(uint8_t channel) {
  if (channel > 7) return;
  Wire.beginTransmission(TCA_ADDR);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

// Disable all multiplexer channels
void tcadisable() {
  Wire.beginTransmission(TCA_ADDR);
  Wire.write(0);
  Wire.endTransmission();
}

// ─────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────

void setup() {
  // Initialize Serial (connects to HM-10)
  Serial.begin(9600);

  // Initialize I²C
  Wire.begin();

  delay(2000);  // Wait for stabilization

  // Note: Cannot use Serial.print here if HM-10 is connected
  // Debug by disconnecting HM-10 and connecting USB

  // ─── Initialize MPU9250 Sensors ───

  tcaselect(0);
  mpu1.setup(0x68);

  tcaselect(1);
  mpu2.setup(0x68);

  tcaselect(2);
  mpu3.setup(0x68);

  tcaselect(3);
  mpu4.setup(0x68);

  tcadisable();

  // ─── Calibrate Hall Sensors ───

  delay(1000);

  hallBaseline1 = analogRead(HALL1_PIN);
  hallBaseline2 = analogRead(HALL2_PIN);
  hallBaseline3 = analogRead(HALL3_PIN);
  hallBaseline4 = analogRead(HALL4_PIN);

  // System ready - start sending data
}

// ─────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────

void loop() {
  // ─── Read Sensors ───

  // Update MPU9250 sensors (switch channels)
  tcaselect(0); mpu1.update(); tcadisable();
  tcaselect(1); mpu2.update(); tcadisable();
  tcaselect(2); mpu3.update(); tcadisable();
  tcaselect(3); mpu4.update(); tcadisable();

  // Read Hall sensors (Arduino's 10-bit ADC: 0-1023)
  int hall1 = analogRead(HALL1_PIN);
  int hall2 = analogRead(HALL2_PIN);
  int hall3 = analogRead(HALL3_PIN);
  int hall4 = analogRead(HALL4_PIN);

  // ─── Calculate Force ───

  float force1 = abs(hall1 - hallBaseline1) * hallToNewtons;
  float force2 = abs(hall2 - hallBaseline2) * hallToNewtons;
  float force3 = abs(hall3 - hallBaseline3) * hallToNewtons;
  float force4 = abs(hall4 - hallBaseline4) * hallToNewtons;

  float totalForce = force1 + force2 + force3 + force4;

  // ─── Calculate Hand Position ───

  float avgRoll = (mpu1.getRoll() + mpu2.getRoll() +
                   mpu3.getRoll() + mpu4.getRoll()) / 4.0;
  float avgPitch = (mpu1.getPitch() + mpu2.getPitch() +
                    mpu3.getPitch() + mpu4.getPitch()) / 4.0;

  // Convert to normalized 0-1 position
  float posX = constrain(0.5 + (avgRoll / 90.0) * 0.5, 0.0, 1.0);
  float posY = constrain(0.5 - (avgPitch / 90.0) * 0.5, 0.0, 1.0);

  // ─── Calculate Thrust Angle ───

  float avgYaw = (mpu1.getYaw() + mpu2.getYaw() +
                  mpu3.getYaw() + mpu4.getYaw()) / 4.0;

  // ─── Send via Serial to HM-10 ───

  // Format: force,posX,posY,angle
  Serial.print(totalForce, 2);
  Serial.print(",");
  Serial.print(posX, 3);
  Serial.print(",");
  Serial.print(posY, 3);
  Serial.print(",");
  Serial.println(avgYaw, 2);

  // Update rate: 10Hz
  delay(100);
}
```

### Memory Optimization Tips

**Arduino Uno has only 2KB SRAM - must be careful!**

```cpp
// BAD: Uses too much memory
String data = "Force: " + String(force) + " Position: " + String(posX);

// GOOD: Uses minimal memory
Serial.print(force);
Serial.print(",");
Serial.print(posX);
```

**If you run out of memory:**
- Remove Serial.println debug messages
- Use F() macro for strings: `Serial.println(F("Hello"));`
- Reduce number of global variables
- Use smaller data types (byte instead of int where possible)

---

## 📱 Integrating with Your App

### App Changes Required

Your app needs modifications to work with Arduino's Serial-based Bluetooth.

**Current app uses:** BLE characteristics with UUIDs (ESP32 style)

**Arduino sends:** Simple CSV strings via Serial

### Option 1: Modify HM-10 to Emulate BLE (Recommended)

**HM-10 Configuration:**

```cpp
// Upload this configuration code ONCE to set up HM-10

void setup() {
  Serial.begin(9600);
  delay(1000);

  // Enter AT command mode
  Serial.println("AT");                    // Test
  delay(500);
  Serial.println("AT+NAME=RescueRight");   // Set name
  delay(500);
  Serial.println("AT+UUID=0xFFE0");        // Set service UUID
  delay(500);
  Serial.println("AT+CHAR=0xFFE1");        // Set characteristic UUID
  delay(500);
  Serial.println("AT+RESET");              // Reset to apply
  delay(1000);
}

void loop() {}
```

**Then modify your app's Bluetooth manager:**

```typescript
// In lib/bluetooth.ts

// Add method to handle Serial data
private handleSerialData(data: string) {
  // Parse CSV: "force,posX,posY,angle"
  const values = data.trim().split(',');

  if (values.length === 4) {
    const force = parseFloat(values[0]);
    const posX = parseFloat(values[1]);
    const posY = parseFloat(values[2]);
    const angle = parseFloat(values[3]);

    // Call existing callbacks
    this.forceCallback(force);
    this.positionCallback(posX, posY);
    this.angleCallback(angle);
  }
}

// Modify subscription to listen for Serial data
async subscribeToAllSensors(callback: (data: Partial<SensorData>) => void): Promise<void> {
  // Subscribe to HM-10 Serial characteristic
  this.device.monitorCharacteristicForService(
    '0000FFE0-0000-1000-8000-00805F9B34FB',  // HM-10 service
    '0000FFE1-0000-1000-8000-00805F9B34FB',  // HM-10 characteristic
    (error, characteristic) => {
      if (error || !characteristic?.value) return;

      const decoded = base64Decode(characteristic.value);
      this.handleSerialData(decoded);
    }
  );
}
```

### Option 2: Create Simple Bridge Code (Easier)

**Add to Arduino code:**

```cpp
// In loop(), replace Serial output with BLE-compatible format

// Create packet similar to ESP32 BLE
void sendBLEPacket(float force, float x, float y, float angle) {
  // Send as binary data (more efficient)
  byte packet[16];

  memcpy(packet, &force, 4);
  memcpy(packet + 4, &x, 4);
  memcpy(packet + 8, &y, 4);
  memcpy(packet + 12, &angle, 4);

  Serial.write(packet, 16);
}

// In loop():
sendBLEPacket(totalForce, posX, posY, avgYaw);
```

**This makes data format identical to ESP32, minimal app changes!**

---

## 🧪 Testing Your Hardware

### Test Plan

```
Test 1: Arduino Basics
    ↓
Test 2: Multiplexer Communication
    ↓
Test 3: Individual MPU Sensors
    ↓
Test 4: Hall Sensors
    ↓
Test 5: Bluetooth Connection
    ↓
Test 6: App Integration
```

### Test 4: Bluetooth Connection

**Using BLE Scanner App:**

1. Upload Arduino code
2. Disconnect USB (pins 0/1 conflict!)
3. Power Arduino with 9V battery or wall adapter
4. Open BLE scanner on phone
5. Look for "RescueRight" or "HMSoft"
6. Connect
7. Find service UUID 0xFFE0
8. Enable notifications on characteristic 0xFFE1
9. Watch data stream!

**Expected data format:**
```
95.5,0.52,0.48,2.5
91.3,0.50,0.47,1.8
...
```

---

## 🔧 Troubleshooting

### Issue: "Not enough memory"

**Symptoms:**
- Arduino IDE error: "Low memory available"
- Program crashes randomly
- Strange behavior

**Solutions:**

1. **Remove debug Serial.print():**
```cpp
// Remove these from production code:
// Serial.println("Debug message");
```

2. **Use F() macro:**
```cpp
// BAD:
Serial.println("This string uses SRAM");

// GOOD:
Serial.println(F("This string stays in Flash"));
```

3. **Check memory usage:**
```
Sketch uses 25000 bytes (76%) of program storage space.
Global variables use 1850 bytes (90%) of dynamic memory. ⚠️ TOO HIGH!
```

Keep dynamic memory below 75% (1536 bytes)

### Issue: HM-10 Not Responding

**Symptoms:**
- Can't find "RescueRight" in BLE scan
- No data received

**Solutions:**

1. **Check wiring:**
```
HM-10 VCC → Arduino 3.3V (NOT 5V!)
HM-10 GND → Arduino GND
HM-10 TX → Arduino Pin 0
HM-10 RX → Via voltage divider to Pin 1
```

2. **Test AT commands:**
```cpp
// Disconnect Arduino from USB
// Use separate USB-Serial adapter to test HM-10
// Send: AT
// Expect: OK
```

3. **Check baud rate:**
```cpp
// HM-10 default: 9600
Serial.begin(9600);  // Must match!
```

---

## 🏗️ Building Your MVP

### Recommended MVP Configuration

**For competition demo:**

Use **2 MPUs + 2 Hall sensors** (simpler, faster to debug):

```
Arduino Uno R3
├─ I²C Bus (A4/A5)
│  └─ TCA9548A Multiplexer
│     ├─ Channel 0: MPU9250 #1 (upper chest)
│     └─ Channel 1: MPU9250 #2 (lower chest)
│
├─ Analog Pins
│  ├─ A0: Hall Sensor #1 (center)
│  └─ A1: Hall Sensor #2 (lower)
│
└─ Serial (Pins 0/1)
   └─ HM-10 Bluetooth Module
```

**Benefits:**
- ✓ Simpler wiring
- ✓ Less memory usage
- ✓ Faster debugging
- ✓ Still demonstrates concept
- ✓ Keep extra sensors as backup

### Power Solution

**For demo:**

```
Option 1: USB Power Bank (Recommended)
• 10,000mAh = 100+ hours runtime
• Power via Arduino's barrel jack (9V)
• Or via USB port (5V)

Option 2: 9V Battery
• Simple, portable
• ~2-3 hours runtime
• Use for short demos
```

---

## 📊 Key Differences: Arduino vs ESP32

| Feature | ESP32 DevKit V1 | Arduino Uno R3 |
|---------|----------------|----------------|
| **Bluetooth** | Built-in BLE | External module required |
| **I²C Buses** | Multiple (any GPIO pair) | ONE (A4/A5 fixed) |
| **GPIO Pins** | 38 flexible | 14 digital + 6 analog |
| **Voltage** | 3.3V logic | 5V logic |
| **Memory** | 520KB SRAM | 2KB SRAM ⚠️ |
| **ADC Resolution** | 12-bit (0-4095) | 10-bit (0-1023) |
| **Programming** | ESP32 core | Standard Arduino |
| **Multiplexer** | Optional | **REQUIRED** |
| **Cost** | ~$10-12 | ~$20-25 (+ BT module) |
| **Complexity** | Lower (integrated) | Higher (more wiring) |

---

## ✅ Final Checklist

### Before Competition

**Hardware:**
- [ ] All sensors working with multiplexer
- [ ] Bluetooth connection stable
- [ ] Voltage divider for HM-10 in place
- [ ] All using correct voltages (3.3V vs 5V)
- [ ] Memory usage < 75%
- [ ] Backup Arduino ready

**Software:**
- [ ] Arduino code uploaded and tested
- [ ] HM-10 configured
- [ ] App modified for Serial Bluetooth
- [ ] Calibration completed
- [ ] Feedback thresholds tuned

**Power:**
- [ ] Power bank fully charged
- [ ] 9V battery backup
- [ ] Tested 30+ minute runtime

---

## 🎉 Conclusion

You now have a complete guide for building RescueRight with **Arduino Uno R3**!

**Key Takeaways:**

1. **Use TCA9548A multiplexer** - REQUIRED for multiple MPUs
2. **Watch voltages** - 3.3V for MPUs/HM-10, 5V for Hall sensors
3. **Voltage divider for HM-10 RX** - Prevents damage from 5V Arduino
4. **Memory constraints** - Keep code lean, use F() macro
5. **Pins 0/1 reserved** - Serial communication with Bluetooth

**Your MVP will work great!** The Arduino Uno is proven, reliable hardware. While it requires more manual work than ESP32, it's stable and well-documented.

Good luck at IDEATE 2025! 🚀

---

**Document Version**: 2.0 (Arduino Uno R3 Edition)
**Last Updated**: October 12, 2025
**Hardware**: Arduino Uno R3 + HM-10 BLE Module
**Team**: IDEATE 2025 Team Kiwi (AKSD2103)

---

## 📝 Quick Reference

### Pin Summary
```
Arduino Pin    →  Function
────────────────────────────
0 (RX)         →  HM-10 TX
1 (TX)         →  HM-10 RX (via voltage divider)
A0             →  Hall Sensor #1
A1             →  Hall Sensor #2
A2             →  Hall Sensor #3
A3             →  Hall Sensor #4
A4 (SDA)       →  TCA9548A SDA
A5 (SCL)       →  TCA9548A SCL
5V             →  Hall sensors, TCA9548A
3.3V           →  MPU9250s, HM-10
GND            →  All devices
```

### Voltage Divider
```
Pin 1 ──[1kΩ]──┬── HM-10 RX
               │
             [2kΩ]
               │
              GND

Output: 3.3V (safe for HM-10)
```

### I²C Addresses
```
TCA9548A: 0x70
MPU9250:  0x68 (all sensors, via multiplexer)
```

### Data Format (Serial)
```
CSV: force,posX,posY,angle\n
Example: 95.5,0.52,0.48,2.5\n
```

