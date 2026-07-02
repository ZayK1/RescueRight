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
 *   BLE SensorFrame (mag[4], tilt)  ->  app-side baseline  ->  smoothing  ->
 *   force / position / angle  ->  per-thrust peak detection  ->  feedback +
 *   session recording.
 *
 * Pass useMockData=true to run the whole flow off a simulated Heimlich
 * sequence (dev tool and demo safety net if BLE misbehaves).
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

  // Per-thrust peak tracking. A real Heimlich thrust is a short pulse: force
  // rises past THRUST_DETECT_N, peaks, then releases. We record the thrust at
  // RELEASE, with its true PEAK force — not the value at threshold crossing.
  const inThrustRef = useRef(false);
  const peakForceRef = useRef(0);
  const peakPositionRef = useRef({ x: POSITION_TARGET.x, y: POSITION_TARGET.y });
  const peakAngleRef = useRef(0);
  const thrustsCountRef = useRef(0);
  const thrustTimesRef = useRef<number[]>([]);

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

    const force = forceFilterRef.current.filter(magDeltaToForce(magDelta));

    const rawPos = computeLocation(magDelta);
    const position = {
      x: positionXFilterRef.current.filter(rawPos.x),
      y: positionYFilterRef.current.filter(rawPos.y),
    };

    const angle = angleFilterRef.current.filter(computeAngle(frame.tiltX, frame.tiltY));

    registerSample(force, position, angle);

    setData({
      force,
      compressionRate: calculateThrustRate(),
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
   * Per-thrust peak detection. Tracks a thrust from the moment force rises
   * past THRUST_DETECT_N until it releases below IDLE_FORCE_N, then records
   * the thrust with its peak force / position / angle.
   */
  const registerSample = (force: number, position: { x: number; y: number }, angle: number) => {
    if (!inThrustRef.current) {
      if (force > THRUST_DETECT_N) {
        inThrustRef.current = true;
        peakForceRef.current = force;
        peakPositionRef.current = position;
        peakAngleRef.current = angle;
      }
      return;
    }

    // Inside a thrust — keep tracking the peak.
    if (force > peakForceRef.current) {
      peakForceRef.current = force;
      peakPositionRef.current = position;
      peakAngleRef.current = angle;
    }

    // Release detected -> the thrust is complete, record it.
    if (force < IDLE_FORCE_N) {
      inThrustRef.current = false;
      thrustsCountRef.current += 1;
      thrustTimesRef.current.push(Date.now());
      sessionStorage.recordThrust(
        peakForceRef.current,
        peakPositionRef.current,
        peakAngleRef.current
      );
      sessionStorage.updateStats(peakForceRef.current, calculateThrustRate());
    }
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
   * Simulated Heimlich rescue for the self-test / demo.
   *
   * A real Heimlich is NOT a continuous push: it's a series of discrete
   * thrusts — a sharp inward-and-upward pulse (~0.4s), full release, a short
   * gap, then the next thrust — repeated until the foreign body is expelled.
   * This simulates exactly that: 6–8 successive thrusts (mostly in the
   * 40–65N band, a couple deliberately low/high so every feedback state is
   * shown), then the object is expelled and the session invites you to view
   * the results.
   */
  const startMockDataSimulation = () => {
    sessionStorage.startSession();

    const TICK_MS = 50; // 20 Hz, same as the real pad
    const THRUST_MS = 400; // one pulse: ramp ~30%, brief peak, release
    const totalThrusts = 6 + Math.floor(Math.random() * 3); // until "expelled"

    let phase: 'gap' | 'thrust' = 'gap';
    let phaseStart = Date.now();
    let gapMs = 1000; // settle-in before the first thrust
    let peakN = 0;
    let thrustPos = { ...POSITION_TARGET };
    let completed = 0;
    let expelled = false;

    // Plan the next thrust: mostly in-band, sometimes low or high so the demo
    // exercises every coaching state.
    const planThrust = (index: number) => {
      if (index === 1) {
        peakN = 30 + Math.random() * 6; // early attempt: too weak
      } else if (index === totalThrusts - 1) {
        peakN = TARGET_FORCE.max + 8 + Math.random() * 8; // one overshoot
      } else {
        peakN = TARGET_FORCE.min + 4 + Math.random() * (TARGET_FORCE.max - TARGET_FORCE.min - 8);
      }
      thrustPos = {
        x: POSITION_TARGET.x + (Math.random() - 0.5) * 0.16,
        y: POSITION_TARGET.y + (Math.random() - 0.5) * 0.16,
      };
      gapMs = 1100 + Math.random() * 700; // distinct, separate thrusts
    };
    planThrust(0);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - phaseStart;
      let force = 0;

      if (!expelled) {
        if (phase === 'gap') {
          if (elapsed >= gapMs) {
            phase = 'thrust';
            phaseStart = now;
          }
        } else {
          if (elapsed >= THRUST_MS) {
            completed += 1;
            if (completed >= totalThrusts) {
              expelled = true;
            } else {
              planThrust(completed);
            }
            phase = 'gap';
            phaseStart = now;
          } else {
            // Pulse envelope: sharp rise, brief peak, release to zero.
            const t = elapsed / THRUST_MS;
            const envelope = t < 0.3 ? t / 0.3 : t < 0.5 ? 1 : (1 - t) / 0.5;
            force = Math.max(0, peakN * envelope + (Math.random() - 0.5) * 2);
          }
        }
      }

      const position =
        force > IDLE_FORCE_N ? thrustPos : { ...POSITION_TARGET };
      const angle = force > IDLE_FORCE_N ? -42 + (Math.random() - 0.5) * 10 : 0;

      registerSample(force, position, angle);

      setData({
        force,
        compressionRate: calculateThrustRate(),
        handPosition: position,
        angle,
        feedback: expelled
          ? '🎉 Foreign body expelled! Tap Complete Session for your results'
          : generateFeedback(force, position),
        thrusts: thrustsCountRef.current,
        isConnected: false, // mock mode — the Demo badge reflects this
        rawMagDelta: [force / 4, force / 4, force / 4, force / 4],
        sumMagDelta: force,
        seq: 0,
        droppedFrames: 0,
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  };

  return {
    ...data,
    error,
  };
}
