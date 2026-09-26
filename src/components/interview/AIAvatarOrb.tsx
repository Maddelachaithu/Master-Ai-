import React from 'react';
import { AIState } from '../../types';
import { cn } from '../../lib/utils';
import { Sparkles, Eye, ShieldAlert, CheckCircle2, Mic, BrainCircuit } from 'lucide-react';

interface AIAvatarOrbProps {
  state: AIState;
  audioLevel?: number; // 0 - 100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIAvatarOrb: React.FC<AIAvatarOrbProps> = ({
  state,
  audioLevel = 35,
  className,
  size = 'md',
}) => {
  // Determine color themes per state
  const stateConfig: Record<
    AIState,
    {
      glow: string;
      ring1: string;
      ring2: string;
      core: string;
      label: string;
      icon: React.ReactNode;
      pulseRate: string;
    }
  > = {
    IDLE: {
      glow: 'shadow-[0_0_50px_rgba(99,102,241,0.3)]',
      ring1: 'border-indigo-500/30',
      ring2: 'border-indigo-400/20',
      core: 'from-indigo-600 to-slate-900',
      label: 'IDLE / READY',
      icon: <BrainCircuit className="w-5 h-5 text-indigo-300" />,
      pulseRate: 'duration-[4000ms]',
    },
    LISTENING: {
      glow: 'shadow-[0_0_60px_rgba(0,242,254,0.45)]',
      ring1: 'border-cyan-400/60',
      ring2: 'border-cyan-300/30',
      core: 'from-cyan-400 via-indigo-600 to-slate-950',
      label: 'LISTENING',
      icon: <Mic className="w-5 h-5 text-cyan-300 animate-pulse" />,
      pulseRate: 'duration-[1500ms]',
    },
    THINKING: {
      glow: 'shadow-[0_0_60px_rgba(139,92,246,0.5)]',
      ring1: 'border-purple-500/60',
      ring2: 'border-violet-400/30',
      core: 'from-purple-500 via-indigo-700 to-slate-950',
      label: 'THINKING',
      icon: <BrainCircuit className="w-5 h-5 text-purple-300 animate-spin" />,
      pulseRate: 'duration-[2000ms]',
    },
    ANALYZING: {
      glow: 'shadow-[0_0_65px_rgba(99,102,241,0.55)]',
      ring1: 'border-indigo-400/70',
      ring2: 'border-cyan-500/30',
      core: 'from-indigo-500 via-purple-600 to-slate-950',
      label: 'ANALYZING REASONING',
      icon: <Eye className="w-5 h-5 text-cyan-300" />,
      pulseRate: 'duration-[1200ms]',
    },
    FACT_CHECKING: {
      glow: 'shadow-[0_0_65px_rgba(16,185,129,0.55)]',
      ring1: 'border-emerald-400/70',
      ring2: 'border-teal-500/30',
      core: 'from-emerald-400 via-teal-700 to-slate-950',
      label: 'FACT CHECKING RAG',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-300" />,
      pulseRate: 'duration-[1000ms]',
    },
    CHALLENGING: {
      glow: 'shadow-[0_0_75px_rgba(244,63,94,0.6)]',
      ring1: 'border-rose-500/80',
      ring2: 'border-amber-400/40',
      core: 'from-rose-500 via-red-700 to-slate-950',
      label: 'ADVERSARY CHALLENGE',
      icon: <ShieldAlert className="w-5 h-5 text-rose-300 animate-bounce" />,
      pulseRate: 'duration-[900ms]',
    },
    SPEAKING: {
      glow: 'shadow-[0_0_70px_rgba(59,130,246,0.55)]',
      ring1: 'border-cyan-400/70',
      ring2: 'border-blue-500/40',
      core: 'from-cyan-400 via-blue-600 to-indigo-900',
      label: 'SPEAKING',
      icon: <Sparkles className="w-5 h-5 text-cyan-200" />,
      pulseRate: 'duration-[1000ms]',
    },
    FOLLOW_UP: {
      glow: 'shadow-[0_0_65px_rgba(245,158,11,0.55)]',
      ring1: 'border-amber-400/70',
      ring2: 'border-orange-500/30',
      core: 'from-amber-400 via-orange-600 to-slate-950',
      label: 'PROBING FOLLOW-UP',
      icon: <Eye className="w-5 h-5 text-amber-300" />,
      pulseRate: 'duration-[1400ms]',
    },
    RECORDING: {
      glow: 'shadow-[0_0_75px_rgba(244,63,94,0.65)]',
      ring1: 'border-rose-500/90',
      ring2: 'border-red-400/40',
      core: 'from-rose-500 via-red-600 to-slate-950',
      label: 'RECORDING YOUR SPEECH',
      icon: <Mic className="w-5 h-5 text-white animate-pulse" />,
      pulseRate: 'duration-[800ms]',
    },
    TRANSCRIBING: {
      glow: 'shadow-[0_0_70px_rgba(0,242,254,0.6)]',
      ring1: 'border-cyan-400/80',
      ring2: 'border-indigo-400/40',
      core: 'from-cyan-400 via-indigo-600 to-slate-950',
      label: 'WHISPER TRANSCRIBING',
      icon: <BrainCircuit className="w-5 h-5 text-cyan-200 animate-spin" />,
      pulseRate: 'duration-[1000ms]',
    },
    EVALUATING: {
      glow: 'shadow-[0_0_65px_rgba(99,102,241,0.6)]',
      ring1: 'border-indigo-400/80',
      ring2: 'border-purple-400/40',
      core: 'from-indigo-500 via-purple-700 to-slate-950',
      label: 'EVALUATING RUBRIC',
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-300 animate-pulse" />,
      pulseRate: 'duration-[1100ms]',
    },
  };

  const current = stateConfig[state] || stateConfig.IDLE;

  const sizeClasses = {
    sm: 'w-28 h-28',
    md: 'w-44 h-44 sm:w-52 sm:h-52',
    lg: 'w-60 h-60 sm:w-72 sm:h-72',
  };

  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      {/* Outer Orbital Rotating Ring 1 */}
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-dashed transition-all animate-spin-slow',
          current.ring1,
          sizeClasses[size]
        )}
      />

      {/* Outer Orbital Rotating Ring 2 (Reverse Spin) */}
      <div
        className={cn(
          'absolute -inset-3 rounded-full border border-dotted transition-all opacity-60',
          current.ring2,
          sizeClasses[size]
        )}
        style={{ animation: 'spin 18s linear infinite reverse' }}
      />

      {/* Outer Dynamic Glow Atmosphere */}
      <div
        className={cn(
          'absolute rounded-full transition-all duration-700 bg-gradient-radial from-indigo-500/20 via-transparent to-transparent opacity-80',
          current.glow,
          sizeClasses[size]
        )}
      />

      {/* Main Pulsing Core Orb */}
      <div
        className={cn(
          'relative rounded-full flex flex-col items-center justify-center p-6 bg-gradient-to-br border border-white/20 transition-all shadow-2xl backdrop-blur-md overflow-hidden',
          current.core,
          sizeClasses[size]
        )}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

        {/* Central Aperture Iris */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md shadow-inner">
            {current.icon}
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-white uppercase drop-shadow-md text-center">
            {current.label}
          </span>
        </div>

        {/* Real-time reactive audio rings when listening or speaking */}
        {(state === 'LISTENING' || state === 'SPEAKING') && (
          <div
            className="absolute inset-2 rounded-full border border-cyan-300/40 animate-ping opacity-30 pointer-events-none"
            style={{ animationDuration: `${Math.max(600, 1500 - audioLevel * 10)}ms` }}
          />
        )}
      </div>

      {/* Floating State Indicator Tag */}
      <div className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-[#0a0d18] border border-white/15 text-[10px] font-mono text-slate-300 shadow-lg flex items-center gap-1.5 z-20">
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            state === 'CHALLENGING'
              ? 'bg-rose-400'
              : state === 'FACT_CHECKING'
              ? 'bg-emerald-400'
              : state === 'LISTENING'
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-indigo-400'
          )}
        />
        <span>AI AUTONOMOUS ENGINE</span>
      </div>
    </div>
  );
};
