import { Bluetooth, Info } from 'lucide-react';

export function StatusHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Safe area top */}
      <div className="h-[59px] bg-transparent" />
      
      {/* Floating navigation pill */}
      <div className="px-4 pb-4">
        <div 
          className="h-[56px] px-4 flex items-center justify-between rounded-3xl"
          style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '0.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3), 0px 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Left - Connection status */}
          <div 
            className="flex items-center gap-1.5 px-3 h-7 rounded-full"
            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
          >
            <Bluetooth size={14} className="text-green-400" />
            <span className="text-[12px] font-medium text-green-400">Connected</span>
          </div>

          {/* Center - Title */}
          <h1 
            className="text-[17px] font-semibold text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            Live Training
          </h1>

          {/* Right - Info button */}
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Info size={16} className="text-white/90" />
          </button>
        </div>
      </div>
    </div>
  );
}