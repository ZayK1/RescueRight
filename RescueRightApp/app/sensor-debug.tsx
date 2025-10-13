/**
 * Sensor Debug Screen
 *
 * Developer tool for testing and debugging sensor data
 * Shows raw and calibrated values in real-time
 *
 * Features:
 * - Real-time sensor value display
 * - Data quality indicators
 * - Connection status
 * - Data logging capabilities
 * - Visual graphs for trends
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useBluetoothTrainingData } from '../hooks/useBluetoothTrainingData';
import { bluetoothManager } from '../lib/bluetooth';
import { Activity, Wifi, WifiOff, Download, Trash2, CheckCircle, AlertTriangle } from 'lucide-react-native';

export default function SensorDebugScreen() {
  const [useMockData, setUseMockData] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState<any[]>([]);
  const trainingData = useBluetoothTrainingData(useMockData);

  // Connection status
  const isConnected = trainingData.isConnected || bluetoothManager.isConnected();

  // Start/stop data logging
  const toggleLogging = () => {
    if (isLogging) {
      // Stop logging
      setIsLogging(false);
    } else {
      // Start logging
      setLogData([]);
      setIsLogging(true);
    }
  };

  // Export log data as CSV
  const exportLogData = () => {
    if (logData.length === 0) {
      alert('No data to export');
      return;
    }

    // Generate CSV content
    const headers = Object.keys(logData[0]).join(',');
    const rows = logData.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    console.log('[Export] CSV data ready for export:');
    console.log(csv);

    alert(`Exported ${logData.length} samples. Check console for CSV data.`);
  };

  // Clear log data
  const clearLogData = () => {
    setLogData([]);
  };

  // Log data at regular intervals
  useEffect(() => {
    if (!isLogging) return;

    const interval = setInterval(() => {
      const logEntry = {
        timestamp: Date.now(),
        force: trainingData.compressionDepth,
        rawForce: trainingData.rawForce || 0,
        filteredForce: trainingData.filteredForce || 0,
        positionX: trainingData.handPosition.x,
        positionY: trainingData.handPosition.y,
        angle: trainingData.angle,
        compressionRate: trainingData.compressionRate,
        thrusts: trainingData.thrusts,
      };

      setLogData((prev) => [...prev, logEntry]);
    }, 100); // Log every 100ms

    return () => clearInterval(interval);
  }, [isLogging, trainingData]);

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-white mb-2">Sensor Debug</Text>
        <Text className="text-gray-400">Developer tool for sensor testing and calibration</Text>
      </View>

      {/* Connection Status */}
      <View className="bg-gray-800 rounded-lg p-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-lg font-semibold">Connection Status</Text>
          {isConnected ? (
            <Wifi size={24} color="#10b981" />
          ) : (
            <WifiOff size={24} color="#ef4444" />
          )}
        </View>

        <View className="flex-row items-center mb-2">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <Text className="text-white">
            {isConnected ? 'Connected to vest' : 'Not connected'}
          </Text>
        </View>

        <View className="flex-row items-center mt-4">
          <Text className="text-gray-400 mr-3">Use Mock Data:</Text>
          <Switch
            value={useMockData}
            onValueChange={setUseMockData}
            trackColor={{ false: '#374151', true: '#10b981' }}
            thumbColor={useMockData ? '#fff' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Real-time Sensor Values */}
      <View className="bg-gray-800 rounded-lg p-4 mb-4">
        <Text className="text-white text-lg font-semibold mb-3">Real-time Sensor Data</Text>

        {/* Force */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400">Force</Text>
            <Text className="text-white font-mono">{trainingData.compressionDepth.toFixed(1)} N</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <View
              className="bg-blue-500 h-full"
              style={{ width: `${Math.min((trainingData.compressionDepth / 200) * 100, 100)}%` }}
            />
          </View>
          {trainingData.rawForce !== undefined && (
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-gray-500">Raw: {trainingData.rawForce.toFixed(1)} N</Text>
              <Text className="text-xs text-gray-500">
                Filtered: {trainingData.filteredForce?.toFixed(1)} N
              </Text>
            </View>
          )}
        </View>

        {/* Compression Depth */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400">Compression Depth</Text>
            <Text className="text-white font-mono">
              {(trainingData.compressionDepth * 0.05).toFixed(1)} cm
            </Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <View
              className="bg-green-500 h-full"
              style={{
                width: `${Math.min(((trainingData.compressionDepth * 0.05) / 6) * 100, 100)}%`,
              }}
            />
          </View>
        </View>

        {/* Position */}
        <View className="mb-3">
          <Text className="text-gray-400 mb-2">Hand Position</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-500">X</Text>
                <Text className="text-xs text-white font-mono">
                  {trainingData.handPosition.x.toFixed(3)}
                </Text>
              </View>
              <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
                <View
                  className="bg-purple-500 h-full"
                  style={{ width: `${trainingData.handPosition.x * 100}%` }}
                />
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-500">Y</Text>
                <Text className="text-xs text-white font-mono">
                  {trainingData.handPosition.y.toFixed(3)}
                </Text>
              </View>
              <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
                <View
                  className="bg-purple-500 h-full"
                  style={{ width: `${trainingData.handPosition.y * 100}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Angle */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400">Angle</Text>
            <Text className="text-white font-mono">{trainingData.angle.toFixed(1)}°</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <View
              className="bg-yellow-500 h-full"
              style={{
                width: `${((trainingData.angle + 180) / 360) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Compression Rate */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400">Compression Rate</Text>
            <Text className="text-white font-mono">{trainingData.compressionRate} /min</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <View
              className="bg-orange-500 h-full"
              style={{
                width: `${Math.min((trainingData.compressionRate / 120) * 100, 100)}%`,
              }}
            />
          </View>
        </View>

        {/* Thrusts */}
        <View className="flex-row justify-between">
          <Text className="text-gray-400">Total Thrusts</Text>
          <Text className="text-white font-mono text-2xl">{trainingData.thrusts}</Text>
        </View>
      </View>

      {/* Data Quality */}
      {trainingData.dataQuality && (
        <View className="bg-gray-800 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-semibold">Data Quality</Text>
            {trainingData.dataQuality.isValid ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <AlertTriangle size={24} color="#f59e0b" />
            )}
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Confidence</Text>
            <Text className="text-white font-mono">
              {(trainingData.dataQuality.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View className="bg-gray-700 h-2 rounded-full overflow-hidden mb-3">
            <View
              className={`h-full ${
                trainingData.dataQuality.confidence > 0.8
                  ? 'bg-green-500'
                  : trainingData.dataQuality.confidence > 0.6
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${trainingData.dataQuality.confidence * 100}%` }}
            />
          </View>

          {trainingData.dataQuality.issues.length > 0 && (
            <View>
              <Text className="text-yellow-400 text-sm mb-2">Issues Detected:</Text>
              {trainingData.dataQuality.issues.map((issue, idx) => (
                <Text key={idx} className="text-gray-400 text-xs ml-2 mb-1">
                  • {issue}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Feedback */}
      <View className="bg-gray-800 rounded-lg p-4 mb-4">
        <Text className="text-white text-lg font-semibold mb-2">Current Feedback</Text>
        <Text className="text-gray-300">{trainingData.feedback}</Text>
      </View>

      {/* Data Logging Controls */}
      <View className="bg-gray-800 rounded-lg p-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-lg font-semibold">Data Logging</Text>
          <Activity size={24} color={isLogging ? '#10b981' : '#6b7280'} />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-400">Status:</Text>
          <Text className={`font-semibold ${isLogging ? 'text-green-400' : 'text-gray-400'}`}>
            {isLogging ? 'Recording...' : 'Stopped'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400">Samples Logged:</Text>
          <Text className="text-white font-mono text-lg">{logData.length}</Text>
        </View>

        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={toggleLogging}
            className={`flex-1 mr-2 p-3 rounded-lg ${
              isLogging ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            <Text className="text-white text-center font-semibold">
              {isLogging ? 'Stop Logging' : 'Start Logging'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={exportLogData}
            disabled={logData.length === 0}
            className={`p-3 rounded-lg ${
              logData.length > 0 ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <Download size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearLogData}
            disabled={logData.length === 0}
            className={`ml-2 p-3 rounded-lg ${
              logData.length > 0 ? 'bg-gray-700' : 'bg-gray-700 opacity-50'
            }`}
          >
            <Trash2 size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Developer Notes */}
      <View className="bg-gray-800 rounded-lg p-4 mb-6">
        <Text className="text-white text-lg font-semibold mb-2">Developer Notes</Text>
        <Text className="text-gray-400 text-sm mb-2">
          • Use "Start Logging" to record sensor data for analysis
        </Text>
        <Text className="text-gray-400 text-sm mb-2">
          • Export button copies CSV data to console (check logs)
        </Text>
        <Text className="text-gray-400 text-sm mb-2">
          • Mock data simulates sensor readings for testing without hardware
        </Text>
        <Text className="text-gray-400 text-sm">
          • Data quality indicators help diagnose sensor issues
        </Text>
      </View>
    </ScrollView>
  );
}
