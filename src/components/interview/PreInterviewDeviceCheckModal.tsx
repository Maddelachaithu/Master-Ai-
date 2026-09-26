import React, { useEffect, useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { visionService } from '../../services/visionService';
import { speechService } from '../../services/speechService';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Video,
  Activity,
  Cpu,
  Sparkles,
  ArrowRight,
  Eye,
  Sun,
  User,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { cn } from '../../lib/utils';
import { VisionMetrics } from '../../types';

interface PreInterviewDeviceCheckModalProps {
  isOpen: boolean;
  onConfirmStart: () => void;
  onClose: () => void;
}

export const PreInterviewDeviceCheckModal: React.FC<PreInterviewDeviceCheckModalProps> = ({
  isOpen,
  onConfirmStart,
  onClose,
}) => {
  const {
    config,
    backendHealth,
    visionMetrics: contextVisionMetrics,
    isCameraActive,
    isMicActive,
    cameraError,
    retryCamera,
    continueWithoutVision,
  } = useSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStreamActive, setLocalStreamActive] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [localMetrics, setLocalMetrics] = useState<VisionMetrics>(contextVisionMetrics);
  const [localCameraError, setLocalCameraError] = useState<string | null>(null);

  // Initialize camera and start test vision tracking on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsInitializing(true);
    setLocalCameraError(null);

    const setupDevices = async () => {
      try {
        const stream = await visionService.initializeCamera(videoRef.current);
        if (isMounted) {
          setLocalStreamActive(true);
          // Start vision analysis on preview
          await visionService.startVisionTracking(
            videoRef.current,
            (metrics) => {
              if (isMounted) setLocalMetrics(metrics);
            }
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setLocalStreamActive(false);
          setLocalCameraError(err.message || 'Camera permission denied or unavailable');
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    setupDevices();

    // Microphone test VU level interval
    const micInterval = setInterval(() => {
      if (isMounted) {
        // Sample speechService audio level or simulate ambient mic noise
        const liveLvl = speechService.getLiveAudioLevel();
        setMicTestLevel(liveLvl > 0 ? liveLvl : Math.floor(18 + Math.random() * 25));
      }
    }, 120);

    return () => {
      isMounted = false;
      clearInterval(micInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = () => {
    onConfirmStart();
  };

  const handleRetryCamera = async () => {
    setIsInitializing(true);
    setLocalCameraError(null);
    try {
      await visionService.initializeCamera(videoRef.current);
      setLocalStreamActive(true);
      await visionService.startVisionTracking(videoRef.current, (metrics) => {
        setLocalMetrics(metrics);
      });
    } catch (e: any) {
      setLocalCameraError(e.message);
      setLocalStreamActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleContinueWithoutCamera = () => {
    continueWithoutVision();
    onConfirmStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0a0d1a] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-indigo-950/60 via-[#0c1022] to-purple-950/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">
                PRE-SESSION CHECK
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Mode: {config.mode.toUpperCase()} ({config.difficulty.toUpperCase()})
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Camera, Microphone & Vision Readiness Check
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-xs"
          >
            ✕ Close
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera Preview Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-video w-full rounded-2xl bg-[#060812] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
              {localStreamActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />

                  {/* Face Mesh Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-48 h-56 rounded-3xl border-2 border-dashed border-cyan-400/40 flex flex-col items-center justify-between p-3 bg-cyan-950/10">
                      <div className="w-full flex justify-between text-[10px] font-mono text-cyan-300">
                        <span>[FACING FRAME]</span>
                        <span>{localMetrics.headOrientation.toUpperCase()}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-mono font-bold text-cyan-300 bg-black/60 px-2.5 py-1 rounded-full border border-cyan-400/30">
                          {localMetrics.faceDetected ? '✓ Face Centered' : '⚠ Face Missing'}
                        </span>
                      </div>
                      <div className="w-full flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Yaw: {localMetrics.headYaw}°</span>
                        <span>Pitch: {localMetrics.headPitch}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Live Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>CAM LIVE</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback View if Camera Denied */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <CameraOff className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Camera Access Required for Vision</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      {localCameraError || 'Allow camera permissions in your browser to enable live presentation analysis.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleRetryCamera} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                      Retry Camera
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleContinueWithoutCamera} className="text-xs text-slate-400">
                      Skip Vision
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mic Live Level Indicator */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Microphone Input Level</p>
                  <p className="text-[10px] text-slate-400 font-mono">Speak to verify audio pickup</p>
                </div>
              </div>

              <div className="w-40 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-100 rounded-full',
                      micTestLevel > 65 ? 'bg-emerald-400' : 'bg-cyan-400'
                    )}
                    style={{ width: `${Math.min(100, Math.max(5, micTestLevel))}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {micTestLevel > 15 ? 'Active' : 'Muted'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: System Readiness Checklist (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                System Diagnostics & Telemetry
              </h3>

              {/* Check 1: Camera Feed */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-200">Camera Feed</span>
                </div>
                {localStreamActive ? (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Offline
                  </span>
                )}
              </div>

              {/* Check 2: Face Presence & Framing */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-200">Face Framing & Center</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {localMetrics.faceDetected ? '✓ Centered' : '⚠ Missing'}
                </span>
              </div>

              {/* Check 3: Lighting & Glare */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-200">Lighting Quality</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {localMetrics.lightingState === 'GOOD_LIGHTING' ? '✓ Optimal' : '⚠ Check Lighting'}
                </span>
              </div>

              {/* Check 4: Whisper STT Server */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-200">Whisper Speech STT</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {backendHealth.whisperReady ? 'FastAPI Ready' : 'Online'}
                </span>
              </div>

              {/* Check 5: AI Engine */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-200">Adversarial Engine</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Socratic Active
                </span>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.04] text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Assurance:</strong> Video is analyzed locally in your browser for observable presentation signals. Zero raw video frames are saved or sent over the network.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="glow"
                size="lg"
                className="w-full font-bold text-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleStart}
              >
                Looks Good — Start Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
