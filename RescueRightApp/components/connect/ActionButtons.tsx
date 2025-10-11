import { Share, Activity, Target } from 'lucide-react';

export function ActionButtons() {
  return (
    <div className="space-y-4">
      {/* Primary Action */}
      <button 
        className="w-full text-white rounded-2xl active:scale-[0.99] transition-all duration-150 ease-out"
        style={{
          height: '52px',
          fontSize: '17px',
          fontWeight: '600',
          letterSpacing: '-0.022em',
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          boxShadow: '0px 2px 4px rgba(59, 130, 246, 0.3), 0px 4px 12px rgba(59, 130, 246, 0.2), 0px 8px 24px rgba(59, 130, 246, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.2)'
        }}
      >
        Start New Session
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="rounded-xl active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            height: '44px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <Share size={16} strokeWidth={2.5} />
          <span>Share</span>
        </button>
        
        <button 
          className="rounded-xl active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            height: '44px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)'
          }}
        >
          <Activity size={16} strokeWidth={2.5} />
          <span>Health</span>
        </button>
      </div>

      {/* Progress indicator */}
      <div 
        className="rounded-xl flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 2px 8px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
          padding: '16px'
        }}
      >
        <div 
          className="rounded-xl flex items-center justify-center"
          style={{ 
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
            boxShadow: '0px 2px 4px rgba(59, 130, 246, 0.12), inset 0px 1px 0px rgba(255, 255, 255, 0.6)'
          }}
        >
          <Target size={18} strokeWidth={2.5} style={{ color: '#3B82F6' }} />
        </div>
        
        <div className="flex-1">
          <p 
            className="text-foreground mb-1"
            style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              letterSpacing: '-0.01em'
            }}
          >
            Training Progress
          </p>
          <p 
            className="text-muted-foreground"
            style={{ 
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            2 of 5 sessions completed this week
          </p>
        </div>
        
        <div 
          className="rounded-lg"
          style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
            fontSize: '12px',
            fontWeight: '700',
            color: '#3B82F6',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.6)'
          }}
        >
          40%
        </div>
      </div>
    </div>
  );
}