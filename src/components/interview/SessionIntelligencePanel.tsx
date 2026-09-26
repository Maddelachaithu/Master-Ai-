import React from 'react';
import { InterviewQuestion, VisionMetrics, VoiceMetrics, AIState } from '../../types';
import { ThinkingStep } from '../../context/SessionContext';
import { AIThinkingVisualizer } from './AIThinkingVisualizer';
import { AgentActivityPanel } from './AgentActivityPanel';
import { Badge } from '../common/Badge';
import { Timer, Zap, Activity, Eye, Mic, Brain, Sparkles, MessageSquare } from 'lucide-react';
import { cn, formatTime } from '../../lib/utils';

interface SessionIntelligencePanelProps {
  question: InterviewQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  elapsedSeconds: number;
  targetDurationMinutes: number;
  aiState: AIState;
  thinkingStep: ThinkingStep;
  visionMetrics: VisionMetrics;
  voiceMetrics: VoiceMetrics;
  hasChallengerActive?: boolean;
  hasFactChecks?: boolean;
  className?: string;
}

export const SessionIntelligencePanel: React.FC<SessionIntelligencePanelProps> = ({
  question,
  questionIndex,
  totalQuestions,
  elapsedSeconds,
  targetDurationMinutes,
  aiState,
  thinkingStep,
  visionMetrics,
  voiceMetrics,
  hasChallengerActive = false,
  hasFactChecks = false,
  className,
}) => {
  const targetTotalSeconds = targetDurationMinutes * 60;
  const remainingSeconds = Math.max(0, targetTotalSeconds - elapsedSeconds);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Session Header Card */}
      <div className="p-4 rounded-2xl bg-[#0b0e1d]/90 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase text-slate-300">Session Timer</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
            <span className="text-cyan-400">{formatTime(elapsedSeconds)}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{formatTime(targetTotalSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Domain Challenge:</span>
          <span className="text-indigo-300 font-semibold truncate max-w-[170px]">
            {question?.subTopic || 'Enterprise Security'}
          </span>
        </div>
      </div>

      {/* Stage 4 Multi-Agent Activity Panel */}
      <AgentActivityPanel
        aiState={aiState}
        hasChallengerActive={hasChallengerActive}
        hasFactChecks={hasFactChecks}
      />

      {/* Real-time Autonomous AI Thinking Pipeline Visualizer */}
      <AIThinkingVisualizer currentStep={thinkingStep} />

      {/* Multimodal Live Telemetry Gauges */}
      <div className="p-4 rounded-2xl bg-[#0b0e1d]/90 border border-white/[0.08] backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Live Delivery Telemetry
          </span>
          <Badge variant="cyan" size="sm">
            ACTIVE
          </Badge>
        </div>

        {/* Metric 1: Speaking Pace */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-medium text-slate-200">Speaking Pace</p>
              <p className="text-[10px] text-slate-400">Target: 120-150 WPM</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-emerald-400">{voiceMetrics.speakingRate} WPM</p>
            <p className="text-[10px] font-mono text-emerald-400/80">Optimal Cadence</p>
          </div>
        </div>

        {/* Metric 2: Filler Words */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-medium text-slate-200">Filler Words</p>
              <p className="text-[10px] text-slate-400">Detected hesitations</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-amber-400">{voiceMetrics.fillerWordCount} Detected</p>
            <p className="text-[10px] font-mono text-slate-400">"um", "like"</p>
          </div>
        </div>

        {/* Metric 3: Eye Contact Consistency */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-xs font-medium text-slate-200">Eye-Contact Alignment</p>
              <p className="text-[10px] text-slate-400">Neutral camera focus</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-cyan-400">{visionMetrics.eyeContactConsistency}%</p>
            <p className="text-[10px] font-mono text-cyan-400/80">High Consistency</p>
          </div>
        </div>
      </div>
    </div>
  );
};
