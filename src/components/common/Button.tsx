import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow' | 'adversary';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#07080d] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30',
      glow:
        'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-cyan-400/30 font-semibold',
      secondary:
        'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 shadow-sm',
      outline:
        'bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500',
      danger:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25 border border-rose-400/30',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-slate-400 hover:text-slate-100',
      adversary:
        'bg-gradient-to-r from-amber-600 via-rose-600 to-purple-700 hover:from-amber-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] border border-rose-400/30',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5',
      xl: 'text-lg px-7 py-3.5 gap-3 font-semibold',
      icon: 'p-2.5 w-10 h-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
