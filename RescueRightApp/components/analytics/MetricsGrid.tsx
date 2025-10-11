import { Gauge, Timer, Target, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export function MetricsGrid() {
  const metrics = [
    {
      icon: Gauge,
      label: 'Thrust Force',
      value: '142',
      unit: 'N',
      target: '130-160N',
      trend: { value: '+12%', direction: 'up' },
      status: 'optimal',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      description: 'Adequate upward pressure'
    },
    {
      icon: Timer,
      label: 'Thrust Rate',
      value: '6',
      unit: 'tpm',
      target: '5-8tpm',
      trend: { value: '+1%', direction: 'up' },
      status: 'excellent',
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.08)',
      description: 'Optimal thrust frequency'
    },
    {
      icon: Target,
      label: 'Thrust Angle',
      value: '78',
      unit: '°',
      target: '75-85°',
      trend: { value: 'stable', direction: 'stable' },
      status: 'optimal',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      description: 'Correct upward trajectory'
    },
    {
      icon: Activity,
      label: 'Hand Position',
      value: '96',
      unit: '%',
      target: '>90%',
      trend: { value: '+4%', direction: 'up' },
      status: 'excellent',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      description: 'Proper fist placement'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'optimal': return '#0ea5e9';
      case 'good': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'rgba(16, 185, 129, 0.1)';
      case 'optimal': return 'rgba(14, 165, 233, 0.1)';
      case 'good': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend.direction === 'up' ? TrendingUp : 
                         metric.trend.direction === 'down' ? TrendingDown : null;
        
        return (
          <div
            key={index}
            className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.04)',
              padding: '20px 16px',
              cursor: 'pointer'
            }}
          >
            {/* Background glow */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(ellipse at top left, ${metric.bgColor} 0%, transparent 60%)`
              }}
            />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-4">
              {/* Icon */}
              <div 
                className="flex items-center justify-center transition-transform duration-300 hover:scale-110"
                style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}08 100%)`,
                  boxShadow: `0 4px 8px ${metric.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                }}
              >
                <Icon 
                  size={20} 
                  strokeWidth={2.5}
                  style={{ color: metric.color }} 
                />
              </div>

              {/* Status badge */}
              <div 
                className="px-2 py-1 rounded-lg"
                style={{
                  background: getStatusBg(metric.status),
                  color: getStatusColor(metric.status),
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {metric.status}
              </div>
            </div>

            {/* Label */}
            <div 
              className="text-muted-foreground mb-3"
              style={{ 
                fontSize: '12px', 
                fontWeight: '600',
                letterSpacing: '0.02em'
              }}
            >
              {metric.label}
            </div>

            {/* Value section */}
            <div className="relative">
              <div className="flex items-baseline gap-1 mb-2">
                <span 
                  className="text-foreground leading-none"
                  style={{ 
                    fontSize: '28px', 
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                  }}
                >
                  {metric.value}
                </span>
                <span 
                  className="text-muted-foreground"
                  style={{ 
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {metric.unit}
                </span>
              </div>

              {/* Target range */}
              <div 
                className="text-muted-foreground mb-2"
                style={{
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                Target: {metric.target}
              </div>

              {/* Trend and description */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-muted-foreground"
                  style={{
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {metric.description}
                </span>

                {TrendIcon && (
                  <div 
                    className="flex items-center gap-1"
                    style={{
                      color: metric.trend.direction === 'up' ? '#10b981' : '#ef4444',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}
                  >
                    <TrendIcon size={10} strokeWidth={3} />
                    <span>{metric.trend.value}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle animation overlay */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${metric.color}05 0%, transparent 50%)`,
                borderRadius: '20px'
              }}
            />
          </div>
        );
      })}
    </div>
  );
}