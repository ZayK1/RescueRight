/**
 * RescueRight Vest Calibration
 * ============================================================================
 * Single source of truth for turning the new sensor pad's raw readings into the
 * three things we show the trainee: FORCE, HAND POSITION and THRUST ANGLE for
 * the Heimlich (abdominal-thrust) manoeuvre.
 *
 * Hardware (v2 pad): Adafruit Feather ESP32 V2 + PCA9548A I2C mux + 5x
 * (LIS3MDL magnetometer + LSM6DSOX accel/gyro) boards — 4 at the foam corners
 * and 1 reference board fixed to the base plate.
 *
 * The firmware streams a small comma-separated text line per sample
 * (see docs/FIRMWARE_BLE_CONTRACT.md). All interpretation happens here, in the
 * app, so constants can be tuned live with hot-reload — no reflashing.
 * ============================================================================
 */

// ─── CLINICAL TARGET ─────────────────────────────────────────────────────────
// Target applied-force window for a correct abdominal thrust, in Newtons.
// Derived from the only quantitative reference that exists (Lippmann et al.,
// Resuscitation 2013, anaesthetised-pig study): applied pressure ~120–160 cmH2O
// (~12–16 kPa) over an estimated fist contact area of ~40 cm^2  ->  ~47–63 N,
// rounded to 40–65 N.
//
// This is a TRAINING reference range, NOT a clinically validated threshold.
//  - below min  -> ineffective (airway unlikely to clear)
//  - within     -> optimal
//  - above max  -> injury risk (gastric/oesophageal rupture, pneumomediastinum)
export const TARGET_FORCE = { min: 40, max: 65 }; // Newtons

// Where the hands should land on the pad (normalised 0–1, centre of the pad).
export const POSITION_TARGET = { x: 0.5, y: 0.5 };
export const POSITION_TOLERANCE = 0.18; // how far off before we flag it

// Below this the pad is treated as "at rest" (no active thrust in progress).
export const IDLE_FORCE_N = 8;

// Count a thrust once force rises past this. Kept low so weak attempts are still
// counted; whether a thrust was strong ENOUGH is judged separately against
// TARGET_FORCE.
export const THRUST_DETECT_N = 15;

// ─── THE ONE NUMBER TO CALIBRATE ─────────────────────────────────────────────
// Maps the summed corner magnetometer change (µT) to force (Newtons):
//
//     force  ≈  sum(magDelta) * FORCE_GAIN
//
// HOW TO CALIBRATE (do this once, before the demo, with the real pad):
//   1. Put the pad on a scale that reads force/weight (1 kgf ≈ 9.81 N).
//   2. Open the Sensor Debug screen and press firmly at the centre.
//   3. Read the "Σ magDelta" value shown there while pressing at a firm,
//      "correct" thrust.
//   4. Set FORCE_GAIN so that firm thrust reads about 55 N (middle of 40–65):
//         FORCE_GAIN = 55 / (Σ magDelta at a firm thrust)
//   5. Save — the app hot-reloads. Re-check a few presses land in 40–65 N.
export const FORCE_GAIN = 1.0; // TODO: calibrate against a force scale (see above)

export const MAX_FORCE_N = 200; // hard display clamp

// ─── CORNER LAYOUT ───────────────────────────────────────────────────────────
// magDelta array order MUST match the firmware CSV order:
//   index 0 = TOP_LEFT     (x=0, y=0)
//   index 1 = TOP_RIGHT    (x=1, y=0)
//   index 2 = BOTTOM_LEFT  (x=0, y=1)
//   index 3 = BOTTOM_RIGHT (x=1, y=1)
const CORNER_X = [0, 1, 0, 1];
const CORNER_Y = [0, 0, 1, 1];

/** Summed positive corner change — the raw compression signal. */
export function sumMagDelta(magDelta: number[]): number {
  return magDelta.reduce((s, m) => s + Math.max(0, m ?? 0), 0);
}

/** Convert the pad's magnetometer change into applied force (Newtons). */
export function magDeltaToForce(magDelta: number[]): number {
  const force = sumMagDelta(magDelta) * FORCE_GAIN;
  return Math.max(0, Math.min(MAX_FORCE_N, force));
}

/**
 * Centre of pressure across the 4 corners -> normalised hand position (0–1).
 * The corner that compresses most pulls the point toward it.
 */
export function computeLocation(magDelta: number[]): { x: number; y: number } {
  let wx = 0;
  let wy = 0;
  let w = 0;
  for (let i = 0; i < 4; i++) {
    const wi = Math.max(0, magDelta[i] ?? 0);
    wx += CORNER_X[i] * wi;
    wy += CORNER_Y[i] * wi;
    w += wi;
  }
  if (w < 1e-6) return { x: POSITION_TARGET.x, y: POSITION_TARGET.y }; // nothing pressed
  return { x: wx / w, y: wy / w };
}

/**
 * Thrust direction from the pad tilt during the push (reference-subtracted
 * accelerometer horizontal components).
 * NOTE: sign/axis convention must be confirmed against the real pad's
 * orientation once we see live data; this is a reasonable placeholder.
 */
export function computeAngle(tiltX: number, tiltY: number): number {
  if (Math.abs(tiltX) < 1e-3 && Math.abs(tiltY) < 1e-3) return 0;
  return Math.atan2(tiltY, tiltX) * (180 / Math.PI);
}

export type ForceZone = 'idle' | 'low' | 'optimal' | 'high';

/** Classify a force reading against the training target band. */
export function getForceZone(force: number): ForceZone {
  if (force < IDLE_FORCE_N) return 'idle';
  if (force < TARGET_FORCE.min) return 'low';
  if (force <= TARGET_FORCE.max) return 'optimal';
  return 'high';
}
