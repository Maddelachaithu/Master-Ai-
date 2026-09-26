import React from 'react';
import { Zap, Play, ShieldAlert, Clock, Sliders } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface QuickStartCardProps {
  onStart: (config: {
    role: string;
    difficulty: string;
    mode: string;
    durationMinutes: number;
  }) => void;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({ onStart }) => {
  const quickConfig = {
    role: 'SOC Analyst',
    difficulty: 'advanced',
    mode: 'cybersecurity',
    durationMinutes: 30,
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121630] to-[#070914] border border-indigo-500/30 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-300" />
          <h3 className="text-sm font-bold font-display text-white">Quick Start Interview</h3>
        </div>
        <Badge variant="violet" size="sm">
          Instant Launch
        </Badge>
      </div>

      <p className="text-xs text-slate-400">
        Jump directly into a 30-minute high-pressure SOC Analyst technical interview.
      </p>

      {/* Spec Pills */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Role:</span>
          <span className="text-slate-200 font-bold">{quickConfig.role}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Difficulty:</span>
          <span className="text-cyan-400 font-bold capitalize">{quickConfig.difficulty}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Mode:</span>
          <span className="text-indigo-400 font-bold">Technical</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Duration:</span>
          <span className="text-amber-400 font-bold">{quickConfig.durationMinutes} mins</span>
        </div>
      </div>

      <Button
        variant="glow"
        size="md"
        className="w-full"
        onClick={() => onStart(quickConfig)}
        leftIcon={<Play className="w-4 h-4 text-cyan-300" />}
      >
        Start Instant Interview
      </Button>
    </div>
  );
};
