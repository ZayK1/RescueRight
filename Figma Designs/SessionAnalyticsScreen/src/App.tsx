import { SessionNavigation } from './components/SessionNavigation';
import { HeroSuccessCard } from './components/HeroSuccessCard';
import { MetricsGrid } from './components/MetricsGrid';
import { TechniqueAnalysis } from './components/TechniqueAnalysis';
import { ActionButtons } from './components/ActionButtons';

export default function App() {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'radial-gradient(ellipse at top, #f0f9ff 0%, #fafbff 50%, #f8fafc 100%)'
      }}
    >
      {/* Enhanced medical-grade container */}
      <div 
        className="max-w-[393px] mx-auto min-h-screen relative"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(120%)',
          boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.05), 0 20px 40px -10px rgba(15, 23, 42, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Navigation Header */}
        <SessionNavigation />
        
        {/* Main content with sophisticated spacing */}
        <div 
          className="px-6 overflow-y-auto"
          style={{ 
            paddingTop: '120px',
            paddingBottom: '40px',
            maxHeight: '100vh'
          }}
        >
          {/* Status Hero */}
          <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <HeroSuccessCard />
          </div>

          {/* Performance Analytics */}
          <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <header className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-1 h-6 rounded-full bg-medical-info"
                  style={{ boxShadow: '0 0 8px rgba(2, 132, 199, 0.4)' }}
                />
                <h2 
                  className="text-foreground"
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Performance Analytics
                </h2>
              </div>
              <p 
                className="text-muted-foreground ml-7"
                style={{
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Real-time assessment metrics
              </p>
            </header>
            <MetricsGrid />
          </section>

          {/* Clinical Assessment */}
          <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <header className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-1 h-6 rounded-full bg-medical-success"
                  style={{ boxShadow: '0 0 8px rgba(5, 150, 105, 0.4)' }}
                />
                <h2 
                  className="text-foreground"
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Clinical Assessment
                </h2>
              </div>
              <p 
                className="text-muted-foreground ml-7"
                style={{
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Technique evaluation and recommendations
              </p>
            </header>
            <TechniqueAnalysis />
          </section>

          {/* Session Actions */}
          <section className="pb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <ActionButtons />
          </section>
        </div>

        {/* Subtle ambient lighting effects */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
          style={{
            width: '300px',
            height: '200px',
            background: 'radial-gradient(ellipse, rgba(3, 105, 161, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
      </div>
    </div>
  );
}