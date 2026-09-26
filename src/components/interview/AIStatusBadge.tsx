import React from 'react';
import { AIState } from '../../types';
import { cn } from '../../lib/utils';
import { Mic, Brain, Eye, CheckCircle2, ShieldAlert, Volume2, Sparkles } from 'lucide-react';

interface AIStatusBadgeProps {
  state: AIState;
  customMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({
  state,
  customMessage,
  className,
  size = 'md',
}) => {
  const configs: Record<
    AIState,
    {
      title: string;
      defaultDesc: string;
      dotColor: string;
      textColor: string;
      bgGradient: string;
      borderColor: string;
      icon: React.ReactNode;
    }
  > = {
    IDLE: {
      title: 'IDLE',
      defaultDesc: 'Waiting for session start...',
      dotColor: 'bg-indigo-400',
      textColor: 'text-indigo-300',
      bgGradient: 'bg-indigo-950/40',
      borderColor: 'border-indigo-500/30',
      icon: <Brain className="w-3.5 h-3.5 text-indigo-400" />,
    },
    LISTENING: {
      title: 'LISTENING',
      defaultDesc: 'Listening to your answer...',
      dotColor: 'bg-cyan-400 animate-pulse',
      textColor: 'text-cyan-300',
      bgGradient: 'bg-cyan-950/40',
      borderColor: 'border-cyan-500/40',
      icon: <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />,
    },
    THINKING: {
      title: 'THINKING',
      defaultDesc: 'Synthesizing response context...',
      dotColor: 'bg-purple-400 animate-ping',
      textColor: 'text-purple-300',
      bgGradient: 'bg-purple-950/40',
      borderColor: 'border-purple-500/40',
      icon: <Brain className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
    },
    ANALYZING: {
      title: 'ANALYZING',
      defaultDesc: 'Analyzing your reasoning & completeness...',
      dotColor: 'bg-blue-400 animate-pulse',
      textColor: 'text-blue-300',
      bgGradient: 'bg-blue-950/40',
      borderColor: 'border-blue-500/40',
      icon: <Eye className="w-3.5 h-3.5 text-blue-400" />,
    },
    FACT_CHECKING: {
      title: 'FACT CHECKING',
      defaultDesc: 'Verifying claims against knowledge corpus...',
      dotColor: 'bg-emerald-400 animate-pulse',
      textColor: 'text-emerald-300',
      bgGradient: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    },
    CHALLENGING: {
      title: 'CHALLENGING',
      defaultDesc: 'Preparing adversarial counter-probe...',
      dotColor: 'bg-rose-400 animate-bounce',
      textColor: 'text-rose-300',
      bgGradient: 'bg-rose-950/40',
      borderColor: 'border-rose-500/40',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
    },
    SPEAKING: {
      title: 'SPEAKING',
      defaultDesc: 'Master AI presenting prompt...',
      dotColor: 'bg-cyan-400 animate-pulse',
      textColor: 'text-cyan-200',
      bgGradient: 'bg-cyan-950/30',
      borderColor: 'border-cyan-500/40',
      icon: <Volume2 className="w-3.5 h-3.5 text-cyan-300" />,
    },
    FOLLOW_UP: {
      title: 'FOLLOW UP',
      defaultDesc: 'Probing specific detail...',
      dotColor: 'bg-amber-400 animate-pulse',
      textColor: 'text-amber-300',
      bgGradient: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    },
    RECORDING: {
      title: 'RECORDING ANSWER',
      defaultDesc: 'Capturing speech from microphone...',
      dotColor: 'bg-rose-500 animate-ping',
      textColor: 'text-rose-300',
      bgGradient: 'bg-rose-950/50',
      borderColor: 'border-rose-500/50',
      icon: <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />,
    },
    TRANSCRIBING: {
      title: 'WHISPER TRANSCRIBING',
      defaultDesc: 'Transcribing speech with faster-whisper...',
      dotColor: 'bg-cyan-400 animate-spin',
      textColor: 'text-cyan-300',
      bgGradient: 'bg-cyan-950/50',
      borderColor: 'border-cyan-500/50',
      icon: <Brain className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
    },
    EVALUATING: {
      title: 'EVALUATING RUBRIC',
      defaultDesc: 'Scoring correctness, completeness & reasoning...',
      dotColor: 'bg-indigo-400 animate-pulse',
      textColor: 'text-indigo-300',
      bgGradient: 'bg-indigo-950/50',
      borderColor: 'border-indigo-500/50',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />,
    },
  };

  const current = configs[state] || configs.IDLE;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-md',
        current.bgGradient,
        current.borderColor,
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', current.dotColor)} />
        <span className={cn('font-mono font-bold tracking-wider text-xs', current.textColor)}>
          ● {current.title}
        </span>
      </div>

      <div className="h-3 w-[1px] bg-white/15" />

      <span className="text-slate-300 text-xs truncate max-w-[280px] sm:max-w-md font-medium">
        "{customMessage || current.defaultDesc}"
      </span>
    </div>
  );
};
