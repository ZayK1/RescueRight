import { Gauge, Timer, Target, Activity } from 'lucide-react';

export function MetricsGrid() {
  const metrics = [
    {
      icon: Gauge,
      label: 'Average Force',
      value: '105',
      unit: 'N',
      trend: '+12%',
      status: 'Optimal',
      color: '#10B981'
    },
    {
      icon: Timer,
      label: 'Duration',
      value: '3:45',
      unit: 'min',
      trend: null,
      status: 'Target',
      color: '#3B82F6'
    },
    {
      icon: Target,
      label: 'Placement',
      value: '94%',
      unit: 'accuracy',
      trend: '+5%',
      status: 'Excellent',
      color: '#8B5CF6'
    },
    {
      icon: Activity,
      label: 'Compressions',
      value: '127',
      unit: 'total',
      trend: null,
      status: 'Complete',
      color: '#DC2626'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div
            key={index}
            className="relative rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              border: '0.5px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 4px 12px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
              padding: '20px 16px'
            }}
          >
            {/* Icon */}
            <div 
              className="mb-4 rounded-xl flex items-center justify-center"
              style={{ 
                width: '32px',
                height: '32px',
                background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}08 100%)`,
                boxShadow: `0px 2px 4px ${metric.color}10, inset 0px 1px 0px rgba(255, 255, 255, 0.6)`
              }}
            >
              <Icon 
                size={16} 
                strokeWidth={2.5}
                style={{ color: metric.color }} 
              />
            </div>

            {/* Status indicator */}
            <div 
              className="absolute top-4 right-4 rounded-full"
              style={{
                padding: '4px 8px',
                background: `linear-gradient(135deg, ${metric.color}12 0%, ${metric.color}08 100%)`,
                fontSize: '10px',
                fontWeight: '600',
                color: metric.color,
                letterSpacing: '0.01em',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {metric.status}
            </div>

            {/* Label */}
            <div 
              className="text-muted-foreground mb-3"
              style={{ 
                fontSize: '11px', 
                fontWeight: '600',
                letterSpacing: '0.005em',
                textTransform: 'uppercase'
              }}
            >
              {metric.label}
            </div>

            {/* Value section */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-foreground leading-none"
                  style={{ 
                    fontSize: '24px', 
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {metric.value}
                </span>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {metric.unit}
                </span>
              </div>

              {/* Trend indicator */}
              {metric.trend && (
                <div 
                  className="rounded-full flex items-center"
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#059669',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  {metric.trend}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}