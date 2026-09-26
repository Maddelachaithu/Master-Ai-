import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { AIPersonality, DifficultyLevel, InterviewMode, PracticeConfig } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import {
  ShieldAlert,
  Terminal,
  Swords,
  Users,
  Activity,
  Zap,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Brain,
  ShieldCheck,
  AlertCircle,
  Play,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface PracticeConfigPageProps {
  onStartSession: (config: PracticeConfig) => void;
}

export const PracticeConfigPage: React.FC<PracticeConfigPageProps> = ({ onStartSession }) => {
  const { config, updateConfig } = useSession();

  const [mode, setMode] = useState<InterviewMode>(config.mode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(config.difficulty);
  const [durationMinutes, setDurationMinutes] = useState<number>(config.durationMinutes);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(config.aiPersonality);
  const [targetTopic, setTargetTopic] = useState<string>(config.targetTopic || 'Lateral Movement & Threat Hunting');

  const [pressureLevel, setPressureLevel] = useState<number>(3);

  const pressureLevels = [
    { level: 1, title: 'Level 1: Normal', desc: 'Standard professional pace with routine follow-ups.' },
    { level: 2, title: 'Level 2: Follow-ups', desc: 'Active probing on omitted sub-components.' },
    { level: 3, title: 'Level 3: Challenges', desc: 'Frequent Socratic probes & counterexamples (Recommended).' },
    { level: 4, title: 'Level 4: Rapid Counter', desc: 'Aggressive contradiction detection & assumption challenges.' },
    { level: 5, title: 'Level 5: High-Pressure', desc: 'Rigorous adversarial cross-examination under time constraints.' },
  ];
  const [enableFactChecking, setEnableFactChecking] = useState<boolean>(config.enableFactChecking);
  const [enableVisualAnalysis, setEnableVisualAnalysis] = useState<boolean>(config.enableVisualAnalysis);
  const [enableAdaptiveDifficulty, setEnableAdaptiveDifficulty] = useState<boolean>(config.enableAdaptiveDifficulty);
  const [enableFollowUps, setEnableFollowUps] = useState<boolean>(config.enableFollowUps);
  const [enablePerformanceTracking, setEnablePerformanceTracking] = useState<boolean>(config.enablePerformanceTracking);

  const modesList: { id: InterviewMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'cybersecurity', label: 'Cybersecurity', desc: 'Incident response, threat hunting & zero trust', icon: <ShieldAlert className="w-4 h-4 text-cyan-400" /> },
    { id: 'technical', label: 'Technical Systems', desc: 'Distributed architectures, scaling & memory', icon: <Terminal className="w-4 h-4 text-indigo-400" /> },
    { id: 'debate', label: 'Debate Arena', desc: 'Defend AI ethics, liability & policy arguments', icon: <Swords className="w-4 h-4 text-rose-400" /> },
    { id: 'behavioral', label: 'Behavioral (STAR)', desc: 'Executive communication, outages & leadership', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { id: 'stress', label: 'Stress Interview', desc: 'High-pressure pivots and unexpected constraints', icon: <Activity className="w-4 h-4 text-amber-400" /> },
    { id: 'rapid_fire', label: 'Rapid Fire', desc: '45-second timers to build conciseness', icon: <Zap className="w-4 h-4 text-purple-400" /> },
    { id: 'custom', label: 'Custom Challenge', desc: 'Configure custom domains and rubrics', icon: <Sliders className="w-4 h-4 text-slate-300" /> },
  ];

  const difficultiesList: { id: DifficultyLevel; label: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Foundational concepts & gentle follow-ups' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Standard industry interview depth' },
    { id: 'advanced', label: 'Advanced', desc: 'Staff/Senior complexity with adversarial counter-probes' },
    { id: 'expert', label: 'Expert', desc: 'Principal/Distinguished level edge-case probing' },
  ];

  const durationsList = [
    { value: 5, label: '5 Minutes', sub: 'Quick Drill' },
    { value: 10, label: '10 Minutes', sub: 'Standard' },
    { value: 15, label: '15 Minutes', sub: 'Comprehensive' },
    { value: 20, label: '20 Minutes', sub: 'Full Gauntlet' },
  ];

  const personalitiesList: { id: AIPersonality; label: string; desc: string; badge: string }[] = [
    { id: 'professional', label: 'Professional', desc: 'Structured, calm, corporate interviewer tone.', badge: 'Standard' },
    { id: 'strict', label: 'Strict', desc: 'Rigid adherence to time and high technical standards.', badge: 'Rigorous' },
    { id: 'friendly', label: 'Friendly', desc: 'Encouraging tone while still probing missing points.', badge: 'Supportive' },
    { id: 'aggressive', label: 'Aggressive Adversary', desc: 'Interrupts with direct counter-claims and challenges.', badge: 'High Pressure' },
    { id: 'socratic', label: 'Socratic', desc: 'Guides reasoning by asking probing philosophical questions.', badge: 'Recommended' },
  ];

  const handleLaunch = () => {
    const finalConfig: PracticeConfig = {
      mode,
      difficulty,
      durationMinutes,
      aiPersonality,
      targetTopic,
      enableFactChecking,
      enableVisualAnalysis,
      enableAdaptiveDifficulty,
      enableFollowUps,
      enablePerformanceTracking,
    };
    updateConfig(finalConfig);
    onStartSession(finalConfig);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
          Practice Session Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your challenge domain, adversary rigor, and real-time telemetry pipelines.
        </p>
      </div>

      {/* 1. SELECT MODE */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
            1
          </span>
          Select Interview & Challenge Mode
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modesList.map((m) => {
            const isSelected = mode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 select-none',
                  isSelected
                    ? 'bg-indigo-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/40 border-white/[0.06] hover:bg-slate-800/40 hover:border-slate-600'
                )}
              >
                <div className="p-2 rounded-lg bg-slate-800/80 border border-white/[0.06] shrink-0 mt-0.5">
                  {m.icon}
                </div>
                <div>
                  <h4 className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-slate-200')}>
                    {m.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TARGET TOPIC INPUT */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Target Topic / Domain Focus
        </label>
        <input
          type="text"
          value={targetTopic}
          onChange={(e) => setTargetTopic(e.target.value)}
          placeholder="e.g. AWS Incident Containment, Distributed Cache Coherence, AI Liability"
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
        />
      </div>

      {/* 2. DIFFICULTY & DURATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              2
            </span>
            Difficulty Tier
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {difficultiesList.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all select-none',
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-400 shadow-md ring-1 ring-indigo-400/40 text-white'
                      : 'bg-slate-900/40 border-white/[0.06] text-slate-300 hover:border-slate-600'
                  )}
                >
                  <p className="text-xs font-bold uppercase font-mono">{d.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              3
            </span>
            Session Duration
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {durationsList.map((d) => {
              const isSelected = durationMinutes === d.value;
              return (
                <div
                  key={d.value}
                  onClick={() => setDurationMinutes(d.value)}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all select-none',
                    isSelected
                      ? 'bg-indigo-950/50 border-cyan-400 shadow-md ring-1 ring-cyan-400/40 text-white'
                      : 'bg-slate-900/40 border-white/[0.06] text-slate-300 hover:border-slate-600'
                  )}
                >
                  <p className="text-xs font-bold font-mono text-cyan-300">{d.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{d.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. AI PERSONALITY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              4
            </span>
            AI Personality & Communication Style
          </label>
          <span className="text-[11px] text-amber-400/90 font-mono">
            ⚠️ Personality modifies tone only; grading remains objectively fair.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personalitiesList.map((p) => {
            const isSelected = aiPersonality === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setAiPersonality(p.id)}
                className={cn(
                  'p-3.5 rounded-xl border cursor-pointer transition-all select-none flex flex-col justify-between',
                  isSelected
                    ? 'bg-indigo-950/40 border-purple-400 ring-1 ring-purple-400/40 shadow-lg'
                    : 'bg-slate-900/40 border-white/[0.06] hover:border-slate-600'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-display">{p.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADVERSARIAL PRESSURE LEVEL (1 - 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              5
            </span>
            Adversarial Pressure Level (1 - 5)
          </label>
          <span className="text-[11px] text-cyan-400 font-mono">
            Selected: Level {pressureLevel} / 5
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {pressureLevels.map((pl) => {
            const isSelected = pressureLevel === pl.level;
            return (
              <div
                key={pl.level}
                onClick={() => setPressureLevel(pl.level)}
                className={cn(
                  'p-3 rounded-xl border cursor-pointer transition-all select-none flex flex-col justify-between',
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/40 shadow-lg text-white'
                    : 'bg-slate-900/40 border-white/[0.06] hover:border-slate-600 text-slate-300'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-amber-300">Lvl {pl.level}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{pl.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ADVANCED SETTINGS TOGGLES */}
      <Card className="p-6 bg-[#0c0f20]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Advanced Multimodal & Adversary Pipelines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Toggle
            checked={enableFactChecking}
            onChange={setEnableFactChecking}
            label="Real-Time Fact Checking (RAG)"
            description="Verifies claims against RFCs, NIST, and MITRE standards"
          />

          <Toggle
            checked={enableVisualAnalysis}
            onChange={setEnableVisualAnalysis}
            label="Visual Delivery Telemetry"
            description="Measures observed eye-contact alignment and posture framing"
          />

          <Toggle
            checked={enableAdaptiveDifficulty}
            onChange={setEnableAdaptiveDifficulty}
            label="Dynamic Adaptive Difficulty"
            description="Scales question complexity dynamically based on answer depth"
          />

          <Toggle
            checked={enableFollowUps}
            onChange={setEnableFollowUps}
            label="Adversarial Follow-Up Probing"
            description="AI actively probes gaps or contradictions in your answers"
          />

          <Toggle
            checked={enablePerformanceTracking}
            onChange={setEnablePerformanceTracking}
            label="Rubric Report Generation"
            description="Generates detailed scoring, timeline, and improvement plan"
          />
        </div>
      </Card>

      {/* Launch Action */}
      <div className="pt-4 flex items-center justify-end gap-4">
        <Button
          variant="glow"
          size="xl"
          rightIcon={<Play className="w-5 h-5 fill-current" />}
          onClick={handleLaunch}
          className="w-full sm:w-auto font-bold tracking-wide"
        >
          Launch Challenge Session
        </Button>
      </div>
    </div>
  );
};
