import React, { useState } from 'react';
import { InterviewQuestion as QuestionType } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RotateCcw, SkipForward, HelpCircle, Lightbulb, CheckCircle, AlertTriangle, Volume2, Mic } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { cn } from '../../lib/utils';

interface InterviewQuestionProps {
  question: QuestionType | null;
  questionIndex: number;
  totalQuestions: number;
  onRepeat: () => void;
  onSkip: () => void;
  className?: string;
}

export const InterviewQuestion: React.FC<InterviewQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onRepeat,
  onSkip,
  className,
}) => {
  const { aiState } = useSession();
  const [showHints, setShowHints] = useState(false);
  const [showConcepts, setShowConcepts] = useState(false);
  const [showWhyAsked, setShowWhyAsked] = useState(false);

  if (!question) {
    return (
      <div className="p-6 rounded-2xl bg-[#0c0f1d] border border-white/[0.08] animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-3" />
        <div className="h-8 bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
      </div>
    );
  }

  const difficultyVariant =
    question.difficulty === 'expert'
      ? 'rose'
      : question.difficulty === 'advanced'
      ? 'violet'
      : question.difficulty === 'intermediate'
      ? 'cyan'
      : 'emerald';

  const defaultWhy = `Evaluates foundational architectural depth and active threat hunting protocols for ${question.subTopic || question.category || 'this domain'}.`;

  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0e1222] via-[#0b0e1b] to-[#070913] border border-indigo-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden',
        className
      )}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant="cyan" size="sm">
            QUESTION {(questionIndex + 1).toString().padStart(2, '0')} / {totalQuestions.toString().padStart(2, '0')}
          </Badge>
          <Badge variant={difficultyVariant} size="sm">
            {question.difficulty.toUpperCase()}
          </Badge>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {question.category} • {question.subTopic}
          </span>

          {/* AI Speaking / Candidate Turn Live Indicator */}
          {aiState === 'SPEAKING' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span>AI SPEAKING</span>
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              </span>
            </span>
          ) : aiState === 'LISTENING' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold">
              <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>YOUR TURN</span>
            </span>
          ) : null}
        </div>

        {/* Hints / Concepts / Why Asked Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWhyAsked(!showWhyAsked)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              showWhyAsked
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900/60 text-slate-400 border-white/[0.06] hover:text-white'
            )}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>{showWhyAsked ? 'Hide Insight' : 'Why this is asked'}</span>
          </button>

          {question.hints && question.hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                showHints
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/[0.06] hover:text-white'
              )}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHints ? 'Hide Hint' : 'Hint'}</span>
            </button>
          )}

          <button
            onClick={() => setShowConcepts(!showConcepts)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              showConcepts
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-400 border-white/[0.06] hover:text-white'
            )}
          >
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showConcepts ? 'Hide Rubric' : 'Expected Concepts'}</span>
          </button>
        </div>
      </div>

      {/* Main Question Text */}
      <h2 className="text-base sm:text-xl font-bold font-display text-white leading-relaxed mb-4">
        "{question.questionText}"
      </h2>

      {/* Why Asked Insight Expansion */}
      {showWhyAsked && (
        <div className="mb-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5 animate-in fade-in duration-200">
          <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Why you're being asked this: </span>
            {defaultWhy}
          </div>
        </div>
      )}

      {/* Hints Expansion */}
      {showHints && question.hints && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Adversary Hint: </span>
            {question.hints[0]}
          </div>
        </div>
      )}

      {/* Expected Concepts Expansion */}
      {showConcepts && question.expectedConcepts && (
        <div className="mb-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 animate-in fade-in duration-200">
          <p className="font-bold mb-2 text-cyan-300">Expected Evaluation Concepts (AI Rubric):</p>
          <div className="flex flex-wrap gap-1.5">
            {question.expectedConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-mono text-cyan-200"
              >
                ✓ {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
            onClick={onRepeat}
          >
            Repeat Question
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => onSkip()}
          >
            I Don't Know / Skip
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          rightIcon={<SkipForward className="w-3.5 h-3.5 text-cyan-400" />}
          onClick={onSkip}
        >
          Next Question
        </Button>
      </div>
    </div>
  );
};
