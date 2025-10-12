import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { decode as base64Decode } from 'base-64';

// ESP32 Service and Characteristic UUIDs
// These should match your ESP32 firmware configuration
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_FORCE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const CHAR_POSITION_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const CHAR_ANGLE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';

export interface SensorData {
  force: number;
  position: { x: number; y: number };
  angle: number;
  timestamp: number;
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
   * Scan for RescueRight smart vest devices
   * @param onDeviceFound Callback when a device is discovered
   * @param durationMs Scan duration in milliseconds (default: 10 seconds)
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

        // Filter for RescueRight vests and avoid duplicates
        if (device?.name?.startsWith('RescueRight') && !discoveredDevices.has(device.id)) {
          discoveredDevices.add(device.id);
          console.log('Found device:', device.name, 'RSSI:', device.rssi);
          onDeviceFound(device);
        }
      });

      // Auto-stop scan after duration
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
   * @param deviceId The device ID to connect to
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

      // Setup disconnect listener
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
   * Subscribe to force sensor data
   * @param callback Function to call with new force readings
   */
  async subscribeToForce(callback: (force: number) => void): Promise<void> {
    if (!this.device) {
      console.error('No device connected');
      return;
    }

    try {
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_FORCE_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Force monitoring error:', error);
            return;
          }

          if (characteristic?.value) {
            const force = this.decodeFloat(characteristic.value);
            callback(force);
          }
        }
      );
      console.log('Subscribed to force sensor');
    } catch (error) {
      console.error('Error subscribing to force:', error);
    }
  }

  /**
   * Subscribe to position sensor data
   * @param callback Function to call with new position readings (x, y normalized 0-1)
   */
  async subscribeToPosition(callback: (x: number, y: number) => void): Promise<void> {
    if (!this.device) {
      console.error('No device connected');
      return;
    }

    try {
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_POSITION_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Position monitoring error:', error);
            return;
          }

          if (characteristic?.value) {
            const [x, y] = this.decodePosition(characteristic.value);
            callback(x, y);
          }
        }
      );
      console.log('Subscribed to position sensor');
    } catch (error) {
      console.error('Error subscribing to position:', error);
    }
  }

  /**
   * Subscribe to angle sensor data
   * @param callback Function to call with new angle readings
   */
  async subscribeToAngle(callback: (angle: number) => void): Promise<void> {
    if (!this.device) {
      console.error('No device connected');
      return;
    }

    try {
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_ANGLE_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Angle monitoring error:', error);
            return;
          }

          if (characteristic?.value) {
            const angle = this.decodeFloat(characteristic.value);
            callback(angle);
          }
        }
      );
      console.log('Subscribed to angle sensor');
    } catch (error) {
      console.error('Error subscribing to angle:', error);
    }
  }

  /**
   * Subscribe to all sensor data at once
   * @param callback Function to call with complete sensor data
   */
  async subscribeToAllSensors(callback: (data: Partial<SensorData>) => void): Promise<void> {
    const sensorData: Partial<SensorData> = {};

    await this.subscribeToForce((force) => {
      sensorData.force = force;
      sensorData.timestamp = Date.now();
      callback({ ...sensorData });
    });

    await this.subscribeToPosition((x, y) => {
      sensorData.position = { x, y };
      sensorData.timestamp = Date.now();
      callback({ ...sensorData });
    });

    await this.subscribeToAngle((angle) => {
      sensorData.angle = angle;
      sensorData.timestamp = Date.now();
      callback({ ...sensorData });
    });
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
   * Decode base64 encoded float value
   */
  private decodeFloat(base64: string): number {
    try {
      const decoded = base64Decode(base64);
      const bytes = new Uint8Array(decoded.split('').map((c) => c.charCodeAt(0)));
      const view = new DataView(bytes.buffer);
      return view.getFloat32(0, true); // true = little-endian
    } catch (error) {
      console.error('Error decoding float:', error);
      return 0;
    }
  }

  /**
   * Decode base64 encoded position (2 floats: x, y)
   */
  private decodePosition(base64: string): [number, number] {
    try {
      const decoded = base64Decode(base64);
      const bytes = new Uint8Array(decoded.split('').map((c) => c.charCodeAt(0)));
      const view = new DataView(bytes.buffer);
      const x = view.getFloat32(0, true);
      const y = view.getFloat32(4, true);
      return [x, y];
    } catch (error) {
      console.error('Error decoding position:', error);
      return [0, 0];
    }
  }
}

// Singleton instance
export const bluetoothManager = new BluetoothManager();
