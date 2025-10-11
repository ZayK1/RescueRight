import { useState, useEffect, useRef } from 'react';
import { TrainingMetrics, generateRandomMetrics } from '../lib/mockData';

interface UseTrainingDataReturn {
  metrics: TrainingMetrics;
  duration: number;
  compressions: number;
  isActive: boolean;
  startSession: () => void;
  endSession: () => void;
}

export function useTrainingData(): UseTrainingDataReturn {
  const [metrics, setMetrics] = useState<TrainingMetrics>(generateRandomMetrics());
  const [duration, setDuration] = useState(0);
  const [compressions, setCompressions] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const compressionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    setIsActive(true);
    setDuration(0);
    setCompressions(0);
  };

  const endSession = () => {
    setIsActive(false);
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (compressionIntervalRef.current) clearInterval(compressionIntervalRef.current);
  };

  useEffect(() => {
    if (isActive) {
      // Update metrics every 500ms (simulating real-time sensor data)
      metricsIntervalRef.current = setInterval(() => {
        setMetrics(generateRandomMetrics());
      }, 500);

      // Update timer every second
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Simulate compressions (avg 1.75 per second = 105 CPM)
      compressionIntervalRef.current = setInterval(() => {
        setCompressions((prev) => prev + 1);
      }, 570);
    }

    return () => {
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (compressionIntervalRef.current) clearInterval(compressionIntervalRef.current);
    };
  }, [isActive]);

  // Auto-start session on mount
  useEffect(() => {
    startSession();
    return () => endSession();
  }, []);

  return {
    metrics,
    duration,
    compressions,
    isActive,
    startSession,
    endSession,
  };
}
