import { Hand, Gauge, RefreshCw, ChevronRight } from 'lucide-react';

export function TechniqueAnalysis() {
  const analysisItems = [
    {
      icon: Hand,
      title: 'Hand Positioning',
      subtitle: 'Excellent accuracy achieved',
      grade: 'A+',
      score: 95,
      color: '#6366F1'
    },
    {
      icon: Gauge,
      title: 'Compression Depth',
      subtitle: 'Within optimal range',
      grade: 'A',
      score: 92,
      color: '#10B981'
    },
    {
      icon: RefreshCw,
      title: 'Release Technique',
      subtitle: 'Good form, room for improvement',
      grade: 'B+',
      score: 78,
      color: '#F59E0B'
    }
  ];

  return (
    <div className="space-y-3">
      {analysisItems.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <div
            key={index}
            className="rounded-xl flex items-center active:scale-[0.99] transition-transform duration-150 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              border: '0.5px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 2px 8px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
              padding: '16px'
            }}
          >
            {/* Icon */}
            <div 
              className="rounded-xl flex items-center justify-center mr-3"
              style={{ 
                width: '40px',
                height: '40px',
                background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                boxShadow: `0px 2px 4px ${item.color}12, inset 0px 1px 0px rgba(255, 255, 255, 0.6)`
              }}
            >
              <Icon 
                size={18} 
                strokeWidth={2.5}
                style={{ color: item.color }} 
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 
                  className="text-foreground"
                  style={{ 
                    fontSize: '15px', 
                    fontWeight: '600',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {item.title}
                </h4>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {item.score}%
                </span>
              </div>
              
              <p 
                className="text-muted-foreground mb-2"
                style={{ 
                  fontSize: '13px',
                  fontWeight: '500',
                  lineHeight: '1.4'
                }}
              >
                {item.subtitle}
              </p>
              
              {/* Progress bar */}
              <div 
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${item.score}%`,
                    transitionDelay: `${index * 150}ms`
                  }}
                />
              </div>
            </div>

            {/* Grade and arrow */}
            <div className="flex items-center gap-3 ml-4">
              <div 
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                  fontSize: '12px',
                  fontWeight: '700',
                  color: item.color,
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.6)'
                }}
              >
                {item.grade}
              </div>
              
              <ChevronRight 
                size={16} 
                strokeWidth={2.5}
                className="text-muted-foreground" 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}