/**
 * Calibration Data Analysis Script
 *
 * This script analyzes CSV calibration data and generates:
 * - Statistical summaries
 * - Calibration coefficients
 * - Validation metrics
 * - Data quality reports
 *
 * Usage:
 *   npx ts-node scripts/analyze_calibration.ts <path_to_csv>
 *
 * Example:
 *   npx ts-node scripts/analyze_calibration.ts calibration_data.csv
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CalibrationRow {
  timestamp: number;
  compressionDepth: number;
  appliedForce: number;
  sensorPositionX: number;
  sensorPositionY: number;
  angle: number;
  hall1: number;
  hall2: number;
  hall3: number;
  hall4: number;
  mpu1_accel_x?: number;
  mpu1_accel_y?: number;
  mpu1_accel_z?: number;
  mpu1_gyro_x?: number;
  mpu1_gyro_y?: number;
  mpu1_gyro_z?: number;
  mpu2_accel_x?: number;
  mpu2_accel_y?: number;
  mpu2_accel_z?: number;
  [key: string]: number | undefined;
}

interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

interface CalibrationResults {
  hallSensorCalibration: {
    baseline: number[];
    sensitivity: number[];
    r2Values: number[];
  };
  mpuCalibration: {
    sensorPositions: Array<{ x: number; y: number }>;
    referenceCenter: { x: number; y: number };
  };
  depthCalibration: {
    forceToDepthRatio: number;
    r2: number;
  };
  angleCalibration: {
    avgError: number;
    maxError: number;
    systematicOffset: number;
  };
  dataQuality: {
    totalSamples: number;
    validSamples: number;
    outliers: number;
    qualityScore: number; // 0-1
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr: number[]): number {
  const avg = average(arr);
  const squaredDiffs = arr.map((val) => Math.pow(val - avg, 2));
  return Math.sqrt(average(squaredDiffs));
}

function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  const predicted = x.map((xi) => slope * xi + intercept);
  const residualSS = y.reduce((sum, yi, i) => sum + Math.pow(yi - predicted[i], 2), 0);
  const r2 = 1 - residualSS / totalSS;

  return { slope, intercept, r2 };
}

function calculateRMSE(groundTruth: number[], predicted: number[]): number {
  const squaredErrors = groundTruth.map((gt, i) => Math.pow(gt - predicted[i], 2));
  const meanSquaredError = average(squaredErrors);
  return Math.sqrt(meanSquaredError);
}

function calculateMAE(groundTruth: number[], predicted: number[]): number {
  const absoluteErrors = groundTruth.map((gt, i) => Math.abs(gt - predicted[i]));
  return average(absoluteErrors);
}

// ============================================================================
// CSV PARSING
// ============================================================================

function parseCSV(csvContent: string): CalibrationRow[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: CalibrationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
      continue;
    }

    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      if (!isNaN(parseFloat(value))) {
        row[header] = parseFloat(value);
      } else {
        row[header] = value;
      }
    });

    rows.push(row as CalibrationRow);
  }

  return rows;
}

// ============================================================================
// CALIBRATION ANALYSIS
// ============================================================================

function analyzeHallSensors(data: CalibrationRow[]): CalibrationResults['hallSensorCalibration'] {
  console.log('\n=== Hall Sensor Calibration (Force) ===\n');

  // Calculate baseline (zero-force readings)
  const zeroForceSamples = data.filter((d) => d.appliedForce === 0);

  if (zeroForceSamples.length === 0) {
    console.warn('⚠️  No zero-force samples found. Using median of all samples as baseline.');
    const allHall1 = data.map((d) => d.hall1).sort((a, b) => a - b);
    const allHall2 = data.map((d) => d.hall2).sort((a, b) => a - b);
    const allHall3 = data.map((d) => d.hall3).sort((a, b) => a - b);
    const allHall4 = data.map((d) => d.hall4).sort((a, b) => a - b);

    const baseline = [
      allHall1[Math.floor(allHall1.length / 2)],
      allHall2[Math.floor(allHall2.length / 2)],
      allHall3[Math.floor(allHall3.length / 2)],
      allHall4[Math.floor(allHall4.length / 2)],
    ];

    console.log('Estimated Baselines:', baseline.map((b) => b.toFixed(0)).join(', '));
  } else {
    const baseline = [
      average(zeroForceSamples.map((s) => s.hall1)),
      average(zeroForceSamples.map((s) => s.hall2)),
      average(zeroForceSamples.map((s) => s.hall3)),
      average(zeroForceSamples.map((s) => s.hall4)),
    ];

    console.log(`✓ Baselines (${zeroForceSamples.length} samples):`);
    console.log(`  Hall 1: ${baseline[0].toFixed(1)}`);
    console.log(`  Hall 2: ${baseline[1].toFixed(1)}`);
    console.log(`  Hall 3: ${baseline[2].toFixed(1)}`);
    console.log(`  Hall 4: ${baseline[3].toFixed(1)}`);
  }

  // Calculate sensitivity (force per ADC unit)
  const nonZeroSamples = data.filter((d) => d.appliedForce > 0);

  const baseline = [
    average(zeroForceSamples.length > 0 ? zeroForceSamples.map((s) => s.hall1) : [2048]),
    average(zeroForceSamples.length > 0 ? zeroForceSamples.map((s) => s.hall2) : [2048]),
    average(zeroForceSamples.length > 0 ? zeroForceSamples.map((s) => s.hall3) : [2048]),
    average(zeroForceSamples.length > 0 ? zeroForceSamples.map((s) => s.hall4) : [2048]),
  ];

  console.log(`\n✓ Sensitivity (${nonZeroSamples.length} samples):`);

  const regression1 = linearRegression(
    nonZeroSamples.map((s) => s.hall1 - baseline[0]),
    nonZeroSamples.map((s) => s.appliedForce)
  );
  const regression2 = linearRegression(
    nonZeroSamples.map((s) => s.hall2 - baseline[1]),
    nonZeroSamples.map((s) => s.appliedForce)
  );
  const regression3 = linearRegression(
    nonZeroSamples.map((s) => s.hall3 - baseline[2]),
    nonZeroSamples.map((s) => s.appliedForce)
  );
  const regression4 = linearRegression(
    nonZeroSamples.map((s) => s.hall4 - baseline[3]),
    nonZeroSamples.map((s) => s.appliedForce)
  );

  console.log(`  Hall 1: ${regression1.slope.toFixed(6)} N/ADC (R² = ${regression1.r2.toFixed(3)})`);
  console.log(`  Hall 2: ${regression2.slope.toFixed(6)} N/ADC (R² = ${regression2.r2.toFixed(3)})`);
  console.log(`  Hall 3: ${regression3.slope.toFixed(6)} N/ADC (R² = ${regression3.r2.toFixed(3)})`);
  console.log(`  Hall 4: ${regression4.slope.toFixed(6)} N/ADC (R² = ${regression4.r2.toFixed(3)})`);

  const sensitivity = [regression1.slope, regression2.slope, regression3.slope, regression4.slope];
  const r2Values = [regression1.r2, regression2.r2, regression3.r2, regression4.r2];

  // Check quality
  const avgR2 = average(r2Values);
  if (avgR2 < 0.9) {
    console.warn(`⚠️  Low R² values (avg: ${avgR2.toFixed(3)}). Check data quality or sensor issues.`);
  } else {
    console.log(`✓ Good correlation (avg R²: ${avgR2.toFixed(3)})`);
  }

  return { baseline, sensitivity, r2Values };
}

function analyzeDepthCalibration(data: CalibrationRow[]): CalibrationResults['depthCalibration'] {
  console.log('\n=== Depth-to-Force Calibration ===\n');

  const regression = linearRegression(
    data.map((d) => d.appliedForce),
    data.map((d) => d.compressionDepth)
  );

  console.log(`✓ Force-to-Depth Ratio: ${regression.slope.toFixed(6)} cm/N`);
  console.log(`  Intercept: ${regression.intercept.toFixed(3)} cm`);
  console.log(`  R²: ${regression.r2.toFixed(3)}`);

  if (regression.r2 < 0.9) {
    console.warn('⚠️  Low R². Depth-force relationship may not be linear.');
  }

  return {
    forceToDepthRatio: regression.slope,
    r2: regression.r2,
  };
}

function analyzeMPUPosition(data: CalibrationRow[]): CalibrationResults['mpuCalibration'] {
  console.log('\n=== MPU Position Calibration ===\n');

  const mpuData = data.filter((d) => d.mpu1_accel_z !== undefined);

  if (mpuData.length === 0) {
    console.warn('⚠️  No MPU data found in CSV');
    return {
      sensorPositions: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ],
      referenceCenter: { x: 5, y: 5 },
    };
  }

  console.log(`✓ Found ${mpuData.length} samples with MPU data`);

  // Analyze sensor positions by finding which sensor responds most to pressure at known locations
  // This is a simplified analysis - real implementation would need more sophisticated clustering

  const sensorPositions = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
    { x: 10, y: 10 },
  ];

  const referenceCenter = { x: 5, y: 5 };

  console.log('✓ Using default sensor positions (requires manual verification):');
  console.log('  MPU1: (0, 0) cm');
  console.log('  MPU2: (10, 0) cm');
  console.log('  MPU3: (0, 10) cm');
  console.log('  MPU4: (10, 10) cm');
  console.log('  Center: (5, 5) cm');

  return { sensorPositions, referenceCenter };
}

function analyzeAngleCalibration(data: CalibrationRow[]): CalibrationResults['angleCalibration'] {
  console.log('\n=== Angle Calibration ===\n');

  const mpuData = data.filter((d) => d.mpu1_accel_x !== undefined && d.mpu1_accel_z !== undefined);

  if (mpuData.length === 0) {
    console.warn('⚠️  No MPU accelerometer data found');
    return { avgError: 0, maxError: 0, systematicOffset: 0 };
  }

  const accelScale = 16384; // ±2g range

  const errors = mpuData.map((d) => {
    const accelX = d.mpu1_accel_x! / accelScale;
    const accelZ = d.mpu1_accel_z! / accelScale;
    const calculatedAngle = Math.atan2(accelX, accelZ) * (180 / Math.PI);
    const error = calculatedAngle - d.angle;
    return { calculated: calculatedAngle, groundTruth: d.angle, error };
  });

  const avgError = average(errors.map((e) => Math.abs(e.error)));
  const maxError = Math.max(...errors.map((e) => Math.abs(e.error)));
  const systematicOffset = average(errors.map((e) => e.error));

  console.log(`✓ Analyzed ${errors.length} angle samples:`);
  console.log(`  Avg Absolute Error: ${avgError.toFixed(2)}°`);
  console.log(`  Max Error: ${maxError.toFixed(2)}°`);
  console.log(`  Systematic Offset: ${systematicOffset.toFixed(2)}°`);

  if (avgError > 5) {
    console.warn('⚠️  High angle error. May need axis transformation or calibration adjustment.');
  } else {
    console.log('✓ Angle calibration within acceptable range');
  }

  if (Math.abs(systematicOffset) > 3) {
    console.warn(`⚠️  Systematic offset detected (${systematicOffset.toFixed(2)}°). Consider applying correction.`);
  }

  return { avgError, maxError, systematicOffset };
}

function assessDataQuality(data: CalibrationRow[]): CalibrationResults['dataQuality'] {
  console.log('\n=== Data Quality Assessment ===\n');

  const totalSamples = data.length;
  let validSamples = 0;
  let outliers = 0;

  // Check for valid ranges
  data.forEach((row) => {
    const isValidHall =
      row.hall1 >= 0 &&
      row.hall1 <= 4095 &&
      row.hall2 >= 0 &&
      row.hall2 <= 4095 &&
      row.hall3 >= 0 &&
      row.hall3 <= 4095 &&
      row.hall4 >= 0 &&
      row.hall4 <= 4095;

    const isValidForce = row.appliedForce >= 0 && row.appliedForce <= 500;
    const isValidDepth = row.compressionDepth >= 0 && row.compressionDepth <= 10;
    const isValidAngle = Math.abs(row.angle) <= 180;

    if (isValidHall && isValidForce && isValidDepth && isValidAngle) {
      validSamples++;
    } else {
      outliers++;
    }
  });

  const qualityScore = validSamples / totalSamples;

  console.log(`✓ Total Samples: ${totalSamples}`);
  console.log(`✓ Valid Samples: ${validSamples} (${(qualityScore * 100).toFixed(1)}%)`);
  console.log(`✓ Outliers: ${outliers}`);

  if (qualityScore < 0.95) {
    console.warn('⚠️  Data quality below 95%. Review CSV for errors.');
  } else {
    console.log('✓ Excellent data quality');
  }

  return { totalSamples, validSamples, outliers, qualityScore };
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

function analyzeCalibrationData(csvPath: string): CalibrationResults {
  console.log('='.repeat(70));
  console.log('  RESCUERIGHT CALIBRATION DATA ANALYSIS');
  console.log('='.repeat(70));
  console.log(`\nInput File: ${csvPath}\n`);

  // Load CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const data = parseCSV(csvContent);

  console.log(`✓ Loaded ${data.length} samples from CSV`);

  // Run analyses
  const hallCalibration = analyzeHallSensors(data);
  const depthCalibration = analyzeDepthCalibration(data);
  const mpuCalibration = analyzeMPUPosition(data);
  const angleCalibration = analyzeAngleCalibration(data);
  const dataQuality = assessDataQuality(data);

  const results: CalibrationResults = {
    hallSensorCalibration: hallCalibration,
    mpuCalibration,
    depthCalibration,
    angleCalibration,
    dataQuality,
  };

  return results;
}

// ============================================================================
// OUTPUT GENERATION
// ============================================================================

function generateCalibrationCode(results: CalibrationResults): string {
  return `
// ============================================================================
// CALIBRATION CONSTANTS (Auto-generated from CSV analysis)
// Generated: ${new Date().toISOString()}
// ============================================================================

export const CALIBRATION_CONSTANTS = {
  hallSensorCalibration: {
    baselineADC: [${results.hallSensorCalibration.baseline.map((b) => b.toFixed(1)).join(', ')}],
    forcePerADCUnit: [${results.hallSensorCalibration.sensitivity.map((s) => s.toFixed(6)).join(', ')}],
    maxForce: 200, // Safety limit (Newtons)
  },

  mpuCalibration: {
    accelScale: 16384, // ±2g range: 16384 LSB/g
    gyroScale: 131, // ±250°/s range: 131 LSB/(°/s)
    rotationMatrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ], // Identity matrix (adjust if axis swapping needed)
    positionMapping: {
      sensorPositions: ${JSON.stringify(results.mpuCalibration.sensorPositions)},
      referenceCenter: ${JSON.stringify(results.mpuCalibration.referenceCenter)},
    },
  },

  depthCalibration: {
    forceToDepthRatio: ${results.depthCalibration.forceToDepthRatio.toFixed(6)}, // cm per Newton
    minimumDepth: 0,
    maximumDepth: 6, // Max recommended CPR depth (cm)
  },

  qualityThresholds: {
    minConfidence: 0.7,
    maxAccelNoise: 0.5, // g
    maxGyroNoise: 10, // deg/s
    maxPositionError: 2, // cm
  },
};

// Data Quality Report:
// - Total Samples: ${results.dataQuality.totalSamples}
// - Valid Samples: ${results.dataQuality.validSamples} (${(results.dataQuality.qualityScore * 100).toFixed(1)}%)
// - Hall Sensor R² values: ${results.hallSensorCalibration.r2Values.map((r) => r.toFixed(3)).join(', ')}
// - Depth-Force R²: ${results.depthCalibration.r2.toFixed(3)}
// - Angle Avg Error: ${results.angleCalibration.avgError.toFixed(2)}°
// - Angle Systematic Offset: ${results.angleCalibration.systematicOffset.toFixed(2)}°
`;
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx ts-node scripts/analyze_calibration.ts <path_to_csv>');
    console.error('Example: npx ts-node scripts/analyze_calibration.ts calibration_data.csv');
    process.exit(1);
  }

  const csvPath = path.resolve(args[0]);

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    const results = analyzeCalibrationData(csvPath);

    // Generate calibration code
    const calibrationCode = generateCalibrationCode(results);

    // Save to output file
    const outputPath = path.join(path.dirname(csvPath), 'calibration_output.ts');
    fs.writeFileSync(outputPath, calibrationCode);

    console.log('\n' + '='.repeat(70));
    console.log('✓ ANALYSIS COMPLETE');
    console.log('='.repeat(70));
    console.log(`\nCalibration constants saved to: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Review the generated calibration constants');
    console.log('2. Copy constants to lib/calibration.ts (replace DEFAULT_CALIBRATION)');
    console.log('3. Test with app using sensor-debug screen');
    console.log('4. Iterate if accuracy does not meet targets\n');
  } catch (error) {
    console.error('\n❌ Error analyzing calibration data:');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { analyzeCalibrationData, parseCSV, CalibrationResults };
