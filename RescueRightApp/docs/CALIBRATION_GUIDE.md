# RescueRight Sensor Calibration Guide

**Version:** 1.0.0
**Last Updated:** October 13, 2025
**Target Audience:** Software developers handling data processing and calibration

---

## Table of Contents

1. [Overview](#overview)
2. [Understanding the Calibration Problem](#understanding-the-calibration-problem)
3. [CSV Data Format](#csv-data-format)
4. [Calibration Process Workflow](#calibration-process-workflow)
5. [Step-by-Step Calibration Instructions](#step-by-step-calibration-instructions)
6. [Validation Procedures](#validation-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Topics](#advanced-topics)

---

## Overview

### What is Calibration?

Calibration is the process of converting **raw sensor readings** (e.g., ADC values, raw accelerometer counts) into **meaningful physical units** (e.g., Newtons of force, centimeters of position, degrees of angle).

### Why is Calibration Necessary?

- **Hall Sensors**: Output raw ADC values (0-4095) that must be converted to force in Newtons
- **MPU9250 Sensors**: Output raw accelerometer/gyroscope values that must be converted to position (x, y) and angle
- **Environmental Factors**: Each sensor has slight manufacturing variations, temperature drift, and installation differences
- **Medical Accuracy**: CPR feedback must be precise to ensure proper training and safety

### Calibration Goals

1. **Force Calibration**: Convert Hall sensor ADC → Newtons (N)
2. **Position Calibration**: Convert MPU accelerometer data → Normalized position (0-1 range)
3. **Angle Calibration**: Convert MPU gyroscope data → Angle in degrees (-180° to 180°)
4. **Depth Calibration**: Relate force to compression depth in centimeters

---

## Understanding the Calibration Problem

### Hall Sensor Calibration (Force)

**Problem**: Hall sensors measure magnetic field strength and output ADC values (0-4095 on ESP32).

**Known Information**:
- Baseline ADC reading (no force applied)
- Maximum ADC reading (known force applied)

**Unknown to Determine**:
- Relationship between ADC value and force in Newtons
- Sensor sensitivity coefficients
- Combining multiple sensor readings into total force

**Calibration Approach**:
```
Force (N) = (ADC_reading - ADC_baseline) × Force_per_ADC_unit
```

Where `Force_per_ADC_unit` is determined from known force applications.

### MPU9250 Calibration (Position)

**Problem**: MPU9250 outputs raw accelerometer values that indicate the sensor's orientation relative to gravity.

**Known Information**:
- Physical positions of MPU sensors on vest (in cm)
- Reference center point
- Raw accelerometer readings during compressions

**Unknown to Determine**:
- Mapping between sensor array and normalized coordinate system
- Weighted center of pressure calculation
- Axis orientation (may need swapping)

**Calibration Approach**:
```
Position = Weighted_average_of_sensor_positions
Weight = abs(accel_z) / accel_scale
```

### MPU9250 Calibration (Angle)

**Problem**: MPU9250 outputs raw accelerometer values that can be used to calculate pitch angle.

**Known Information**:
- Raw accelerometer readings (x, y, z axes)
- Known angle during compressions

**Unknown to Determine**:
- Pitch angle calculation from accelerometer
- Gyroscope scale factor
- Sensor orientation

**Calibration Approach**:
```
Pitch_angle = atan2(accel_x, accel_z) × (180 / π)
```

---

## CSV Data Format

### Expected CSV Structure

When the hardware team sends CSV files, they should contain the following columns:

#### Required Columns

```csv
timestamp,compressionDepth,appliedForce,sensorPositionX,sensorPositionY,angle,hall1,hall2,hall3,hall4
```

- **timestamp**: Unix timestamp in milliseconds
- **compressionDepth**: Known ground truth depth in cm (measured externally)
- **appliedForce**: Known ground truth force in Newtons (measured externally)
- **sensorPositionX**: Known hand position X in cm from reference point
- **sensorPositionY**: Known hand position Y in cm from reference point
- **angle**: Known body angle in degrees (measured externally)
- **hall1, hall2, hall3, hall4**: Raw ADC readings from Hall sensors (GPIO 34, 35, 36, 39)

#### Optional MPU Columns

If MPU sensors are included:

```csv
mpu1_accel_x,mpu1_accel_y,mpu1_accel_z,mpu1_gyro_x,mpu1_gyro_y,mpu1_gyro_z
mpu2_accel_x,mpu2_accel_y,mpu2_accel_z,mpu2_gyro_x,mpu2_gyro_y,mpu2_gyro_z
```

And similarly for `mpu3` and `mpu4` if available.

### Example CSV Data

```csv
timestamp,compressionDepth,appliedForce,sensorPositionX,sensorPositionY,angle,hall1,hall2,hall3,hall4,mpu1_accel_x,mpu1_accel_y,mpu1_accel_z
1697234567000,0,0,5,5,0,2048,2048,2048,2048,0,0,16384
1697234567100,2,50,5,5,-5,2400,2400,2400,2400,-1000,500,15000
1697234567200,4,100,5,5,-10,2800,2800,2800,2800,-2000,800,14000
1697234567300,5,120,5.5,4.8,-12,3100,3000,3050,3020,-2400,1000,13500
```

### Data Collection Procedure (For Hardware Team)

The hardware team should perform compressions at:
- **Various positions**: Move hands to different locations on the vest
- **Various depths**: Apply different compression depths (0-6cm)
- **Various angles**: Lean forward/backward at different angles

For each test case:
1. Record the **ground truth** values (measured externally with tools/sensors)
2. Record the **raw sensor readings** from ESP32
3. Save to CSV with synchronized timestamps

---

## Calibration Process Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. RECEIVE CSV FILES                        │
│  Hardware team sends CSV with raw sensor + ground truth data   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     2. VALIDATE CSV DATA                        │
│   - Check for required columns                                  │
│   - Verify data ranges (ADC 0-4095, etc.)                      │
│   - Check for missing/corrupted samples                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     3. ANALYZE DATA                             │
│   - Plot raw sensor values vs ground truth                     │
│   - Identify linear relationships                               │
│   - Calculate calibration coefficients                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     4. UPDATE CALIBRATION CONSTANTS             │
│   - Modify lib/calibration.ts with new constants               │
│   - Update DEFAULT_CALIBRATION object                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     5. TEST CALIBRATION                         │
│   - Apply calibration to test dataset                          │
│   - Calculate error metrics (RMSE, MAE)                        │
│   - Verify accuracy meets requirements                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     6. INTEGRATE & VALIDATE                     │
│   - Test with app using sensor-debug screen                    │
│   - Verify real-time performance                                │
│   - Check feedback accuracy                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Calibration Instructions

### Step 1: Load and Validate CSV Data

```typescript
import { parseCalibrationCSV, validateCalibrationData } from '../lib/calibration';
import * as FileSystem from 'expo-file-system';

// Read CSV file
const csvPath = FileSystem.documentDirectory + 'calibration_data.csv';
const csvContent = await FileSystem.readAsStringAsync(csvPath);

// Parse CSV
const calibrationRows = parseCalibrationCSV(csvContent);

// Validate data
const validation = validateCalibrationData(calibrationRows);

if (!validation.isValid) {
  console.error('CSV Validation Errors:', validation.errors);
  // Fix errors before proceeding
}

if (validation.warnings.length > 0) {
  console.warn('CSV Validation Warnings:', validation.warnings);
  // Review warnings but can proceed
}

console.log(`✓ Loaded ${calibrationRows.length} calibration samples`);
```

### Step 2: Hall Sensor Force Calibration

**Goal**: Determine the relationship between Hall sensor ADC readings and force in Newtons.

#### Analysis Code

```typescript
// Extract Hall sensor data and ground truth force
const hallData = calibrationRows.map((row) => ({
  groundTruthForce: row.appliedForce,
  hall1: row.hall1,
  hall2: row.hall2,
  hall3: row.hall3,
  hall4: row.hall4,
  hallSum: row.hall1 + row.hall2 + row.hall3 + row.hall4,
}));

// Calculate baseline (zero-force readings)
const zeroForceSamples = hallData.filter((d) => d.groundTruthForce === 0);
const baseline = {
  hall1: average(zeroForceSamples.map((s) => s.hall1)),
  hall2: average(zeroForceSamples.map((s) => s.hall2)),
  hall3: average(zeroForceSamples.map((s) => s.hall3)),
  hall4: average(zeroForceSamples.map((s) => s.hall4)),
};

console.log('Hall Sensor Baselines:', baseline);

// Calculate force sensitivity (Newtons per ADC unit)
// Using linear regression: Force = k × (ADC - baseline)

const nonZeroSamples = hallData.filter((d) => d.groundTruthForce > 0);

// For each sensor, calculate k = Force / (ADC - baseline)
const sensitivity = {
  hall1: linearRegression(
    nonZeroSamples.map((s) => s.hall1 - baseline.hall1),
    nonZeroSamples.map((s) => s.groundTruthForce)
  ).slope,
  hall2: linearRegression(
    nonZeroSamples.map((s) => s.hall2 - baseline.hall2),
    nonZeroSamples.map((s) => s.groundTruthForce)
  ).slope,
  hall3: linearRegression(
    nonZeroSamples.map((s) => s.hall3 - baseline.hall3),
    nonZeroSamples.map((s) => s.groundTruthForce)
  ).slope,
  hall4: linearRegression(
    nonZeroSamples.map((s) => s.hall4 - baseline.hall4),
    nonZeroSamples.map((s) => s.groundTruthForce)
  ).slope,
};

console.log('Hall Sensor Sensitivity (N per ADC unit):', sensitivity);

// Helper: Linear regression
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
```

#### Update Calibration Constants

```typescript
import { calibrationEngine, DEFAULT_CALIBRATION } from '../lib/calibration';

const updatedConstants = {
  ...DEFAULT_CALIBRATION,
  hallSensorCalibration: {
    baselineADC: [baseline.hall1, baseline.hall2, baseline.hall3, baseline.hall4],
    forcePerADCUnit: [sensitivity.hall1, sensitivity.hall2, sensitivity.hall3, sensitivity.hall4],
    maxForce: 200, // Keep safety limit
  },
};

calibrationEngine.updateConstants(updatedConstants);

console.log('✓ Force calibration updated');
```

### Step 3: MPU9250 Position Calibration

**Goal**: Map MPU sensor readings to normalized position (0-1 range).

#### Analysis Code

```typescript
// Extract MPU position data
const mpuPositionData = calibrationRows
  .filter((row) => row.mpu1_accel_z !== undefined)
  .map((row) => ({
    groundTruthX: row.sensorPosition.x,
    groundTruthY: row.sensorPosition.y,
    mpu1_accel_z: row.mpu1_accel_z!,
    mpu2_accel_z: row.mpu2_accel_z || 0,
    mpu3_accel_z: row.mpu3_accel_z || 0,
    mpu4_accel_z: row.mpu4_accel_z || 0,
  }));

// Determine sensor positions by analyzing which sensor has highest Z-accel
// at known ground truth positions

// Step 1: Find samples where force is applied at extreme corners
const topLeft = mpuPositionData.filter((d) => d.groundTruthX < 3 && d.groundTruthY < 3);
const topRight = mpuPositionData.filter((d) => d.groundTruthX > 7 && d.groundTruthY < 3);
const bottomLeft = mpuPositionData.filter((d) => d.groundTruthX < 3 && d.groundTruthY > 7);
const bottomRight = mpuPositionData.filter((d) => d.groundTruthX > 7 && d.groundTruthY > 7);

// Analyze which sensor has highest response in each corner
// This tells us the physical layout of sensors

console.log('Analyzing sensor layout...');

// Example: If mpu1 has highest Z-accel in top-left, then mpu1 is at (0, 0)
// Repeat for all corners to build position map

const sensorPositions = [
  { x: 0, y: 0 },    // mpu1 (determined from analysis)
  { x: 10, y: 0 },   // mpu2
  { x: 0, y: 10 },   // mpu3
  { x: 10, y: 10 },  // mpu4
];

const referenceCenter = { x: 5, y: 5 };

// Update calibration
calibrationEngine.updateConstants({
  mpuCalibration: {
    ...DEFAULT_CALIBRATION.mpuCalibration,
    positionMapping: {
      sensorPositions,
      referenceCenter,
    },
  },
});

console.log('✓ Position calibration updated');
```

### Step 4: MPU9250 Angle Calibration

**Goal**: Verify pitch angle calculation accuracy.

#### Analysis Code

```typescript
// Extract angle data
const angleData = calibrationRows
  .filter((row) => row.mpu1_accel_x !== undefined)
  .map((row) => {
    const accelX = row.mpu1_accel_x!;
    const accelZ = row.mpu1_accel_z!;
    const calculatedAngle = Math.atan2(accelX, accelZ) * (180 / Math.PI);

    return {
      groundTruthAngle: row.angle,
      calculatedAngle,
      error: Math.abs(calculatedAngle - row.angle),
    };
  });

// Calculate average error
const avgError = average(angleData.map((d) => d.error));
const maxError = Math.max(...angleData.map((d) => d.error));

console.log(`Angle Calibration - Avg Error: ${avgError.toFixed(2)}°, Max Error: ${maxError.toFixed(2)}°`);

// If error is acceptable (<5°), no adjustment needed
// If error is systematic (e.g., always off by +10°), apply offset

if (avgError > 5) {
  console.warn('⚠️ Angle calibration may need adjustment');
  // Calculate systematic offset
  const offset = average(angleData.map((d) => d.calculatedAngle - d.groundTruthAngle));
  console.log(`Systematic offset detected: ${offset.toFixed(2)}°`);
  // Apply offset in calibration code
}
```

### Step 5: Depth-to-Force Calibration

**Goal**: Establish relationship between force and compression depth.

#### Analysis Code

```typescript
// Extract depth-force relationship
const depthForceData = calibrationRows.map((row) => ({
  depth: row.compressionDepth,
  force: row.appliedForce,
}));

// Linear regression: depth = k × force
const regression = linearRegression(
  depthForceData.map((d) => d.force),
  depthForceData.map((d) => d.depth)
);

const forceToDepthRatio = regression.slope;

console.log(`Force-to-Depth Ratio: ${forceToDepthRatio.toFixed(4)} cm/N`);

// Update calibration
calibrationEngine.updateConstants({
  depthCalibration: {
    forceToDepthRatio,
    minimumDepth: 0,
    maximumDepth: 6,
  },
});

console.log('✓ Depth calibration updated');
```

---

## Validation Procedures

### Validation Metrics

After calibration, calculate these metrics on a **test dataset** (separate from calibration data):

#### 1. Root Mean Square Error (RMSE)

```typescript
function calculateRMSE(groundTruth: number[], predicted: number[]): number {
  const squaredErrors = groundTruth.map((gt, i) => Math.pow(gt - predicted[i], 2));
  const meanSquaredError = average(squaredErrors);
  return Math.sqrt(meanSquaredError);
}

// Example usage
const forceRMSE = calculateRMSE(
  testData.map((d) => d.groundTruthForce),
  testData.map((d) => calibratedForce(d))
);

console.log(`Force RMSE: ${forceRMSE.toFixed(2)} N`);
```

#### 2. Mean Absolute Error (MAE)

```typescript
function calculateMAE(groundTruth: number[], predicted: number[]): number {
  const absoluteErrors = groundTruth.map((gt, i) => Math.abs(gt - predicted[i]));
  return average(absoluteErrors);
}
```

#### 3. R² (Coefficient of Determination)

```typescript
function calculateR2(groundTruth: number[], predicted: number[]): number {
  const mean = average(groundTruth);
  const totalSS = groundTruth.reduce((sum, gt) => sum + Math.pow(gt - mean, 2), 0);
  const residualSS = groundTruth.reduce(
    (sum, gt, i) => sum + Math.pow(gt - predicted[i], 2),
    0
  );
  return 1 - residualSS / totalSS;
}
```

### Acceptance Criteria

| Metric | Target Value | Description |
|--------|--------------|-------------|
| Force RMSE | < 5 N | Force error less than 5 Newtons |
| Position MAE | < 1 cm | Position error less than 1 cm |
| Angle MAE | < 5° | Angle error less than 5 degrees |
| Depth MAE | < 0.5 cm | Depth error less than 0.5 cm |
| Force R² | > 0.95 | Strong linear correlation |

If metrics do not meet targets:
1. **Review data quality**: Check for outliers, sensor noise
2. **Collect more data**: More samples improve calibration
3. **Check sensor installation**: Physical issues may affect readings

### Live Testing with Sensor Debug Screen

1. Build and run the app with updated calibration
2. Navigate to the **Sensor Debug** screen (`/sensor-debug`)
3. Connect to the vest
4. Perform test compressions with known force/position/angle
5. Verify:
   - Force readings match applied force (±5N)
   - Position indicator shows correct hand location
   - Angle reading matches body lean angle (±5°)
   - Feedback messages are appropriate

---

## Troubleshooting

### Issue: Force readings are unstable/noisy

**Possible Causes**:
- Electrical noise in Hall sensor circuit
- Poor contact between magnets and sensors
- Sensor mounting vibrations

**Solutions**:
- Increase filter smoothing (adjust EMA alpha parameter)
- Check physical sensor installation
- Add capacitors to sensor circuit for noise reduction

### Issue: Position calculation is inaccurate

**Possible Causes**:
- Incorrect sensor position mapping
- Axis swapping needed (hardware team mentioned this)
- Sensor orientation mismatch

**Solutions**:
- Verify physical sensor positions with hardware team
- Swap X/Y axes in position calculation
- Apply rotation matrix to accelerometer readings

### Issue: Angle calculation drifts over time

**Possible Causes**:
- Gyroscope drift (inherent to MEMS gyros)
- Temperature changes
- Integration errors

**Solutions**:
- Use accelerometer-based pitch (not gyro integration)
- Implement complementary filter (combine accel + gyro)
- Recalibrate periodically

### Issue: CSV data has missing values

**Possible Causes**:
- Sensor connection lost during recording
- ESP32 buffer overflow
- Logging errors

**Solutions**:
- Filter out rows with missing critical values
- Interpolate missing values (if few samples)
- Request re-collection of data from hardware team

---

## Advanced Topics

### Axis Swapping (Hardware Team Note)

If the hardware team mentions "need to swap axes", you may need to apply axis transformations:

```typescript
// Example: Swap X and Y axes
const transformedPosition = {
  x: rawPosition.y,  // X becomes Y
  y: rawPosition.x,  // Y becomes X
};

// Example: Invert Z axis
const transformedAccelZ = -rawAccelZ;
```

Add axis transformation to `calibration.ts`:

```typescript
private applyAxisTransform(accel: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  // Apply rotation matrix or axis swaps here
  return {
    x: accel.y,   // Swap X/Y
    y: accel.x,
    z: -accel.z,  // Invert Z
  };
}
```

### Temperature Compensation

Hall sensors and MPUs can drift with temperature. If calibration accuracy degrades over time:

1. Collect calibration data at multiple temperatures
2. Model temperature-dependent coefficients
3. Add temperature sensor to ESP32 (if not present)
4. Apply compensation in real-time

### Multi-Point Calibration

For higher accuracy, use **multi-point calibration** instead of 2-point:

- Collect data at 5-10 known force levels (e.g., 0N, 25N, 50N, 75N, 100N, 125N, 150N)
- Fit polynomial curve instead of linear regression
- Use look-up table with interpolation for force calculation

### Sensor Fusion

Combine multiple sensor readings for improved accuracy:

- **Complementary Filter**: Combine accelerometer (long-term stable) with gyroscope (short-term accurate)
- **Kalman Filter**: Optimal estimation using sensor models and noise characteristics

---

## Quick Reference: Files and Functions

### Key Files

- **`lib/calibration.ts`**: Calibration engine, data types, CSV parsing, filters
- **`hooks/useBluetoothTrainingData.ts`**: Real-time data processing with filtering
- **`app/sensor-debug.tsx`**: Developer screen for testing and logging
- **`docs/CALIBRATION_GUIDE.md`**: This document

### Key Functions

```typescript
// Parse CSV file
parseCalibrationCSV(csvContent: string): CalibrationCSVRow[]

// Validate CSV data
validateCalibrationData(rows: CalibrationCSVRow[]): ValidationResult

// Update calibration constants
calibrationEngine.updateConstants(constants: Partial<CalibrationConstants>): void

// Apply calibration to raw data
calibrationEngine.calibrate(raw: RawSensorData): CalibratedSensorData

// Data filters
new EMAFilter(alpha: number)         // Exponential moving average
new MedianFilter(windowSize: number) // Median filter (remove outliers)
new MovingAverageFilter(windowSize: number) // Simple moving average
```

---

## Next Steps

1. **Wait for CSV files** from hardware team
2. **Run validation** on CSV data structure
3. **Perform calibration analysis** following Step-by-Step instructions
4. **Update calibration constants** in `lib/calibration.ts`
5. **Test with app** using sensor-debug screen
6. **Iterate** if accuracy doesn't meet targets

---

## Contact & Support

If you have questions during calibration:
- Check this guide first
- Review CSV data format and examples
- Test with mock data in sensor-debug screen
- Consult hardware team for ground truth verification

**Let's calibrate these sensors and win this! 🚀**
