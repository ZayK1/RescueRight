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
  compressionDepth: number; // Force in Newtons for Heimlich thrusts
  compressionRate: number; // Thrusts per minute
  handPosition: 'correct' | 'too-high' | 'too-low' | 'too-left' | 'too-right';
  recoilComplete: boolean; // Complete release between thrusts
  timestamp: number;
}

export interface SessionSummary {
  duration: number; // seconds
  totalCompressions: number; // Total abdominal thrusts
  averageDepth: number; // Average force (N)
  averageRate: number; // Thrusts per minute
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

// Mock real-time training data for Heimlich maneuver
export const mockTrainingData: TrainingMetrics = {
  compressionDepth: 55, // Target: 40-65N for abdominal thrusts (see vestCalibration)
  compressionRate: 8, // thrusts per minute (deliberate Heimlich thrusts)
  handPosition: 'correct',
  recoilComplete: true,
  timestamp: Date.now(),
};

// Mock session summary for Analytics screen
export const mockSessionSummary: SessionSummary = {
  duration: 125, // 2 minutes 5 seconds - typical for clearing airway
  totalCompressions: 218, // Total abdominal thrusts
  averageDepth: 98, // Average force in Newtons
  averageRate: 105, // Thrusts per minute
  correctTechnique: 91, // percentage of correct technique
  score: 91, // Overall score
};

// Simulate real-time sensor updates for Heimlich maneuver
export function generateRandomMetrics(): TrainingMetrics {
  const force = 35 + Math.random() * 35; // 35-70N (spans the 40-65N target band)
  const rate = 6 + Math.random() * 6; // 6-12 deliberate thrusts per minute

  let handPosition: 'correct' | 'too-high' | 'too-low' | 'too-left' | 'too-right';
  const rand = Math.random();
  if (rand > 0.8) handPosition = 'too-high'; // Above ribcage
  else if (rand > 0.7) handPosition = 'too-low'; // Below navel
  else if (rand > 0.6) handPosition = 'too-left'; // Left of center
  else if (rand > 0.5) handPosition = 'too-right'; // Right of center
  else handPosition = 'correct'; // Just above navel, below ribcage

  return {
    compressionDepth: Math.round(force),
    compressionRate: Math.round(rate),
    handPosition,
    recoilComplete: Math.random() > 0.2,
    timestamp: Date.now(),
  };
}
