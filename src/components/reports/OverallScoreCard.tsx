import React from 'react';
import { PerformanceReport } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Award, ShieldCheck, Zap, RotateCcw, Share2, Download, ArrowRight } from 'lucide-react';
import { cn, formatTime, getScoreColor } from '../../lib/utils';

interface OverallScoreCardProps {
  report: PerformanceReport;
  onRetry: () => void;
  onImprovementPlan: () => void;
  className?: string;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({
  report,
  onRetry,
  onImprovementPlan,
  className,
}) => {
  const scoreColors = getScoreColor(report.overallScore);

  return (
    <Card
      className={cn(
        'p-6 sm:p-8 bg-gradient-to-br from-[#0e1328] via-[#090b16] to-[#060810] border border-indigo-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden',
        className
      )}
    >
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-indigo-500/15 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left Score Circle & Grade */}
        <div className="flex items-center gap-5 sm:gap-6">
          <div
            className={cn(
              'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex flex-col items-center justify-center border-2 font-display font-black shrink-0 relative bg-black/40 backdrop-blur-md',
              scoreColors.border,
              scoreColors.glow
            )}
          >
            <span className={cn('text-4xl sm:text-5xl tracking-tight', scoreColors.text)}>
              {report.overallScore}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 mt-0.5">
              OUT OF 100
            </span>
            <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-mono font-bold shadow-md border border-white/20">
              GRADE {report.grade}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">
                {report.mode.toUpperCase()}
              </Badge>
              <Badge variant="violet" size="sm">
                {report.difficulty.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Duration: {formatTime(report.durationSeconds)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display text-white mb-2">
              Performance Evaluation Report
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          <Button
            variant="glow"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onImprovementPlan}
            className="w-full sm:w-auto"
          >
            View Improvement Plan
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onRetry}
            className="w-full sm:w-auto"
          >
            Practice Again
          </Button>
        </div>
      </div>

      {/* Adversary Verdict Banner */}
      <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-200">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300 font-mono">MASTER AI ADVERSARY VERDICT: </span>
          <span className="text-slate-300">{report.adversaryVerdict}</span>
        </div>
      </div>
    </Card>
  );
};
