import React, { useState } from 'react';
import {
  Sparkles,
  User,
  FileText,
  Target,
  Award,
  Sliders,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  PlayCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { profileApi } from '../../services/profileApi';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
  onStartPractice: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartDemo,
  onStartPractice,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form states
  const [name, setName] = useState('Chaitanya');
  const [email, setEmail] = useState('chaitanya@masterai.dev');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [targetRole, setTargetRole] = useState('SOC Analyst');
  const [targetCompany, setTargetCompany] = useState('CrowdStrike');
  const [personality, setPersonality] = useState('socratic');
  const [difficulty, setDifficulty] = useState('advanced');

  if (!isOpen) return null;

  const handleNext = async () => {
    if (currentStep === 3) {
      // Save profile updates to backend
      try {
        await profileApi.saveProfile({
          name,
          email,
          target_role: targetRole,
          experience_level: experienceLevel,
          target_companies: targetCompany ? [targetCompany] : [],
        });
      } catch (e) {
        console.error('Failed to auto-save during onboarding', e);
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const roles = [
    'SOC Analyst',
    'Penetration Tester',
    'Cloud Security Analyst',
    'Incident Responder',
    'DevSecOps Engineer',
    'System Administrator',
    'Software Developer',
    'Data Analyst',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c1021] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Step Progress */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#080b18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white">Welcome to MASTER AI</h2>
              <p className="text-[11px] text-slate-400">Autonomous AI Interview & Debate Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="cyan" size="sm">
              Step {currentStep} of {totalSteps}
            </Badge>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              title="Skip onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-900">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5 min-h-[320px]">
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  Candidate Profile Setup
                </h3>
                <p className="text-xs text-slate-400">
                  Tell MASTER AI who you are so questions and reports are accurately addressed.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">YOUR NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">EXPERIENCE LEVEL</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (5-8 years)</option>
                    <option value="lead">Lead / Principal (8+ years)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Resume Grounding */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Resume Grounding (Optional)
                </h3>
                <p className="text-xs text-slate-400">
                  MASTER AI can extract your real projects and tools to ask personalized architectural questions.
                </p>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl text-center bg-slate-900/40 space-y-3 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-white">Upload PDF or TXT Resume</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Skills, tools, and project architectures will be parsed automatically.
                  </p>
                </div>
                <Badge variant="cyan" size="sm">
                  You can also upload later from Profile
                </Badge>
              </div>
            </div>
          )}

          {/* STEP 3: Target Role & Target Company */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Target Role & Company Focus
                </h3>
                <p className="text-xs text-slate-400">
                  Select your primary career target to load the role competency matrix and RAG knowledge scope.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">TARGET ROLE</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">TARGET COMPANY</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. CrowdStrike, Microsoft, Mandiant, Google..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Skill Matrix Overview */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Role Competencies Loaded
                </h3>
                <p className="text-xs text-slate-400">
                  Based on <span className="text-cyan-400 font-semibold">{targetRole}</span>, MASTER AI will evaluate your responses across these domains:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  'SIEM & Log Correlation',
                  'Incident Response Triage',
                  'Threat Detection & MITRE ATT&CK',
                  'Network Security & TCP/IP',
                  'Active Directory & Kerberos',
                  'Cloud Security & IAM',
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-200">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Interview Preferences */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Interview & Adversary Preferences
                </h3>
                <p className="text-xs text-slate-400">
                  Tune how aggressively the AI Challenger pressure-tests your answers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">AI PERSONALITY</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'socratic', label: 'Socratic Coach', desc: 'Constructive probing' },
                      { id: 'adversary', label: 'Tough Adversary', desc: 'Aggressive challenges' },
                      { id: 'standard', label: 'Standard Formal', desc: 'Corporate interviewer' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersonality(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          personality === p.id
                            ? 'bg-indigo-600/30 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">{p.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">DEFAULT DIFFICULTY</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced (Recommended)</option>
                    <option value="expert">Expert (High Pressure)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Ready to Launch */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fadeIn text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display">You're All Set!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  MASTER AI is initialized for <span className="text-cyan-400 font-semibold">{name}</span> targeting{' '}
                  <span className="text-indigo-400 font-semibold">{targetRole}</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full"
                  leftIcon={<PlayCircle className="w-4 h-4 text-cyan-300" />}
                  onClick={() => {
                    onClose();
                    onStartPractice();
                  }}
                >
                  Start Practice Session
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full border-cyan-500/30"
                  leftIcon={<Zap className="w-4 h-4 text-cyan-400" />}
                  onClick={() => {
                    onClose();
                    onStartDemo();
                  }}
                >
                  Explore Demo Mode
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#080b18] flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip for now
            </button>
          )}

          {currentStep < totalSteps ? (
            <Button
              variant="glow"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={handleNext}
            >
              Continue
            </Button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
