import React from 'react';
import { Target, TrendingUp, ShieldCheck, Award, HelpCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface InterviewReadinessCardProps {
  targetRole?: string;
  technicalScore?: number;
  reasoningScore?: number;
  communicationScore?: number;
  presentationScore?: number;
  totalSessionsCompleted?: number;
}

export const InterviewReadinessCard: React.FC<InterviewReadinessCardProps> = ({
  targetRole = 'SOC Analyst',
  technicalScore = 82,
  reasoningScore = 75,
  communicationScore = 79,
  presentationScore = 76,
  totalSessionsCompleted = 24,
}) => {
  const hasSufficientHistory = totalSessionsCompleted >= 2;

  // Deterministic weighted formula: 40% Technical, 25% Reasoning, 20% Communication, 15% Presentation
  const readinessPercentage = Math.round(
    technicalScore * 0.4 +
    reasoningScore * 0.25 +
    communicationScore * 0.2 +
    presentationScore * 0.15
  );

  const pillars = [
    { label: 'Technical Accuracy', score: technicalScore, weight: '40%' },
    { label: 'Reasoning & Logic', score: reasoningScore, weight: '25%' },
    { label: 'Communication Pacing', score: communicationScore, weight: '20%' },
    { label: 'Presentation & HUD', score: presentationScore, weight: '15%' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1224] to-[#070914] border border-cyan-500/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-display text-white">Interview Readiness</h3>
        </div>
        <Badge variant="cyan" size="sm">
          {targetRole}
        </Badge>
      </div>

      {hasSufficientHistory ? (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black font-mono text-cyan-400">
                {readinessPercentage}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Role Preparedness Index (Grounded)
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <TrendingUp className="w-3.5 h-3.5" />
                +5.4% this week
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Based on {totalSessionsCompleted} sessions</span>
            </div>
          </div>

          {/* Pillar Progress Bars */}
          <div className="space-y-2.5 pt-1">
            {pillars.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{p.label}</span>
                  <span className="text-slate-200 font-bold">{p.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${p.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-6 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            Complete {Math.max(1, 2 - totalSessionsCompleted)} more interview(s) to calculate readiness index.
          </p>
        </div>
      )}
    </div>
  );
};
