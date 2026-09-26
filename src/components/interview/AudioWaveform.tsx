import React from 'react';
import { cn } from '../../lib/utils';

interface AudioWaveformProps {
  isActive: boolean;
  color?: 'cyan' | 'violet' | 'rose' | 'emerald';
  barsCount?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  color = 'cyan',
  barsCount = 20,
  className,
}) => {
  const bars = Array.from({ length: barsCount });

  const colorStyles = {
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]',
    violet: 'bg-indigo-400 shadow-[0_0_8px_#6366f1]',
    rose: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    emerald: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
  };

  return (
    <div className={cn('flex items-center justify-center gap-1 h-10 px-3', className)}>
      {bars.map((_, i) => {
        // Calculate variable heights based on index
        const randomHeight = isActive
          ? Math.floor(20 + Math.sin(i * 0.8) * 15 + Math.random() * 40)
          : 6;

        return (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-150',
              isActive ? colorStyles[color] : 'bg-slate-800'
            )}
            style={{
              height: `${randomHeight}%`,
              animationDelay: `${i * 45}ms`,
            }}
          />
        );
      })}
    </div>
  );
};
