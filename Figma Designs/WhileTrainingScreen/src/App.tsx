import { StatusHeader } from './components/StatusHeader';
import { HeatmapModule } from './components/HeatmapModule';
import { ForceGauge } from './components/ForceGauge';
import { FeedbackCard } from './components/FeedbackCard';
import { MetricsStrip } from './components/MetricsStrip';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* iPhone frame simulation */}
      <div className="max-w-[393px] mx-auto bg-black relative">
        {/* Status Header */}
        <StatusHeader />
        
        {/* Main content area */}
        <div 
          className="px-4 bg-gray-50"
          style={{ 
            paddingTop: '135px', // 59px safe area + 56px pill + 4px padding + 16px margin
            paddingBottom: '138px' // 122px metrics strip + 16px margin
          }}
        >
          {/* Hero Heatmap Module */}
          <div className="mb-4">
            <HeatmapModule />
          </div>

          {/* Force Gauge Module */}
          <div className="mb-4">
            <ForceGauge />
          </div>

          {/* Real-time Feedback Card */}
          <div className="mb-4">
            <FeedbackCard />
          </div>
        </div>

        {/* Bottom Metrics Strip */}
        <MetricsStrip />
      </div>
    </div>
  );
}