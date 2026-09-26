import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Send,
  Swords,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Square,
  Loader2,
  AlertCircle,
  X,
  Keyboard,
} from 'lucide-react';
import { Button } from '../common/Button';
import { cn, formatTime } from '../../lib/utils';

interface InterviewControlsProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  isMuted: boolean;
  isRecordingAnswer: boolean;
  recordingDurationSeconds: number;
  isTranscribing: boolean;
  isAnalyzing: boolean;
  errorMessage?: string | null;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onSubmitAnswer: (answerText: string) => void;
  onTriggerChallenge: () => void;
  onEndSession: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  isMicActive,
  isCameraActive,
  isMuted,
  isRecordingAnswer,
  recordingDurationSeconds,
  isTranscribing,
  isAnalyzing,
  errorMessage,
  onToggleMic,
  onToggleCamera,
  onToggleMute,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSubmitAnswer,
  onTriggerChallenge,
  onEndSession,
  onOpenSettings,
  className,
}) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    onSubmitAnswer(typedAnswer);
    setTypedAnswer('');
    setShowKeyboardInput(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Error Alert Banner if audio capture or transcription fails */}
      {errorMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onCancelRecording}
            className="text-rose-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        className={cn(
          'p-4 rounded-2xl bg-[#0b0e1b]/95 border border-white/[0.1] backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4',
          className
        )}
      >
        {/* Left: Device Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isMicActive ? 'secondary' : 'danger'}
            size="icon"
            onClick={onToggleMic}
            title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
            className="rounded-xl"
          >
            {isMicActive ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5 text-rose-300" />}
          </Button>

          <Button
            variant={isCameraActive ? 'secondary' : 'danger'}
            size="icon"
            onClick={onToggleCamera}
            title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            className="rounded-xl"
          >
            {isCameraActive ? <Camera className="w-5 h-5 text-cyan-400" /> : <CameraOff className="w-5 h-5 text-rose-300" />}
          </Button>

          <Button
            variant={!isMuted ? 'secondary' : 'danger'}
            size="icon"
            onClick={onToggleMute}
            title={!isMuted ? 'Mute AI Audio' : 'Unmute AI Audio'}
            className="rounded-xl"
          >
            {!isMuted ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-rose-300" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyboardInput(!showKeyboardInput)}
            title="Toggle Text Input"
            className={cn('rounded-xl', showKeyboardInput && 'bg-indigo-500/20 text-cyan-400 border border-indigo-500/40')}
          >
            <Keyboard className="w-5 h-5" />
          </Button>

          {onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              title="Audio & Video Settings"
              className="rounded-xl hidden sm:inline-flex"
            >
              <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
            </Button>
          )}
        </div>

        {/* Center: Real Speech-to-Text Push-to-Talk Action Bar */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center gap-2">
          {/* Main Push-to-Talk Button State Machine */}
          {!isRecordingAnswer && !isTranscribing && !isAnalyzing ? (
            <div className="w-full flex items-center justify-center gap-3">
              <Button
                variant="glow"
                size="lg"
                leftIcon={<Mic className="w-5 h-5 text-cyan-200 animate-pulse" />}
                onClick={onStartRecording}
                className="w-full sm:w-auto px-8 py-3 text-sm font-bold tracking-wide shadow-[0_0_25px_rgba(0,242,254,0.35)]"
              >
                Start Answer (Speak)
              </Button>
            </div>
          ) : isRecordingAnswer ? (
            <div className="w-full flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-200">
              {/* Recording Indicator & Timer */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">RECORDING:</span>
                <span>{formatTime(recordingDurationSeconds)}</span>
              </div>

              {/* Stop & Submit Button */}
              <Button
                variant="danger"
                size="md"
                leftIcon={<Square className="w-4 h-4 fill-current" />}
                onClick={onStopRecording}
                className="font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              >
                Finish Answer & Transcribe
              </Button>

              {/* Cancel Button */}
              <button
                onClick={onCancelRecording}
                className="text-xs text-slate-400 hover:text-white underline font-mono"
              >
                Cancel
              </button>
            </div>
          ) : isTranscribing ? (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="font-semibold">Whisper STT: Transcribing speech audio...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-xs font-mono text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="font-semibold">MASTER AI: Evaluating reasoning & follow-up...</span>
            </div>
          )}

          {/* Optional Keyboard Input Drawer */}
          {showKeyboardInput && (
            <form onSubmit={handleSendAnswer} className="w-full flex items-center gap-2 mt-2 animate-in fade-in duration-200">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type answer manually (e.g. SIEM Event ID 4624 triage)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!typedAnswer.trim()}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          )}
        </div>

        {/* Right: Challenge Me & End Interview */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="adversary"
            size="sm"
            leftIcon={<Swords className="w-4 h-4 text-amber-200" />}
            onClick={onTriggerChallenge}
            title="Prompt the AI adversary to challenge your technical premise"
          >
            Challenge Me
          </Button>

          <Button
            variant="danger"
            size="sm"
            leftIcon={<PhoneOff className="w-4 h-4" />}
            onClick={onEndSession}
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
};
