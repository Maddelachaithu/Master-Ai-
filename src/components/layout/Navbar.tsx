import React, { useState } from 'react';
import { Menu, Zap, Sparkles, Flame, Shield, Bell, HelpCircle, Activity } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { SystemStatusModal } from '../common/SystemStatusModal';
import { NavRoute } from './Sidebar';
import { cn } from '../../lib/utils';

interface NavbarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  onOpenMobileSidebar,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isSessionActive, aiState, backendHealth } = useSession();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const routeTitles: Record<NavRoute, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard Overview', subtitle: 'Performance metrics & upcoming challenges' },
    profile: { title: 'Candidate Profile & Intelligence', subtitle: 'Resume artifacts, target roles, and competency matrices' },
    practice: { title: 'Practice Configuration', subtitle: 'Tune domain, difficulty, and AI personality' },
    interview: { title: 'Live Autonomous Interview', subtitle: 'Adaptive questioning & multimodal observation' },
    debate: { title: 'Adversary Debate Arena', subtitle: 'Defend complex arguments against real-time AI challenge' },
    history: { title: 'Session History', subtitle: 'Review past performance reports and transcripts' },
    analytics: { title: 'Performance Analytics', subtitle: 'Speech pace, filler trends, and visual consistency' },
    improvement: { title: 'Personalized Improvement Plan', subtitle: 'Actionable goals and practice roadmap' },
    'question-bank': { title: 'Comprehensive Question Bank', subtitle: 'Explore curated technical & behavioral challenges' },
    settings: { title: 'Settings & Privacy', subtitle: 'Device inputs, AI preferences, and ethical data controls' },
    report: { title: 'Performance Report', subtitle: 'Rubric evaluation & adversary analysis' },
  };

  const currentInfo = routeTitles[currentRoute] || routeTitles.overview;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.08]">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-white/[0.08]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
              {currentInfo.title}
              {isSessionActive && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  LIVE SESSION
                </span>
              )}
            </h1>
            <p className="hidden md:block text-xs text-slate-400">{currentInfo.subtitle}</p>
          </div>
        </div>

        {/* Right: Status badges, Streak, Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
            <span>{user?.streakDays || 7}d Streak</span>
          </div>

          {/* Real Backend & Whisper Status Pill - Clickable for Diagnostics */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1222] hover:bg-[#151c35] border border-indigo-500/30 hover:border-cyan-400/50 transition-all text-xs font-mono cursor-pointer group shadow-sm"
            title="Click to view full MASTER AI system architecture & readiness diagnostics"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  backendHealth.connected && backendHealth.whisperReady ? 'bg-cyan-400' : 'bg-amber-400'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  backendHealth.connected && backendHealth.whisperReady ? 'bg-cyan-400' : 'bg-amber-400'
                )}
              />
            </span>
            <span className="text-slate-300 text-[11px] group-hover:text-white transition-colors">
              {backendHealth.connected ? (
                <>
                  <span className="text-emerald-400 font-bold">API</span> • Whisper:{' '}
                  <span className="text-cyan-400 font-semibold">{backendHealth.whisperReady ? 'Ready' : 'Init'}</span>
                </>
              ) : (
                <span className="text-amber-400">Offline (Local Engine)</span>
              )}
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors ml-0.5" />
          </button>

          {/* Quick CTA button if not in interview */}
          {currentRoute !== 'interview' && (
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Zap className="w-4 h-4 text-cyan-300" />}
              onClick={() => onRouteChange('practice')}
              className="hidden xs:inline-flex"
            >
              Start Practice
            </Button>
          )}

          {/* Auth Button or User Profile Avatar */}
          {!isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={onOpenAuthModal}>
              Sign In
            </Button>
          ) : (
            <button
              onClick={() => onRouteChange('settings')}
              className="relative p-0.5 rounded-full ring-2 ring-indigo-500/40 hover:ring-cyan-400 transition-all"
              title="Account & Settings"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          )}
        </div>
      </header>

      {/* System Status & Architecture Telemetry Modal */}
      <SystemStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} />
    </>
  );
};
