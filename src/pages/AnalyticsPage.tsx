import React, { useState, useEffect } from 'react';
import { PerformanceTrendChart } from '../components/analytics/PerformanceTrendChart';
import { SkillRadarChart } from '../components/analytics/SkillRadarChart';
import { MetricsBreakdownChart } from '../components/analytics/MetricsBreakdownChart';
import {
  mockPerformanceTrends,
  mockDomainProficiencies,
  mockMetricTrends,
  mockWeeklyPractice,
} from '../data/mockAnalytics';
import { StatCard } from '../components/dashboard/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { analyticsApi } from '../services/analyticsApi';
import { profileApi } from '../services/profileApi';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Mic,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Database,
} from 'lucide-react';
import { AnalyticsSummary, SkillTrendItem, SkillGapAnalysis } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'last_session' | '7_days' | '30_days' | 'all_time'>('30_days');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [skillTrends, setSkillTrends] = useState<SkillTrendItem[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [sum, trends, gaps] = await Promise.all([
        analyticsApi.getAnalyticsSummary(timeframe).catch(() => null),
        analyticsApi.getSkillTrends('default', timeframe).catch(() => []),
        profileApi.getSkillGaps('default', 'SOC Analyst').catch(() => null),
      ]);
      if (sum) setSummary(sum);
      if (trends && trends.length > 0) setSkillTrends(trends);
      if (gaps) setSkillGaps(gaps);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Skill heatmap data
  const heatmapSkills = [
    { name: 'Network Security & Lateral Movement', score: 82, trend: '+6%', status: 'Improving', attempts: 14 },
    { name: 'Incident Response & SIEM Triage', score: 78, trend: '+4%', status: 'Improving', attempts: 12 },
    { name: 'Cloud Security & AWS IMDSv2', score: 71, trend: '+8%', status: 'Mastering', attempts: 8 },
    { name: 'Authentication & Kerberos Tickets', score: 64, trend: '-2%', status: 'Needs Practice', attempts: 9 },
    { name: 'Web Security & OWASP Top 10', score: 85, trend: '+3%', status: 'Proficient', attempts: 18 },
    { name: 'Linux System Hardening', score: 80, trend: '+5%', status: 'Proficient', attempts: 11 },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Performance & Skill Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Longitudinal telemetry tracking technical mastery, verbal cadence, and RAG-grounded evidence.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/[0.08]">
          {[
            { id: 'last_session', label: 'Last Session' },
            { id: '7_days', label: '7 Days' },
            { id: '30_days', label: '30 Days' },
            { id: 'all_time', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                timeframe === t.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Technical Score"
          value={`${summary?.technical_score ?? 82}%`}
          subtitle="Grounded depth & accuracy"
          icon={<BookOpen className="w-5 h-5" />}
          trend={{ value: '+5.4 pts', isPositive: true }}
          glowColor="cyan"
        />

        <StatCard
          title="Reasoning & Logic"
          value={`${summary?.reasoning_score ?? 86}%`}
          subtitle="Structured explanations"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: '+4.1 pts', isPositive: true }}
          glowColor="indigo"
        />

        <StatCard
          title="Speaking Cadence"
          value={`${summary?.speaking_pace_wpm ?? 136} WPM`}
          subtitle="Optimal range (120-150)"
          icon={<Mic className="w-5 h-5" />}
          trend={{ value: '-12 WPM (Paced)', isPositive: true }}
          glowColor="emerald"
        />

        <StatCard
          title="Camera Engagement"
          value={`${summary?.camera_engagement_score ?? 88}%`}
          subtitle="Forward attention"
          icon={<Eye className="w-5 h-5" />}
          trend={{ value: '+7% consistency', isPositive: true }}
          glowColor="violet"
        />
      </div>

      {/* STAGE 5: SKILL HEATMAP & MASTERY MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Skill Mastery Heatmap & Longitudinal Progression
            </h2>
            <p className="text-xs text-slate-400">
              Competency tracking across technical subdomains assessed during adaptive interview turns.
            </p>
          </div>
          <Badge variant="cyan" size="sm">
            PERSISTENT MASTERY ENGINE
          </Badge>
        </div>

        <Card className="p-5 bg-[#0c1021]/90 border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090c19] text-slate-400 font-mono text-[10px] uppercase border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Technical Skill Domain</th>
                  <th className="py-3 px-4">Mastery Heatmap</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Trend</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {heatmapSkills.map((s) => (
                  <tr key={s.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-4 w-48">
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            s.score >= 80
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                              : s.score >= 70
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                              : 'bg-gradient-to-r from-amber-500 to-rose-500'
                          }`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{s.score}%</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.attempts}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{s.trend}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={s.score >= 80 ? 'emerald' : s.score >= 70 ? 'violet' : 'amber'}
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Main Charts: Progression Area & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PerformanceTrendChart data={mockPerformanceTrends} />
        </div>
        <div className="lg:col-span-5">
          <SkillRadarChart data={mockDomainProficiencies} />
        </div>
      </div>

      {/* STAGE 5: WEAKNESS DETECTION & TARGETED RECOMMENDATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Targeted Weakness Remediation & Evidence
            </h2>
            <p className="text-xs text-slate-400">
              Evidence-based recommendations derived from factual misconceptions and challenger responses.
            </p>
          </div>
          <Badge variant="amber" size="sm">
            ACTIONABLE DRILLS
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-[#0e1224] border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">1. Kerberos Ticket Triage</h3>
              <Badge variant="amber" size="sm">High Priority</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Why it matters:</strong> Crucial for SOC Analyst interviews to distinguish Golden Tickets vs Silver Tickets.
              </p>
              <p>
                <strong className="text-slate-300">Recent Evidence:</strong> Overlooked KRBTGT hash encryption during domain persistence question.
              </p>
              <p className="text-cyan-400 font-medium">
                → Recommended: Complete 5-minute Kerberos attack triage drill.
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-[#0e1224] border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">2. Cloud IMDSv2 Transition</h3>
              <Badge variant="violet" size="sm">Moderate</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Why it matters:</strong> Required to explain SSRF mitigation against EC2 metadata endpoints.
              </p>
              <p>
                <strong className="text-slate-300">Recent Evidence:</strong> Answer mentioned IP whitelisting rather than session-token requirement.
              </p>
              <p className="text-cyan-400 font-medium">
                → Recommended: Review AWS IMDSv2 HTTP PUT header requirements.
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-[#0e1224] border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">3. Memory Forensics & LSASS</h3>
              <Badge variant="cyan" size="sm">Moderate</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Why it matters:</strong> Essential for incident containment and dump file analysis.
              </p>
              <p>
                <strong className="text-slate-300">Recent Evidence:</strong> Failed to state Event ID 4624 logon types during credential dump drill.
              </p>
              <p className="text-cyan-400 font-medium">
                → Recommended: Practice 10-minute volatile triage scenario.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* STAGE 3 & 4: PRESENTATION & RAG EVIDENCE TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presentation Telemetry */}
        <Card className="p-5 bg-[#0d1020]/90 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Presentation & Delivery Metrics
            </h3>
            <Badge variant="cyan" size="sm">Multimodal</Badge>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Camera Eye Alignment:</span>
              <span className="font-mono font-bold text-white">88.4%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Spine Posture Consistency:</span>
              <span className="font-mono font-bold text-white">92.0%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Speaking Pace:</span>
              <span className="font-mono font-bold text-emerald-400">136 WPM (Optimal)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Filler Word Frequency:</span>
              <span className="font-mono font-bold text-indigo-300">3.2 / min (-73%)</span>
            </div>
          </div>
        </Card>

        {/* RAG Grounding Observability */}
        <Card className="p-5 bg-[#0d1020]/90 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              RAG Grounding & Fact Observability
            </h3>
            <Badge variant="violet" size="sm">Evidence Engine</Badge>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Average Evidence Confidence:</span>
              <span className="font-mono font-bold text-cyan-400">86% Grounded</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Authority Sources Cited:</span>
              <span className="font-mono font-bold text-white">NIST, MITRE ATT&CK, AWS</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Fact-Check Pass Rate:</span>
              <span className="font-mono font-bold text-emerald-400">91.4% Verified</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Adversary Challenges Survived:</span>
              <span className="font-mono font-bold text-indigo-300">18 / 22 (81.8%)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
