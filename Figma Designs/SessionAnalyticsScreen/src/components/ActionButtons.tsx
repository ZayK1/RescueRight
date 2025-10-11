import { Play, Share, BarChart3, Target, Calendar, FileText } from 'lucide-react';

export function ActionButtons() {
  return (
    <div className="space-y-6">
      {/* Primary CTA */}
      <button 
        className="w-full text-white transition-all duration-300 active:scale-[0.98] hover:shadow-2xl group relative overflow-hidden"
        style={{
          height: '56px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
          boxShadow: '0 4px 12px rgba(3, 105, 161, 0.3), 0 8px 24px rgba(3, 105, 161, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          fontSize: '17px',
          fontWeight: '600',
          letterSpacing: '-0.01em'
        }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        <div className="relative flex items-center justify-center gap-3">
          <Play size={20} strokeWidth={2.5} fill="currentColor" />
          <span>Start New Training Session</span>
        </div>
      </button>

      {/* Secondary Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className="flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:shadow-lg group"
          style={{
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)',
            fontSize: '15px',
            fontWeight: '600'
          }}
        >
          <Share size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:scale-110" />
          <span>Share</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:shadow-lg group"
          style={{
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            color: 'var(--color-foreground)',
            fontSize: '15px',
            fontWeight: '600'
          }}
        >
          <BarChart3 size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:scale-110" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Training Progress Card */}
      <div 
        className="rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.04)',
          padding: '20px'
        }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(3, 105, 161, 0.06) 0%, transparent 60%)'
          }}
        />

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div 
            className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.15) 0%, rgba(3, 105, 161, 0.08) 100%)',
              boxShadow: '0 4px 8px rgba(3, 105, 161, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            <Target size={22} strokeWidth={2.5} style={{ color: '#0369a1' }} />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 
                className="text-foreground"
                style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  letterSpacing: '-0.01em'
                }}
              >
                Weekly Training Goal
              </h4>
              <span 
                className="px-3 py-1 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.15) 0%, rgba(3, 105, 161, 0.08) 100%)',
                  color: '#0369a1',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                60%
              </span>
            </div>
            
            <p 
              className="text-muted-foreground mb-3"
              style={{ 
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              3 of 5 sessions completed this week
            </p>

            {/* Progress bar */}
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(226, 232, 240, 0.5)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  background: 'linear-gradient(90deg, #0ea5e9 0%, #0369a1 100%)',
                  width: '60%',
                  boxShadow: '0 0 8px rgba(3, 105, 161, 0.4)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:shadow-md"
          style={{
            height: '44px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            color: '#d97706',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <Calendar size={14} strokeWidth={2.5} />
          <span>Schedule</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:shadow-md"
          style={{
            height: '44px',
            borderRadius: '14px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: '#7c3aed',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <FileText size={14} strokeWidth={2.5} />
          <span>Report</span>
        </button>
      </div>
    </div>
  );
}