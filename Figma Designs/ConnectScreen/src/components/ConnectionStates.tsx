import { useState, useEffect } from 'react';
import { Bluetooth, Check, ChevronRight } from 'lucide-react';
import type { Device } from '../types/device';

interface ConnectionStatesProps {
  onDeviceSelect: (device: Device) => void;
}

export function ConnectionStates({ onDeviceSelect }: ConnectionStatesProps) {
  const [currentState, setCurrentState] = useState<'scanning' | 'found'>('scanning');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [scanningDots, setScanningDots] = useState(1);

  // Demo: Transition from scanning to found state
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentState('found');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Animate scanning dots
  useEffect(() => {
    if (currentState === 'scanning') {
      const interval = setInterval(() => {
        setScanningDots(prev => prev >= 3 ? 1 : prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentState]);

  const devices: Device[] = [
    {
      id: 'vest-001',
      name: 'RescueRight Vest',
      model: 'Training Edition',
      signal: { dots: 4, total: 5, strength: 'Strong Signal', color: '#10B981' }
    },
    {
      id: 'vest-002', 
      name: 'RescueRight Vest-002',
      model: 'Training Edition',
      signal: { dots: 3, total: 5, strength: 'Moderate Signal', color: '#F59E0B' }
    }
  ];

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device.id);
    setTimeout(() => {
      onDeviceSelect(device);
    }, 300);
  };

  if (currentState === 'scanning') {
    return (
      <div className="flex flex-col items-center py-8">
        {/* Scanning Spinner */}
        <div 
          className="animate-spin rounded-full border-2 border-transparent border-t-current mb-4"
          style={{
            width: '20px',
            height: '20px',
            color: '#3B82F6'
          }}
        />
        
        {/* Scanning Text */}
        <p 
          className="text-center"
          style={{
            fontSize: '15px',
            fontWeight: '400',
            color: '#6B7280'
          }}
        >
          Searching for devices{'.'.repeat(scanningDots)}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[361px] mx-auto space-y-3">
      {devices.map((device, index) => {
        const isSelected = selectedDevice === device.id || (selectedDevice === null && index === 0);
        const isPrimary = index === 0;
        
        return (
          <div
            key={device.id}
            className="device-card rounded-2xl cursor-pointer active:scale-[0.99] transition-all duration-300"
            style={{
              height: '88px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              border: isSelected && isPrimary ? '1px solid rgba(59, 130, 246, 0.3)' : '0.5px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isSelected && isPrimary 
                ? '0px 4px 16px rgba(59, 130, 246, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.08)'
                : '0px 2px 8px rgba(0, 0, 0, 0.04)',
              padding: '20px',
              opacity: isPrimary ? 1 : 0.85,
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both'
            }}
            onClick={() => handleDeviceSelect(device)}
          >
            <div className="flex items-center h-full">
              {/* Bluetooth Icon */}
              <div 
                className="rounded-full flex items-center justify-center mr-4"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(59, 130, 246, 0.1)'
                }}
              >
                <Bluetooth size={24} style={{ color: '#3B82F6' }} />
              </div>

              {/* Device Info */}
              <div className="flex-1">
                <h3 
                  style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '2px'
                  }}
                >
                  {device.name}
                </h3>
                
                <p 
                  style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}
                >
                  {device.model}
                </p>
                
                {/* Signal Strength */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: device.signal.total }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: '4px',
                          height: '4px',
                          background: i < device.signal.dots ? device.signal.color : '#E5E7EB'
                        }}
                      />
                    ))}
                  </div>
                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      color: device.signal.color
                    }}
                  >
                    {device.signal.strength}
                  </span>
                </div>
              </div>

              {/* Selection Indicator */}
              <div className="ml-4">
                {isSelected && isPrimary ? (
                  <div 
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: '#3B82F6'
                    }}
                  >
                    <Check size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <ChevronRight size={20} style={{ color: '#C7C7CC' }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}