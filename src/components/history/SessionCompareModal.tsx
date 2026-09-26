import React, { useState } from 'react';
import {
  GitCompare,
  X,
  TrendingUp,
  Award,
  ShieldAlert,
  Eye,
  Mic,
  Swords,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { InterviewHistoryRecord } from '../../types';

interface SessionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: InterviewHistoryRecord[];
}

export const SessionCompareModal: React.FC<SessionCompareModalProps> = ({
  isOpen,
  onClose,
  sessions,
}) => {
  const getSessionId = (s?: InterviewHistoryRecord) => s?.id || s?.session_id || '';
  const [sessionAId, setSessionAId] = useState<string>(getSessionId(sessions[0]));
  const [sessionBId, setSessionBId] = useState<string>(getSessionId(sessions[1]) || getSessionId(sessions[0]));

  if (!isOpen) return null;

  const sessionA = sessions.find((s) => getSessionId(s) === sessionAId) || sessions[0];
  const sessionB = sessions.find((s) => getSessionId(s) === sessionBId) || sessions[1] || sessions[0];

  const scoreDiff = (sessionB?.overall_score || 0) - (sessionA?.overall_score || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1021] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#080b18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Compare Interview Sessions</h2>
                <Badge variant="violet" size="sm">Longitudinal Tracking</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Side-by-side progression analysis across technical depth, adversarial defense, and presentation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Selector Bar */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/[0.06] bg-[#090d1f]">
          <div>
            <label className="text-[11px] font-mono text-slate-400 mb-1.5 block">BASE SESSION (A)</label>
            <select
              value={sessionAId}
              onChange={(e) => setSessionAId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {sessions.map((s) => {
                const sid = getSessionId(s);
                return (
                  <option key={sid} value={sid}>
                    {s.title || s.topic} ({new Date(s.created_at || s.date || Date.now()).toLocaleDateString()}) - Score: {s.overall_score}%
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 mb-1.5 block">COMPARISON SESSION (B)</label>
            <select
              value={sessionBId}
              onChange={(e) => setSessionBId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {sessions.map((s) => {
                const sid = getSessionId(s);
                return (
                  <option key={sid} value={sid}>
                    {s.title || s.topic} ({new Date(s.created_at || s.date || Date.now()).toLocaleDateString()}) - Score: {s.overall_score}%
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progression Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/80 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-mono font-bold text-white">Overall Delta</p>
                <p className="text-xs text-slate-400">
                  {scoreDiff >= 0
                    ? `Improvement of +${scoreDiff} points between sessions`
                    : `Score delta: ${scoreDiff} points`}
                </p>
              </div>
            </div>
            <span
              className={`text-lg font-bold font-mono px-3 py-1 rounded-lg ${
                scoreDiff >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
            </span>
          </div>

          {/* Side by Side Comparison Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Session A Details */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/50 border border-white/[0.06]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <Badge variant="slate" size="sm">Session A</Badge>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(sessionA?.created_at || sessionA?.date || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{sessionA?.title || sessionA?.topic}</h3>
              <p className="text-xs text-slate-400 capitalize">{sessionA?.mode} • {sessionA?.target_role || sessionA?.role || 'General'}</p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Overall Score:</span>
                  <span className="font-bold font-mono text-white">{sessionA?.overall_score || 0}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Questions Answered:</span>
                  <span className="font-mono text-slate-200">{sessionA?.turn_count || sessionA?.questions_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Challenges Survived:</span>
                  <span className="font-mono text-rose-300">{sessionA?.challenges_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Fact-Checks Run:</span>
                  <span className="font-mono text-cyan-300">{sessionA?.fact_checks_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-mono text-slate-200">{sessionA?.duration_minutes || Math.round((sessionA?.duration_seconds || 600) / 60)} mins</span>
                </div>
              </div>
            </div>

            {/* Session B Details */}
            <div className="space-y-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <Badge variant="violet" size="sm">Session B</Badge>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(sessionB?.created_at || sessionB?.date || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{sessionB?.title || sessionB?.topic}</h3>
              <p className="text-xs text-slate-400 capitalize">{sessionB?.mode} • {sessionB?.target_role || sessionB?.role || 'General'}</p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Overall Score:</span>
                  <span className="font-bold font-mono text-cyan-400">{sessionB?.overall_score || 0}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Questions Answered:</span>
                  <span className="font-mono text-slate-200">{sessionB?.turn_count || sessionB?.questions_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Challenges Survived:</span>
                  <span className="font-mono text-rose-300">{sessionB?.challenges_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Fact-Checks Run:</span>
                  <span className="font-mono text-cyan-300">{sessionB?.fact_checks_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-mono text-slate-200">{sessionB?.duration_minutes || Math.round((sessionB?.duration_seconds || 600) / 60)} mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#080b18] flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
