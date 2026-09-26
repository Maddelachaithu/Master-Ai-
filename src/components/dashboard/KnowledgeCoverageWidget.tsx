import React, { useState, useEffect } from 'react';
import { Database, BookOpen, Layers, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ragApi } from '../../services/ragApi';
import { KnowledgeStatus } from '../../types';
import { KnowledgeBaseAdminModal } from '../knowledge/KnowledgeBaseAdminModal';

interface KnowledgeCoverageWidgetProps {
  targetRole?: string;
}

export const KnowledgeCoverageWidget: React.FC<KnowledgeCoverageWidgetProps> = ({
  targetRole = 'SOC Analyst',
}) => {
  const [status, setStatus] = useState<KnowledgeStatus | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    ragApi.getStatus().then(setStatus).catch(() => {});
  }, []);

  const domains = [
    { name: 'Cybersecurity & Lateral Movement', chunks: status?.categories?.cybersecurity || 4, pct: 88 },
    { name: 'Cloud Security & IAM (AWS/IMDSv2)', chunks: status?.categories?.cloud || 2, pct: 75 },
    { name: 'Networking & Kerberos Auth', chunks: status?.categories?.networking || 2, pct: 82 },
    { name: 'Incident Response & SIEM', chunks: status?.categories?.incident_response || 2, pct: 80 },
  ];

  return (
    <>
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1224] to-[#070914] border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-display text-white">Knowledge Coverage</h3>
          </div>
          <Badge variant="cyan" size="sm">
            {status?.total_chunks || 10} Chunks Indexed
          </Badge>
        </div>

        <p className="text-xs text-slate-400">
          Authority grounding for <span className="text-slate-200 font-semibold">{targetRole}</span> technical interview questions.
        </p>

        {/* Domain Progress Bars */}
        <div className="space-y-3">
          {domains.map((dom) => (
            <div key={dom.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 truncate max-w-[200px]">{dom.name}</span>
                <span className="text-cyan-400 font-bold">{dom.pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${dom.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Model: all-MiniLM-L6-v2
          </span>
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Admin & Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <KnowledgeBaseAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </>
  );
};
