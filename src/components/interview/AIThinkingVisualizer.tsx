import React from 'react';
import { ThinkingStep } from '../../context/SessionContext';
import { cn } from '../../lib/utils';
import { Check, Loader2, ArrowRight } from 'lucide-react';

interface AIThinkingVisualizerProps {
  currentStep: ThinkingStep;
  className?: string;
}

export const AIThinkingVisualizer: React.FC<AIThinkingVisualizerProps> = ({
  currentStep,
  className,
}) => {
  const steps: { key: ThinkingStep; label: string; desc: string }[] = [
    { key: 'Listening', label: 'Listen', desc: 'Audio Stream' },
    { key: 'Understanding', label: 'Semantic', desc: 'Intent Parsing' },
    { key: 'Analyzing', label: 'Reasoning', desc: 'Rubric Evaluator' },
    { key: 'Checking', label: 'Fact Check', desc: 'Knowledge Base' },
    { key: 'Generating Follow-Up', label: 'Adversary', desc: 'Follow-Up Generation' },
  ];

  const stepOrder: Record<ThinkingStep, number> = {
    Idle: 0,
    Listening: 1,
    Understanding: 2,
    Analyzing: 3,
    Checking: 4,
    'Generating Follow-Up': 5,
  };

  const currentIndex = stepOrder[currentStep];

  return (
    <div className={cn('p-3.5 rounded-2xl bg-[#0b0e1b]/90 border border-white/[0.08] backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
            Autonomous Reasoning Pipeline
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          {currentStep === 'Idle' ? 'Awaiting Input' : `Phase: ${currentStep}`}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isDone = currentIndex > stepNumber;
          const isCurrent = currentIndex === stepNumber;

          return (
            <div
              key={step.key}
              className={cn(
                'relative flex flex-col items-center text-center p-2 rounded-xl border transition-all duration-300',
                isCurrent
                  ? 'bg-gradient-to-b from-indigo-900/60 to-purple-950/60 border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900/40 border-white/[0.04] opacity-50'
              )}
            >
              {/* Step indicator icon */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mb-1',
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#00f2fe]'
                    : isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                )}
              >
                {isDone ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  stepNumber
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] sm:text-[11px] font-bold truncate max-w-full',
                  isCurrent ? 'text-white' : isDone ? 'text-emerald-300' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>

              <span className="hidden sm:block text-[9px] text-slate-400 truncate max-w-full">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
