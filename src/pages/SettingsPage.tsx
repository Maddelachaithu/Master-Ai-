import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { Badge } from '../components/common/Badge';
import {
  User,
  Sliders,
  Brain,
  Camera,
  Mic,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  RefreshCw,
  Video,
} from 'lucide-react';
import { AIPersonality, DifficultyLevel, InterviewMode } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [name, setName] = useState(user?.name || 'Chaitanya');
  const [email, setEmail] = useState(user?.email || 'chaitanya@masterai.dev');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Local state for preferences
  const [defaultMode, setDefaultMode] = useState<InterviewMode>(settings.defaultMode);
  const [defaultDifficulty, setDefaultDifficulty] = useState<DifficultyLevel>(settings.defaultDifficulty);
  const [defaultDuration, setDefaultDuration] = useState<number>(settings.defaultDurationMinutes);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(settings.aiPersonality);
  const [privacyLocalOnly, setPrivacyLocalOnly] = useState(settings.privacyLocalProcessingOnly);
  const [zeroRawVideo, setZeroRawVideo] = useState(settings.zeroRawVideoStorage);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(settings.adaptiveDifficulty);
  const [enableFactChecking, setEnableFactChecking] = useState(settings.enableFactChecking);

  // Test camera preview stream
  const videoTestRef = useRef<HTMLVideoElement>(null);
  const [isTestCameraActive, setIsTestCameraActive] = useState(false);

  const handleToggleTestCamera = () => {
    if (!isTestCameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoTestRef.current) {
            videoTestRef.current.srcObject = stream;
            setIsTestCameraActive(true);
          }
        })
        .catch(() => {
          alert('Webcam access not allowed or unavailable. Virtual preview will be used.');
        });
    } else {
      if (videoTestRef.current && videoTestRef.current.srcObject) {
        const stream = videoTestRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoTestRef.current.srcObject = null;
      }
      setIsTestCameraActive(false);
    }
  };

  const handleSave = () => {
    updateProfile({ name, email });
    updateSettings({
      defaultMode,
      defaultDifficulty,
      defaultDurationMinutes: defaultDuration,
      aiPersonality,
      privacyLocalProcessingOnly: privacyLocalOnly,
      zeroRawVideoStorage: zeroRawVideo,
      adaptiveDifficulty,
      enableFactChecking,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Settings & System Preferences
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure candidate profile, AI adversary parameters, hardware inputs, and privacy controls.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {savedSuccess ? 'Settings Saved!' : 'Save Changes'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Your preferences and privacy policies have been successfully updated.</span>
        </div>
      )}

      {/* 1. PROFILE SETTINGS */}
      <Card className="p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          Candidate Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-300 mb-1 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 mb-1 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* 2. INTERVIEW & AI ADVERSARY PREFERENCES */}
      <Card className="p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl space-y-5">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          AI Adversary & Interview Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-300 mb-1 block">Default Mode</label>
            <select
              value={defaultMode}
              onChange={(e) => setDefaultMode(e.target.value as InterviewMode)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="cybersecurity">Cybersecurity</option>
              <option value="technical">Technical Systems</option>
              <option value="debate">Debate Arena</option>
              <option value="behavioral">Behavioral (STAR)</option>
              <option value="stress">Stress Interview</option>
              <option value="rapid_fire">Rapid Fire</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 mb-1 block">Default Difficulty</label>
            <select
              value={defaultDifficulty}
              onChange={(e) => setDefaultDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 mb-1 block">AI Personality</label>
            <select
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value as AIPersonality)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="socratic">Socratic (Probing)</option>
              <option value="aggressive">Aggressive Adversary</option>
              <option value="strict">Strict / Rigorous</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly / Supportive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
          <Toggle
            checked={adaptiveDifficulty}
            onChange={setAdaptiveDifficulty}
            label="Enable Adaptive Difficulty"
            description="Dynamically escalates or de-escalates question depth"
          />

          <Toggle
            checked={enableFactChecking}
            onChange={setEnableFactChecking}
            label="Enable Knowledge Base Fact Checking"
            description="Autonomous RAG verification against technical standards"
          />
        </div>
      </Card>

      {/* 3. CAMERA & MICROPHONE TEST */}
      <Card className="p-6 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          Camera & Microphone Hardware Calibration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Video Preview Container */}
          <div className="aspect-video rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
            {isTestCameraActive ? (
              <video
                ref={videoTestRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center p-4">
                <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Camera preview inactive</p>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <Button
              variant={isTestCameraActive ? 'danger' : 'secondary'}
              size="sm"
              onClick={handleToggleTestCamera}
              className="w-full"
            >
              {isTestCameraActive ? 'Stop Camera Test' : 'Test Webcam Stream'}
            </Button>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.04] text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Microphone Level:</span>
                <span className="text-emerald-400 font-mono font-bold">42 dB (Optimal)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-emerald-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. PRIVACY & RESPONSIBLE AI COMPLIANCE */}
      <Card className="p-6 bg-[#0b0e1b]/95 border border-indigo-500/30 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Responsible AI, Biometric Telemetry & Privacy Policy
          </h3>
          <Badge variant="emerald" size="sm">
            GDPR / PRIVACY COMPLIANT
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          MASTER AI implements strict responsible AI policies. Multimodal vision and speech telemetry are processed client-side via edge geometry extractors. <strong>Zero raw video is transmitted or stored on cloud servers.</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Toggle
            checked={zeroRawVideo}
            onChange={setZeroRawVideo}
            label="Zero Raw Video Retention"
            description="Never save or upload camera video pixels"
          />

          <Toggle
            checked={privacyLocalOnly}
            onChange={setPrivacyLocalOnly}
            label="Client-Side Telemetry Only"
            description="Process landmark vectors exclusively in your browser"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.04] text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Biometric-Adjacent Signal Notice:</p>
          <p>
            Visual signals like observed eye-contact consistency reflect objective camera alignment only and are never used to draw clinical or psychological inferences.
          </p>
        </div>
      </Card>
    </div>
  );
};
