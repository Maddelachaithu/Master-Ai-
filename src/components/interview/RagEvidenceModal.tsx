import React from 'react';
import { Database, BookOpen, ExternalLink, X, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface RagEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence?: {
    document_name?: string;
    category?: string;
    source?: string;
    content_excerpt?: string;
    confidence?: number;
    grounded?: boolean;
  } | null;
}

export const RagEvidenceModal: React.FC<RagEvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence = {
    document_name: 'Kerberos Authentication & MITRE ATT&CK T1558',
    category: 'networking',
    source: 'MITRE ATT&CK & Microsoft Security',
    content_excerpt: 'Event ID 4769 monitors Kerberos TGS requests. RC4 encryption (0x17) indicates legacy cipher exploitation (Kerberoasting). Golden Tickets forge TGTs encrypted with KRBTGT hash.',
    confidence: 94,
    grounded: true,
  },
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c1021] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#080b18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white">Grounded Knowledge Evidence</h2>
              <p className="text-[11px] text-slate-400">Retrieved from authoritative technical documentation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {evidence.document_name || 'Technical Security Standard'}
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                {evidence.confidence || 90}% Evidence Confidence
              </Badge>
            </div>

            <p className="text-[11px] font-mono text-slate-400">
              Source: <span className="text-slate-200">{evidence.source || 'Authoritative Security Framework'}</span> • Category: <span className="text-cyan-400 capitalize">{evidence.category || 'Cybersecurity'}</span>
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Relevant Grounding Excerpt
            </span>
            <div className="p-3.5 rounded-xl bg-[#080b18] border border-cyan-500/20 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
              {evidence.content_excerpt || 'Grounded technical definitions from knowledge base.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#080b18] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Authority Grounded Evaluation</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
