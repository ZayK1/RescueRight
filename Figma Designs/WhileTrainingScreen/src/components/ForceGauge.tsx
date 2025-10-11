import { Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ForceGauge() {
  const [currentForce, setCurrentForce] = useState(105);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [isOptimal, setIsOptimal] = useState(false);

  // Convert force to angle (0-300N mapped to -135° to 135°)
  useEffect(() => {
    const angle = (currentForce / 300) * 270 - 135;
    setNeedleAngle(Math.max(-135, Math.min(135, angle)));
    setIsOptimal(currentForce >= 80 && currentForce <= 120);
  }, [currentForce]);

  // Simulate real-time force changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentForce(prev => {
        const variation = (Math.random() - 0.5) * 20;
        return Math.max(0, Math.min(300, prev + variation));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getForceStatus = () => {
    if (currentForce < 60) return { text: 'Too Low', color: '#EF4444' };
    if (currentForce < 80) return { text: 'Low', color: '#F59E0B' };
    if (currentForce <= 120) return { text: 'Optimal', color: '#10B981' };
    if (currentForce <= 150) return { text: 'High', color: '#F59E0B' };
    return { text: 'Too High', color: '#EF4444' };
  };

  const status = getForceStatus();

  return (
    <div 
      className="w-[361px] h-[340px] rounded-[24px] p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        boxShadow: '0px 8px 32px rgba(0,0,0,0.06), 0px 2px 8px rgba(0,0,0,0.04), inset 0px 1px 0px rgba(255,255,255,0.8)',
        border: '0.5px solid rgba(0,0,0,0.06)'
      }}
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,1) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Module header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <h3 
            className="font-semibold text-gray-900"
            style={{ fontSize: '17px', letterSpacing: '-0.02em' }}
          >
            Compression Force
          </h3>
        </div>
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16, 185, 129, 0.08)' }}
        >
          <Target size={12} className="text-emerald-600" />
          <span className="text-[12px] font-medium text-emerald-700">80-120 N optimal</span>
        </div>
      </div>

      {/* Enhanced circular gauge */}
      <div className="relative w-[280px] h-[280px] mx-auto">
        <svg width="280" height="280" className="absolute inset-0">
          <defs>
            {/* Enhanced gradients */}
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#EE5A52" />
            </linearGradient>
            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD93D" />
              <stop offset="100%" stopColor="#FF9F43" />
            </linearGradient>
            <linearGradient id="optimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6BCF7F" />
              <stop offset="50%" stopColor="#4D7C0F" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="transitionGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FFD93D" />
            </linearGradient>
            <linearGradient id="transitionGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4D7C0F" />
              <stop offset="100%" stopColor="#FF9F43" />
            </linearGradient>
            
            {/* Glow effects */}
            <filter id="optimalGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Needle gradient */}
            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>

          {/* Background track with subtle gradient */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="24"
          />
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Active segments with enhanced styling */}
          {/* Danger zone 1: 0-60N */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#dangerGradient)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="98.96 659.73"
            strokeDashoffset="0"
            transform="rotate(-135 140 140)"
            style={{ filter: 'drop-shadow(0px 0px 12px rgba(255, 107, 107, 0.4))' }}
          />

          {/* Transition 1: 60-80N */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#transitionGradient1)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="32.99 659.73"
            strokeDashoffset="-98.96"
            transform="rotate(-135 140 140)"
          />

          {/* Optimal zone: 80-120N */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#optimalGradient)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="65.97 659.73"
            strokeDashoffset="-131.95"
            transform="rotate(-135 140 140)"
            filter={isOptimal ? "url(#optimalGlow)" : "none"}
            className={isOptimal ? "animate-pulse" : ""}
            style={{ filter: 'drop-shadow(0px 0px 16px rgba(16, 185, 129, 0.5))' }}
          />

          {/* Transition 2: 120-150N */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#transitionGradient2)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="49.48 659.73"
            strokeDashoffset="-197.92"
            transform="rotate(-135 140 140)"
          />

          {/* Danger zone 2: 150-300N */}
          <circle
            cx="140"
            cy="140"
            r="105"
            fill="none"
            stroke="url(#dangerGradient)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="247.4 659.73"
            strokeDashoffset="-247.4"
            transform="rotate(-135 140 140)"
            style={{ filter: 'drop-shadow(0px 0px 12px rgba(255, 107, 107, 0.4))' }}
          />

          {/* Enhanced tick marks */}
          {[60, 120, 180, 240].map((value) => {
            const angle = (value / 300) * 270 - 135;
            const x1 = 140 + 96 * Math.cos((angle * Math.PI) / 180);
            const y1 = 140 + 96 * Math.sin((angle * Math.PI) / 180);
            const x2 = 140 + 84 * Math.cos((angle * Math.PI) / 180);
            const y2 = 140 + 84 * Math.sin((angle * Math.PI) / 180);
            
            return (
              <g key={value}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text
                  x={140 + 75 * Math.cos((angle * Math.PI) / 180)}
                  y={140 + 75 * Math.sin((angle * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[11px] font-medium fill-gray-500"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Enhanced needle */}
          <g 
            transform={`rotate(${needleAngle} 140 140)`}
            style={{ 
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: '140px 140px'
            }}
          >
            {/* Needle shadow */}
            <rect
              x="137"
              y="36"
              width="6"
              height="104"
              rx="3"
              fill="rgba(0,0,0,0.1)"
              transform="translate(2, 2)"
            />
            {/* Main needle */}
            <rect
              x="137"
              y="36"
              width="6"
              height="104"
              rx="3"
              fill="url(#needleGradient)"
              style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))' }}
            />
            {/* Needle tip */}
            <circle
              cx="140"
              cy="36"
              r="4"
              fill="#1F2937"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            />
          </g>

          {/* Enhanced center hub */}
          <circle
            cx="140"
            cy="140"
            r="20"
            fill="url(#hubGradient)"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
            style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))' }}
          />
          <circle
            cx="140"
            cy="140"
            r="12"
            fill="white"
            opacity="0.9"
          />

          {/* Hub gradient definition */}
          <defs>
            <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Enhanced center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="font-bold text-gray-900 leading-none"
            style={{ 
              fontSize: '58px', 
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            {Math.round(currentForce)}
          </div>
          <div className="text-[13px] font-medium text-gray-600 -mt-1">
            Newtons
          </div>
          <div 
            className="text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full"
            style={{ 
              color: status.color, 
              background: `${status.color}15`
            }}
          >
            {status.text}
          </div>
        </div>
      </div>
    </div>
  );
}