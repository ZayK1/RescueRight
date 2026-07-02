import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { decode as base64Decode } from 'base-64';

// ============================================================================
// RescueRight Smart Vest — BLE layer
//
// The v2 sensor pad (Feather ESP32 + PCA9548A + 5x LIS3MDL/LSM6DSOX boards)
// streams ONE notify characteristic containing a plain comma-separated text
// line per sample. Keeping it as text makes it trivial for the firmware team
// to emit and easy to inspect in a BLE scanner (nRF Connect / LightBlue).
//
// Frame format (see docs/FIRMWARE_BLE_CONTRACT.md):
//   "m0,m1,m2,m3[,tx,ty[,seq]]"
//     m0..m3 = RAW magnetometer magnitude (µT) per corner,
//              order TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT  (required)
//     tx,ty  = accel components for thrust angle                     (optional)
//     seq    = packet counter, for dropped-frame detection           (optional)
//
// The firmware sends RAW numbers — the app captures its own baseline and does
// all interpretation (force / position / angle). Minimum viable frame is just
// the 4 corner magnitudes; tilt and seq can be omitted.
// ============================================================================

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
// New single characteristic that carries the whole sensor frame as text.
const CHAR_SENSOR_FRAME_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26b0';

export interface SensorFrame {
  mag: number[]; // [TL, TR, BL, BR] RAW magnetometer magnitude, µT (app baselines)
  tiltX: number; // accel component for angle (0 if firmware omits it)
  tiltY: number;
  seq: number; // packet counter (0 if firmware omits it)
  timestamp: number; // phone receipt time (ms)
}

class BluetoothManager {
  private manager: BleManager;
  private device: Device | null = null;
  private isScanning: boolean = false;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Request necessary Bluetooth permissions (Android only)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Initialize Bluetooth and check if it's powered on
   */
  async initialize(): Promise<boolean> {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.error('Bluetooth permissions not granted');
        return false;
      }

      const state = await this.manager.state();
      if (state === State.PoweredOn) {
        console.log('Bluetooth initialized successfully');
        return true;
      }

      console.warn('Bluetooth is not powered on:', state);
      return false;
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
      return false;
    }
  }

  /**
   * Scan for RescueRight smart vest devices.
   * The firmware must advertise a name starting with "RescueRight".
   */
  async scanForDevices(
    onDeviceFound: (device: Device) => void,
    durationMs: number = 10000
  ): Promise<void> {
    if (this.isScanning) {
      console.warn('Already scanning for devices');
      return;
    }

    try {
      this.isScanning = true;
      const discoveredDevices = new Set<string>();

      console.log('Starting BLE scan...');

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.stopScan();
          return;
        }

        if (device?.name?.startsWith('RescueRight') && !discoveredDevices.has(device.id)) {
          discoveredDevices.add(device.id);
          console.log('Found device:', device.name, 'RSSI:', device.rssi);
          onDeviceFound(device);
        }
      });

      setTimeout(() => {
        this.stopScan();
      }, durationMs);
    } catch (error) {
      console.error('Error starting scan:', error);
      this.isScanning = false;
    }
  }

  /**
   * Stop scanning for devices
   */
  stopScan(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      console.log('BLE scan stopped');
    }
  }

  /**
   * Connect to a specific device
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      console.log('Connecting to device:', deviceId);

      const device = await this.manager.connectToDevice(deviceId, {
        timeout: 10000,
      });

      console.log('Connected! Discovering services...');
      await device.discoverAllServicesAndCharacteristics();

      this.device = device;
      console.log('Device ready for communication');

      device.onDisconnected((error, disconnectedDevice) => {
        console.log('Device disconnected:', disconnectedDevice?.name);
        if (error) {
          console.error('Disconnect error:', error);
        }
        this.device = null;
      });

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.device = null;
      return false;
    }
  }

  /**
   * Check if currently connected to a device
   */
  isConnected(): boolean {
    return this.device !== null;
  }

  /**
   * Get the connected device
   */
  getConnectedDevice(): Device | null {
    return this.device;
  }

  /**
   * Subscribe to the vest's sensor-frame stream.
   * Calls back with a parsed SensorFrame for every valid notification.
   */
  async subscribeToSensorFrame(callback: (frame: SensorFrame) => void): Promise<void> {
    if (!this.device) {
      console.error('No device connected');
      return;
    }

    try {
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_SENSOR_FRAME_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Sensor frame monitoring error:', error);
            return;
          }

          if (characteristic?.value) {
            const frame = this.parseSensorFrame(characteristic.value);
            if (frame) callback(frame);
          }
        }
      );
      console.log('Subscribed to sensor frame');
    } catch (error) {
      console.error('Error subscribing to sensor frame:', error);
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        console.log('Disconnecting from device...');
        await this.device.cancelConnection();
        this.device = null;
        console.log('Disconnected successfully');
      } catch (error) {
        console.error('Disconnect error:', error);
        this.device = null;
      }
    }
  }

  /**
   * Cleanup and destroy the manager
   */
  destroy(): void {
    this.stopScan();
    if (this.device) {
      this.disconnect();
    }
    this.manager.destroy();
  }

  // Helper Methods

  /**
   * Parse a base64 BLE value holding a comma-separated sensor frame:
   *   "m0,m1,m2,m3,tx,ty,seq"
   * Returns null if the line is malformed (so bad frames are simply skipped).
   */
  private parseSensorFrame(base64: string): SensorFrame | null {
    try {
      const text = base64Decode(base64).trim();
      if (!text) return null;

      const parts = text.split(',');
      // Minimum viable frame = the 4 corner magnetometer magnitudes.
      if (parts.length < 4) return null;

      const nums = parts.map((p) => parseFloat(p));
      if (nums.slice(0, 4).some((n) => Number.isNaN(n))) return null;

      // Tilt (accel) and seq are optional; default to 0 when absent.
      const tiltX = parts.length >= 6 && !Number.isNaN(nums[4]) ? nums[4] : 0;
      const tiltY = parts.length >= 6 && !Number.isNaN(nums[5]) ? nums[5] : 0;
      const seq = parts.length >= 7 && !Number.isNaN(nums[6]) ? nums[6] : 0;

      return {
        mag: [nums[0], nums[1], nums[2], nums[3]],
        tiltX,
        tiltY,
        seq,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error parsing sensor frame:', error);
      return null;
    }
  }
}

// Singleton instance
export const bluetoothManager = new BluetoothManager();
