import React, { useState } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { ChallengeCard, ChallengeCardProps } from '../components/dashboard/ChallengeCard';
import { RecentSessionCard } from '../components/dashboard/RecentSessionCard';
import { StreakTracker } from '../components/dashboard/StreakTracker';
import { KnowledgeCoverageWidget } from '../components/dashboard/KnowledgeCoverageWidget';
import { DailyPracticePlanCard } from '../components/dashboard/DailyPracticePlanCard';
import { InterviewReadinessCard } from '../components/dashboard/InterviewReadinessCard';
import { QuickStartCard } from '../components/dashboard/QuickStartCard';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { useAuth } from '../context/AuthContext';
import { mockSessions } from '../data/mockSessions';
import {
  Video,
  Award,
  MessageSquare,
  BookOpen,
  Flame,
  ShieldAlert,
  Swords,
  Zap,
  Users,
  Terminal,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { NavRoute } from '../components/layout/Sidebar';
import { InterviewMode } from '../types';

interface DashboardPageProps {
  onStartChallenge: (mode: InterviewMode, topic?: string) => void;
  onViewReport: (sessionId: string) => void;
  onNavigate: (route: NavRoute) => void;
  onStartDemo?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartChallenge,
  onViewReport,
  onNavigate,
  onStartDemo,
}) => {
  const { user } = useAuth();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const challengeCards: {
    mode: InterviewMode;
    title: string;
    description: string;
    difficulty: any;
    duration: string;
    icon: React.ReactNode;
    tags: string[];
  }[] = [
    {
      mode: 'cybersecurity',
      title: 'Cybersecurity Interview',
      description: 'Defend zero-trust architecture, investigate lateral movement, and triage cloud credential compromise.',
      difficulty: 'advanced',
      duration: '15-20 mins',
      icon: <ShieldAlert className="w-5 h-5 text-cyan-400" />,
      tags: ['Incident Response', 'MITRE ATT&CK', 'Zero Trust'],
    },
    {
      mode: 'technical',
      title: 'Technical Systems Interview',
      description: 'Design distributed architectures at 500k RPS and defend low-latency data structures under load.',
      difficulty: 'expert',
      duration: '20 mins',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      tags: ['Distributed Systems', 'Rate Limiting', 'Scalability'],
    },
    {
      mode: 'debate',
      title: 'Adversary Debate Arena',
      description: 'Defend your position on AI governance and tech policy against a real-time counter-arguing adversary.',
      difficulty: 'advanced',
      duration: '10-15 mins',
      icon: <Swords className="w-5 h-5 text-rose-400" />,
      tags: ['AI Ethics', 'Legal Liability', 'Critical Thinking'],
    },
    {
      mode: 'behavioral',
      title: 'Behavioral Leadership (STAR)',
      description: 'Practice crisis management, blameless post-mortems, and executive alignment scenarios.',
      difficulty: 'intermediate',
      duration: '10 mins',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      tags: ['STAR Method', 'Crisis Mgmt', 'Leadership'],
    },
    {
      mode: 'stress',
      title: 'Stress Interview',
      description: 'Handle rapid scenario shifts, critical premise contradictions, and high-intensity adversary probing.',
      difficulty: 'expert',
      duration: '12 mins',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      tags: ['High Pressure', 'Fast Pivots', 'Composure'],
    },
    {
      mode: 'rapid_fire',
      title: 'Rapid Fire Drills',
      description: 'Answer fast-paced technical questions under strict 45-second timers to eliminate filler words.',
      difficulty: 'advanced',
      duration: '7 mins',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      tags: ['Speed', 'Precision', 'Filler Reduction'],
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* COMPACT PRODUCT HERO SECTION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0e1329]/90 via-[#0a0d1d]/90 to-[#070914]/90 border border-indigo-500/25 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              AI INTERVIEW OPERATING SYSTEM
            </Badge>
            <span className="text-xs font-mono text-slate-400">• v2.4 Product Edition</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Good to see you, {user?.name || 'Chaitanya'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            MASTER AI is your autonomous interview coach with real-time speech transcription, presentation telemetry, and adversarial reasoning.
          </p>
        </div>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button
            variant="glow"
            size="md"
            leftIcon={<Zap className="w-4 h-4 text-cyan-300" />}
            onClick={() => onStartChallenge('cybersecurity', 'SOC Incident Triage & Event Log Analysis')}
          >
            Start Interview
          </Button>

          {onStartDemo && (
            <Button
              variant="secondary"
              size="md"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
              onClick={onStartDemo}
            >
              Try MASTER AI Demo
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            leftIcon={<HelpCircle className="w-4 h-4 text-slate-400" />}
            onClick={() => setIsOnboardingOpen(true)}
          >
            Guided Setup
          </Button>
        </div>
      </div>

      {/* STAGE 6: INTERVIEW READINESS & QUICK START CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterviewReadinessCard
          targetRole="SOC Analyst"
          technicalScore={82}
          reasoningScore={75}
          communicationScore={79}
          presentationScore={76}
          totalSessionsCompleted={user?.totalSessions || 24}
        />

        <QuickStartCard
          onStart={(cfg) => onStartChallenge(cfg.mode as InterviewMode, 'SOC Analyst Technical Sprint')}
        />
      </div>

      {/* DASHBOARD STATISTICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Practice Sessions"
          value={user?.totalSessions || 24}
          subtitle="Completed sessions"
          icon={<Video className="w-5 h-5" />}
          trend={{ value: '+4 this week', isPositive: true }}
          glowColor="indigo"
        />

        <StatCard
          title="Average Score"
          value={`${user?.avgScore || 82}`}
          subtitle="Across all domains"
          icon={<Award className="w-5 h-5" />}
          trend={{ value: '+5.2 pts', isPositive: true }}
          glowColor="cyan"
        />

        <StatCard
          title="Communication"
          value={`${user?.communicationScore || 86}`}
          subtitle="Pacing & clarity"
          icon={<MessageSquare className="w-5 h-5" />}
          trend={{ value: '+3.1 pts', isPositive: true }}
          glowColor="emerald"
        />

        <StatCard
          title="Technical"
          value={`${user?.technicalScore || 79}`}
          subtitle="Depth & accuracy"
          icon={<BookOpen className="w-5 h-5" />}
          trend={{ value: '+4.0 pts', isPositive: true }}
          glowColor="violet"
        />

        <StatCard
          title="Current Streak"
          value={`${user?.streakDays || 7} Days`}
          subtitle="Daily practice"
          icon={<Flame className="w-5 h-5" />}
          trend={{ value: 'Active', isPositive: true }}
          glowColor="amber"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* STAGE 5 & 6: KNOWLEDGE COVERAGE & DAILY PRACTICE PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KnowledgeCoverageWidget targetRole="SOC Analyst" />
        <DailyPracticePlanCard
          onStartDrill={(topic) => onStartChallenge('cybersecurity', topic)}
        />
      </div>

      {/* START A CHALLENGE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Interview Modes & Adversary Drills</h2>
            <p className="text-xs text-slate-400">
              Select an adversarial drill or full simulated interview mode
            </p>
          </div>

          <button
            onClick={() => onNavigate('question-bank')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All in Question Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challengeCards.map((card) => (
            <ChallengeCard
              key={card.mode}
              {...card}
              onStart={() => onStartChallenge(card.mode)}
            />
          ))}
        </div>
      </div>

      {/* LOWER SECTION: RECENT SESSIONS & STREAK TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions Feed (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white">Recent Session Reports</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              See All History →
            </button>
          </div>

          <div className="space-y-3">
            {mockSessions.slice(0, 3).map((session) => (
              <RecentSessionCard
                key={session.id}
                session={session}
                onViewReport={onViewReport}
              />
            ))}
          </div>
        </div>

        {/* Streak & Milestone Tracker (1 col on lg) */}
        <div className="space-y-4">
          <StreakTracker streakDays={user?.streakDays || 7} />

          {/* Quick Recommendation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101426] to-[#070914] border border-cyan-500/20 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-mono font-bold">
              <Zap className="w-4 h-4" />
              <span>AI RECOMMENDATION</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Incident Response Memory Forensics Drill
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Your last session missed volatile LSASS triage during credential dumping. Practice a 10-minute targeted remediation.
            </p>
            <Button
              variant="glow"
              size="sm"
              onClick={() => onStartChallenge('cybersecurity', 'Memory Forensics & LSASS Triage')}
              className="w-full"
            >
              Launch Targeted Drill
            </Button>
          </div>
        </div>
      </div>

      {/* Product Onboarding Guided Walkthrough */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartDemo={() => {
          setIsOnboardingOpen(false);
          if (onStartDemo) onStartDemo();
        }}
        onStartPractice={() => {
          setIsOnboardingOpen(false);
          onNavigate('practice');
        }}
      />
    </div>
  );
};
