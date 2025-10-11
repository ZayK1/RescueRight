/**
 * Mock Data for Development & Testing
 * Used to simulate ESP32 sensor data and Bluetooth devices
 */

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength
  isConnected: boolean;
}

export interface TrainingMetrics {
  compressionDepth: number; // mm
  compressionRate: number; // compressions per minute
  handPosition: 'correct' | 'too-high' | 'too-low';
  recoilComplete: boolean;
  timestamp: number;
}

export interface SessionSummary {
  duration: number; // seconds
  totalCompressions: number;
  averageDepth: number; // mm
  averageRate: number; // CPM
  correctTechnique: number; // percentage
  score: number; // 0-100
}

// Mock Bluetooth devices for Connect screen
export const mockDevices: BluetoothDevice[] = [
  {
    id: 'rescue-001',
    name: 'RescueRight Vest #001',
    rssi: -45,
    isConnected: false,
  },
  {
    id: 'rescue-002',
    name: 'RescueRight Vest #002',
    rssi: -67,
    isConnected: false,
  },
  {
    id: 'rescue-003',
    name: 'RescueRight Vest #003',
    rssi: -82,
    isConnected: false,
  },
];

// Mock real-time training data
export const mockTrainingData: TrainingMetrics = {
  compressionDepth: 52, // Target: 50-60mm
  compressionRate: 105, // Target: 100-120 CPM
  handPosition: 'correct',
  recoilComplete: true,
  timestamp: Date.now(),
};

// Mock session summary for Analytics screen
export const mockSessionSummary: SessionSummary = {
  duration: 180, // 3 minutes
  totalCompressions: 315,
  averageDepth: 54,
  averageRate: 105,
  correctTechnique: 87,
  score: 92,
};

// Simulate real-time sensor updates
export function generateRandomMetrics(): TrainingMetrics {
  const depth = 40 + Math.random() * 30; // 40-70mm
  const rate = 90 + Math.random() * 40; // 90-130 CPM

  let handPosition: 'correct' | 'too-high' | 'too-low';
  const rand = Math.random();
  if (rand > 0.7) handPosition = 'too-high';
  else if (rand < 0.15) handPosition = 'too-low';
  else handPosition = 'correct';

  return {
    compressionDepth: Math.round(depth),
    compressionRate: Math.round(rate),
    handPosition,
    recoilComplete: Math.random() > 0.2,
    timestamp: Date.now(),
  };
}
