import { HelpCircle } from 'lucide-react';

interface HelpSectionProps {
  onTroubleshooting?: () => void;
}

export function HelpSection({ onTroubleshooting }: HelpSectionProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <HelpCircle size={16} style={{ color: '#9CA3AF' }} />
      
      <span 
        style={{
          fontSize: '13px',
          fontWeight: '400',
          color: '#6B7280'
        }}
      >
        Can't find your vest?
      </span>
      
      <button 
        onClick={onTroubleshooting}
        className="active:scale-95 transition-transform duration-150 touch-manipulation"
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#3B82F6',
          textDecoration: 'underline',
          textUnderlineOffset: '2px'
        }}
      >
        Troubleshooting Guide
      </button>
    </div>
  );
}