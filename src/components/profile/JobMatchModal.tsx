import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { profileApi } from '../../services/profileApi';
import { JobMatchAnalysis } from '../../types';
import { Briefcase, Building, CheckCircle2, AlertTriangle, Sparkles, Loader2, Target } from 'lucide-react';

interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  targetCompany?: string;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'SOC Analyst',
  targetCompany = 'Target Company',
}) => {
  const [jobText, setJobText] = useState('');
  const [company, setCompany] = useState(targetCompany);
  const [role, setRole] = useState(targetRole);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await profileApi.analyzeJobDescription(jobText, company, role);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company & Job Description Matcher">
      <div className="space-y-4">
        {!analysis ? (
          <>
            <p className="text-xs text-slate-300">
              Paste the target job description. MASTER AI factually identifies matching competencies, skill gaps, and tailors company-specific interview challenge topics.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. CrowdStrike, Microsoft"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SOC Analyst"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Paste Job Description</label>
              <textarea
                rows={6}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste responsibilities, required skills, and qualification requirements here..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                disabled={!jobText.trim() || isAnalyzing}
                onClick={handleAnalyze}
                leftIcon={isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              >
                {isAnalyzing ? 'Matching Skills & Topics...' : 'Analyze Match'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Header Result Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white font-display">{analysis.target_company}</span>
                </div>
                <p className="text-xs text-slate-400">{analysis.target_role} Competency Alignment</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {analysis.skills_match_percentage}%
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Skills Match</span>
              </div>
            </div>

            {/* Matched vs Missing Skills Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Matched */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Matched ({analysis.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.matched_skills.map((s, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-200 border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing / Focus */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Missing / Unassessed ({analysis.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.missing_skills.map((s, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tailored Interview Topics */}
            {analysis.recommended_interview_topics && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended Practice Topics for {analysis.target_company}
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {analysis.recommended_interview_topics.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)}>
                Analyze Another Posting
              </Button>
              <Button variant="glow" size="sm" onClick={onClose}>
                Apply to Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
