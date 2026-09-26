import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  interactive?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className,
  interactive = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', dot: 'w-2.5 h-2.5' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', dot: 'w-3 h-3' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* Abstract AI / Eye Icon Treatment */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0c101d] to-[#161a2e] p-1.5 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]',
          currentSize.icon,
          interactive && 'transition-transform duration-300 hover:scale-105 hover:border-cyan-400/50'
        )}
      >
        {/* Glowing Neural Ring */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 animate-pulse-glow" />

        {/* Abstract Eye & Aperture SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            stroke="url(#masterGrad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Inner Aperture Diamond */}
          <polygon
            points="20,10 30,20 20,30 10,20"
            stroke="#00f2fe"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          {/* Central AI Eye Pupil */}
          <circle cx="20" cy="20" r="4.5" fill="url(#coreGlow)" />
          <circle cx="20" cy="20" r="2" fill="#ffffff" />
          
          <defs>
            <linearGradient id="masterGrad" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00f2fe" />
              <stop offset="0.5" stopColor="#6366f1" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="coreGlow" x1="16" y1="16" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00f2fe" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Corner Neon Accents */}
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={cn('font-display font-extrabold tracking-wider text-white', currentSize.text)}>
            MASTER
          </span>
          <span
            className={cn(
              'font-display font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400',
              currentSize.text
            )}
          >
            AI
          </span>
          <div className="flex items-center ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            PRO
          </div>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 tracking-wide font-medium">
            Autonomous Adversary
          </span>
        )}
      </div>
    </div>
  );
};
