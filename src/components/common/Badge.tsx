import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  pulse = false,
  className,
  icon,
}) => {
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    violet: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-mono font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
