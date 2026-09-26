import React, { useState, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { AppLayout } from './components/layout/AppLayout';
import { NavRoute } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PracticeConfigPage } from './pages/PracticeConfigPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { PerformanceReportPage } from './pages/PerformanceReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ImprovementPlanPage } from './pages/ImprovementPlanPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './pages/AuthModal';
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { OfflineBanner } from './components/common/OfflineBanner';
import { InterviewMode, PracticeConfig, QuestionBankItem } from './types';

const MainAppContent: React.FC = () => {
  const { startSession, updateConfig, backendHealth } = useSession();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('overview');
  const [isLandingView, setIsLandingView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  const handleStartChallengeFromDashboard = (mode: InterviewMode, topic?: string) => {
    setIsDemoModeActive(false);
    updateConfig({ mode, targetTopic: topic || mode });
    setCurrentRoute('practice');
  };

  const handleLaunchSessionFromConfig = (config: PracticeConfig) => {
    setIsDemoModeActive(false);
    startSession(config);
    setCurrentRoute('interview');
  };

  const handlePracticeQuestionFromBank = (question: QuestionBankItem) => {
    setIsDemoModeActive(false);
    updateConfig({
      targetTopic: question.title,
      difficulty: question.difficulty,
    });
    startSession({
      targetTopic: question.title,
      difficulty: question.difficulty,
    });
    setCurrentRoute('interview');
  };

  const handleStartDemoMode = () => {
    setIsDemoModeActive(true);
    setIsLandingView(false);
    setCurrentRoute('interview');
  };

  const handleEndSessionComplete = () => {
    setCurrentRoute('report');
  };

  const handlePracticeAgain = () => {
    setIsDemoModeActive(false);
    setCurrentRoute('practice');
  };

  const handleRetryBackendConnection = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        setOfflineDismissed(false);
      }
    } catch {
      // bounded retry handled in component
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      {/* Offline banner notification with bounded retry */}
      <OfflineBanner
        isOffline={!backendHealth.connected && !offlineDismissed}
        onRetry={handleRetryBackendConnection}
        onDismiss={() => setOfflineDismissed(true)}
      />

      {isLandingView ? (
        <div className="min-h-screen bg-[#07080d] text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto">
          {/* Landing Nav Header */}
          <div className="flex items-center justify-between py-4 border-b border-white/[0.08] mb-6">
            <div className="cursor-pointer" onClick={() => setIsLandingView(false)}>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-white">MASTER</span>
                <span className="font-display font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">AI</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartDemoMode}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/25 transition-colors"
              >
                ⚡ Try Demo
              </button>
              <button
                onClick={() => setIsLandingView(false)}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => {
                  setIsLandingView(false);
                  setIsDemoModeActive(false);
                  setCurrentRoute('practice');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-lg"
              >
                Start Practice
              </button>
            </div>
          </div>

          <LandingPage
            onStartPractice={() => {
              setIsLandingView(false);
              setIsDemoModeActive(false);
              setCurrentRoute('practice');
            }}
            onExploreDemo={handleStartDemoMode}
            onNavigate={(route) => {
              setIsLandingView(false);
              if (route === 'interview') {
                setIsDemoModeActive(false);
              }
              setCurrentRoute(route);
            }}
          />
        </div>
      ) : (
        <AppLayout
          currentRoute={currentRoute}
          onRouteChange={(route) => {
            if (route !== 'interview') {
              setIsDemoModeActive(false);
            }
            setCurrentRoute(route);
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        >
          {currentRoute === 'overview' && (
            <DashboardPage
              onStartChallenge={handleStartChallengeFromDashboard}
              onViewReport={() => setCurrentRoute('report')}
              onNavigate={(route) => {
                if (route === 'interview') {
                  setIsDemoModeActive(false);
                }
                setCurrentRoute(route);
              }}
              onStartDemo={handleStartDemoMode}
            />
          )}

          {currentRoute === 'profile' && <ProfilePage />}

          {currentRoute === 'practice' && (
            <PracticeConfigPage onStartSession={handleLaunchSessionFromConfig} />
          )}

          {currentRoute === 'interview' && (
            <LiveInterviewPage
              key={isDemoModeActive ? 'demo-session' : 'live-session'}
              initialDemoMode={isDemoModeActive}
              onEndSessionComplete={handleEndSessionComplete}
              onNavigate={(route) => {
                setIsDemoModeActive(false);
                setCurrentRoute(route);
              }}
            />
          )}

          {currentRoute === 'debate' && (
            <LiveInterviewPage
              onEndSessionComplete={handleEndSessionComplete}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {currentRoute === 'report' && (
            <PerformanceReportPage
              onPracticeAgain={handlePracticeAgain}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {currentRoute === 'history' && (
            <HistoryPage
              onViewReport={() => setCurrentRoute('report')}
              onStartNewSession={() => {
                setIsDemoModeActive(false);
                setCurrentRoute('practice');
              }}
            />
          )}

          {currentRoute === 'analytics' && <AnalyticsPage />}

          {currentRoute === 'improvement' && (
            <ImprovementPlanPage
              onStartDrill={(topic) => {
                setIsDemoModeActive(false);
                updateConfig({ targetTopic: topic });
                startSession({ targetTopic: topic });
                setCurrentRoute('interview');
              }}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {currentRoute === 'question-bank' && (
            <QuestionBankPage onPracticeQuestion={handlePracticeQuestionFromBank} />
          )}

          {currentRoute === 'settings' && <SettingsPage />}
        </AppLayout>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </GlobalErrorBoundary>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SessionProvider>
          <MainAppContent />
        </SessionProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;

