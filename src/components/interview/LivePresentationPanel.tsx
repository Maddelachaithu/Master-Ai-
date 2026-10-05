import React from 'react';
import { VisionMetrics } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Eye, User, Sun, ShieldCheck, Video, Compass, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LivePresentationPanelProps {
  visionMetrics: VisionMetrics;
  className?: string;
}

export const LivePresentationPanel: React.FC<LivePresentationPanelProps> = ({
  visionMetrics,
  className,
}) => {
  return (
    <div className={cn('p-4 rounded-2xl bg-[#0b0e1d]/90 border border-white/[0.08] backdrop-blur-xl space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Presentation Telemetry
          </span>
        </div>
        <Badge variant={visionMetrics.faceDetected ? 'emerald' : 'amber'} size="sm">
          {visionMetrics.faceDetected ? '✓ FACE DETECTED' : '⚠ FACE MISSING'}
        </Badge>
      </div>

      {/* Grid of Observable Metrics */}
      <div className="space-y-3">
        {/* Metric 1: Camera Engagement */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Camera Engagement
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {visionMetrics.cameraEngagement}%
            </span>
          </div>
          <ProgressBar value={visionMetrics.cameraEngagement} variant="cyan" size="sm" className="mb-1" />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Orientation: {visionMetrics.headOrientation}</span>
            <span>Yaw: {visionMetrics.headYaw}°</span>
          </div>
        </div>

        {/* Metric 2: Posture Consistency */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Posture Consistency
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {visionMetrics.postureConsistency}%
            </span>
          </div>
          <ProgressBar value={visionMetrics.postureConsistency} variant="violet" size="sm" className="mb-1.5" />
          <p className="text-[11px] text-slate-300">
            {visionMetrics.postureFeedback || 'Your posture is consistent and upright.'}
          </p>
        </div>

        {/* Metric 3: Frame & Lighting Quality */}
        <div className="grid grid-cols-2 gap-2">
          {/* Frame Quality */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px] font-mono">
              <Video className="w-3 h-3 text-cyan-400" />
              <span>Framing</span>
            </div>
            <p className="text-xs font-bold text-white">
              {visionMetrics.frameQualityState} ({visionMetrics.frameQuality}%)
            </p>
          </div>

          {/* Lighting Quality */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px] font-mono">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Lighting</span>
            </div>
            <p className="text-xs font-bold text-white">
              {visionMetrics.lightingState === 'GOOD_LIGHTING' ? 'Optimal' : 'Low Light'}
            </p>
          </div>
        </div>

        {/* Metric 4: Real-Time Environment Monitoring */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Environment Monitoring
            </span>
            <span
              className={cn(
                'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border',
                visionMetrics.environmentStatus === 'BACKGROUND_PERSON_DETECTED'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  : visionMetrics.environmentStatus === 'BACKGROUND_MOVEMENT_DETECTED'
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              )}
            >
              {visionMetrics.environmentStatusText || '🟢 Environment Clear'}
            </span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span>Persons in View: {visionMetrics.detectedPersonsCount || 1}</span>
            <span>Person Events: {visionMetrics.backgroundPersonEventsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-2 rounded-lg bg-slate-950/60 border border-white/[0.04] text-[10px] text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
        <span className="truncate">Observable edge signals only. Zero video recorded.</span>
      </div>
    </div>
  );
};
