import React from 'react';
import { Flame, Clock, PlayCircle, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DailyPracticeItem } from '../../types';

interface DailyPracticePlanCardProps {
  items?: DailyPracticeItem[];
  onStartDrill: (topic: string) => void;
}

export const DailyPracticePlanCard: React.FC<DailyPracticePlanCardProps> = ({
  items = [
    {
      skill: 'Network Security & Lateral Movement',
      recommended_minutes: 5,
      reason: 'Missed Kerberos ticket triage in recent session',
      category: 'cybersecurity',
    },
    {
      skill: 'Incident Response & SIEM Alert Triage',
      recommended_minutes: 5,
      reason: 'Core requirement for SOC Analyst role',
      category: 'incident_response',
    },
    {
      skill: 'Cloud Security & AWS IMDSv2',
      recommended_minutes: 5,
      reason: 'Unassessed high-priority role competency',
      category: 'cloud',
    },
  ],
  onStartDrill,
}) => {
  const totalMinutes = items.reduce(
    (acc, item) => acc + (item.recommended_minutes || item.duration_minutes || 5),
    0
  );

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10152e] to-[#080a18] border border-indigo-500/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold font-display text-white">Daily Practice Plan</h3>
        </div>
        <Badge variant="amber" size="sm">
          {totalMinutes} Min High-Yield Drill
        </Badge>
      </div>

      <p className="text-xs text-slate-400">
        AI-curated practice plan targeted to close your highest-priority skill gaps.
      </p>

      {/* Drill Items */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const itemSkill = item.skill || item.topic || 'Core Concept';
          const itemMin = item.recommended_minutes || item.duration_minutes || 5;
          const itemReason = item.reason || item.rationale || item.focus_area || 'Target role practice';
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between gap-3 group hover:border-indigo-500/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{itemSkill}</span>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold shrink-0">
                    {itemMin}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{itemReason}</p>
              </div>

              <button
                onClick={() => onStartDrill(itemSkill)}
                className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shrink-0"
                title="Practice this skill"
              >
                <PlayCircle className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Button
        variant="glow"
        size="sm"
        onClick={() => onStartDrill(items[0]?.skill || items[0]?.topic || 'Incident Response')}
        className="w-full"
        leftIcon={<Zap className="w-3.5 h-3.5 text-cyan-300" />}
      >
        Start 15-Min Focused Workout
      </Button>
    </div>
  );
};
