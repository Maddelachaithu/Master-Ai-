import React from 'react';
import { ScoreBreakdown } from '../../types';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { BookOpen, BrainCircuit, MessageSquare, Zap, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
  className?: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  breakdown,
  className,
}) => {
  const categories = [
    {
      id: 'knowledge',
      label: 'Technical Knowledge',
      score: breakdown.knowledge,
      explanation: breakdown.knowledgeExplanation,
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      variant: 'cyan' as const,
    },
    {
      id: 'reasoning',
      label: 'Reasoning & Logic',
      score: breakdown.reasoning,
      explanation: breakdown.reasoningExplanation,
      icon: <BrainCircuit className="w-4 h-4 text-indigo-400" />,
      variant: 'violet' as const,
    },
    {
      id: 'communication',
      label: 'Communication & Structure',
      score: breakdown.communication,
      explanation: breakdown.communicationExplanation,
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      variant: 'emerald' as const,
    },
    {
      id: 'adaptability',
      label: 'Adversarial Adaptability',
      score: breakdown.adaptability,
      explanation: breakdown.adaptabilityExplanation,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      variant: 'amber' as const,
    },
    {
      id: 'presentation',
      label: 'Presentation & Delivery',
      score: breakdown.presentation,
      explanation: breakdown.presentationExplanation,
      icon: <UserCheck className="w-4 h-4 text-cyan-400" />,
      variant: 'gradient' as const,
    },
  ];

  return (
    <Card className={cn('p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl', className)}>
      <h3 className="text-base font-bold font-display text-white mb-1">
        Rubric Score Breakdown
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        Multi-dimensional evaluation based on standardized grading criteria
      </p>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800/80 border border-white/[0.06]">
                  {cat.icon}
                </div>
                <span className="text-sm font-semibold text-white">{cat.label}</span>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {cat.score} / 100
              </span>
            </div>

            <ProgressBar value={cat.score} variant={cat.variant} size="sm" className="mb-2" />

            <p className="text-xs text-slate-300 leading-relaxed">
              {cat.explanation}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
