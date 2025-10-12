import { useState, useEffect, useRef } from 'react';
import { bluetoothManager, SensorData } from '../lib/bluetooth';

export interface TrainingData {
  compressionDepth: number;
  compressionRate: number;
  handPosition: { x: number; y: number };
  angle: number;
  feedback: string;
  thrusts: number;
  isConnected: boolean;
}

/**
 * Custom hook to manage real-time training data from Bluetooth vest
 * Falls back to mock data if not connected
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

    // Subscribe to all sensor data
    const subscribeToSensors = async () => {
      try {
        await bluetoothManager.subscribeToAllSensors((sensorData: Partial<SensorData>) => {
          setData((prev) => {
            const updated = { ...prev };

            // Update force/compression depth
            if (sensorData.force !== undefined) {
              updated.compressionDepth = sensorData.force;

              // Detect thrust (force spike above threshold)
              if (detectThrust(sensorData.force)) {
                thrustsCountRef.current += 1;
                updated.thrusts = thrustsCountRef.current;
              }

              // Calculate compression rate
              updated.compressionRate = calculateCompressionRate();

              // Update feedback
              updated.feedback = generateFeedback(
                sensorData.force,
                prev.handPosition,
                prev.angle
              );
            }

            // Update hand position
            if (sensorData.position) {
              updated.handPosition = sensorData.position;
            }

            // Update angle
            if (sensorData.angle !== undefined) {
              updated.angle = sensorData.angle;
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
    const threshold = 60; // Minimum force in Newtons
    const cooldown = 500; // Minimum time between thrusts (ms)

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
    const targetForce = { min: 80, max: 120 };
    const targetPosition = { x: 0.5, y: 0.45 };
    const targetAngle = 0;

    // Check force
    if (force < targetForce.min) {
      return 'Increase pressure - current force too low';
    }
    if (force > targetForce.max) {
      return '⚠️ Reduce pressure - risk of injury!';
    }

    // Check position
    const positionError = Math.sqrt(
      Math.pow(position.x - targetPosition.x, 2) + Math.pow(position.y - targetPosition.y, 2)
    );

    if (positionError > 0.1) {
      const xOffset = (position.x - targetPosition.x) * 100;
      const yOffset = (position.y - targetPosition.y) * 100;

      if (Math.abs(xOffset) > Math.abs(yOffset)) {
        return `Move hands ${Math.abs(xOffset).toFixed(0)}cm ${xOffset > 0 ? 'left' : 'right'}`;
      } else {
        return `Move hands ${Math.abs(yOffset).toFixed(0)}cm ${yOffset > 0 ? 'down' : 'up'}`;
      }
    }

    // Check angle
    if (Math.abs(angle - targetAngle) > 15) {
      return `Adjust angle - ${angle > 0 ? 'lean back' : 'lean forward'} slightly`;
    }

    return '✓ Perfect technique! Maintain this position and pressure.';
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
