import { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';

export function HeroSuccessCard() {
  const [animateIn, setAnimateIn] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    
    const scoreTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore(prev => {
          if (prev >= 89) {
            clearInterval(interval);
            return 89;
          }
          return prev + 3;
        });
      }, 40);
    }, 400);

    return () => {
      clearTimeout(timer);
      clearTimeout(scoreTimer);
    };
  }, []);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        border: '0.5px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 8px 24px rgba(0, 0, 0, 0.04), 0px 16px 32px rgba(0, 0, 0, 0.02)',
        padding: '40px 32px'
      }}
    >
      {/* Enhanced background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.03) 0%, transparent 50%)'
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Success indicator */}
        <div 
          className={`mb-6 transition-all duration-700 ease-out ${
            animateIn ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.3), 0px 2px 6px rgba(16, 185, 129, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.2)',
            transitionDelay: '0.1s'
          }}
        >
          <Check size={24} className="text-white" strokeWidth={3} />
        </div>

        {/* Title */}
        <h1 
          className={`text-foreground mb-8 transition-all duration-700 ease-out ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ 
            fontSize: '22px',
            fontWeight: '600',
            letterSpacing: '-0.022em',
            lineHeight: '1.27',
            transitionDelay: '0.2s'
          }}
        >
          Excellent Performance
        </h1>

        {/* Score visualization */}
        <div 
          className={`relative mb-6 transition-all duration-700 ease-out ${
            animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '0.3s' }}
        >
          <svg width="104" height="104" className="-rotate-90">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            
            <circle
              cx="52"
              cy="52"
              r="42"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            
            <circle
              cx="52"
              cy="52"
              r="42"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ 
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '0.6s'
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="text-foreground leading-none"
              style={{ 
                fontSize: '32px', 
                fontWeight: '700',
                letterSpacing: '-0.025em'
              }}
            >
              {score}
            </span>
            <span 
              className="text-muted-foreground"
              style={{ 
                fontSize: '12px',
                fontWeight: '500',
                marginTop: '2px'
              }}
            >
              Score
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div 
          className={`flex items-center gap-2 text-muted-foreground transition-all duration-700 ease-out ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
          style={{ 
            fontSize: '13px',
            fontWeight: '500',
            transitionDelay: '0.7s'
          }}
        >
          <Clock size={13} strokeWidth={2} />
          <span>Today at 2:34 PM</span>
        </div>
      </div>
    </div>
  );
}