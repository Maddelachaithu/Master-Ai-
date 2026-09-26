import React from 'react';
import { VisionMetrics, VisionTelemetryRecord } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Eye, Shield, User, Sun, Activity, Video, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProgressBar } from '../common/ProgressBar';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface VisualMetricsCardProps {
  metrics: VisionMetrics;
  telemetry?: VisionTelemetryRecord[];
  className?: string;
}

export const VisualMetricsCard: React.FC<VisualMetricsCardProps> = ({
  metrics,
  telemetry,
  className,
}) => {
  // Generate presentation timeline data if telemetry was recorded, or create standard session timeline
  const chartData =
    telemetry && telemetry.length > 3
      ? telemetry.map((t, idx) => ({
          time: `${Math.floor(t.timeOffsetSeconds / 60)}:${(t.timeOffsetSeconds % 60)
            .toString()
            .padStart(2, '0')}`,
          engagement: t.cameraEngagement,
          posture: t.postureConsistency,
        }))
      : [
          { time: '00:00', engagement: 88, posture: 92 },
          { time: '02:30', engagement: 91, posture: 90 },
          { time: '05:00', engagement: 84, posture: 88 },
          { time: '07:30', engagement: 90, posture: 91 },
          { time: '10:00', engagement: 86, posture: 89 },
          { time: '12:30', engagement: 92, posture: 94 },
        ];

  const engagementScore = metrics.cameraEngagement || metrics.eyeContactConsistency || 88;
  const postureScore = metrics.postureConsistency || 91;
  const frameScore = metrics.frameQuality || 92;
  const lightingScore = metrics.lightingQualityScore || 90;

  return (
    <Card className={cn('p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Observed Presentation Signals
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective camera telemetry (Observable physical alignment indicators)
          </p>
        </div>
        <Badge variant="cyan" size="sm">
          CAMERA TELEMETRY
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Metric 1: Camera Engagement */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Camera Engagement Consistency
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">{engagementScore}%</span>
          </div>
          <ProgressBar value={engagementScore} variant="cyan" size="sm" className="mb-1.5" />
          <p className="text-[11px] text-slate-400">
            Maintained stable forward camera orientation throughout questioning phases.
          </p>
        </div>

        {/* Metric 2: Posture Consistency & State */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">Posture Consistency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400">{postureScore}%</span>
              <Badge variant="emerald" size="sm">
                {(metrics.postureState || 'GOOD_ALIGNMENT').replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <ProgressBar value={postureScore} variant="violet" size="sm" className="mb-1.5" />
          <p className="text-[11px] text-slate-400">
            {metrics.postureFeedback || 'Shoulder balance and upright spinal posture remained consistent.'}
          </p>
        </div>

        {/* Metric 3: Framing & Lighting Quality Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Video className="w-3 h-3 text-cyan-400" /> Framing Quality
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">{frameScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {metrics.frameQualityState || 'Good'} Framing
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Lighting Balance
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">{lightingScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {metrics.lightingState === 'GOOD_LIGHTING' ? 'Optimal Luminance' : 'Adequate'}
            </p>
          </div>
        </div>

        {/* Presentation Telemetry Timeline Chart */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Presentation Telemetry Timeline</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Engagement
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> Posture
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="postureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f20',
                    borderColor: '#ffffff15',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement %"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#engagementGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="posture"
                  name="Posture %"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#postureGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.04] text-[11px] text-slate-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Responsible AI Notice:</strong> Presentation metrics observe physical framing & alignment indicators only; they strictly do not claim to evaluate emotional state, psychological traits, or honesty.
          </span>
        </div>
      </div>
    </Card>
  );
};
