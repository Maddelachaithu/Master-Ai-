import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  glowColor?: 'indigo' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'violet';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowColor = 'indigo',
  className,
}) => {
  const glowStyles = {
    indigo: 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    violet: 'border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)]',
    rose: 'border-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    amber: 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  };

  const iconBgStyles = {
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    violet: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <Card
      className={cn(
        'p-5 transition-all duration-300 bg-[#0d101e]/85 backdrop-blur-xl border',
        glowStyles[glowColor],
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('p-2 rounded-xl border', iconBgStyles[glowColor])}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
          {value}
        </h3>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full',
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            )}
          >
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </Card>
  );
};
