import { useEffect, useState } from 'react';
import { Bluetooth, X } from 'lucide-react';

interface ConnectingModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ConnectingModal({ isVisible, onCancel, onSuccess }: ConnectingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onSuccess, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isVisible, onSuccess]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)'
      }}
      onClick={onCancel}
    >
      <div 
        className="rounded-3xl relative animate-modal-appear"
        style={{
          width: '300px',
          minHeight: '200px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.3), 0px 4px 16px rgba(0, 0, 0, 0.2)',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {/* Pulsing Bluetooth Icon */}
          <div 
            className="mb-6 rounded-full flex items-center justify-center animate-pulse-scale"
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
            }}
          >
            <Bluetooth size={32} style={{ color: '#3B82F6' }} />
          </div>

          {/* Connecting Text */}
          <h3 
            className="mb-4 text-center"
            style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#1F2937'
            }}
          >
            Connecting to vest...
          </h3>

          {/* Progress Bar */}
          <div 
            className="w-full mb-4 rounded-full overflow-hidden"
            style={{
              height: '4px',
              background: '#E5E7EB'
            }}
          >
            <div 
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)'
              }}
            />
          </div>

          {/* Cancel Button */}
          <button 
            onClick={onCancel}
            className="active:scale-95 transition-transform duration-150"
            style={{
              fontSize: '15px',
              fontWeight: '400',
              color: '#3B82F6'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}