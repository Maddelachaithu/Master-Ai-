import React from 'react';
import { Target, Swords, ShieldCheck, BarChart3, Cpu, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { AIState } from '../../types';

interface AgentActivityPanelProps {
  aiState: AIState;
  hasChallengerActive?: boolean;
  hasFactChecks?: boolean;
  lastAction?: string;
  className?: string;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  aiState,
  hasChallengerActive = false,
  hasFactChecks = false,
  lastAction,
  className = '',
}) => {
  const isProcessing = ['THINKING', 'ANALYZING', 'FACT_CHECKING', 'CHALLENGING', 'EVALUATING'].includes(aiState);

  const agents = [
    {
      id: 'interviewer',
      name: 'Interviewer',
      role: 'Domain Flow & Questioning',
      icon: Target,
      color: 'cyan',
      status: ['LISTENING', 'RECORDING'].includes(aiState)
        ? 'Listening'
        : ['ANALYZING', 'THINKING'].includes(aiState)
        ? 'Directing Flow'
        : aiState === 'SPEAKING'
        ? 'Prompting Candidate'
        : 'Active',
      isActive: true,
      isBusy: ['THINKING', 'ANALYZING'].includes(aiState),
    },
    {
      id: 'challenger',
      name: 'Challenger',
      role: 'Adversarial Pressure',
      icon: Swords,
      color: 'amber',
      status: hasChallengerActive || aiState === 'CHALLENGING'
        ? 'Pressure-Testing'
        : isProcessing
        ? 'Checking Logic'
        : 'Monitoring',
      isActive: hasChallengerActive || aiState === 'CHALLENGING' || isProcessing,
      isBusy: aiState === 'CHALLENGING' || (isProcessing && hasChallengerActive),
    },
    {
      id: 'factchecker',
      name: 'Fact Checker',
      role: 'RFC & NIST Verification',
      icon: ShieldCheck,
      color: 'emerald',
      status: aiState === 'FACT_CHECKING'
        ? 'Verifying Docs'
        : hasFactChecks
        ? 'Claims Verified'
        : isProcessing
        ? 'Scanning Claims'
        : 'Standby',
      isActive: hasFactChecks || aiState === 'FACT_CHECKING' || isProcessing,
      isBusy: aiState === 'FACT_CHECKING',
    },
    {
      id: 'rubric',
      name: 'Rubric Synthesizer',
      role: 'Objective Evaluation',
      icon: BarChart3,
      color: 'purple',
      status: aiState === 'EVALUATING'
        ? 'Synthesizing Rubric'
        : isProcessing
        ? 'Scoring Answer'
        : 'Ready',
      isActive: true,
      isBusy: aiState === 'EVALUATING',
    },
  ];

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 space-y-3 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Multi-Agent AI Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Orchestrator Coordinated
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className={`p-2.5 rounded-lg border transition-all duration-200 ${
                agent.isBusy
                  ? 'border-cyan-500/50 bg-cyan-950/30 shadow-sm shadow-cyan-500/10'
                  : agent.isActive
                  ? 'border-slate-700/80 bg-slate-800/40'
                  : 'border-slate-800/50 bg-slate-900/40 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      agent.color === 'cyan'
                        ? 'text-cyan-400'
                        : agent.color === 'amber'
                        ? 'text-amber-400'
                        : agent.color === 'emerald'
                        ? 'text-emerald-400'
                        : 'text-purple-400'
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-200">{agent.name}</span>
                </div>
                {agent.isBusy ? (
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                ) : agent.isActive ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/80" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-500" />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate">{agent.role}</span>
              </div>
              <div className="mt-0.5">
                <span
                  className={`text-[10px] font-mono ${
                    agent.isBusy ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
