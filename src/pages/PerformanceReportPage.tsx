import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { OverallScoreCard } from '../components/reports/OverallScoreCard';
import { ScoreBreakdownCard } from '../components/reports/ScoreBreakdownCard';
import { VisualMetricsCard } from '../components/reports/VisualMetricsCard';
import { VoiceMetricsCard } from '../components/reports/VoiceMetricsCard';
import { MultiAgentAnalysisCard } from '../components/reports/MultiAgentAnalysisCard';
import { QuestionAnalysisAccordion } from '../components/reports/QuestionAnalysisAccordion';
import { mockPerformanceReport } from '../data/mockPerformance';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Swords,
  Download,
  Printer,
  Database,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { NavRoute } from '../components/layout/Sidebar';

interface PerformanceReportPageProps {
  onPracticeAgain: () => void;
  onNavigate: (route: NavRoute) => void;
}

export const PerformanceReportPage: React.FC<PerformanceReportPageProps> = ({
  onPracticeAgain,
  onNavigate,
}) => {
  const { lastReport, config } = useSession();
  const report = lastReport || mockPerformanceReport;
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MASTER_AI_Report_${report.sessionId || 'session'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto animate-fadeIn print:text-black print:bg-white">
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08] print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              EVALUATION COMPLETE
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Session ID: {report.sessionId || 'session-current'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            Performance & Multimodal Evaluation Report
          </h1>
          <p className="text-xs text-slate-400">
            Role: <span className="text-cyan-400 font-semibold">{config?.targetTopic || 'SOC Analyst'}</span> • Mode: <span className="text-indigo-400 capitalize">{config?.mode || 'Cybersecurity'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4 text-slate-400" />}
            onClick={handlePrint}
          >
            Print Report
          </Button>

          <Button
            variant="glow"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-cyan-300" />}
            onClick={handleDownloadJSON}
          >
            {downloadSuccess ? 'Downloaded!' : 'Export JSON'}
          </Button>
        </div>
      </div>

      {/* 1. OVERALL SCORE & SUMMARY CARD */}
      <OverallScoreCard
        report={report}
        onRetry={onPracticeAgain}
        onImprovementPlan={() => onNavigate('improvement')}
      />

      {/* 2. SCORE EXPLANATION CALLOUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
          <p className="text-[11px] font-mono text-cyan-400 font-bold">TECHNICAL KNOWLEDGE ({report.scoreBreakdown?.knowledge || 84}%)</p>
          <p className="text-xs text-slate-300 leading-snug">
            Accurately referenced Event ID 4624/4625 log correlation and AWS IMDSv2 HTTP PUT headers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
          <p className="text-[11px] font-mono text-indigo-400 font-bold">REASONING & LOGIC ({report.scoreBreakdown?.reasoning || 88}%)</p>
          <p className="text-xs text-slate-300 leading-snug">
            Strong multi-step investigation logic maintained across {report.questionEvaluations?.length || 4} evaluated turns.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
          <p className="text-[11px] font-mono text-emerald-400 font-bold">PRESENTATION & HUD ({report.visionMetrics?.cameraEngagement || 88}%)</p>
          <p className="text-xs text-slate-300 leading-snug">
            Consistent forward camera focus with upright spine posture and clear 136 WPM speech cadence.
          </p>
        </div>
      </div>

      {/* 3. STAGE 4 & 5 MULTI-AGENT ADVERSARY & RAG GROUNDING ANALYSIS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white font-display">
            Multi-Agent Adversary & Grounded Evidence Analysis
          </h3>
        </div>
        <MultiAgentAnalysisCard difficulty={report.difficulty} />
      </div>

      {/* 4. RAG EVIDENCE GROUNDING & SOURCES CITED */}
      <Card className="p-6 bg-[#0c1021]/90 border border-cyan-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold font-display text-white">
              Grounded Knowledge Sources Cited
            </h3>
          </div>
          <Badge variant="cyan" size="sm">
            86% Evidence Confidence
          </Badge>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The evaluation of your technical answers was compared against authoritative documentation indexed in ChromaDB:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06]">
            <p className="text-xs font-bold text-white">NIST SP 800-61 Rev 2</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Order of Volatility & Incident Handling</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06]">
            <p className="text-xs font-bold text-white">MITRE ATT&CK T1558</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Kerberoasting & Lateral Movement</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06]">
            <p className="text-xs font-bold text-white">AWS Security Standards</p>
            <p className="text-[11px] text-slate-400 mt-0.5">IMDSv2 Session Token Configuration</p>
          </div>
        </div>
      </Card>

      {/* 5. CORE EVALUATION GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ScoreBreakdownCard breakdown={report.scoreBreakdown} />
        </div>

        {/* Right: Multimodal Signal Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <VisualMetricsCard metrics={report.visionMetrics} telemetry={report.visionTelemetry} />
          <VoiceMetricsCard metrics={report.voiceMetrics} />
        </div>
      </div>

      {/* 6. QUESTION-BY-QUESTION DEEP ANALYSIS */}
      <QuestionAnalysisAccordion evaluations={report.questionEvaluations} />

      {/* 7. KEY STRENGTHS & AREAS TO IMPROVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6 bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Key Strengths Demonstrated</h3>
              <p className="text-xs text-slate-400">Validated competencies</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {report.keyStrengths.map((st, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Areas to Improve */}
        <Card className="p-6 bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Areas for Improvement</h3>
              <p className="text-xs text-slate-400">Recommended target areas</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {report.areasToImprove.map((ai, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">!</span>
                <span>{ai}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 8. RECOMMENDED PRACTICE CALL TO ACTION */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-[#0e1224] to-purple-950 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 print:hidden">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            NEXT STEPS
          </Badge>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-1">
            Personalized Improvement Plan Ready
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            MASTER AI has generated targeted drills and speaking exercises to address your identified gaps.
          </p>
        </div>

        <Button
          variant="glow"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => onNavigate('improvement')}
          className="shrink-0"
        >
          Open Improvement Plan
        </Button>
      </Card>
    </div>
  );
};
