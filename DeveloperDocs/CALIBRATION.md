# RescueRight - Sensor Calibration

## Overview

This document covers the calibration procedures for RescueRight's ESP32-based sensor system. Proper calibration ensures accurate force, position, and angle measurements during Heimlich maneuver training.

---

## Calibration Philosophy

**Sensor calibration converts raw hardware readings into meaningful physical units**:

- **Hall Sensors** (if used): ADC values (0-4095) → Force (Newtons)
- **MPU6500 IMUs**: Raw accelerometer/gyro → Position (normalized 0-1) and Angle (degrees)
- **Compression Depth**: Force → Estimated depth (cm)

---

## Quick Calibration (5 Minutes)

### 1. Baseline Calibration (Automatic)

**Procedure**:
1. Place vest flat on table
2. Ensure no pressure on sensors
3. Press EN button on ESP32 (restart)
4. Wait 3 seconds

**Expected Serial Monitor Output**:
```
Sensor 1 baseline: 9.81 m/s²
Sensor 2 baseline: 9.82 m/s²
Sensor 3 baseline: 9.80 m/s²
Sensor 4 baseline: 9.81 m/s²
✓ Calibration complete
```

Baselines should be near 9.81 m/s² (gravity). If significantly different, check sensor orientation.

### 2. Force Scale Adjustment

**Open**: `RescueRightApp/firmware/mvp2.ino`

**Find Line 65**:
```cpp
#define FORCE_SCALE 0.8
```

**Test and Adjust**:
1. Apply medium pressure to vest center
2. Check Serial Monitor force reading
3. **Target**: Medium press = 30-50N
4. If too low: increase to `1.0` or `1.5`
5. If too high: decrease to `0.5` or `0.3`
6. Re-upload firmware and test again

### 3. Detection Threshold Adjustment

**Find Line 66**:
```cpp
#define ACCEL_THRESHOLD 1.5
```

**Adjust If**:
- Thrusts not detecting: Lower to `1.0` (more sensitive)
- False triggers: Raise to `2.0` (less sensitive)

### 4. Position Verification

**Test Each Corner**:
```
Press Top-Left     → Pos: (0.2-0.4, 0.2-0.4)
Press Top-Right    → Pos: (0.6-0.8, 0.2-0.4)
Press Bottom-Left  → Pos: (0.2-0.4, 0.6-0.8)
Press Bottom-Right → Pos: (0.6-0.8, 0.6-0.8)
Press Center       → Pos: (0.45-0.55, 0.40-0.50)
```

If position doesn't respond, verify all 4 sensors initialized at startup.

---

## Advanced Calibration (CSV-Based)

For production-level accuracy, use CSV calibration data.

### Data Collection Requirements

**Collect 100+ samples** covering:
- Force range: 0-150N (use scale or known weights)
- Position coverage: Full vest area
- Angle range: -30° to +30°
- Include zero-force baseline samples (10-20)

### CSV Format

```csv
timestamp,compressionDepth,appliedForce,sensorPositionX,sensorPositionY,angle,mpu1_accel_x,mpu1_accel_y,mpu1_accel_z,mpu2_accel_x,mpu2_accel_y,mpu2_accel_z,mpu3_accel_x,mpu3_accel_y,mpu3_accel_z,mpu4_accel_x,mpu4_accel_y,mpu4_accel_z
1697234567000,0,0,13.5,6.5,0,0,0,16384,0,0,16384,0,0,16384,0,0,16384
1697234567100,2,50,13.5,6.5,-5,-1000,500,15000,-900,480,14800,-1050,510,15100,-950,490,14900
```

**Critical Columns**:
- `timestamp`: Unix milliseconds
- `compressionDepth`: Ground truth compression (cm), measured with ruler
- `appliedForce`: Ground truth force (N), measured with scale
- `sensorPositionX/Y`: Hand position (cm from top-left corner)
- `angle`: Body angle (degrees), measured with protractor/level
- `mpuN_accel_x/y/z`: Raw accelerometer readings from each sensor

### Calibration Analysis Scripts

**Location**: `RescueRightApp/scripts/`

**1. Visualize Data** (Python):
```bash
pip install pandas matplotlib numpy scipy
python scripts/visualize_calibration.py calibration_data.csv
```

**Output**: `calibration_plots/` directory with 6 PNG files:
- `force_distribution.png`: Sensor balance analysis
- `depth_force_relationship.png`: Force vs depth correlation
- `position_heatmap.png`: Spatial coverage
- `angle_calibration.png`: Angle accuracy
- `time_series.png`: Raw sensor readings over time
- `analysis_report.txt`: Statistical summary

**2. Calculate Calibration Constants** (TypeScript):
```bash
npx ts-node scripts/analyze_calibration.ts calibration_data.csv
```

**Output**: `calibration_output.ts` with updated constants:
```typescript
export const CALIBRATION_CONSTANTS = {
  mpuCalibration: {
    accelScale: 16384,  // ±2g range (standard)
    gyroScale: 131,     // ±250°/s range (standard)
    positionMapping: {
      sensorPositions: [
        { x: 0, y: 0 },      // MPU1 (cm from top-left)
        { x: 27, y: 0 },     // MPU2
        { x: 0, y: 13 },     // MPU3
        { x: 27, y: 13 },    // MPU4
      ],
      referenceCenter: { x: 13.5, y: 6.5 }
    }
  },
  depthCalibration: {
    forceToDepthRatio: 0.048,  // cm per Newton (from regression)
    minimumDepth: 0,
    maximumDepth: 6
  }
};
```

### Apply Calibration to App

**File**: `RescueRightApp/lib/calibration.ts`

Replace `DEFAULT_CALIBRATION` object with values from `calibration_output.ts`.

### Validation

**Test with Sensor Debug Screen**:
1. Run app: `npm start`
2. Navigate to `/sensor-debug`
3. Connect to vest
4. Perform test compressions
5. Verify:
   - Force accuracy: ±5N of applied force
   - Position accuracy: ±2cm of hand location
   - Angle accuracy: ±5° of measured angle

**Acceptance Criteria**:
| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Force Accuracy | ±5N | Compare to scale reading |
| Position Accuracy | ±2cm | Mark positions on vest, verify heatmap |
| Angle Accuracy | ±5° | Use level/protractor |
| Force R² | >0.95 | Check analysis script output |
| Data Quality | >95% | Check validation report |

---

## Calibration Constants Reference

### Firmware (ESP32)

**File**: `RescueRightApp/firmware/mvp2.ino`

```cpp
// Force Calibration
#define FORCE_SCALE 0.8           // Multiplier for force calculation
#define ACCEL_THRESHOLD 1.5       // Minimum detection (m/s²)
#define NOISE_FILTER_ALPHA 0.4    // Low-pass filter (0-1)

// Physical Layout
#define FOAM_WIDTH_CM  27.0       // Vest width
#define FOAM_HEIGHT_CM 13.0       // Vest height

// Position Tuning
#define CENTER_BIAS 0.6           // Pull toward center (0-1)

// Constants
#define GRAVITY 9.81              // m/s²
```

### App (Mobile)

**File**: `RescueRightApp/lib/calibration.ts`

```typescript
export const DEFAULT_CALIBRATION: CalibrationConstants = {
  mpuCalibration: {
    accelScale: 16384,            // LSB/g for ±2g range
    gyroScale: 131,               // LSB/(°/s) for ±250°/s
    rotationMatrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ],                            // Identity (no rotation)
    positionMapping: {
      sensorPositions: [
        { x: 0, y: 0 },           // MPU1 (top-left)
        { x: 27, y: 0 },          // MPU2 (top-right)
        { x: 0, y: 13 },          // MPU3 (bottom-left)
        { x: 27, y: 13 },         // MPU4 (bottom-right)
      ],
      referenceCenter: { x: 13.5, y: 6.5 }
    }
  },
  depthCalibration: {
    forceToDepthRatio: 0.05,      // 5cm per 100N (estimate)
    minimumDepth: 0,
    maximumDepth: 6
  }
};
```

---

## Troubleshooting Calibration Issues

### Force Always Zero

**Cause**: Threshold too high or scale too low

**Fix**:
1. Lower `ACCEL_THRESHOLD` to `1.0` or `0.5`
2. Increase `FORCE_SCALE` to `1.0` or higher
3. Verify sensors initialized (Serial Monitor startup)
4. Check foam thickness (2-3cm optimal)

### Force Too High/Low

**Cause**: Incorrect force scale

**Fix**:
1. Use known weight (e.g., 5kg = ~50N)
2. Apply weight to vest center
3. Read force from Serial Monitor
4. Calculate: `new_scale = old_scale × (expected_force / measured_force)`
5. Update `FORCE_SCALE`
6. Re-upload and test

### Position Stuck at Center

**Cause**: All sensors reading same value or center bias too high

**Fix**:
1. Verify all 4 sensors initialized (check Serial Monitor)
2. Lower `CENTER_BIAS` to `0.3` or `0.0` temporarily
3. Press harder (test sensitivity)
4. Check sensor wiring

### Position Inverted/Mirrored

**Cause**: Sensor layout doesn't match physical installation

**Fix**:
1. Swap sensor positions in firmware:
   ```cpp
   // Adjust physical positions in sensor config
   SensorConfig sensors[4] = {
     {&Wire, MPU_ADDR_LOW, "MPU #1", 0.0, 0.0},    // Was top-left
     {&Wire, MPU_ADDR_HIGH, "MPU #2", 27.0, 0.0},  // Was top-right
     // ...swap as needed
   };
   ```
2. Or apply transformation matrix in app calibration

### Angle Drifts Over Time

**Cause**: Gyroscope integration error

**Fix**:
1. Use accelerometer-based pitch (already implemented):
   ```cpp
   float angle = atan2(avgY, avgZ) * 180.0 / PI;
   ```
2. Don't integrate gyroscope (causes drift)
3. Recalibrate baseline if vest orientation changed

---

## Calibration Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│ 1. BASELINE CALIBRATION (Automatic on Startup)         │
│    • Place vest flat                                    │
│    • Restart ESP32                                      │
│    • Wait 3 seconds                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. QUICK ADJUSTMENTS (Firmware Constants)              │
│    • Test with manual presses                           │
│    • Adjust FORCE_SCALE (0.5 - 1.5)                    │
│    • Adjust ACCEL_THRESHOLD (1.0 - 2.0)                │
│    • Verify position corners                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CSV CALIBRATION (Advanced, Optional)                │
│    • Collect 100+ samples with ground truth             │
│    • Run visualization script                           │
│    • Run analysis script                                │
│    • Update lib/calibration.ts                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. VALIDATION                                           │
│    • Test with sensor-debug screen                      │
│    • Verify accuracy: ±5N, ±2cm, ±5°                   │
│    • Check data quality: >95%                           │
│    • Iterate if needed                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Best Practices

1. **Recalibrate regularly**:
   - After sensor reinstallation
   - After foam replacement
   - If accuracy degrades
   - Temperature changes (±10°C)

2. **Document calibration**:
   - Save CSV files with timestamps
   - Note physical changes to hardware
   - Track force scale adjustments

3. **Verify with ground truth**:
   - Use calibrated scale for force
   - Use ruler for position
   - Use level/protractor for angle

4. **Start simple**:
   - Begin with quick calibration
   - Only use CSV method if higher accuracy needed
   - Quick calibration sufficient for most use cases

---

## Calibration Data Quality Metrics

### Good Quality Indicators

- **Linear R²**: >0.95 (force vs depth, sensor vs ground truth)
- **Sensor Balance**: Standard deviation <10% of mean
- **Coverage**: All positions, angles, forces represented
- **Outliers**: <5% of samples
- **Noise Level**: Gyro standard deviation <0.5°/s at rest

### Poor Quality Indicators

- **Linear R²**: <0.85
- **Sensor Balance**: Standard deviation >20% of mean
- **Missing Coverage**: Gaps in position/force/angle ranges
- **Outliers**: >10% of samples
- **High Noise**: Gyro standard deviation >2°/s at rest

**If poor quality**: Recollect data or check hardware.

---

## Target Ranges Post-Calibration

| Measurement | Optimal Range | Acceptable Range |
|-------------|---------------|------------------|
| Force (Training) | 20-60N | 10-100N |
| Force (Max Safe) | - | <150N |
| Position X | 0.45-0.55 | 0.2-0.8 |
| Position Y | 0.40-0.50 | 0.2-0.8 |
| Angle | -45° to -35° | -60° to -20° |
| Compression Depth | 2-4cm | 1-6cm |
| Update Rate | 20Hz | 10-20Hz |

---

## Advanced Topics

### Temperature Compensation

For environments with significant temperature variation:

1. Collect calibration data at multiple temperatures (15°C, 25°C, 35°C)
2. Model temperature-dependent coefficients
3. Add temperature sensor to ESP32
4. Apply real-time compensation

**Implementation**: Read internal ESP32 temperature:
```cpp
float temp = temperatureRead();  // °C
float tempFactor = 1.0 + (temp - 25.0) * 0.001;  // 0.1% per °C
float adjustedForce = rawForce * tempFactor;
```

### Multi-Point Calibration

For non-linear sensor response:

1. Collect data at 5-10 known force levels
2. Fit polynomial curve (degree 2-3)
3. Use look-up table with interpolation

**Example**:
```cpp
float calibrateForce(float raw) {
  // Polynomial: F = a + bx + cx²
  float a = 0.5, b = 0.8, c = 0.001;
  return a + (b * raw) + (c * raw * raw);
}
```

### Sensor Fusion (Complementary Filter)

Combine accelerometer (long-term stable) with gyroscope (short-term accurate):

```cpp
float complementaryFilter(float accelAngle, float gyroAngle, float dt) {
  float alpha = 0.98;  // Trust gyro 98%, accel 2%
  return alpha * (prevAngle + gyroAngle * dt) + (1 - alpha) * accelAngle;
}
```

Current implementation uses accelerometer-only (no drift).

---

## Additional Resources

- **MPU6500 Calibration Guide**: https://github.com/ElectronicCats/mpu6050/wiki/Calibration
- **Linear Regression**: https://en.wikipedia.org/wiki/Simple_linear_regression
- **Complementary Filter**: https://www.pieter-jan.com/node/11

---

For hardware details, see `DeveloperDocs/HARDWARE.md`.
For app integration, see `DeveloperDocs/ARCHITECTURE.md`.
