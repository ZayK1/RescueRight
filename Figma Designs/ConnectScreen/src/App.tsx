import { useState } from 'react';
import { PairingNavigation } from './components/PairingNavigation';
import { VestIllustration } from './components/VestIllustration';
import { ConnectionStates } from './components/ConnectionStates';
import { ConnectingModal } from './components/ConnectingModal';
import { ManualPairing } from './components/ManualPairing';
import { HelpSection } from './components/HelpSection';
import type { Device } from './types/device';

export default function App() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleDeviceSelect = (device: Device) => {
    setIsConnecting(true);
  };

  const handleConnectionSuccess = () => {
    setIsConnecting(false);
    // In a real app, this would navigate to the next screen
    setTimeout(() => {
      alert('Connection successful! Transitioning to training screen...');
    }, 800);
  };

  const handleConnectionCancel = () => {
    setIsConnecting(false);
  };

  const handleCancel = () => {
    // In a real app, this would navigate back
    console.log('Cancel tapped');
  };

  const handleHelp = () => {
    // In a real app, this would show help modal or navigate to help
    console.log('Help tapped');
  };

  const handleManualPairing = () => {
    // In a real app, this would navigate to manual pairing screen
    console.log('Manual pairing requested');
  };

  const handleTroubleshooting = () => {
    // In a real app, this would navigate to troubleshooting guide
    console.log('Troubleshooting guide requested');
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
      }}
    >
      {/* iPhone 16 Pro frame */}
      <div 
        className="max-w-[393px] mx-auto min-h-screen relative"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 32px 64px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Navigation Header */}
        <PairingNavigation onCancel={handleCancel} onHelp={handleHelp} />
        
        {/* Main Content */}
        <div 
          className="flex flex-col min-h-screen"
          style={{ 
            paddingTop: '112px', // Navigation height + safe area
            paddingBottom: '34px' // iOS bottom safe area
          }}
        >
          {/* Hero Section - Upper portion */}
          <div className="flex-1 flex flex-col justify-center px-5 pb-8">
            <div className="flex flex-col items-center">
              {/* Vest Illustration */}
              <div className="mb-6">
                <VestIllustration />
              </div>

              {/* Title */}
              <h1 
                className="text-center mb-2"
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  letterSpacing: '-0.03em',
                  color: '#1F2937'
                }}
              >
                Connect Smart Vest
              </h1>

              {/* Subtitle */}
              <p 
                className="text-center max-w-[300px]"
                style={{
                  fontSize: '15px',
                  fontWeight: '400',
                  lineHeight: '20px',
                  color: '#6B7280'
                }}
              >
                Power on your RescueRight vest and hold nearby
              </p>
            </div>
          </div>

          {/* Connection Section - Lower portion */}
          <div className="px-5 space-y-6">
            {/* Connection States */}
            <ConnectionStates onDeviceSelect={handleDeviceSelect} />

            {/* Manual Pairing */}
            <ManualPairing onManualPairing={handleManualPairing} />

            {/* Help Section */}
            <HelpSection onTroubleshooting={handleTroubleshooting} />
          </div>
        </div>

        {/* Connecting Modal */}
        <ConnectingModal 
          isVisible={isConnecting}
          onCancel={handleConnectionCancel}
          onSuccess={handleConnectionSuccess}
        />
      </div>
    </div>
  );
}