import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FactCheckResult } from '../../types';
import { FactCheckBadge } from './FactCheckBadge';

interface EvidencePanelProps {
  factCheckResults: FactCheckResult[];
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  factCheckResults,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeClaimIndex, setActiveClaimIndex] = useState<number | null>(0);

  if (!factCheckResults || factCheckResults.length === 0) {
    return null;
  }

  const supportedCount = factCheckResults.filter((r) => r.verdict === 'SUPPORTED').length;
  const unsupportedCount = factCheckResults.filter((r) => r.verdict === 'UNSUPPORTED').length;

  return (
    <div
      className={`rounded-xl border border-cyan-500/20 bg-slate-900/80 backdrop-blur-md overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/40 hover:bg-cyan-950/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
            Technical Evidence & Fact-Check ({factCheckResults.length})
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {supportedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {supportedCount} Verified
              </span>
            )}
            {unsupportedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-2.5 h-2.5" />
                {unsupportedCount} Disputed
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {isExpanded ? 'Collapse' : 'View Evidence'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded claim list & citations */}
      {isExpanded && (
        <div className="p-4 space-y-4 divide-y divide-slate-800/80">
          {factCheckResults.map((result, idx) => (
            <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400/80">CLAIM #{idx + 1}</span>
                    <FactCheckBadge verdict={result.verdict} confidence={result.confidence} size="sm" />
                    {result.cached && (
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded">
                        cached
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    "{result.claim}"
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                {result.explanation}
              </p>

              {/* Authoritative Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Authoritative Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, sIdx) => (
                      <a
                        key={sIdx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-cyan-300 text-xs transition-colors group"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
                        <span className="truncate max-w-xs">{source.title || source.publisher || 'Documentation'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
