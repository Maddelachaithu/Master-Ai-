import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'panel' | 'subtle' | 'glow' | 'gradient';
  hoverEffect?: boolean;
  glowColor?: 'indigo' | 'cyan' | 'rose' | 'amber';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverEffect = false,
  glowColor = 'indigo',
  ...props
}) => {
  const variantStyles = {
    glass: 'bg-[#0e1220]/80 backdrop-blur-xl border border-white/[0.08] shadow-xl',
    panel: 'bg-[#121626] border border-white/[0.06]',
    subtle: 'bg-[#090b14]/90 border border-slate-800/80',
    glow: `bg-[#0e1220]/90 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.15)]`,
    gradient: 'bg-gradient-to-br from-[#12172b] to-[#0a0d18] border border-indigo-500/20',
  };

  const hoverStyles = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_12px_30px_rgba(99,102,241,0.18)] cursor-pointer'
    : '';

  return (
    <div
      className={cn(
        'rounded-2xl relative overflow-hidden',
        variantStyles[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
