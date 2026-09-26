import React, { useState, useEffect } from 'react';
import { mockSessions } from '../data/mockSessions';
import { RecentSessionCard } from '../components/dashboard/RecentSessionCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SessionCompareModal } from '../components/history/SessionCompareModal';
import { analyticsApi } from '../services/analyticsApi';
import { History, Search, GitCompare, Trash2, Award, Clock } from 'lucide-react';
import { InterviewHistoryRecord, InterviewMode, InterviewSession } from '../types';

interface HistoryPageProps {
  onViewReport: (sessionId: string) => void;
  onStartNewSession: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewReport,
  onStartNewSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<InterviewHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const records = await analyticsApi.getInterviewHistory();
      if (records && records.length > 0) {
        setHistoryRecords(records);
      } else {
        // Map mock sessions to history records format for fallback
        const mapped: InterviewHistoryRecord[] = mockSessions.map((s) => ({
          id: s.id,
          session_id: s.id,
          candidate_id: 'default',
          title: s.title,
          mode: s.mode,
          role: 'SOC Analyst',
          target_role: 'SOC Analyst',
          topic: s.topic,
          difficulty: s.difficulty,
          overall_score: s.score,
          questions_count: 5,
          turn_count: 5,
          challenges_count: 2,
          fact_checks_count: 3,
          duration_minutes: Math.round(s.durationSeconds / 60),
          duration_seconds: s.durationSeconds,
          date: s.date,
          created_at: s.date,
          is_completed: true,
        }));
        setHistoryRecords(mapped);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire interview history?')) {
      await analyticsApi.clearHistory();
      setHistoryRecords([]);
    }
  };

  // Convert history records to InterviewSession format for RecentSessionCard
  const displaySessions: InterviewSession[] = historyRecords.map((r) => ({
    id: r.id || r.session_id,
    title: r.title || r.topic || 'Interview Session',
    date: r.created_at || r.date || new Date().toISOString(),
    topic: r.target_role || r.role || r.topic || 'General',
    mode: (r.mode || 'cybersecurity') as InterviewMode,
    difficulty: (r.difficulty || 'advanced') as any,
    durationSeconds: r.duration_seconds || (r.duration_minutes ? r.duration_minutes * 60 : 600),
    score: r.overall_score,
    status: 'completed',
  }));

  const filteredSessions = displaySessions.filter((s) => {
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedMode === 'all' || s.mode === selectedMode;
    return matchesQuery && matchesMode;
  });

  const modes = [
    { id: 'all', label: 'All Sessions' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'technical', label: 'Technical' },
    { id: 'debate', label: 'Debate' },
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'stress', label: 'Stress' },
    { id: 'rapid_fire', label: 'Rapid Fire' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            Interview History & Longitudinal Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your past interview simulations, scores, and compare progression between sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {historyRecords.length >= 2 && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<GitCompare className="w-4 h-4 text-indigo-400" />}
              onClick={() => setIsCompareOpen(true)}
            >
              Compare Sessions
            </Button>
          )}

          <Button variant="glow" size="md" onClick={onStartNewSession}>
            Start New Session
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-[#0d1020]/90 border border-white/[0.08] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Mode Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
          {modes.map((m) => {
            const isActive = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sessions List */}
      <div className="space-y-3.5">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <RecentSessionCard
              key={session.id}
              session={session}
              onViewReport={onViewReport}
            />
          ))
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-[#0d1020]/50 border border-white/[0.06]">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No past sessions found</h3>
            <p className="text-xs text-slate-400 mb-4">
              Try adjusting your search query or start a new challenge session.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedMode('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Session Compare Modal */}
      <SessionCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        sessions={historyRecords}
      />
    </div>
  );
};
