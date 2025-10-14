# RescueRight MVP - Action Checklist

**Use this checklist to track your progress through integration.**

---

## Phase 1: Hardware Assembly (2-3 hours)

### Wiring
- [ ] ESP32 DevKit V1 identified and tested (LED lights up when plugged in)
- [ ] All 4 MPU6500 sensors identified
- [ ] I2C multiplexer (TCA9548A) obtained OR planned to use separate buses
- [ ] Breadboard or PCB ready for prototyping

### Connections
- [ ] MPU #1 wired: VCC, GND, SDA, SCL
- [ ] MPU #2 wired: VCC, GND, SDA, SCL
- [ ] MPU #3 wired: VCC, GND, SDA, SCL
- [ ] MPU #4 wired: VCC, GND, SDA, SCL
- [ ] All grounds connected together
- [ ] Power connections secure

### Physical Mounting
- [ ] Foam pads cut (4 pieces, ~5cm x 5cm, 2-3cm thick)
- [ ] Sensors mounted on TOP of foam
- [ ] Sensor positions marked:
  - [ ] Top-Left (8cm left, 5cm above center)
  - [ ] Top-Right (8cm right, 5cm above center)
  - [ ] Bottom-Left (8cm left, 5cm below center)
  - [ ] Bottom-Right (8cm right, 5cm below center)
- [ ] ESP32 mounted accessibly on vest
- [ ] Wires secured with cable ties (no loose connections)

---

## Phase 2: Firmware Setup (1-2 hours)

### Arduino IDE Setup
- [ ] Arduino IDE 2.0+ installed
- [ ] ESP32 board support installed
- [ ] MPU6050 library installed (works with MPU6500)
- [ ] ESP32 shows up in Port selection

### Code Upload
- [ ] Copied firmware code from FINAL_INTEGRATION_GUIDE.md
- [ ] Pasted into new Arduino sketch
- [ ] Saved as "RescueRight_MVP.ino"
- [ ] Board selected: ESP32 Dev Module
- [ ] Port selected: (your ESP32 port)
- [ ] Upload successful (no errors)

### Initial Test
- [ ] Serial Monitor opened (115200 baud)
- [ ] Sees "System ready! Waiting for connection..."
- [ ] All 4 sensors show "✓" (initialized)
- [ ] Calibration completed successfully
- [ ] Bluetooth advertising started

---

## Phase 3: Hardware Testing (2-3 hours)

### Test 1: Individual Sensors
- [ ] Sensor #1 responds when pressed (value increases)
- [ ] Sensor #2 responds when pressed
- [ ] Sensor #3 responds when pressed
- [ ] Sensor #4 responds when pressed
- [ ] All sensors return to ~0 when released
- [ ] No cross-talk (pressing one doesn't affect others)

### Test 2: Force Readings
- [ ] Light press: 20-40N shown
- [ ] Medium press: 60-100N shown
- [ ] Strong press: 100-200N shown
- [ ] Force returns to 0 when released
- [ ] Values stable (not jumping wildly)

### Test 3: Position Tracking
- [ ] Press left side → X position goes to 0.2-0.4
- [ ] Press right side → X position goes to 0.6-0.8
- [ ] Press top → Y position goes to 0.2-0.4
- [ ] Press bottom → Y position goes to 0.6-0.8
- [ ] Press center → Position reads (0.45-0.55, 0.40-0.50)

### Test 4: Bluetooth Discovery
- [ ] BLE scanner app installed on phone (LightBlue or nRF Connect)
- [ ] "RescueRight Vest #001" appears in scan
- [ ] Successfully connects to device
- [ ] Service UUID visible: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
- [ ] 3 characteristics visible (Force, Position, Angle)
- [ ] Notifications enabled on all characteristics
- [ ] Values update when vest is pressed

---

## Phase 4: App Integration (1-2 hours)

### Code Changes
- [ ] Opened RescueRightApp/app/training.tsx
- [ ] Found line: `const data = useBluetoothTrainingData(true);`
- [ ] Changed to: `const data = useBluetoothTrainingData(false);`
- [ ] Saved file

### App Testing
- [ ] App rebuilt and installed on phone
- [ ] ESP32 powered on and advertising
- [ ] Opened app → Connect screen
- [ ] "RescueRight Vest #001" appears in device list
- [ ] Tapped device to connect
- [ ] Connection successful
- [ ] Auto-navigated to Training screen

### Real-Time Data Verification
- [ ] Press vest → Force gauge moves
- [ ] Release → Force gauge returns to zero
- [ ] Press left → Heatmap dot moves left
- [ ] Press right → Heatmap dot moves right
- [ ] Press top → Heatmap dot moves up
- [ ] Press bottom → Heatmap dot moves down
- [ ] Press at angle → Angle indicator updates

### Feedback Testing
- [ ] Light press (<60N) → Shows "Increase pressure"
- [ ] Perfect press (80-120N, center) → Shows "✓ Perfect technique!"
- [ ] Too hard (>150N) → Shows "⚠️ Reduce pressure - risk of injury!"
- [ ] Wrong position → Shows direction to move hands
- [ ] Wrong angle → Shows "Adjust angle - lean back/forward"

---

## Phase 5: Calibration (1-2 hours)

### Force Calibration
- [ ] Known weights obtained (5kg, 10kg, 15kg) OR bathroom scale ready
- [ ] Recorded actual force vs displayed force
- [ ] Calculated calibration factor
- [ ] Updated FORCE_SCALE in firmware
- [ ] Re-uploaded firmware
- [ ] Verified accuracy: ±10N

### Position Calibration
- [ ] Marked target zones on vest (center, 5cm in each direction)
- [ ] Pressed at each marked position
- [ ] Recorded position readings
- [ ] Verified coverage: 0-1 range in both axes
- [ ] Adjusted sensor placement if needed

### Angle Calibration
- [ ] Hung vest vertically
- [ ] Restarted ESP32 (pressed EN button)
- [ ] Verified angle reads 0° when vertical
- [ ] Tilted forward → Shows positive angle
- [ ] Tilted back → Shows negative angle

---

## Phase 6: Final Validation (30 minutes)

### System Integration
- [ ] Complete training session (3-5 minutes) with no disconnections
- [ ] App remains responsive throughout session
- [ ] Feedback messages accurate and timely
- [ ] Force gauge updates smoothly (<200ms latency)
- [ ] Position tracking accurate (±2cm)

### Demo Scenarios
- [ ] **Perfect technique**: Center position, 80-120N → Green feedback
- [ ] **Too light**: <60N → Orange feedback with instructions
- [ ] **Too hard**: >150N → Red warning
- [ ] **Wrong position**: Off-center → Shows correction distance
- [ ] **Wrong angle**: Tilted thrust → Shows angle correction

### Reliability
- [ ] Battery life: 30+ minutes continuous use
- [ ] No loose connections (shake test)
- [ ] Foam resilient (bounces back after compression)
- [ ] Sensors secure (don't shift during use)
- [ ] Bluetooth range: 5+ meters

---

## Phase 7: Documentation & Presentation Prep

### User Guide
- [ ] Simple setup instructions written
- [ ] Troubleshooting tips documented
- [ ] Demo script prepared

### Presentation Materials
- [ ] System architecture diagram
- [ ] Live demo rehearsed
- [ ] Backup plan if hardware fails (mock data mode)
- [ ] Key metrics ready:
  - [ ] Force range: 0-200N
  - [ ] Update rate: 10Hz
  - [ ] Accuracy: ±10N, ±2cm, ±5°
  - [ ] Latency: <200ms

### Competition Requirements
- [ ] MVP demonstrates all core features
- [ ] Working prototype ready for semifinals
- [ ] Poster includes system overview
- [ ] Pitch emphasizes real-time feedback and precision

---

## Issues Log

**Use this section to track problems and solutions:**

### Issue 1:
- **Problem**:
- **Solution**:
- **Status**: ☐ Open / ☐ Resolved

### Issue 2:
- **Problem**:
- **Solution**:
- **Status**: ☐ Open / ☐ Resolved

### Issue 3:
- **Problem**:
- **Solution**:
- **Status**: ☐ Open / ☐ Resolved

---

## Quick Reference

**Wiring:**
```
ESP32        MPU6500 (all 4)
GPIO 21  →   SDA
GPIO 22  →   SCL
3.3V     →   VCC
GND      →   GND
```

**Serial Monitor Commands:**
- Open: Tools → Serial Monitor
- Baud: 115200
- Expected output: "System ready! Waiting for connection..."

**UUIDs (must match in app):**
```
Service:  4fafc201-1fb5-459e-8fcc-c5c9c331914b
Force:    beb5483e-36e1-4688-b7f5-ea07361b26a8
Position: beb5483e-36e1-4688-b7f5-ea07361b26a9
Angle:    beb5483e-36e1-4688-b7f5-ea07361b26aa
```

**Calibration Values:**
- FORCE_SCALE: _____ (adjust after testing)
- ACCEL_THRESHOLD: 2.0 (default)
- NOISE_FILTER_ALPHA: 0.3 (default)

**Target Ranges:**
- Force: 80-120N (optimal)
- Position: (0.45-0.55, 0.40-0.50) (center)
- Angle: -15° to +15° (acceptable)

---

## Success Criteria

**MVP is complete when:**
- ✅ All 4 sensors working reliably
- ✅ App connects and displays real-time data
- ✅ Force accuracy within ±10N
- ✅ Position accuracy within ±2cm
- ✅ Feedback messages accurate and helpful
- ✅ System stable for 5+ minute sessions
- ✅ Demo ready for semifinals presentation

---

**Last Updated**: October 14, 2025
**Completion Target**: Before October 15, 2025 semifinals
