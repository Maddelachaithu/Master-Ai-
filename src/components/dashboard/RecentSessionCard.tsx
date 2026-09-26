import React from 'react';
import { InterviewSession } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Calendar, Clock, ChevronRight, Award, Shield, FileText } from 'lucide-react';
import { cn, formatDate, formatTime, getScoreColor } from '../../lib/utils';

interface RecentSessionCardProps {
  session: InterviewSession;
  onViewReport: (sessionId: string) => void;
  className?: string;
}

export const RecentSessionCard: React.FC<RecentSessionCardProps> = ({
  session,
  onViewReport,
  className,
}) => {
  const scoreColors = getScoreColor(session.score);

  return (
    <Card
      hoverEffect
      onClick={() => onViewReport(session.id)}
      className={cn(
        'p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e1220]/80 border border-white/[0.06] hover:border-indigo-500/30 transition-all',
        className
      )}
    >
      {/* Left Metadata */}
      <div className="flex items-start sm:items-center gap-3.5">
        {/* Score Circle / Badge */}
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex flex-col items-center justify-center border font-mono font-bold shrink-0',
            scoreColors.bg,
            scoreColors.border,
            scoreColors.text,
            scoreColors.glow
          )}
        >
          <span className="text-lg leading-none">{session.score}</span>
          <span className="text-[9px] font-sans opacity-75">SCORE</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet" size="sm">
              {session.mode.toUpperCase()}
            </Badge>
            <Badge variant="outline" size="sm">
              {session.difficulty.toUpperCase()}
            </Badge>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {session.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(session.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatTime(session.durationSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action */}
      <Button
        variant="outline"
        size="sm"
        rightIcon={<ChevronRight className="w-4 h-4" />}
        onClick={(e) => {
          e.stopPropagation();
          onViewReport(session.id);
        }}
        className="w-full sm:w-auto shrink-0"
      >
        View Report
      </Button>
    </Card>
  );
};
