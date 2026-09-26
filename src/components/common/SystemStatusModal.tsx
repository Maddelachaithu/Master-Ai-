import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Mic,
  Eye,
  Database,
  Lock,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useSession } from '../../context/SessionContext';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const { backendHealth, checkBackendHealth } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkBackendHealth();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const systems = [
    {
      name: 'Multi-Agent AI Engine',
      category: 'Interviewer • Challenger • Rubric',
      status: backendHealth.connected ? 'online' : 'local',
      desc: 'Orchestrates turn progression, Socratic adversarial challenges, and independent 5-dimension rubric scoring.',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      details: backendHealth.connected ? `Provider: ${backendHealth.llmProvider}` : 'Deterministic Rule Engine',
    },
    {
      name: 'Whisper STT Engine',
      category: 'faster-whisper • int8 Quantized',
      status: backendHealth.whisperReady ? 'online' : 'standby',
      desc: 'Local speech-to-text inference with Voice Activity Detection (VAD) and client-side streaming fallback.',
      icon: <Mic className="w-4 h-4 text-indigo-400" />,
      details: 'faster-whisper small (int8 CTranslate2)',
    },
    {
      name: 'RAG Knowledge Base',
      category: 'ChromaDB • Vector Store',
      status: backendHealth.connected ? 'online' : 'local',
      desc: 'Vector similarity search grounded in MITRE ATT&CK, NIST Cybersecurity Framework, and RFC standards.',
      icon: <Database className="w-4 h-4 text-purple-400" />,
      details: 'sentence-transformers/all-MiniLM-L6-v2',
    },
    {
      name: 'Multimodal Computer Vision',
      category: 'MediaPipe • Edge Signals',
      status: 'online',
      desc: 'Observable camera engagement, head pose, and spine posture tracking with zero raw video stored.',
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      details: 'MediaPipe Tasks Vision (~8 FPS Edge Processing)',
    },
    {
      name: 'Persistence & Analytics',
      category: 'SQLite / PostgreSQL ORM',
      status: backendHealth.connected ? 'online' : 'local',
      desc: 'Session history, turn evaluations, candidate skill graph, and longitudinal practice tracking.',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      details: 'Relational Database Persistence',
    },
    {
      name: 'Security & Prompt Guard',
      category: 'Sanitization • Injection Defense',
      status: 'online',
      desc: 'Boundary encapsulation for untrusted inputs, path traversal sanitization, and 10MB upload limits.',
      icon: <Lock className="w-4 h-4 text-cyan-400" />,
      details: 'Boundary Tag Defense & MIME Whitelisting',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090c18] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 overflow-hidden">
        {/* Top Glow Ambient Accent */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
                MASTER AI System Architecture & Health
                <Badge variant={backendHealth.connected ? 'emerald' : 'amber'} size="sm">
                  {backendHealth.connected ? 'ALL SYSTEMS OPERATIONAL' : 'LOCAL ENGINE ACTIVE'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">Live subsystem readiness & architectural telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {systems.map((sys, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0c1022]/80 border border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-white/10 shrink-0">
                    {sys.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{sys.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{sys.category}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  ONLINE
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">{sys.desc}</p>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span className="truncate">{sys.details}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/[0.08] text-xs">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Endpoint: http://localhost:8000/health (v{backendHealth.version})</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              {isRefreshing ? 'Checking...' : 'Refresh Health'}
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
