import { ChevronLeft, Share, MoreHorizontal } from 'lucide-react';

export function SessionNavigation() {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 max-w-[393px] mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        paddingTop: '59px',
        height: '119px'
      }}
    >
      {/* Status indicator */}
      <div 
        className="absolute top-2 left-1/2 transform -translate-x-1/2"
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '2px',
          background: 'var(--medical-success)',
          boxShadow: '0 0 8px rgba(5, 150, 105, 0.6)'
        }}
      />

      <div className="flex items-center justify-between px-6 h-[60px]">
        {/* Back Button */}
        <button 
          className="flex items-center justify-center transition-all duration-200 active:scale-95"
          style={{ 
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.06)',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Title Section */}
        <div className="text-center">
          <h1 
            className="text-foreground"
            style={{
              fontSize: '17px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              marginBottom: '2px'
            }}
          >
            Session Complete
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full bg-medical-success animate-pulse-glow"
            />
            <span 
              className="text-muted-foreground"
              style={{
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}
            >
              Training Validated
            </span>
          </div>
        </div>

        {/* Action Menu */}
        <button 
          className="flex items-center justify-center transition-all duration-200 active:scale-95"
          style={{ 
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.06)',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <MoreHorizontal size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}