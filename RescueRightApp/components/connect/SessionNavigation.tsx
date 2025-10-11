import { ChevronLeft, Share } from 'lucide-react';

export function SessionNavigation() {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 max-w-[393px] mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
        paddingTop: '59px',
        height: '103px',
        boxShadow: '0px 1px 0px rgba(255, 255, 255, 0.8), 0px 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="flex items-center justify-between px-5 h-11">
        {/* Back Button */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-150 ease-out"
          style={{ 
            background: 'rgba(0, 0, 0, 0.06)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Title */}
        <h1 
          className="text-foreground"
          style={{
            fontSize: '17px',
            fontWeight: '600',
            letterSpacing: '-0.022em'
          }}
        >
          Session Complete
        </h1>

        {/* Share Button */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-150 ease-out"
          style={{ 
            background: 'rgba(0, 0, 0, 0.06)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <Share size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}