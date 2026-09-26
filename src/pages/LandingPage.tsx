import React from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Logo } from '../components/common/Logo';
import { AIAvatarOrb } from '../components/interview/AIAvatarOrb';
import { AudioWaveform } from '../components/interview/AudioWaveform';
import {
  Brain,
  Eye,
  ShieldAlert,
  CheckCircle2,
  Activity,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Play,
  Swords,
  ChevronRight,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { NavRoute } from '../components/layout/Sidebar';

interface LandingPageProps {
  onStartPractice: () => void;
  onExploreDemo: () => void;
  onNavigate: (route: NavRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPractice,
  onExploreDemo,
  onNavigate,
}) => {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-cyan-400" />,
      title: 'Adaptive AI Interviewer',
      description: 'The interviewer changes its next question dynamically based on the semantic depth and omissions in your previous answer.',
    },
    {
      icon: <Eye className="w-6 h-6 text-indigo-400" />,
      title: 'Multimodal Analysis',
      description: 'Analyze spoken content together with objective visual presentation signals like observed eye-contact consistency and posture framing.',
    },
    {
      icon: <Swords className="w-6 h-6 text-rose-400" />,
      title: 'Intelligent Follow-Ups',
      description: 'The AI adversary digs deeper into edge-cases and tests your resolve when an answer is incomplete or mathematically questionable.',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: 'Real-Time Fact Checking',
      description: 'Technical claims are verified against trusted RFC standards, NIST guidelines, and MITRE ATT&CK framework telemetry in real time.',
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      title: 'Communication Telemetry',
      description: 'Measure critical delivery signals such as speaking cadence (WPM), hesitation pause length, and filler-word frequency.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      title: 'Objective Performance Analytics',
      description: 'Receive an exhaustive rubric-based evaluation report, timeline breakdown, and customized improvement plan after every session.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Choose Your Challenge',
      description: 'Select interview domain, debate topic, difficulty level, and AI personality.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: '02',
      title: 'Meet Your AI Adversary',
      description: 'MASTER AI engages audio/video telemetry and establishes the problem parameters.',
      icon: <Brain className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: '03',
      title: 'Answer Under Pressure',
      description: 'Speak naturally using camera and microphone. Live speech-to-text tokenizes your points.',
      icon: <Video className="w-5 h-5 text-purple-400" />,
    },
    {
      step: '04',
      title: 'Get Challenged',
      description: 'MASTER AI analyzes reasoning gaps, fact-checks assertions, and delivers adaptive counter-probes.',
      icon: <Swords className="w-5 h-5 text-rose-400" />,
    },
    {
      step: '05',
      title: 'Review Your Performance',
      description: 'Receive an objective multi-criteria rubric evaluation and a tailored improvement trajectory.',
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* HERO SECTION */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 pt-6 pb-12 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Left Content */}
        <div className="flex-1 max-w-2xl space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AUTONOMOUS AI ADVERSARY & INTERVIEWER</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-[1.1]">
            Your AI Adversary for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              High-Pressure
            </span>{' '}
            Conversations.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Practice interviews, debates, and high-pressure conversations with an adaptive AI opponent that challenges your reasoning, fact-checks claims, and objectively analyzes your delivery.
          </p>

          <p className="text-xs font-mono text-cyan-400/90 tracking-wider uppercase font-semibold">
            Practice smarter. Get challenged. Perform better.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Button
              variant="glow"
              size="xl"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={onStartPractice}
            >
              Start Practice
            </Button>

            <Button
              variant="secondary"
              size="xl"
              leftIcon={<Play className="w-5 h-5 fill-current text-indigo-400" />}
              onClick={onExploreDemo}
            >
              Explore Demo
            </Button>
          </div>

          {/* Trust & Privacy Signals */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Edge Multimodal Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" /> Zero Raw Video Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" /> NIST / MITRE RAG Fact Checking
            </span>
          </div>
        </div>

        {/* Hero Right Visualizer */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-md lg:max-w-lg">
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#101426]/90 to-[#070913]/95 border border-indigo-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl w-full flex flex-col items-center">
            {/* Top AI Ready Indicator */}
            <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  MASTER AI ENGINE
                </span>
              </div>
              <Badge variant="cyan" size="sm">
                AI READY
              </Badge>
            </div>

            {/* Central 3D AI Orb */}
            <div className="my-4">
              <AIAvatarOrb state="LISTENING" audioLevel={55} size="md" />
            </div>

            {/* Animated Audio Waveform */}
            <div className="w-full mt-4 bg-slate-900/60 p-2 rounded-xl border border-white/[0.04]">
              <AudioWaveform isActive={true} color="cyan" barsCount={24} />
            </div>

            {/* Conversation Signal Badge */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 w-full text-center">
              <p className="font-mono text-cyan-300 font-bold mb-0.5">● Dynamic Probing Active</p>
              <p className="text-[11px] text-slate-400">"Analyzing Kerberos Pass-the-Ticket claim..."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STEP WORKFLOW */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="violet" size="sm" className="mb-2">
            HOW MASTER AI WORKS
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            From High-Pressure Simulation to Measurable Mastery
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            An autonomous end-to-end adversary pipeline designed to test both technical depth and live delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.step}
              className="relative p-5 rounded-2xl bg-[#0d1020]/80 border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black font-mono text-indigo-400/80 group-hover:text-cyan-400 transition-colors">
                    {step.step}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-white/[0.06]">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="cyan" size="sm" className="mb-2">
            EXPECTED CAPABILITIES
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Built Specifically for Autonomous Adversarial Reasoning
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Aligned with rigorous rubrics for adaptive questioning, fact-checking, and multimodal telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <Card
              key={idx}
              hoverEffect
              className="p-6 bg-[#0c0f1f]/80 border border-white/[0.08] hover:border-indigo-500/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center mb-4 shadow-md">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-display">{feat.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950 via-[#0e1224] to-purple-950 border border-indigo-500/40 shadow-2xl text-center space-y-6 overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
            Ready to Face Your AI Adversary?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Test your distributed systems, cybersecurity incident response, and debate arguments against real-time adaptive challenge.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button
              variant="glow"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={onStartPractice}
            >
              Start Free Practice Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('question-bank')}
            >
              Browse Question Bank
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
