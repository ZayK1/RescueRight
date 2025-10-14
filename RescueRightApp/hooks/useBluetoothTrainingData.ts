import { useState, useEffect, useRef } from 'react';
import { bluetoothManager, SensorData } from '../lib/bluetooth';
import {
  EMAFilter,
  MedianFilter,
  DataQuality,
} from '../lib/calibration';
import { sessionStorage } from '../lib/sessionStorage';

export interface TrainingData {
  compressionDepth: number;
  compressionRate: number;
  handPosition: { x: number; y: number };
  angle: number;
  feedback: string;
  thrusts: number;
  isConnected: boolean;
  dataQuality?: DataQuality; // Added quality metrics
  rawForce?: number; // For debugging
  filteredForce?: number; // For debugging
}

/**
 * Custom hook to manage real-time training data from Bluetooth vest
 * Falls back to mock data if not connected
 *
 * Now includes:
 * - Data validation and quality assessment
 * - Noise filtering (EMA + Median filters)
 * - Diagnostic logging
 * - Calibration integration
 */
export function useBluetoothTrainingData(useMockData: boolean = false) {
  const [data, setData] = useState<TrainingData>({
    compressionDepth: 0,
    compressionRate: 0,
    handPosition: { x: 0.5, y: 0.45 },
    angle: 0,
    feedback: 'Waiting for vest data...',
    thrusts: 0,
    isConnected: false,
  });

  const [error, setError] = useState<string | null>(null);
  const thrustsCountRef = useRef(0);
  const lastForceRef = useRef(0);
  const forceHistoryRef = useRef<number[]>([]);
  const lastThrustTimeRef = useRef(0);

  // Data filtering
  const forceFilterRef = useRef(new EMAFilter(0.3)); // Smooth force readings
  const positionXFilterRef = useRef(new EMAFilter(0.2)); // Smooth position
  const positionYFilterRef = useRef(new EMAFilter(0.2));
  const angleFilterRef = useRef(new MedianFilter(5)); // Remove angle outliers

  // Data validation
  const invalidDataCountRef = useRef(0);
  const totalDataCountRef = useRef(0);

  useEffect(() => {
    if (useMockData) {
      // Use mock data simulation
      return startMockDataSimulation();
    }

    // Real Bluetooth data
    if (!bluetoothManager.isConnected()) {
      setError('Vest not connected. Please connect to your RescueRight vest.');
      return;
    }

    setData((prev) => ({ ...prev, isConnected: true }));

    // Start session tracking
    sessionStorage.startSession();

    // Subscribe to all sensor data
    const subscribeToSensors = async () => {
      try {
        await bluetoothManager.subscribeToAllSensors((sensorData: Partial<SensorData>) => {
          totalDataCountRef.current += 1;

          setData((prev) => {
            const updated = { ...prev };

            // === DATA VALIDATION ===
            const rawForce = sensorData.force ?? 0;
            const rawPosition = sensorData.position ?? prev.handPosition;
            const rawAngle = sensorData.angle ?? prev.angle;

            // Validate data ranges
            const isValidForce = rawForce >= 0 && rawForce <= 500; // Max 500N
            const isValidPosition =
              rawPosition.x >= 0 &&
              rawPosition.x <= 1 &&
              rawPosition.y >= 0 &&
              rawPosition.y <= 1;
            const isValidAngle = Math.abs(rawAngle) <= 180;

            if (!isValidForce || !isValidPosition || !isValidAngle) {
              invalidDataCountRef.current += 1;

              // Log validation failures (throttled to every 10th failure)
              if (invalidDataCountRef.current % 10 === 0) {
                console.warn('[Data Validation] Invalid data detected:', {
                  force: rawForce,
                  position: rawPosition,
                  angle: rawAngle,
                  validForce: isValidForce,
                  validPosition: isValidPosition,
                  validAngle: isValidAngle,
                  failureRate: (invalidDataCountRef.current / totalDataCountRef.current).toFixed(2),
                });
              }

              // Skip processing invalid data
              return prev;
            }

            // === DATA FILTERING ===
            const filteredForce = forceFilterRef.current.filter(rawForce);
            const filteredPositionX = positionXFilterRef.current.filter(rawPosition.x);
            const filteredPositionY = positionYFilterRef.current.filter(rawPosition.y);
            const filteredAngle = angleFilterRef.current.filter(rawAngle);

            // === UPDATE STATE ===
            if (sensorData.force !== undefined) {
              updated.compressionDepth = filteredForce;
              updated.rawForce = rawForce; // For debugging
              updated.filteredForce = filteredForce; // For debugging

              // Detect thrust (force spike above threshold)
              if (detectThrust(filteredForce)) {
                thrustsCountRef.current += 1;
                updated.thrusts = thrustsCountRef.current;

                // Record thrust in session storage
                sessionStorage.recordThrust(
                  filteredForce,
                  { x: filteredPositionX, y: filteredPositionY },
                  filteredAngle
                );
              }

              // Calculate compression rate
              updated.compressionRate = calculateCompressionRate();

              // Update session stats
              sessionStorage.updateStats(filteredForce, updated.compressionRate);

              // Update feedback
              updated.feedback = generateFeedback(
                filteredForce,
                { x: filteredPositionX, y: filteredPositionY },
                filteredAngle
              );
            }

            // Update hand position
            if (sensorData.position) {
              updated.handPosition = {
                x: filteredPositionX,
                y: filteredPositionY,
              };
            }

            // Update angle
            if (sensorData.angle !== undefined) {
              updated.angle = filteredAngle;
            }

            // === DIAGNOSTIC LOGGING (every 50 samples) ===
            if (totalDataCountRef.current % 50 === 0) {
              console.log('[Sensor Data]', {
                sampleCount: totalDataCountRef.current,
                invalidCount: invalidDataCountRef.current,
                dataQualityRate: (
                  ((totalDataCountRef.current - invalidDataCountRef.current) /
                    totalDataCountRef.current) *
                  100
                ).toFixed(1) + '%',
                currentForce: filteredForce.toFixed(1),
                currentPosition: {
                  x: filteredPositionX.toFixed(3),
                  y: filteredPositionY.toFixed(3),
                },
                currentAngle: filteredAngle.toFixed(1),
              });
            }

            return updated;
          });
        });
      } catch (err) {
        console.error('Error subscribing to sensors:', err);
        setError('Failed to receive data from vest');
      }
    };

    subscribeToSensors();

    // Cleanup
    return () => {
      // Subscriptions are managed by BLE library
    };
  }, [useMockData]);

  /**
   * Detect if a thrust occurred based on force spike
   */
  const detectThrust = (currentForce: number): boolean => {
    const threshold = 10; // Minimum force in Newtons (lowered for calibration)
    const cooldown = 400; // Minimum time between thrusts (ms)

    const now = Date.now();
    const timeSinceLastThrust = now - lastThrustTimeRef.current;

    // Check for force spike above threshold with cooldown
    if (
      currentForce > threshold &&
      lastForceRef.current < threshold &&
      timeSinceLastThrust > cooldown
    ) {
      lastThrustTimeRef.current = now;
      lastForceRef.current = currentForce;
      forceHistoryRef.current.push(now); // Track thrust time
      console.log(`[Thrust Detected] Force: ${currentForce}N at ${new Date(now).toISOString()}`);
      return true;
    }

    lastForceRef.current = currentForce;
    return false;
  };

  /**
   * Calculate thrust rate (thrusts per minute for Heimlich maneuver)
   */
  const calculateCompressionRate = (): number => {
    const history = forceHistoryRef.current;
    if (history.length < 2) return 0;

    // Count thrust peaks in the last 60 seconds
    const oneMinuteAgo = Date.now() - 60000;
    const recentThrusts = history.filter((timestamp) => timestamp > oneMinuteAgo);

    return recentThrusts.length;
  };

  /**
   * Generate real-time feedback based on sensor data
   */
  const generateFeedback = (
    force: number,
    position: { x: number; y: number },
    angle: number
  ): string => {
    // Adjusted thresholds for current calibration
    const targetForce = { min: 20, max: 60 };
    const targetPosition = { x: 0.5, y: 0.45 };

    // No force - waiting for thrust
    if (force < 5) {
      return 'Ready to practice - Apply thrust to begin';
    }

    // Force too low
    if (force < targetForce.min) {
      return `Increase pressure - Current: ${force.toFixed(0)}N (Target: ${targetForce.min}-${targetForce.max}N)`;
    }

    // Force too high
    if (force > targetForce.max) {
      return `⚠️ Reduce pressure - Current: ${force.toFixed(0)}N (Max: ${targetForce.max}N)`;
    }

    // Check position (more lenient for real-world use)
    const positionError = Math.sqrt(
      Math.pow(position.x - targetPosition.x, 2) + Math.pow(position.y - targetPosition.y, 2)
    );

    if (positionError > 0.15) {
      const xOffset = (position.x - targetPosition.x);
      const yOffset = (position.y - targetPosition.y);

      if (Math.abs(xOffset) > Math.abs(yOffset)) {
        const direction = xOffset > 0 ? 'left' : 'right';
        const cm = Math.abs(xOffset * 20).toFixed(0); // Scale to approximate cm
        return `Move hands ${cm}cm ${direction}`;
      } else {
        const direction = yOffset > 0 ? 'up' : 'down';
        const cm = Math.abs(yOffset * 20).toFixed(0);
        return `Move hands ${cm}cm ${direction}`;
      }
    }

    // Good thrust!
    return `✓ Good thrust! Force: ${force.toFixed(0)}N - Keep going!`;
  };

  /**
   * Simulate mock data for testing without hardware
   */
  const startMockDataSimulation = () => {
    const interval = setInterval(() => {
      setData((prev) => {
        // Simulate force fluctuations
        const newForce = 80 + Math.sin(Date.now() / 1000) * 30 + (Math.random() - 0.5) * 10;

        // Detect thrusts
        let newThrusts = prev.thrusts;
        if (detectThrust(newForce)) {
          newThrusts += 1;
        }

        // Simulate position drift
        const newPosition = {
          x: 0.5 + Math.sin(Date.now() / 2000) * 0.08,
          y: 0.45 + Math.cos(Date.now() / 2000) * 0.08,
        };

        // Simulate angle variations
        const newAngle = Math.sin(Date.now() / 3000) * 20;

        return {
          compressionDepth: Math.max(0, newForce),
          compressionRate: 100 + Math.floor(Math.random() * 20),
          handPosition: newPosition,
          angle: newAngle,
          feedback: generateFeedback(newForce, newPosition, newAngle),
          thrusts: newThrusts,
          isConnected: false, // Mock mode
        };
      });
    }, 200); // Update every 200ms

    return () => clearInterval(interval);
  };

  return {
    ...data,
    error,
  };
}
