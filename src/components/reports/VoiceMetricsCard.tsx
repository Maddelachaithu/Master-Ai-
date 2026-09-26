import React from 'react';
import { VoiceMetrics } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Mic, MessageSquare, Clock, Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProgressBar } from '../common/ProgressBar';

interface VoiceMetricsCardProps {
  metrics: VoiceMetrics;
  className?: string;
}

export const VoiceMetricsCard: React.FC<VoiceMetricsCardProps> = ({ metrics, className }) => {
  return (
    <Card className={cn('p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            Vocal Delivery & Speech Cadence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Speaking rate, hesitations, pause durations, and articulation
          </p>
        </div>
        <Badge variant="violet" size="sm">
          AUDIO ANALYSIS
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Metric 1: Speaking Pace */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">Speaking Pace (WPM)</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {metrics.speakingRate} WPM
            </span>
          </div>
          <ProgressBar value={85} variant="emerald" size="sm" className="mb-1.5" />
          <p className="text-[11px] text-slate-400">
            Optimal pace (120-150 WPM). Clear cadence with appropriate phrase transitions.
          </p>
        </div>

        {/* Metric 2: Filler Words */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Filler Words Detected</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {metrics.fillerWordCount} total
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {metrics.fillerWordsList.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300"
              >
                "{item.word}" <span className="text-amber-400 font-bold">×{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Metric 3: Articulation & Pause */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04]">
            <p className="text-[11px] text-slate-400 mb-1">Avg Pause Length</p>
            <p className="text-base font-bold font-mono text-cyan-300">{metrics.pauseDuration}s</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">Natural pauses</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04]">
            <p className="text-[11px] text-slate-400 mb-1">Articulation Score</p>
            <p className="text-base font-bold font-mono text-indigo-300">{metrics.articulationScore}%</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">High clarity</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
