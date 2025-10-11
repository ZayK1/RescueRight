import { Hand, Gauge, RefreshCw, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export function TechniqueAnalysis() {
  const analysisItems = [
    {
      icon: Hand,
      title: 'Hand Positioning',
      subtitle: 'Optimal fist placement achieved consistently',
      score: 96,
      grade: 'A+',
      status: 'excellent',
      color: '#10b981',
      recommendation: 'Maintain current technique',
      details: 'Fist positioned above navel, below ribcage'
    },
    {
      icon: Gauge,
      title: 'Thrust Technique',
      subtitle: 'Strong upward and inward motion maintained',
      score: 94,
      grade: 'A',
      status: 'excellent',
      color: '#0ea5e9',
      recommendation: 'Excellent thrust execution',
      details: 'Quick, upward thrusts with proper force'
    },
    {
      icon: RefreshCw,
      title: 'Body Positioning',
      subtitle: 'Minor adjustment opportunity identified',
      score: 82,
      grade: 'B+',
      status: 'good',
      color: '#f59e0b',
      recommendation: 'Optimize stance alignment',
      details: 'Stand closer behind patient for better leverage'
    }
  ];

  const getStatusIcon = (status: string) => {
    return status === 'excellent' ? CheckCircle : AlertCircle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <div className="space-y-4">
      {analysisItems.map((item, index) => {
        const Icon = item.icon;
        const StatusIcon = getStatusIcon(item.status);
        
        return (
          <div
            key={index}
            className="relative overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.04)',
              padding: '20px'
            }}
          >
            {/* Background effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(ellipse at top left, ${item.color}08 0%, transparent 60%)`
              }}
            />

            <div className="relative flex items-start gap-4">
              {/* Icon section */}
              <div className="flex-shrink-0">
                <div 
                  className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                    boxShadow: `0 4px 12px ${item.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                  }}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={2.5}
                    style={{ color: item.color }} 
                  />
                </div>

                {/* Status indicator */}
                <div 
                  className="mt-2 flex items-center justify-center"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: `${getStatusColor(item.status)}15`,
                    marginLeft: '12px'
                  }}
                >
                  <StatusIcon 
                    size={12} 
                    strokeWidth={3}
                    style={{ color: getStatusColor(item.status) }}
                  />
                </div>
              </div>

              {/* Content section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 
                      className="text-foreground mb-1"
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {item.title}
                    </h4>
                    <p 
                      className="text-muted-foreground"
                      style={{ 
                        fontSize: '13px',
                        fontWeight: '500',
                        lineHeight: '1.4'
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score display */}
                    <div className="text-right">
                      <div 
                        className="leading-none mb-1"
                        style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: item.color
                        }}
                      >
                        {item.score}%
                      </div>
                      <div 
                        className="px-2 py-1 rounded-lg"
                        style={{
                          background: `${item.color}15`,
                          color: item.color,
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {item.grade}
                      </div>
                    </div>

                    <ChevronRight 
                      size={16} 
                      strokeWidth={2.5}
                      className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" 
                    />
                  </div>
                </div>
                
                {/* Progress bar */}
                <div 
                  className="mb-3 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(226, 232, 240, 0.5)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}80 100%)`,
                      width: `${item.score}%`,
                      transitionDelay: `${index * 200}ms`,
                      boxShadow: `0 0 8px ${item.color}40`
                    }}
                  />
                </div>

                {/* Details and recommendation */}
                <div className="space-y-2">
                  <div 
                    className="text-muted-foreground"
                    style={{
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    <span className="font-semibold">Details:</span> {item.details}
                  </div>
                  <div 
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: item.color
                    }}
                  >
                    ✓ {item.recommendation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}