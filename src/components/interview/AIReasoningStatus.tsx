import React from 'react';
import { Loader2, Sparkles, ShieldCheck, Zap, BarChart2, Mic } from 'lucide-react';
import { AIState } from '../../types';

interface AIReasoningStatusProps {
  aiState: AIState;
  customStatus?: string;
  className?: string;
}

export const AIReasoningStatus: React.FC<AIReasoningStatusProps> = ({
  aiState,
  customStatus,
  className = '',
}) => {
  const getStatusDetails = () => {
    if (customStatus) {
      return {
        icon: Sparkles,
        text: customStatus,
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/30 border-cyan-500/20',
      };
    }

    switch (aiState) {
      case 'ANALYZING':
      case 'THINKING':
        return {
          icon: Sparkles,
          text: 'MASTER AI is analyzing your answer structure...',
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/30 border-cyan-500/30',
        };
      case 'FACT_CHECKING':
        return {
          icon: ShieldCheck,
          text: 'Verifying technical claims against vendor documentation & RFCs...',
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/30 border-emerald-500/30',
        };
      case 'CHALLENGING':
        return {
          icon: Zap,
          text: 'Adversarial reasoning: pressure-testing logical assumptions...',
          color: 'text-amber-400',
          bg: 'bg-amber-950/30 border-amber-500/30',
        };
      case 'EVALUATING':
        return {
          icon: BarChart2,
          text: 'Synthesizing objective rubric evaluation...',
          color: 'text-purple-400',
          bg: 'bg-purple-950/30 border-purple-500/30',
        };
      case 'LISTENING':
      case 'RECORDING':
        return {
          icon: Mic,
          text: 'Listening to your response (Microphone & Presentation active)...',
          color: 'text-rose-400',
          bg: 'bg-rose-950/30 border-rose-500/30',
        };
      case 'SPEAKING':
        return {
          icon: Sparkles,
          text: 'MASTER AI is responding...',
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/30 border-cyan-500/30',
        };
      default:
        return {
          icon: Sparkles,
          text: 'MASTER AI Ready',
          color: 'text-slate-400',
          bg: 'bg-slate-900/40 border-slate-800',
        };
    }
  };

  const details = getStatusDetails();
  const Icon = details.icon;
  const isBusy = ['ANALYZING', 'THINKING', 'FACT_CHECKING', 'CHALLENGING', 'EVALUATING', 'RECORDING'].includes(
    aiState
  );

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
        details.bg
      } ${className}`}
    >
      {isBusy ? (
        <Loader2 className={`w-3.5 h-3.5 animate-spin ${details.color}`} />
      ) : (
        <Icon className={`w-3.5 h-3.5 ${details.color}`} />
      )}
      <span className={`text-xs font-medium ${details.color}`}>{details.text}</span>
    </div>
  );
};
