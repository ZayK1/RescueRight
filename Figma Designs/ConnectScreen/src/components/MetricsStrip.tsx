import { useEffect, useState } from 'react';

export function MetricsStrip() {
  const [duration, setDuration] = useState({ minutes: 3, seconds: 24 });
  const [thrusts, setThrusts] = useState(12);
  const [score, setScore] = useState(89);

  // Update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => {
        let newSeconds = prev.seconds + 1;
        let newMinutes = prev.minutes;
        
        if (newSeconds >= 60) {
          newSeconds = 0;
          newMinutes += 1;
        }
        
        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update thrusts occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setThrusts(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update score slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => {
        const variation = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, Math.min(100, prev + variation));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ height: '122px' }} // Increased for floating design
    >
      {/* Floating metrics pill */}
      <div className="px-4 pt-4">
        <div 
          className="h-[54px] px-4 rounded-3xl flex items-center justify-center gap-3"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(40px)',
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Duration metric */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] font-medium text-gray-800">
              Duration • {formatTime(duration.minutes, duration.seconds)}
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Thrusts metric */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] font-medium text-gray-800">
              Thrusts • {thrusts}
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Score metric */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] font-medium text-gray-800">
              Score • {score}
            </span>
          </div>
        </div>
      </div>

      {/* Safe area bottom */}
      <div className="h-[34px] bg-transparent" />
    </div>
  );
}