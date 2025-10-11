import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type FeedbackType = 'success' | 'warning' | 'error';

interface FeedbackMessage {
  type: FeedbackType;
  message: string;
}

const feedbackMessages: FeedbackMessage[] = [
  { type: 'success', message: 'Excellent hand placement—hold position' },
  { type: 'success', message: 'Perfect compression depth and rhythm' },
  { type: 'warning', message: 'Adjust hand position slightly higher' },
  { type: 'warning', message: 'Increase compression force by 15N' },
  { type: 'error', message: 'Hands too low—move to center of chest' },
  { type: 'success', message: 'Outstanding technique—keep going' },
];

export function FeedbackCard() {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackMessage>(feedbackMessages[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
        setIsVisible(true);
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-orange-500" />;
      case 'error':
        return <XCircle size={24} className="text-red-500" />;
    }
  };

  const getBackgroundColor = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.08)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.08)';
      case 'error':
        return 'rgba(239, 68, 68, 0.08)';
    }
  };

  const getBorderColor = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
    }
  };

  return (
    <div 
      className={`w-[361px] min-h-[64px] rounded-2xl p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
      style={{
        background: getBackgroundColor(currentFeedback.type),
        borderLeft: `4px solid ${getBorderColor(currentFeedback.type)}`
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon(currentFeedback.type)}
        </div>
        <div className="flex-1">
          <p 
            className="text-[15px] text-gray-800"
            style={{ lineHeight: '20px' }}
          >
            {currentFeedback.message}
          </p>
        </div>
      </div>
    </div>
  );
}