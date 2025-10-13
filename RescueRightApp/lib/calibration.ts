/**
 * Calibration Module for RescueRight Sensor Data
 *
 * This module handles:
 * - Raw sensor data processing from ESP32
 * - Calibration of Hall sensors (force) and MPU9250 (position/angle)
 * - Data validation and error detection
 * - CSV parsing for calibration data analysis
 *
 * @version 1.0.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Raw sensor readings directly from ESP32
 */
export interface RawSensorData {
  // Hall sensor readings (4 sensors, ADC values 0-4095)
  hallSensors: {
    sensor1: number; // GPIO 34
    sensor2: number; // GPIO 35
    sensor3: number; // GPIO 36
    sensor4: number; // GPIO 39
  };

  // MPU9250 readings (2-4 sensors, raw accelerometer/gyro values)
  mpuSensors: {
    mpu1?: MPURawReading; // GPIO 18&19
    mpu2?: MPURawReading; // GPIO 21&22
    mpu3?: MPURawReading; // GPIO 25&26
    mpu4?: MPURawReading; // GPIO 32&33
  };

  // Metadata
  timestamp: number;
  sampleRate?: number; // Hz
}

/**
 * Raw MPU9250 reading
 */
export interface MPURawReading {
  accel: {
    x: number; // Raw accelerometer (typically -32768 to 32767)
    y: number;
    z: number;
  };
  gyro: {
    x: number; // Raw gyroscope (typically -32768 to 32767)
    y: number;
    z: number;
  };
  mag?: {
    x: number; // Raw magnetometer (optional)
    y: number;
    z: number;
  };
}

/**
 * Calibrated sensor outputs (ready for app consumption)
 */
export interface CalibratedSensorData {
  force: number; // Newtons (N)
  position: {
    x: number; // Normalized 0-1 (0=left, 1=right)
    y: number; // Normalized 0-1 (0=top, 1=bottom)
  };
  angle: number; // Degrees (-180 to 180)
  compressionDepth: number; // cm
  quality: DataQuality;
  timestamp: number;
}

/**
 * Data quality indicators
 */
export interface DataQuality {
  isValid: boolean;
  confidence: number; // 0-1
  issues: string[]; // Array of warning messages
}

/**
 * Calibration constants (to be determined from CSV analysis)
 */
export interface CalibrationConstants {
  // Hall sensor calibration
  hallSensorCalibration: {
    baselineADC: number[]; // Zero-force baseline for each sensor
    forcePerADCUnit: number[]; // N per ADC unit for each sensor
    maxForce: number; // Maximum safe force in Newtons
  };

  // MPU9250 calibration
  mpuCalibration: {
    accelScale: number; // g per raw unit
    gyroScale: number; // deg/s per raw unit
    rotationMatrix: number[][]; // 3x3 rotation for axis alignment
    positionMapping: {
      // Maps sensor positions to normalized coordinates
      sensorPositions: Array<{ x: number; y: number }>; // Physical positions in cm
      referenceCenter: { x: number; y: number }; // Center point in cm
    };
  };

  // Depth calculation
  depthCalibration: {
    forceToDepthRatio: number; // cm per Newton
    minimumDepth: number; // cm
    maximumDepth: number; // cm
  };

  // Data quality thresholds
  qualityThresholds: {
    minConfidence: number;
    maxAccelNoise: number; // g
    maxGyroNoise: number; // deg/s
    maxPositionError: number; // cm
  };
}

/**
 * CSV row structure for calibration data
 */
export interface CalibrationCSVRow {
  timestamp: number;
  compressionDepth: number; // Known ground truth (cm)
  appliedForce: number; // Known ground truth (N)
  sensorPosition: { x: number; y: number }; // Known position (cm)
  angle: number; // Known angle (degrees)

  // Raw sensor readings
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
  mpu2_gyro_x?: number;
  mpu2_gyro_y?: number;
  mpu2_gyro_z?: number;

  // Add mpu3 and mpu4 if available
  [key: string]: number | { x: number; y: number } | undefined;
}

// ============================================================================
// DEFAULT CALIBRATION CONSTANTS (PLACEHOLDERS)
// ============================================================================

/**
 * Default calibration constants
 * These are placeholder values that will be replaced after CSV analysis
 */
export const DEFAULT_CALIBRATION: CalibrationConstants = {
  hallSensorCalibration: {
    baselineADC: [2048, 2048, 2048, 2048], // Mid-range ADC value
    forcePerADCUnit: [0.05, 0.05, 0.05, 0.05], // ~200N at max ADC (4095)
    maxForce: 200, // Maximum safe force in Newtons
  },

  mpuCalibration: {
    accelScale: 16384, // ±2g range: 16384 LSB/g
    gyroScale: 131, // ±250°/s range: 131 LSB/(°/s)
    rotationMatrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ], // Identity matrix (no rotation)
    positionMapping: {
      sensorPositions: [
        { x: 0, y: 0 },     // mpu1 position (to be calibrated)
        { x: 10, y: 0 },    // mpu2 position (to be calibrated)
        { x: 0, y: 10 },    // mpu3 position (to be calibrated)
        { x: 10, y: 10 },   // mpu4 position (to be calibrated)
      ],
      referenceCenter: { x: 5, y: 5 }, // Center of sensor array
    },
  },

  depthCalibration: {
    forceToDepthRatio: 0.05, // Placeholder: 5cm per 100N
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

// ============================================================================
// CALIBRATION ENGINE
// ============================================================================

export class CalibrationEngine {
  private constants: CalibrationConstants;

  constructor(constants: CalibrationConstants = DEFAULT_CALIBRATION) {
    this.constants = constants;
  }

  /**
   * Update calibration constants (after CSV analysis)
   */
  public updateConstants(constants: Partial<CalibrationConstants>): void {
    this.constants = { ...this.constants, ...constants };
  }

  /**
   * Get current calibration constants
   */
  public getConstants(): CalibrationConstants {
    return { ...this.constants };
  }

  /**
   * Main calibration function: Convert raw sensor data to calibrated output
   */
  public calibrate(raw: RawSensorData): CalibratedSensorData {
    // Step 1: Calibrate force from Hall sensors
    const force = this.calibrateForce(raw.hallSensors);

    // Step 2: Calibrate position from MPU accelerometers
    const position = this.calibratePosition(raw.mpuSensors);

    // Step 3: Calibrate angle from MPU gyroscopes
    const angle = this.calibrateAngle(raw.mpuSensors);

    // Step 4: Calculate compression depth
    const compressionDepth = this.calculateCompressionDepth(force);

    // Step 5: Assess data quality
    const quality = this.assessDataQuality(raw, force, position, angle);

    return {
      force,
      position,
      angle,
      compressionDepth,
      quality,
      timestamp: raw.timestamp,
    };
  }

  /**
   * Calibrate force from Hall sensor ADC readings
   */
  private calibrateForce(hallSensors: RawSensorData['hallSensors']): number {
    const { baselineADC, forcePerADCUnit, maxForce } = this.constants.hallSensorCalibration;

    // Convert each sensor reading to force
    const forces = [
      Math.max(0, (hallSensors.sensor1 - baselineADC[0]) * forcePerADCUnit[0]),
      Math.max(0, (hallSensors.sensor2 - baselineADC[1]) * forcePerADCUnit[1]),
      Math.max(0, (hallSensors.sensor3 - baselineADC[2]) * forcePerADCUnit[2]),
      Math.max(0, (hallSensors.sensor4 - baselineADC[3]) * forcePerADCUnit[3]),
    ];

    // Sum all sensor forces (distributed load)
    const totalForce = forces.reduce((sum, f) => sum + f, 0);

    // Clamp to safe range
    return Math.min(totalForce, maxForce);
  }

  /**
   * Calibrate position from MPU accelerometer readings
   */
  private calibratePosition(mpuSensors: RawSensorData['mpuSensors']): { x: number; y: number } {
    const { sensorPositions, referenceCenter } = this.constants.mpuCalibration.positionMapping;
    const { accelScale } = this.constants.mpuCalibration;

    // Collect available MPU sensors
    const mpuArray = [
      mpuSensors.mpu1,
      mpuSensors.mpu2,
      mpuSensors.mpu3,
      mpuSensors.mpu4,
    ].filter((mpu) => mpu !== undefined) as MPURawReading[];

    if (mpuArray.length === 0) {
      return { x: 0.5, y: 0.5 }; // Default center if no sensors
    }

    // Calculate weighted center of pressure based on Z-axis acceleration
    let weightedX = 0;
    let weightedY = 0;
    let totalWeight = 0;

    mpuArray.forEach((mpu, index) => {
      if (index >= sensorPositions.length) return;

      // Z-axis acceleration indicates pressure (weight)
      // Higher |accel_z| = more weight on that sensor
      const weight = Math.abs(mpu.accel.z / accelScale);

      weightedX += sensorPositions[index].x * weight;
      weightedY += sensorPositions[index].y * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) {
      return { x: 0.5, y: 0.5 };
    }

    // Calculate position relative to reference center
    const posX = weightedX / totalWeight;
    const posY = weightedY / totalWeight;

    // Normalize to 0-1 range (assumes sensor array spans reasonable area)
    const normalizedX = posX / (referenceCenter.x * 2);
    const normalizedY = posY / (referenceCenter.y * 2);

    return {
      x: Math.max(0, Math.min(1, normalizedX)),
      y: Math.max(0, Math.min(1, normalizedY)),
    };
  }

  /**
   * Calibrate angle from MPU gyroscope readings
   */
  private calibrateAngle(mpuSensors: RawSensorData['mpuSensors']): number {
    const { gyroScale } = this.constants.mpuCalibration;

    // Collect available MPU sensors
    const mpuArray = [
      mpuSensors.mpu1,
      mpuSensors.mpu2,
      mpuSensors.mpu3,
      mpuSensors.mpu4,
    ].filter((mpu) => mpu !== undefined) as MPURawReading[];

    if (mpuArray.length === 0) {
      return 0; // Default angle if no sensors
    }

    // Average pitch angle across all sensors
    // Pitch is typically derived from accel_x and accel_z
    let totalAngle = 0;

    mpuArray.forEach((mpu) => {
      const accelX = mpu.accel.x / this.constants.mpuCalibration.accelScale;
      const accelZ = mpu.accel.z / this.constants.mpuCalibration.accelScale;

      // Calculate pitch angle (rotation around Y-axis)
      const pitch = Math.atan2(accelX, accelZ) * (180 / Math.PI);
      totalAngle += pitch;
    });

    const averageAngle = totalAngle / mpuArray.length;

    // Clamp to reasonable range
    return Math.max(-180, Math.min(180, averageAngle));
  }

  /**
   * Calculate compression depth from force
   */
  private calculateCompressionDepth(force: number): number {
    const { forceToDepthRatio, minimumDepth, maximumDepth } = this.constants.depthCalibration;

    const depth = force * forceToDepthRatio;

    return Math.max(minimumDepth, Math.min(maximumDepth, depth));
  }

  /**
   * Assess data quality and detect anomalies
   */
  private assessDataQuality(
    raw: RawSensorData,
    force: number,
    position: { x: number; y: number },
    angle: number
  ): DataQuality {
    const issues: string[] = [];
    let confidence = 1.0;

    // Check Hall sensor values
    const hallValues = Object.values(raw.hallSensors);
    const hallMin = Math.min(...hallValues);
    const hallMax = Math.max(...hallValues);

    if (hallMin < 100 || hallMax > 4000) {
      issues.push('Hall sensor reading near ADC limits');
      confidence *= 0.8;
    }

    // Check if sensors are balanced (force distribution)
    const hallAvg = hallValues.reduce((sum, v) => sum + v, 0) / hallValues.length;
    const hallStdDev = Math.sqrt(
      hallValues.reduce((sum, v) => sum + Math.pow(v - hallAvg, 2), 0) / hallValues.length
    );

    if (hallStdDev > hallAvg * 0.5) {
      issues.push('Unbalanced force distribution across sensors');
      confidence *= 0.9;
    }

    // Check MPU noise levels
    const mpuArray = [
      raw.mpuSensors.mpu1,
      raw.mpuSensors.mpu2,
      raw.mpuSensors.mpu3,
      raw.mpuSensors.mpu4,
    ].filter((mpu) => mpu !== undefined) as MPURawReading[];

    if (mpuArray.length < 2) {
      issues.push('Insufficient MPU sensors active');
      confidence *= 0.7;
    }

    // Check for excessive gyro activity (shaking/movement)
    mpuArray.forEach((mpu, idx) => {
      const gyroMag = Math.sqrt(
        Math.pow(mpu.gyro.x, 2) + Math.pow(mpu.gyro.y, 2) + Math.pow(mpu.gyro.z, 2)
      );

      if (gyroMag / this.constants.mpuCalibration.gyroScale > this.constants.qualityThresholds.maxGyroNoise) {
        issues.push(`MPU ${idx + 1}: Excessive movement detected`);
        confidence *= 0.85;
      }
    });

    // Overall validity check
    const isValid = confidence >= this.constants.qualityThresholds.minConfidence;

    return {
      isValid,
      confidence,
      issues,
    };
  }
}

// ============================================================================
// CSV PARSING UTILITIES
// ============================================================================

/**
 * Parse CSV string into calibration data rows
 */
export function parseCalibrationCSV(csvContent: string): CalibrationCSVRow[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim());

  // Parse data rows
  const rows: CalibrationCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
      continue;
    }

    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index];

      // Parse numeric values
      if (!isNaN(parseFloat(value))) {
        row[header] = parseFloat(value);
      } else {
        row[header] = value;
      }
    });

    rows.push(row as CalibrationCSVRow);
  }

  return rows;
}

/**
 * Validate CSV data structure
 */
export function validateCalibrationData(rows: CalibrationCSVRow[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rows.length === 0) {
    errors.push('No data rows found');
    return { isValid: false, errors, warnings };
  }

  // Check required columns
  const requiredColumns = ['timestamp', 'hall1', 'hall2', 'hall3', 'hall4'];
  const firstRow = rows[0];

  requiredColumns.forEach((col) => {
    if (!(col in firstRow)) {
      errors.push(`Missing required column: ${col}`);
    }
  });

  // Check for MPU data
  const hasMPU1 = 'mpu1_accel_x' in firstRow;
  const hasMPU2 = 'mpu2_accel_x' in firstRow;

  if (!hasMPU1 && !hasMPU2) {
    warnings.push('No MPU sensor data found');
  }

  // Check data ranges
  rows.forEach((row, idx) => {
    // Hall sensors should be 0-4095
    [row.hall1, row.hall2, row.hall3, row.hall4].forEach((val, sensorIdx) => {
      if (val < 0 || val > 4095) {
        warnings.push(`Row ${idx + 1}, Hall sensor ${sensorIdx + 1}: Value out of range (${val})`);
      }
    });
  });

  const isValid = errors.length === 0;

  return { isValid, errors, warnings };
}

// ============================================================================
// DATA SMOOTHING / FILTERING
// ============================================================================

/**
 * Exponential Moving Average filter for smoothing noisy data
 */
export class EMAFilter {
  private alpha: number;
  private previousValue: number | null = null;

  constructor(alpha: number = 0.3) {
    if (alpha < 0 || alpha > 1) {
      throw new Error('Alpha must be between 0 and 1');
    }
    this.alpha = alpha;
  }

  /**
   * Apply filter to new value
   */
  public filter(value: number): number {
    if (this.previousValue === null) {
      this.previousValue = value;
      return value;
    }

    const filtered = this.alpha * value + (1 - this.alpha) * this.previousValue;
    this.previousValue = filtered;

    return filtered;
  }

  /**
   * Reset filter state
   */
  public reset(): void {
    this.previousValue = null;
  }
}

/**
 * Moving average filter (simple average over N samples)
 */
export class MovingAverageFilter {
  private windowSize: number;
  private buffer: number[] = [];

  constructor(windowSize: number = 5) {
    if (windowSize < 1) {
      throw new Error('Window size must be at least 1');
    }
    this.windowSize = windowSize;
  }

  /**
   * Apply filter to new value
   */
  public filter(value: number): number {
    this.buffer.push(value);

    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    const sum = this.buffer.reduce((acc, v) => acc + v, 0);
    return sum / this.buffer.length;
  }

  /**
   * Reset filter state
   */
  public reset(): void {
    this.buffer = [];
  }
}

/**
 * Median filter (removes outliers)
 */
export class MedianFilter {
  private windowSize: number;
  private buffer: number[] = [];

  constructor(windowSize: number = 5) {
    if (windowSize < 1) {
      throw new Error('Window size must be at least 1');
    }
    this.windowSize = windowSize;
  }

  /**
   * Apply filter to new value
   */
  public filter(value: number): number {
    this.buffer.push(value);

    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    const sorted = [...this.buffer].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * Reset filter state
   */
  public reset(): void {
    this.buffer = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global calibration engine instance
 */
export const calibrationEngine = new CalibrationEngine();
