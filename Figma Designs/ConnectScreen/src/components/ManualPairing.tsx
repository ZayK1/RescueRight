import { Search } from 'lucide-react';

interface ManualPairingProps {
  onManualPairing?: () => void;
}

export function ManualPairing({ onManualPairing }: ManualPairingProps) {
  return (
    <div className="w-full max-w-[361px] mx-auto">
      {/* Divider */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="flex-1 h-px"
          style={{ background: '#E5E7EB' }}
        />
        <span 
          style={{
            fontSize: '13px',
            fontWeight: '400',
            color: '#9CA3AF'
          }}
        >
          or
        </span>
        <div 
          className="flex-1 h-px"
          style={{ background: '#E5E7EB' }}
        />
      </div>

      {/* Manual Connect Button */}
      <button 
        onClick={onManualPairing}
        className="w-full rounded-2xl flex items-center justify-center gap-3 active:scale-[0.99] transition-all duration-150 touch-manipulation"
        style={{
          height: '56px',
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: '15px',
          fontWeight: '600',
          color: '#3B82F6'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.06)';
        }}
      >
        <Search size={20} strokeWidth={2.5} />
        <span>Enter Pairing Code Manually</span>
      </button>
    </div>
  );
}