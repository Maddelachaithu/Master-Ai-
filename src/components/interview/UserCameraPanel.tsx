import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VisionMetrics } from '../../types';
import { visionService } from '../../services/visionService';
import { useSession } from '../../context/SessionContext';
import { useCamera } from '../../hooks/useCamera';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  Eye,
  Activity,
  User,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Video,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn, formatTime } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface UserCameraPanelProps {
  isCameraActive: boolean;
  isMicActive: boolean;
  isMuted: boolean;
  elapsedSeconds: number;
  visionMetrics: VisionMetrics;
  audioLevel: number;
  className?: string;
  onCameraStateChange?: (active: boolean) => void;
}

export const UserCameraPanel: React.FC<UserCameraPanelProps> = ({
  isCameraActive,
  isMicActive,
  isMuted,
  elapsedSeconds,
  visionMetrics,
  audioLevel,
  className,
  onCameraStateChange,
}) => {
  const { continueWithoutVision } = useSession();
  const {
    stream,
    videoRef,
    isInitializing,
    isActive,
    permissionDenied,
    deviceNotFound,
    error: cameraHookError,
    startCamera,
    stopCamera,
    retryCamera,
  } = useCamera(isCameraActive);

  const [isHudCollapsed, setIsHudCollapsed] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);
  const lastFeedbackTimeRef = useRef(0);

  // Sync vision tracking whenever camera stream is active and video is mounted
  useEffect(() => {
    if (isActive && videoRef.current) {
      visionService.startVisionTracking(videoRef.current).catch((err) => {
        console.warn('[Vision] startVisionTracking warning:', err);
      });
    } else {
      visionService.stopVisionTracking().catch(() => {});
    }
  }, [isActive]);

  // Handle feedback banners with a 15-second cooldown to avoid distracting the candidate
  useEffect(() => {
    const now = Date.now();
    if (now - lastFeedbackTimeRef.current > 15000 && isActive) {
      if (!visionMetrics.faceDetected) {
        setLiveFeedback('Face not detected in camera frame.');
        lastFeedbackTimeRef.current = now;
      } else if (visionMetrics.cameraEngagement < 60) {
        setLiveFeedback('Camera engagement is low. Look toward the camera.');
        lastFeedbackTimeRef.current = now;
      } else if (visionMetrics.frameQuality < 65) {
        setLiveFeedback(visionMetrics.frameFeedback);
        lastFeedbackTimeRef.current = now;
      } else if (visionMetrics.postureState !== 'GOOD_ALIGNMENT') {
        setLiveFeedback(visionMetrics.postureFeedback);
        lastFeedbackTimeRef.current = now;
      } else {
        setLiveFeedback(null);
      }
    }
  }, [visionMetrics, isActive]);

  const handleTestWebcam = async () => {
    console.log('[Camera] Testing webcam stream...');
    await retryCamera();
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-[#090c16] border border-white/[0.08] shadow-2xl overflow-hidden relative',
        className
      )}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* REC Timer Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-white font-bold">REC</span>
          <span className="text-slate-300">{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Live Camera Engagement or Connection Badge */}
        {isActive ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● LIVE • Engagement: {visionMetrics.cameraEngagement}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-amber-300">
            <span>Camera Inactive</span>
          </div>
        )}
      </div>

      {/* Video Viewport Container */}
      <div className="relative aspect-video w-full bg-[#060810] flex items-center justify-center overflow-hidden">
        {/* The video element is ALWAYS mounted in the DOM to avoid ref-null race conditions */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300',
            isActive ? 'opacity-100 block' : 'opacity-0 hidden'
          )}
        />

        {/* HUD Reticle Overlay (Only when camera active) */}
        {isActive && !isHudCollapsed && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
            {/* Center Reticle */}
            <div className="my-auto mx-auto relative w-40 h-44 rounded-2xl border border-cyan-400/30 bg-cyan-950/5 flex flex-col justify-between p-2">
              <div className="flex justify-between text-[9px] font-mono text-cyan-400/80">
                <span>{visionMetrics.faceDetected ? '✓ FACE LOCK' : '⚠ ACQUIRING'}</span>
                <span>{visionMetrics.headOrientation.toUpperCase()}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Engagement: {visionMetrics.cameraEngagement}%
                </span>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>Y: {visionMetrics.headYaw}°</span>
                <span>P: {visionMetrics.headPitch}°</span>
              </div>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Bottom HUD Metadata Pill */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Posture: {visionMetrics.postureState.replace('_', ' ')}
              </span>
              <span className="text-slate-400">Frame: {visionMetrics.frameQualityState}</span>
            </div>
          </div>
        )}

        {/* Fallback Screen (Rendered when camera is not actively streaming) */}
        {!isActive && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0a0d1a] to-[#04060b] text-center space-y-2.5">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              {permissionDenied ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : isInitializing ? (
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <CameraOff className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                {permissionDenied
                  ? 'Camera Permission Required'
                  : isInitializing
                  ? 'Initializing Camera...'
                  : deviceNotFound
                  ? 'Camera Unavailable'
                  : 'Camera Not Connected'}
              </p>
              <p className="text-[10px] text-slate-400 max-w-[240px] mt-0.5 leading-snug">
                {cameraHookError ||
                  (permissionDenied
                    ? 'Allow camera access in your browser settings and try again.'
                    : 'Click Test Webcam to verify your video feed before starting.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                variant="glow"
                size="sm"
                onClick={handleTestWebcam}
                disabled={isInitializing}
                className="text-[11px] h-7 px-3"
                leftIcon={<Video className="w-3 h-3" />}
              >
                {isInitializing ? 'Connecting...' : 'Test Webcam Stream'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={continueWithoutVision}
                className="text-[11px] h-7 px-2.5 text-slate-400 hover:text-slate-200"
              >
                Continue Audio-Only
              </Button>
            </div>
          </div>
        )}

        {/* Live Audio Level Meter (Left vertical bar) */}
        <div className="absolute left-3 bottom-3 z-20 flex items-end gap-1 h-12 bg-black/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
          <div className="w-1.5 bg-slate-800 rounded-full h-full overflow-hidden flex flex-col justify-end">
            <div
              className={cn(
                'w-full transition-all duration-100 rounded-full',
                audioLevel > 70 ? 'bg-rose-500' : audioLevel > 40 ? 'bg-cyan-400' : 'bg-emerald-400'
              )}
              style={{ height: `${Math.min(100, Math.max(10, audioLevel))}%` }}
            />
          </div>
          <span className="text-[8px] font-mono text-slate-400">MIC</span>
        </div>

        {/* HUD Collapse Toggle Button */}
        {isActive && (
          <button
            onClick={() => setIsHudCollapsed((prev) => !prev)}
            className="absolute right-3 bottom-3 z-20 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all text-[10px] font-mono flex items-center gap-1"
          >
            {isHudCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{isHudCollapsed ? 'Show HUD' : 'Hide'}</span>
          </button>
        )}
      </div>

      {/* Gentle Real-Time Guidance Alert (with Cooldown) */}
      {liveFeedback && isActive && (
        <div className="px-3 py-1.5 bg-amber-950/40 border-t border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{liveFeedback}</span>
        </div>
      )}

      {/* Multimodal Telemetry Status Bar */}
      <div className="p-3 bg-[#0c0f20] border-t border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-300">
              {isMicActive && !isMuted ? (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              {isMicActive && !isMuted ? 'Mic Online' : 'Mic Muted'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              {isActive ? (
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <CameraOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              {isActive ? (
                <span className="text-emerald-400 font-semibold">✓ Camera Connected</span>
              ) : (
                <span className="text-slate-400">Camera Off</span>
              )}
            </span>
          </div>

          <span className="text-[10px] text-emerald-400 font-bold">
            POSTURE: {visionMetrics.postureState.toUpperCase()}
          </span>
        </div>

        {/* Responsible AI Notice */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/[0.04]">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Observable technical signals only. Zero raw video stored.</span>
        </div>
      </div>
    </div>
  );
};
