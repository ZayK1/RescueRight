import { useState, useEffect } from 'react';
import { Check, Clock, Award, TrendingUp } from 'lucide-react';

export function HeroSuccessCard() {
  const [animateIn, setAnimateIn] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 200);
    
    const scoreTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore(prev => {
          if (prev >= 94) {
            clearInterval(interval);
            return 94;
          }
          return prev + 2;
        });
      }, 35);
    }, 600);

    const progressTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 94) {
            clearInterval(interval);
            return 94;
          }
          return prev + 3;
        });
      }, 40);
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(scoreTimer);
      clearTimeout(progressTimer);
    };
  }, []);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1), 0 20px 40px -10px rgba(15, 23, 42, 0.08)',
        padding: '32px 24px'
      }}
    >
      {/* Success aura effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.1) 0%, transparent 60%)',
          animation: 'breathe 4s ease-in-out infinite'
        }}
      />

      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Success Badge */}
        <div 
          className={`mb-6 transition-all duration-700 ${
            animateIn ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
          style={{
            transitionDelay: '0.2s',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div 
            className="relative flex items-center justify-center"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3), 0 4px 12px rgba(5, 150, 105, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <Check size={32} className="text-white" strokeWidth={3} />
            
            {/* Floating award icon */}
            <div 
              className="absolute -top-2 -right-2 animate-bounce"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                animationDelay: '1s'
              }}
            >
              <Award size={12} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title and Score */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ transitionDelay: '0.3s' }}
        >
          <h1 
            className="text-foreground mb-2"
            style={{ 
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              lineHeight: '1.2'
            }}
          >
            Exceptional Performance
          </h1>
          <p 
            className="text-muted-foreground"
            style={{
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            Heimlich technique validated successfully
          </p>
        </div>

        {/* Advanced Score Visualization */}
        <div 
          className={`relative mb-8 transition-all duration-700 ${
            animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '0.4s' }}
        >
          <div className="relative">
            <svg width="128" height="128" className="-rotate-90">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              
              {/* Background track */}
              <circle
                cx="64"
                cy="64"
                r="52"
                fill="none"
                stroke="url(#trackGradient)"
                strokeWidth="8"
              />
              
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="52"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ 
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '0.8s',
                  filter: 'drop-shadow(0 0 8px rgba(5, 150, 105, 0.3))'
                }}
              />
              
              {/* Score marker */}
              <circle
                cx="64"
                cy="12"
                r="3"
                fill="#10b981"
                style={{
                  transformOrigin: '64px 64px',
                  transform: `rotate(${(progress / 100) * 360}deg)`,
                  transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '0.8s'
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className="text-foreground leading-none mb-1"
                style={{ 
                  fontSize: '36px', 
                  fontWeight: '800',
                  letterSpacing: '-0.03em'
                }}
              >
                {score}
              </span>
              <span 
                className="text-muted-foreground"
                style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div 
          className={`flex items-center gap-6 transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={14} strokeWidth={2.5} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>
              Today, 2:34 PM
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-medical-success">
            <TrendingUp size={14} strokeWidth={2.5} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              +15% improved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}