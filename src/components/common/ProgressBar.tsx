import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  variant?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'gradient',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    cyan: 'bg-cyan-500 shadow-[0_0_10px_#00f2fe]',
    violet: 'bg-indigo-500 shadow-[0_0_10px_#6366f1]',
    emerald: 'bg-emerald-500 shadow-[0_0_10px_#10b981]',
    amber: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
    gradient: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-slate-300">
          <span>Progress</span>
          <span className="font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/[0.05]', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
