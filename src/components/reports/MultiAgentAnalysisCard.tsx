import React from 'react';
import { Card } from '../common/Card';
import { Swords, ShieldCheck, Gauge, Network, CheckCircle, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

interface MultiAgentAnalysisCardProps {
  difficulty?: string;
  className?: string;
}

export const MultiAgentAnalysisCard: React.FC<MultiAgentAnalysisCardProps> = ({
  difficulty = 'advanced',
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: AI Challenges Faced */}
        <Card className="p-4 bg-slate-900/90 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Adversarial Challenges</p>
                <h4 className="text-lg font-bold text-white font-mono">4 Generated</h4>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Pressure Lvl 3
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Socratic Probes:</span>
              <span className="text-slate-200 font-mono">2</span>
            </div>
            <div className="flex justify-between">
              <span>Counterexamples:</span>
              <span className="text-slate-200 font-mono">2</span>
            </div>
            <div className="flex justify-between">
              <span>Contradictions Caught:</span>
              <span className="text-emerald-400 font-mono">0</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Fact-Checks Verified */}
        <Card className="p-4 bg-slate-900/90 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Technical Claims</p>
                <h4 className="text-lg font-bold text-white font-mono">5 Verified</h4>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              RFC & NIST
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Supported:
              </span>
              <span className="text-emerald-400 font-mono">4</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Partially Supported:
              </span>
              <span className="text-amber-400 font-mono">1</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-400" /> Unsupported:
              </span>
              <span className="text-slate-200 font-mono">0</span>
            </div>
          </div>
        </Card>

        {/* Metric 3: Adaptive Progression */}
        <Card className="p-4 bg-slate-900/90 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Difficulty Trajectory</p>
                <h4 className="text-lg font-bold text-white font-mono uppercase">{difficulty}</h4>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Auto-Adapted
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Starting Difficulty:</span>
              <span className="text-slate-200 font-mono">intermediate</span>
            </div>
            <div className="flex justify-between">
              <span>Final Difficulty:</span>
              <span className="text-cyan-300 font-mono font-bold">advanced</span>
            </div>
            <div className="flex justify-between">
              <span>Dynamic Adjustments:</span>
              <span className="text-slate-200 font-mono">+1 Level</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Verified Technical Knowledge Evidence Table */}
      <Card className="p-5 bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Verified Technical Claims & Official Citations</h4>
          </div>
          <span className="text-xs font-mono text-slate-400">Microsoft Learn • AWS Security • RFCs</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-200">"Windows Event ID 4624 (Logon Type 3) records network authentications."</p>
              <p className="text-slate-400 mt-1">Confirmed against Microsoft Security Audit Documentation.</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
              ✓ SUPPORTED (96%)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-200">"AWS IMDSv2 requires PUT session token requests to prevent SSRF credential theft."</p>
              <p className="text-slate-400 mt-1">Confirmed against AWS EC2 User Guide for Instance Metadata Service.</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
              ✓ SUPPORTED (98%)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-200">"Kerberos Pass-the-Ticket reuses TGT without extracting NTLM password hashes."</p>
              <p className="text-slate-400 mt-1">Confirmed against MITRE ATT&CK T1550.003.</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
              ✓ SUPPORTED (94%)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
