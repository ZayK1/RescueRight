import { Activity, Target, Clock, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeatmapModule() {
  const [pressureIntensity, setPressureIntensity] = useState(0.7);
  const [handPosition, setHandPosition] = useState({ x: 160, y: 140 });

  // Simulate real-time pressure and position changes
  useEffect(() => {
    const interval = setInterval(() => {
      setPressureIntensity(prev => {
        const variation = (Math.random() - 0.5) * 0.3;
        return Math.max(0.2, Math.min(1, prev + variation));
      });
      
      setHandPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 4,
        y: prev.y + (Math.random() - 0.5) * 4
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="w-[361px] h-[420px] rounded-[24px] p-6 relative overflow-hidden"
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
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Waves size={16} className="text-white" />
          </div>
          <h3 
            className="font-semibold text-gray-900"
            style={{ fontSize: '17px', letterSpacing: '-0.02em' }}
          >
            Hand Placement
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[12px] font-medium text-gray-600">Live Tracking</span>
        </div>
      </div>

      {/* 3D Vest Visualization */}
      <div className="relative w-[313px] h-[280px] mx-auto mb-5">
        <svg
          width="313"
          height="280"
          viewBox="0 0 313 280"
          className="absolute inset-0"
          style={{ filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.15))' }}
        >
          <defs>
            {/* Vest gradient for 3D effect */}
            <linearGradient id="vestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="30%" stopColor="#2d3748" />
              <stop offset="70%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>

            {/* Hexagonal pattern */}
            <pattern id="hexPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <polygon
                points="10,2 17,6 17,14 10,18 3,14 3,6"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Pressure heatmap gradient */}
            <radialGradient id="pressureGradient" cx="50%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={pressureIntensity * 0.9} />
              <stop offset="25%" stopColor="#f59e0b" stopOpacity={pressureIntensity * 0.7} />
              <stop offset="50%" stopColor="#eab308" stopOpacity={pressureIntensity * 0.5} />
              <stop offset="75%" stopColor="#22c55e" stopOpacity={pressureIntensity * 0.3} />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Target zone gradient */}
            <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* 3D shadow filter */}
            <filter id="vestshadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>

          {/* Vest main body with 3D perspective */}
          <path
            d="M156.5 10 
               C176 12, 190 20, 200 35
               L210 50
               C220 65, 225 85, 230 105
               L235 130
               C240 155, 245 180, 250 200
               L255 230
               C258 250, 255 265, 245 270
               L68 270
               C58 265, 55 250, 58 230
               L63 200
               C68 180, 73 155, 78 130
               L83 105
               C88 85, 93 65, 103 50
               L113 35
               C123 20, 137 12, 156.5 10 Z"
            fill="url(#vestGradient)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1"
            filter="url(#vestshadow)"
          />

          {/* Hexagonal pattern overlay */}
          <path
            d="M156.5 15 
               C174 17, 186 24, 195 37
               L204 50
               C213 63, 218 81, 223 99
               L228 122
               C233 145, 238 168, 243 188
               L248 215
               C251 232, 248 245, 240 249
               L73 249
               C65 245, 62 232, 65 215
               L70 188
               C75 168, 80 145, 85 122
               L90 99
               C95 81, 100 63, 109 50
               L118 37
               C127 24, 139 17, 156.5 15 Z"
            fill="url(#hexPattern)"
            opacity="0.6"
          />

          {/* Target zone (white circular area) */}
          <circle
            cx="160"
            cy="140"
            r="45"
            fill="url(#targetGradient)"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="2"
            strokeDasharray="2,2"
            style={{ filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))' }}
          />

          {/* Target zone outline */}
          <circle
            cx="160"
            cy="140"
            r="40"
            fill="none"
            stroke="rgba(99, 102, 241, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Pressure heatmap overlay */}
          <circle
            cx={handPosition.x}
            cy={handPosition.y}
            r="35"
            fill="url(#pressureGradient)"
            style={{ filter: 'blur(12px)' }}
          />

          {/* Hand placement indicators */}
          <g>
            {/* Left hand outline */}
            <ellipse
              cx={handPosition.x - 20}
              cy={handPosition.y - 5}
              rx="18"
              ry="25"
              fill="rgba(255,255,255,0.2)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              className="animate-pulse-scale"
              style={{ 
                filter: 'drop-shadow(0px 2px 8px rgba(255,255,255,0.3))',
                transform: 'rotate(-15deg)',
                transformOrigin: `${handPosition.x - 20}px ${handPosition.y - 5}px`
              }}
            />

            {/* Right hand outline */}
            <ellipse
              cx={handPosition.x + 20}
              cy={handPosition.y - 5}
              rx="18"
              ry="25"
              fill="rgba(255,255,255,0.2)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              className="animate-pulse-scale"
              style={{ 
                filter: 'drop-shadow(0px 2px 8px rgba(255,255,255,0.3))',
                transform: 'rotate(15deg)',
                transformOrigin: `${handPosition.x + 20}px ${handPosition.y - 5}px`
              }}
            />

            {/* Heel of palm indicator */}
            <circle
              cx={handPosition.x}
              cy={handPosition.y + 10}
              r="8"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="#22c55e"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(34, 197, 94, 0.3))' }}
            />
          </g>

          {/* Sensor indicators */}
          <circle cx="80" cy="60" r="3" fill="#06b6d4" className="animate-pulse" />
          <circle cx="240" cy="60" r="3" fill="#06b6d4" className="animate-pulse" />
          <circle cx="160" cy="200" r="3" fill="#06b6d4" className="animate-pulse" />

          {/* LED status strip */}
          <rect
            x="120"
            y="90"
            width="80"
            height="4"
            rx="2"
            fill="#06b6d4"
            style={{ filter: 'drop-shadow(0px 0px 6px rgba(6, 182, 212, 0.6))' }}
            className="animate-pulse"
          />
        </svg>

        {/* Floating metrics */}
        <div 
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-sm"
          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
        >
          <span className="text-[11px] font-semibold text-emerald-600">
            {Math.round(pressureIntensity * 100)}% accuracy
          </span>
        </div>
      </div>

      {/* Enhanced metrics strip */}
      <div className="flex gap-3">
        <div 
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(99, 102, 241, 0.08)' }}
        >
          <Target size={14} className="text-indigo-600" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-900">94%</span>
            <span className="text-[10px] text-gray-600">Accuracy</span>
          </div>
        </div>
        <div 
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(34, 197, 94, 0.08)' }}
        >
          <Activity size={14} className="text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-900">45°</span>
            <span className="text-[10px] text-gray-600">Angle</span>
          </div>
        </div>
        <div 
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(245, 158, 11, 0.08)' }}
        >
          <Clock size={14} className="text-orange-600" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-gray-900">2.1s</span>
            <span className="text-[10px] text-gray-600">Rhythm</span>
          </div>
        </div>
      </div>
    </div>
  );
}