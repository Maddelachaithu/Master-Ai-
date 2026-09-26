import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { UserCameraPanel } from '../components/interview/UserCameraPanel';
import { LivePresentationPanel } from '../components/interview/LivePresentationPanel';
import { AIAvatarOrb } from '../components/interview/AIAvatarOrb';
import { AIStatusBadge } from '../components/interview/AIStatusBadge';
import { AudioWaveform } from '../components/interview/AudioWaveform';
import { InterviewQuestion } from '../components/interview/InterviewQuestion';
import { SessionIntelligencePanel } from '../components/interview/SessionIntelligencePanel';
import { LiveTranscript } from '../components/interview/LiveTranscript';
import { ChallengeBanner } from '../components/interview/ChallengeBanner';
import { EvidencePanel } from '../components/interview/EvidencePanel';
import { AIReasoningStatus } from '../components/interview/AIReasoningStatus';
import { InterviewControls } from '../components/interview/InterviewControls';
import { SimulatedInterviewFlowModal } from '../components/interview/SimulatedInterviewFlowModal';
import { PreInterviewCheckModal } from '../components/interview/PreInterviewCheckModal';
import { EndInterviewConfirmModal } from '../components/interview/EndInterviewConfirmModal';
import { RagEvidenceModal } from '../components/interview/RagEvidenceModal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { demoApi, DemoTurnData } from '../services/demoApi';
import {
  Sparkles,
  Sliders,
  Play,
  Video,
  Eye,
  ShieldCheck,
  Swords,
  Database,
  Zap,
  RotateCcw,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { NavRoute } from '../components/layout/Sidebar';

interface LiveInterviewPageProps {
  onEndSessionComplete: () => void;
  onNavigate: (route: NavRoute) => void;
  initialDemoMode?: boolean;
}

export const LiveInterviewPage: React.FC<LiveInterviewPageProps> = ({
  onEndSessionComplete,
  onNavigate,
  initialDemoMode = false,
}) => {
  const {
    config,
    isSessionActive,
    currentQuestion,
    questionIndex,
    totalQuestions,
    aiState,
    thinkingStep,
    aiStatusMessage,
    transcript,
    elapsedSeconds,
    isMicActive,
    isCameraActive,
    isMuted,
    audioLevel,
    visionMetrics,
    voiceMetrics,
    lastFactCheckResults,
    lastChallengeDetails,
    isRecordingAnswer,
    recordingDurationSeconds,
    liveInterimTranscript,
    isTranscribing,
    isAnalyzing,
    errorMessage,
    backendHealth,
    startSession,
    startRecordingAnswer,
    stopAndSubmitRecordingAnswer,
    cancelRecording,
    submitAnswer,
    triggerChallenge,
    repeatQuestion,
    skipQuestion,
    toggleMic,
    toggleCamera,
    toggleMute,
    endSession,
  } = useSession();

  // Modals state
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  // HUD & Presentation view
  const [showHud, setShowHud] = useState(true);
  const [showSttDiagnostics, setShowSttDiagnostics] = useState(false);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(initialDemoMode);
  const [demoTurnIndex, setDemoTurnIndex] = useState(1);
  const [demoData, setDemoData] = useState<DemoTurnData | null>(null);
  const [isSimulatingDemoStep, setIsSimulatingDemoStep] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      loadDemoTurn(demoTurnIndex);
    }
  }, [isDemoMode, demoTurnIndex]);

  const loadDemoTurn = async (turnIdx: number) => {
    try {
      const data = await demoApi.getTurn(turnIdx);
      setDemoData(data);
    } catch (e) {
      console.error('Failed to load demo turn', e);
    }
  };

  const handleRunDemoSimulation = async () => {
    if (!demoData) return;
    setIsSimulatingDemoStep(true);

    // Step 1: Simulate candidate speaking & transcript
    await new Promise((r) => setTimeout(r, 800));

    // Step 2: Auto-submit answer
    await submitAnswer(demoData.candidate_answer);

    setIsSimulatingDemoStep(false);
  };

  const handleNextDemoTurn = () => {
    if (demoTurnIndex < 4) {
      setDemoTurnIndex(demoTurnIndex + 1);
    } else {
      setIsEndConfirmOpen(true);
    }
  };

  const handleStartSessionFlow = () => {
    setIsPreCheckModalOpen(true);
  };

  const handleConfirmStartSession = async () => {
    setIsPreCheckModalOpen(false);
    await startSession();
  };

  const handleOpenEndConfirm = () => {
    setIsEndConfirmOpen(true);
  };

  const handleConfirmEndInterview = async () => {
    setIsEndConfirmOpen(false);
    await endSession();
    onEndSessionComplete();
  };

  const handleViewEvidence = (ev?: any) => {
    setSelectedEvidence(
      ev ||
        (demoData?.rag_evidence
          ? {
              document_name: demoData.rag_evidence.document_name,
              category: demoData.rag_evidence.category,
              source: demoData.rag_evidence.source,
              content_excerpt: demoData.rag_evidence.content_excerpt,
              confidence: demoData.rag_evidence.confidence,
              grounded: demoData.rag_evidence.grounded,
            }
          : null)
    );
    setIsEvidenceModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-8 max-w-[1500px] mx-auto animate-fadeIn">
      {/* Top Banner with Demo Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 via-[#0d1020] to-purple-950/60 border border-indigo-500/30 text-xs">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <Badge variant="amber" size="sm" pulse>
              DEMO MODE
            </Badge>
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-400" />
          )}
          <span className="font-semibold text-slate-200">
            {isDemoMode ? 'SOC Analyst Demonstration Session' : 'MASTER AI Autonomous Interview Cockpit'}
          </span>
          <span className="hidden sm:inline text-slate-400">
            • Interviewer + Socratic Challenger + Fact-Checker + Independent Rubric Synthesizer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Diagnostics toggle button */}
          <button
            onClick={() => setShowSttDiagnostics(!showSttDiagnostics)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
              showSttDiagnostics
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Real-Time STT Pipeline Diagnostics"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendHealth.whisperReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>STT Diagnostics</span>
          </button>

          {isDemoMode ? (
            <div className="flex items-center gap-2">
              <Button
                variant="glow"
                size="sm"
                onClick={handleRunDemoSimulation}
                disabled={isSimulatingDemoStep}
                leftIcon={<Zap className="w-3.5 h-3.5 text-cyan-300" />}
              >
                {isSimulatingDemoStep ? 'Simulating Pipeline...' : 'Auto-Simulate Demo Turn'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextDemoTurn}
              >
                Next Turn ({demoTurnIndex}/4) →
              </Button>
            </div>
          ) : !isSessionActive ? (
            <Button
              variant="glow"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={handleStartSessionFlow}
            >
              Start Session
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Database className="w-3.5 h-3.5 text-cyan-400" />}
                onClick={() => handleViewEvidence()}
              >
                Evidence
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sliders className="w-3.5 h-3.5 text-cyan-400" />}
                onClick={() => setIsSimModalOpen(true)}
                className="text-xs"
              >
                Test States
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time STT Pipeline Diagnostic HUD (Step 20) */}
      {showSttDiagnostics && (
        <div className="p-4 rounded-2xl bg-[#080b18]/95 border border-cyan-500/30 text-xs font-mono space-y-2.5 backdrop-blur-2xl animate-in fade-in shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-white/[0.08] pb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Real-Time STT Pipeline Diagnostics (Developer Mode)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Whisper int8 CTranslate2 • Web Audio API</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-slate-300 pt-1">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">Microphone</div>
              <div className={isMicActive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {isMicActive ? "CONNECTED" : "INACTIVE"}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">Recorder</div>
              <div className={isRecordingAnswer ? "text-rose-400 font-bold animate-pulse" : "text-slate-400"}>
                {isRecordingAnswer ? `RECORDING (${recordingDurationSeconds}s)` : "STOPPED"}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">Audio Stream</div>
              <div className="text-cyan-300 font-bold">{audioLevel > 0 ? `Active (${audioLevel}%)` : "Silent"}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">Whisper Engine</div>
              <div className={backendHealth.whisperReady ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {backendHealth.whisperReady ? "ONLINE" : "STANDBY"}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">Pipeline State</div>
              <div className="text-indigo-300 font-bold">
                {isTranscribing ? "TRANSCRIBING..." : isAnalyzing ? "ANALYZING..." : aiState}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">User Transcripts</div>
              <div className="text-cyan-300 font-bold">
                {transcript.filter(t => t.sender === 'user').length} Recorded
              </div>
            </div>
          </div>
          {liveInterimTranscript && (
            <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-[11px]">
              <span className="font-bold text-cyan-400">Live Interim: </span>
              <span className="italic">{liveInterimTranscript}</span>
            </div>
          )}
        </div>
      )}

      {/* THREE-PANEL HIGH PRESSURE MULTIMODAL INTERVIEW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: CANDIDATE FEED & PRESENTATION HUD (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <UserCameraPanel
              isCameraActive={isCameraActive}
              isMicActive={isMicActive}
              isMuted={isMuted}
              elapsedSeconds={elapsedSeconds}
              visionMetrics={visionMetrics}
              audioLevel={audioLevel}
            />

            {/* HUD Toggle Button */}
            <button
              onClick={() => setShowHud(!showHud)}
              className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors z-20"
              title="Toggle HUD presentation overlay"
            >
              <Tv className="w-3 h-3 text-cyan-400" />
              <span>{showHud ? 'Hide HUD' : 'Show HUD'}</span>
            </button>
          </div>

          {/* Live Presentation Telemetry Card */}
          {showHud && <LivePresentationPanel visionMetrics={visionMetrics} />}

          {/* Target Scenario Card */}
          <div className="hidden lg:block p-4 rounded-2xl bg-[#0a0d1a]/90 border border-white/[0.06]">
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Target Scenario</p>
            <p className="text-xs font-bold text-white leading-snug">
              {config.targetTopic || 'Lateral Movement & Threat Hunting'}
            </p>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.04] text-[11px] font-mono text-cyan-400">
              <span>● Adversary: {config.aiPersonality.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: MASTER AI INTERVIEWER (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* AI Orb & Status Container */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0e1328]/95 to-[#080a14]/95 border border-indigo-500/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

            {/* AI Status Badge & Safe Processing State */}
            <div className="mb-4 z-10 flex flex-col items-center gap-2">
              <AIStatusBadge state={aiState} customMessage={aiStatusMessage} />
              {isAnalyzing && (
                <AIReasoningStatus aiState={aiState} customStatus={aiStatusMessage} />
              )}
            </div>

            {/* Main AI Avatar Orb */}
            <div className="my-2 z-10">
              <AIAvatarOrb state={aiState} audioLevel={audioLevel} size="md" />
            </div>

            {/* AI Reactive Waveform */}
            <div className="w-full max-w-sm mt-3 bg-black/40 p-1.5 rounded-xl border border-white/[0.04] z-10">
              <AudioWaveform
                isActive={aiState === 'SPEAKING' || aiState === 'LISTENING'}
                color={aiState === 'CHALLENGING' ? 'rose' : aiState === 'FACT_CHECKING' ? 'emerald' : 'cyan'}
                barsCount={28}
              />
            </div>
          </div>

          {/* Adversarial Challenge Banner if active */}
          {(aiState === 'CHALLENGING' || lastChallengeDetails?.is_challenge_needed) && (
            <ChallengeBanner
              challengeDetails={lastChallengeDetails || undefined}
              isChallenging={aiState === 'CHALLENGING'}
            />
          )}

          {/* Active Interview Question Component */}
          <InterviewQuestion
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            onRepeat={repeatQuestion}
            onSkip={skipQuestion}
          />

          {/* Fact-Check Evidence Panel */}
          {lastFactCheckResults && lastFactCheckResults.length > 0 && (
            <EvidencePanel factCheckResults={lastFactCheckResults} />
          )}
        </div>

        {/* RIGHT COLUMN: SESSION INTELLIGENCE & LIVE TRANSCRIPT (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <SessionIntelligencePanel
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            elapsedSeconds={elapsedSeconds}
            targetDurationMinutes={config.durationMinutes}
            aiState={aiState}
            thinkingStep={thinkingStep}
            visionMetrics={visionMetrics}
            voiceMetrics={voiceMetrics}
            hasChallengerActive={aiState === 'CHALLENGING' || !!lastChallengeDetails?.is_challenge_needed}
            hasFactChecks={lastFactCheckResults && lastFactCheckResults.length > 0}
          />

          {/* Live Transcript */}
          <LiveTranscript
            transcript={transcript}
            isRecordingAnswer={isRecordingAnswer}
            isTranscribing={isTranscribing}
            liveInterimTranscript={liveInterimTranscript}
            className="flex-1"
          />
        </div>
      </div>

      {/* BOTTOM CONTROL DOCK */}
      <InterviewControls
        isMicActive={isMicActive}
        isCameraActive={isCameraActive}
        isMuted={isMuted}
        isRecordingAnswer={isRecordingAnswer}
        recordingDurationSeconds={recordingDurationSeconds}
        isTranscribing={isTranscribing}
        isAnalyzing={isAnalyzing}
        errorMessage={errorMessage}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleMute={toggleMute}
        onStartRecording={startRecordingAnswer}
        onStopRecording={stopAndSubmitRecordingAnswer}
        onCancelRecording={cancelRecording}
        onSubmitAnswer={submitAnswer}
        onTriggerChallenge={triggerChallenge}
        onEndSession={handleOpenEndConfirm}
        onOpenSettings={() => onNavigate('settings')}
      />

      {/* Pre-Interview Device & System Check Modal */}
      <PreInterviewCheckModal
        isOpen={isPreCheckModalOpen}
        onProceed={handleConfirmStartSession}
        onClose={() => setIsPreCheckModalOpen(false)}
        onLaunchDemo={() => {
          setIsDemoMode(true);
          startSession();
        }}
      />

      {/* End Interview Confirmation Modal */}
      <EndInterviewConfirmModal
        isOpen={isEndConfirmOpen}
        onClose={() => setIsEndConfirmOpen(false)}
        onConfirmEnd={handleConfirmEndInterview}
        answeredQuestionsCount={questionIndex + 1}
      />

      {/* RAG Evidence Modal */}
      <RagEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidence={selectedEvidence}
      />

      {/* Flow Simulation Modal */}
      <SimulatedInterviewFlowModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
};
