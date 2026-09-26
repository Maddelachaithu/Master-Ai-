import React, { useState } from 'react';
import { mockQuestionBank } from '../data/mockQuestionBank';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  HelpCircle,
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Award,
} from 'lucide-react';
import { DifficultyLevel, QuestionBankItem } from '../types';

interface QuestionBankPageProps {
  onPracticeQuestion: (question: QuestionBankItem) => void;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({ onPracticeQuestion }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const categories = [
    'all',
    'Cybersecurity',
    'System Design',
    'Cloud',
    'Programming',
    'Networking',
    'Database',
    'Behavioral',
    'Debate',
  ];

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

  const filteredQuestions = mockQuestionBank.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDifficulty =
      selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          Autonomous Question & Challenge Bank
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore curated challenges across distributed systems, threat hunting, and adversarial debate with full rubric concepts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-5 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, protocol, event ID, or architectural pattern..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-mono text-slate-400 mr-2 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
          <span className="text-xs font-mono text-slate-400 mr-2 shrink-0">Difficulty:</span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-all ${
                selectedDifficulty === diff
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </Card>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredQuestions.map((q) => {
          const diffVariant =
            q.difficulty === 'expert'
              ? 'rose'
              : q.difficulty === 'advanced'
              ? 'violet'
              : q.difficulty === 'intermediate'
              ? 'cyan'
              : 'emerald';

          return (
            <Card
              key={q.id}
              className="p-5 sm:p-6 bg-[#0c0f1f]/85 border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={diffVariant} size="sm">
                      {q.difficulty.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {q.category} • {q.type}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    Practiced: <strong className="text-slate-200">{q.timesPracticed}x</strong>
                  </span>
                </div>

                {/* Question Title & Text */}
                <h3 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {q.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  "{q.question}"
                </p>

                {/* Expected Concepts */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                    Expected Rubric Concepts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {q.expectedConcepts.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/[0.04] text-[11px] font-mono text-slate-300"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Adversary Trap Preview */}
                {q.adversarialTraps && q.adversarialTraps.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-[11px] text-rose-300 mb-4 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Adversary Probe Target: {q.adversarialTraps[0]}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-2">
                <span className="text-xs font-mono text-slate-400">
                  Avg Score: <strong className="text-cyan-400">{q.avgScore}/100</strong>
                </span>

                <Button
                  variant="glow"
                  size="sm"
                  rightIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => onPracticeQuestion(q)}
                >
                  Practice This
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
