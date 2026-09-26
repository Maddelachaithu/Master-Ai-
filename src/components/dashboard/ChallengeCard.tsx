import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, Play, Zap } from 'lucide-react';
import { DifficultyLevel, InterviewMode } from '../../types';
import { cn } from '../../lib/utils';

export interface ChallengeCardProps {
  mode: InterviewMode;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: string;
  icon: React.ReactNode;
  tags?: string[];
  onStart: () => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  mode,
  title,
  description,
  difficulty,
  duration,
  icon,
  tags,
  onStart,
  className,
}) => {
  const difficultyVariant =
    difficulty === 'expert'
      ? 'rose'
      : difficulty === 'advanced'
      ? 'violet'
      : difficulty === 'intermediate'
      ? 'cyan'
      : 'emerald';

  return (
    <Card
      hoverEffect
      className={cn(
        'p-5 sm:p-6 flex flex-col justify-between group bg-gradient-to-br from-[#0e1222]/90 to-[#080a13] border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300',
        className
      )}
    >
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-400/50 transition-all shadow-md">
            {icon}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={difficultyVariant} size="sm">
              {difficulty.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-base sm:text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
          {description}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-white/[0.04] text-[10px] font-mono text-slate-300"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Duration & CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{duration}</span>
        </div>

        <Button
          variant="glow"
          size="sm"
          rightIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          onClick={onStart}
          className="shadow-sm"
        >
          Start Challenge
        </Button>
      </div>
    </Card>
  );
};
