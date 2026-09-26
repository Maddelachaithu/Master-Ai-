import React from 'react';
import { Swords, User, Bot, HelpCircle, CheckCircle } from 'lucide-react';
import { DebateRound } from '../../types';

interface DebateRoundCardProps {
  round: DebateRound;
  isLatest?: boolean;
}

export const DebateRoundCard: React.FC<DebateRoundCardProps> = ({
  round,
  isLatest = false,
}) => {
  return (
    <div
      className={`rounded-xl border p-4 space-y-3.5 backdrop-blur-md transition-all duration-300 ${
        isLatest
          ? 'border-cyan-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-lg shadow-cyan-950/20'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      {/* Round Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            ROUND {round.round_number}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Focus: {round.counterargument_focus}
          </span>
        </div>
        <Swords className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* Candidate Argument */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <User className="w-3 h-3 text-cyan-400" />
          <span>Candidate Argument</span>
        </div>
        <p className="text-sm text-slate-200 pl-4 border-l-2 border-cyan-500/40 leading-relaxed italic">
          "{round.candidate_speech}"
        </p>
      </div>

      {/* AI Rebuttal */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
          <Bot className="w-3 h-3 text-amber-400" />
          <span>AI Opponent Rebuttal</span>
        </div>
        <p className="text-sm text-slate-100 pl-4 border-l-2 border-amber-500/40 leading-relaxed bg-amber-950/10 p-2.5 rounded-r-lg">
          {round.ai_rebuttal}
        </p>
      </div>

      {/* Demanded Evidence if present */}
      {round.evidence_demanded && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
          <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-300">Evidence Challenge: </span>
            <span>{round.evidence_demanded}</span>
          </div>
        </div>
      )}

      {/* Claims Checked */}
      {round.claims_checked && round.claims_checked.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Claims Analyzed:</span>
          <div className="flex flex-wrap gap-1.5">
            {round.claims_checked.map((claim, cIdx) => (
              <span
                key={cIdx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono"
              >
                <CheckCircle className="w-2.5 h-2.5 text-cyan-400" />
                {claim}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
