import { useEffect, useState } from 'react';

export function VestIllustration() {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 800); // Slower, more elegant timing

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center">
      <div 
        className="relative"
        style={{
          width: '240px',
          height: '240px'
        }}
      >
        {/* Bluetooth Wave Animations */}
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="absolute inset-0 border-2 rounded-full"
            style={{
              borderColor: '#3B82F6',
              opacity: animationPhase === index ? 0.5 : 
                       animationPhase === (index + 1) % 3 ? 0.3 : 0.1,
              transform: `scale(${1 + (animationPhase >= index ? 0.5 : 0)})`,
              transition: 'all 2.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: `${index * 800}ms`
            }}
          />
        ))}

        {/* Smart Vest Illustration */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0px 16px 48px rgba(0, 0, 0, 0.12))'
          }}
        >
          <svg
            width="160"
            height="180"
            viewBox="0 0 160 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="vestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F3F4F6" />
                <stop offset="100%" stopColor="#E5E7EB" />
              </linearGradient>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            
            {/* Vest Body */}
            <path
              d="M50 30 C50 25, 55 20, 60 20 L100 20 C105 20, 110 25, 110 30 L120 50 L120 160 C120 165, 115 170, 110 170 L50 170 C45 170, 40 165, 40 160 L40 50 Z"
              fill="url(#vestGradient)"
              stroke="#D1D5DB"
              strokeWidth="1"
            />
            
            {/* Chest Panel */}
            <rect
              x="55"
              y="40"
              width="50"
              height="80"
              rx="8"
              fill="url(#accentGradient)"
              opacity="0.1"
            />
            
            {/* Bluetooth Icon */}
            <g transform="translate(75, 70)">
              <path
                d="M5 0 L5 8 L9 4 L5 0 Z M5 8 L5 16 L9 12 L5 8 Z M1 6 L9 14 M1 10 L9 2"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
            
            {/* Sensor Dots */}
            {[
              { x: 65, y: 55 },
              { x: 95, y: 55 },
              { x: 65, y: 105 },
              { x: 95, y: 105 },
              { x: 80, y: 125 }
            ].map((dot, index) => (
              <circle
                key={index}
                cx={dot.x}
                cy={dot.y}
                r="3"
                fill="#10B981"
                opacity={0.8}
              >
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${index * 0.4}s`}
                />
              </circle>
            ))}
            
            {/* Side Straps */}
            <rect x="25" y="45" width="15" height="8" rx="4" fill="#D1D5DB" />
            <rect x="120" y="45" width="15" height="8" rx="4" fill="#D1D5DB" />
            <rect x="25" y="90" width="15" height="8" rx="4" fill="#D1D5DB" />
            <rect x="120" y="90" width="15" height="8" rx="4" fill="#D1D5DB" />
          </svg>
        </div>
      </div>
    </div>
  );
}