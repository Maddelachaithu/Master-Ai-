import React, { useState } from 'react';
import { QuestionEvaluation } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Clock, Zap, Swords, BookCheck } from 'lucide-react';
import { cn, getScoreColor } from '../../lib/utils';

interface QuestionAnalysisAccordionProps {
  evaluations: QuestionEvaluation[];
  className?: string;
}

export const QuestionAnalysisAccordion: React.FC<QuestionAnalysisAccordionProps> = ({
  evaluations,
  className,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-base sm:text-lg font-bold font-display text-white mb-2">
        Question-by-Question Deep Analysis & Timeline
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Examine candidate answers, adversary probe triggers, and rubrics applied
      </p>

      {evaluations.map((item, idx) => {
        const isOpen = openIndex === idx;
        const scoreColors = getScoreColor(item.score);

        return (
          <Card
            key={item.questionId}
            className="border border-white/[0.08] bg-[#0c0f1f]/90 overflow-hidden transition-all duration-300"
          >
            {/* Accordion Header */}
            <div
              onClick={() => toggleAccordion(idx)}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shrink-0',
                    scoreColors.bg,
                    scoreColors.border,
                    scoreColors.text
                  )}
                >
                  {item.score}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      QUESTION {item.questionNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-mono">Score: {item.score}/100</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {item.questionText}
                  </h4>
                </div>
              </div>

              <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Accordion Expanded Body */}
            {isOpen && (
              <div className="p-5 pt-0 space-y-5 border-t border-white/[0.06] bg-[#080b16]/60 animate-in fade-in duration-200">
                {/* Full Question Text */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.04] mt-4">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                    Prompt Presented
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">"{item.questionText}"</p>
                </div>

                {/* Strength & Improvement Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Key Strength</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.strength}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Area for Improvement</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.improvement}</p>
                  </div>
                </div>

                {/* Follow-up / Challenge Rationale */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/25">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1.5">
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>Adversary Dynamic Trigger Rationale</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.followUpReason}</p>
                </div>

                {/* Concepts Covered vs Missed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-emerald-400 block mb-2">
                      ✓ Rubric Concepts Covered:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.conceptsCovered.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono font-semibold text-rose-400 block mb-2">
                      ✕ Rubric Concepts Omitted:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.conceptsMissed.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Event Timeline */}
                <div>
                  <span className="text-xs font-mono font-bold text-slate-300 block mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Interaction Timeline & Probing Cadence
                  </span>

                  <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-500/20">
                    {item.timeline.map((evt, eIdx) => {
                      const eventDot =
                        evt.type === 'challenge'
                          ? 'bg-rose-400 ring-rose-500/30'
                          : evt.type === 'fact_check'
                          ? 'bg-emerald-400 ring-emerald-500/30'
                          : evt.type === 'followup'
                          ? 'bg-amber-400 ring-amber-500/30'
                          : 'bg-cyan-400 ring-cyan-500/30';

                      return (
                        <div key={eIdx} className="relative flex items-start gap-3 text-xs">
                          <span
                            className={cn(
                              'absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4',
                              eventDot
                            )}
                          />
                          <span className="font-mono text-cyan-400 font-bold shrink-0">{evt.time}</span>
                          <span className="text-slate-300">{evt.event}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
