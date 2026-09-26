import React from 'react';
import { Card } from '../common/Card';
import { Flame, CheckCircle2, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakTrackerProps {
  streakDays: number;
  className?: string;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ streakDays, className }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Simulate Mon-Sun completed up to current day
  const completedIndices = [0, 1, 2, 3, 4, 5, 6];

  return (
    <Card
      className={cn(
        'p-5 bg-gradient-to-br from-[#12162a] to-[#0a0d18] border border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.08)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5 fill-amber-400/30 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display">Daily Challenge Streak</h4>
            <p className="text-xs text-slate-400">Keep momentum for mastery</p>
          </div>
        </div>

        <span className="text-xl font-extrabold font-mono text-amber-400">
          {streakDays} Days 🔥
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isDone = completedIndices.includes(idx);
          return (
            <div
              key={day}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl border text-center transition-all',
                isDone
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900/40 border-white/[0.04] text-slate-500'
              )}
            >
              <span className="text-[10px] font-mono mb-1">{day}</span>
              <CheckCircle2
                className={cn('w-4 h-4', isDone ? 'text-amber-400' : 'text-slate-700')}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
