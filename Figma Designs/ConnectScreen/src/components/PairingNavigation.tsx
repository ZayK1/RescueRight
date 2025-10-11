import { HelpCircle } from 'lucide-react';

interface PairingNavigationProps {
  onCancel?: () => void;
  onHelp?: () => void;
}

export function PairingNavigation({ onCancel, onHelp }: PairingNavigationProps) {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 max-w-[393px] mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
        paddingTop: '59px', // Dynamic Island safe area
        height: '103px' // 59px safe area + 44px nav height
      }}
    >
      <div className="flex items-center justify-between px-5 h-11">
        {/* Cancel Button */}
        <button 
          onClick={onCancel}
          className="active:scale-95 transition-transform duration-150 ease-out touch-manipulation"
          style={{ 
            color: '#3B82F6',
            fontSize: '17px',
            fontWeight: '400'
          }}
        >
          Cancel
        </button>

        {/* Empty center for clean layout */}
        <div />

        {/* Help Button */}
        <button 
          onClick={onHelp}
          className="w-11 h-11 flex items-center justify-center active:scale-95 transition-transform duration-150 ease-out touch-manipulation"
          style={{ 
            color: '#3B82F6'
          }}
        >
          <HelpCircle size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}