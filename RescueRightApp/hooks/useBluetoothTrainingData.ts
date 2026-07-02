import { useState, useEffect, useRef } from 'react';
import { bluetoothManager, SensorFrame } from '../lib/bluetooth';
import { EMAFilter, MedianFilter } from '../lib/calibration';
import { sessionStorage } from '../lib/sessionStorage';
import {
  magDeltaToForce,
  sumMagDelta,
  computeLocation,
  computeAngle,
  TARGET_FORCE,
  POSITION_TARGET,
  POSITION_TOLERANCE,
  IDLE_FORCE_N,
  THRUST_DETECT_N,
} from '../lib/vestCalibration';

// Number of at-rest samples averaged to establish the magnetometer baseline.
const BASELINE_FRAMES = 15;

export interface TrainingData {
  force: number; // Newtons — headline metric, derived from the pad
  compressionRate: number; // thrusts per minute
  handPosition: { x: number; y: number };
  angle: number; // degrees
  feedback: string;
  thrusts: number;
  isConnected: boolean;
  // Debugging / calibration aids (used by the Sensor Debug screen)
  rawMagDelta?: number[];
  sumMagDelta?: number;
  seq?: number;
  droppedFrames?: number;
}

/**
 * Real-time training data from the RescueRight vest.
 *
 * Pipeline (all interpretation lives in the app, see lib/vestCalibration.ts):
 *   BLE SensorFrame (magDelta[4], tilt)  ->  smoothing  ->  force / position /
 *   angle  ->  thrust detection  ->  feedback + session recording.
 *
 * Pass useMockData=true to run the whole flow off a simulated stream (dev tool
 * and demo safety net if BLE misbehaves).
 */
export function useBluetoothTrainingData(useMockData: boolean = false) {
  const [data, setData] = useState<TrainingData>({
    force: 0,
    compressionRate: 0,
    handPosition: { x: POSITION_TARGET.x, y: POSITION_TARGET.y },
    angle: 0,
    feedback: 'Waiting for vest data...',
    thrusts: 0,
    isConnected: false,
  });

  const [error, setError] = useState<string | null>(null);

  // Thrust detection + rate
  const thrustsCountRef = useRef(0);
  const lastForceRef = useRef(0);
  const thrustTimesRef = useRef<number[]>([]);
  const lastThrustTimeRef = useRef(0);

  // Frame reliability
  const lastSeqRef = useRef<number | null>(null);
  const droppedFramesRef = useRef(0);

  // App-side auto-baseline: average the first frames after connecting (pad
  // assumed at rest) and subtract thereafter. Makes the app robust regardless
  // of whether the firmware does its own baseline subtraction.
  const baselineRef = useRef<number[] | null>(null);
  const baselineBufRef = useRef<number[][]>([]);

  // Signal smoothing
  const forceFilterRef = useRef(new EMAFilter(0.4)); // responsive force
  const positionXFilterRef = useRef(new EMAFilter(0.25));
  const positionYFilterRef = useRef(new EMAFilter(0.25));
  const angleFilterRef = useRef(new MedianFilter(5)); // reject angle outliers

  useEffect(() => {
    if (useMockData) {
      return startMockDataSimulation();
    }

    if (!bluetoothManager.isConnected()) {
      setError('Vest not connected. Please connect to your RescueRight vest.');
      return;
    }

    setData((prev) => ({ ...prev, isConnected: true }));
    sessionStorage.startSession();

    const subscribe = async () => {
      try {
        await bluetoothManager.subscribeToSensorFrame((frame: SensorFrame) => {
          processFrame(frame);
        });
      } catch (err) {
        console.error('Error subscribing to vest:', err);
        setError('Failed to receive data from vest');
      }
    };

    subscribe();

    return () => {
      // BLE subscriptions are cleaned up by the library on disconnect.
    };
  }, [useMockData]);

  /**
   * Turn one raw sensor frame into displayed metrics.
   */
  const processFrame = (frame: SensorFrame) => {
    // Basic validity: all corner values must be finite.
    if (!frame.mag.every((m) => Number.isFinite(m))) return;

    // Capture baseline from the first BASELINE_FRAMES samples, then subtract.
    // If the firmware already subtracts its own baseline, this captures ~0 and
    // is a harmless no-op.
    if (baselineRef.current === null) {
      baselineBufRef.current.push(frame.mag);
      if (baselineBufRef.current.length >= BASELINE_FRAMES) {
        const buf = baselineBufRef.current;
        baselineRef.current = [0, 1, 2, 3].map(
          (i) => buf.reduce((s, f) => s + f[i], 0) / buf.length
        );
      }
      setData((prev) => ({
        ...prev,
        isConnected: true,
        feedback: 'Calibrating baseline — keep the pad still…',
      }));
      return;
    }

    const magDelta = frame.mag.map((m, i) => Math.max(0, m - baselineRef.current![i]));

    // Track dropped frames via the sequence counter (best-effort; ignores wrap).
    if (lastSeqRef.current !== null && frame.seq > lastSeqRef.current + 1) {
      droppedFramesRef.current += frame.seq - lastSeqRef.current - 1;
    }
    lastSeqRef.current = frame.seq;

    const rawForce = magDeltaToForce(magDelta);
    const force = forceFilterRef.current.filter(rawForce);

    const rawPos = computeLocation(magDelta);
    const position = {
      x: positionXFilterRef.current.filter(rawPos.x),
      y: positionYFilterRef.current.filter(rawPos.y),
    };

    const angle = angleFilterRef.current.filter(computeAngle(frame.tiltX, frame.tiltY));

    // Thrust detection on the smoothed force signal.
    if (detectThrust(force)) {
      thrustsCountRef.current += 1;
      sessionStorage.recordThrust(force, position, angle);
    }

    const rate = calculateThrustRate();
    sessionStorage.updateStats(force, rate);

    setData({
      force,
      compressionRate: rate,
      handPosition: position,
      angle,
      feedback: generateFeedback(force, position),
      thrusts: thrustsCountRef.current,
      isConnected: true,
      rawMagDelta: magDelta,
      sumMagDelta: sumMagDelta(magDelta),
      seq: frame.seq,
      droppedFrames: droppedFramesRef.current,
    });
  };

  /**
   * Detect a thrust: force rising past THRUST_DETECT_N, with a cooldown so one
   * push isn't counted multiple times.
   */
  const detectThrust = (currentForce: number): boolean => {
    const cooldown = 400; // ms between counted thrusts
    const now = Date.now();
    const timeSinceLast = now - lastThrustTimeRef.current;

    if (
      currentForce > THRUST_DETECT_N &&
      lastForceRef.current <= THRUST_DETECT_N &&
      timeSinceLast > cooldown
    ) {
      lastThrustTimeRef.current = now;
      lastForceRef.current = currentForce;
      thrustTimesRef.current.push(now);
      return true;
    }

    lastForceRef.current = currentForce;
    return false;
  };

  /** Thrusts detected in the last 60 seconds (thrusts per minute). */
  const calculateThrustRate = (): number => {
    const oneMinuteAgo = Date.now() - 60000;
    thrustTimesRef.current = thrustTimesRef.current.filter((t) => t > oneMinuteAgo);
    return thrustTimesRef.current.length;
  };

  /**
   * Real-time coaching message based on force + hand position.
   */
  const generateFeedback = (force: number, position: { x: number; y: number }): string => {
    if (force < IDLE_FORCE_N) {
      return 'Ready — perform an abdominal thrust';
    }

    if (force < TARGET_FORCE.min) {
      return `Push harder — ${force.toFixed(0)}N (target ${TARGET_FORCE.min}–${TARGET_FORCE.max}N)`;
    }

    if (force > TARGET_FORCE.max) {
      return `⚠️ Too much force — ${force.toFixed(0)}N (max ${TARGET_FORCE.max}N, injury risk)`;
    }

    // Force is good — check hand placement.
    const dx = position.x - POSITION_TARGET.x;
    const dy = position.y - POSITION_TARGET.y;
    const positionError = Math.sqrt(dx * dx + dy * dy);

    if (positionError > POSITION_TOLERANCE) {
      if (Math.abs(dx) > Math.abs(dy)) {
        return `Move hands ${dx > 0 ? 'left' : 'right'}`;
      }
      return `Move hands ${dy > 0 ? 'up' : 'down'}`;
    }

    return `✓ Good thrust — ${force.toFixed(0)}N`;
  };

  /**
   * Simulated stream for development / demo fallback. Produces force that sweeps
   * through the 40–65N band so every zone (low / optimal / high) is exercised.
   */
  const startMockDataSimulation = () => {
    sessionStorage.startSession();

    const interval = setInterval(() => {
      // Oscillate roughly 25–75 N so the gauge visibly passes through optimal.
      const force = 50 + Math.sin(Date.now() / 900) * 25 + (Math.random() - 0.5) * 6;
      const clamped = Math.max(0, force);

      const position = {
        x: POSITION_TARGET.x + Math.sin(Date.now() / 2000) * 0.06,
        y: POSITION_TARGET.y + Math.cos(Date.now() / 2000) * 0.06,
      };
      const angle = Math.sin(Date.now() / 3000) * 20;

      if (detectThrust(clamped)) {
        thrustsCountRef.current += 1;
        sessionStorage.recordThrust(clamped, position, angle);
      }
      const rate = calculateThrustRate();
      sessionStorage.updateStats(clamped, rate);

      setData({
        force: clamped,
        compressionRate: rate,
        handPosition: position,
        angle,
        feedback: generateFeedback(clamped, position),
        thrusts: thrustsCountRef.current,
        isConnected: false, // mock mode
        rawMagDelta: [clamped / 4, clamped / 4, clamped / 4, clamped / 4],
        sumMagDelta: clamped,
        seq: 0,
        droppedFrames: 0,
      });
    }, 100); // 10 Hz

    return () => clearInterval(interval);
  };

  return {
    ...data,
    error,
  };
}
