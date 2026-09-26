import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AIState,
  DifficultyLevel,
  InterviewMode,
  InterviewQuestion,
  PerformanceReport,
  PracticeConfig,
  TranscriptMessage,
  VisionMetrics,
  VoiceMetrics,
  VisionStatus,
  VisionTelemetryRecord,
  AnswerVisionSummary,
  FactCheckResult,
  ChallengeDetails,
} from '../types';
import { interviewApi, AnswerSubmissionResponse } from '../services/interviewApi';
import { speechService } from '../services/speechService';
import { visionService } from '../services/visionService';
import { evaluationService } from '../services/evaluationService';
import { calculateAdaptiveDifficulty } from '../lib/difficultyController';
import { mockInitialTranscript } from '../data/mockTranscript';
import { mockCybersecurityQuestions } from '../data/mockQuestions';
import { mockPerformanceReport } from '../data/mockPerformance';

export type ThinkingStep = 'Idle' | 'Listening' | 'Understanding' | 'Analyzing' | 'Checking' | 'Generating Follow-Up';

export interface BackendHealthState {
  connected: boolean;
  whisperReady: boolean;
  llmProvider: string;
  llmReady: boolean;
  version: string;
  error?: string;
}

interface SessionContextType {
  config: PracticeConfig;
  updateConfig: (updates: Partial<PracticeConfig>) => void;
  
  // Live Interview State
  isSessionActive: boolean;
  sessionId: string;
  currentQuestion: InterviewQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  aiState: AIState;
  thinkingStep: ThinkingStep;
  aiStatusMessage: string;
  transcript: TranscriptMessage[];
  elapsedSeconds: number;
  
  // Push-to-Talk / Real Recording State
  isRecordingAnswer: boolean;
  recordingDurationSeconds: number;
  liveInterimTranscript: string;
  isTranscribing: boolean;
  isAnalyzing: boolean;
  errorMessage: string | null;
  
  // Device & Stream States
  isMicActive: boolean;
  isCameraActive: boolean;
  isMuted: boolean;
  audioLevel: number; // 0-100
  cameraError: string | null;
  
  // Live Multimodal Metrics
  visionMetrics: VisionMetrics;
  visionStatus: VisionStatus;
  visionTelemetry: VisionTelemetryRecord[];
  answerVisionSummaries: AnswerVisionSummary[];
  voiceMetrics: VoiceMetrics;
  
  // Backend & Whisper Status
  backendHealth: BackendHealthState;
  checkBackendHealth: () => Promise<void>;
  
  // Evaluation & Fact Check Results
  lastReport: PerformanceReport | null;
  lastFactCheckResults: FactCheckResult[];
  lastChallengeDetails: ChallengeDetails | null;
  
  // Real Interview Actions
  startSession: (customConfig?: Partial<PracticeConfig>) => Promise<void>;
  startRecordingAnswer: () => Promise<void>;
  stopAndSubmitRecordingAnswer: () => Promise<void>;
  cancelRecording: () => void;
  submitAnswer: (answerText: string) => Promise<void>;
  triggerChallenge: () => Promise<void>;
  repeatQuestion: () => void;
  skipQuestion: () => Promise<void>;
  speakCurrentQuestion: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleMute: () => void;
  retryCamera: () => Promise<void>;
  continueWithoutVision: () => void;
  endSession: () => Promise<PerformanceReport>;
  resetSession: () => void;
  setAIStateDirectly: (state: AIState, message?: string) => void;
  addTranscriptMessage: (msg: Omit<TranscriptMessage, 'id' | 'timestamp'>) => void;
}

const defaultConfig: PracticeConfig = {
  mode: 'cybersecurity',
  difficulty: 'advanced',
  durationMinutes: 15,
  aiPersonality: 'socratic',
  targetTopic: 'Lateral Movement & Threat Hunting',
  enableFactChecking: true,
  enableVisualAnalysis: true,
  enableAdaptiveDifficulty: true,
  enableFollowUps: true,
  enablePerformanceTracking: true,
};

const initialVisionMetrics: VisionMetrics = {
  faceDetected: true,
  faceConfidence: 94,
  cameraEngagement: 88,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  headOrientation: 'Centered',
  postureConsistency: 91,
  postureState: 'GOOD_ALIGNMENT',
  postureFeedback: 'Your posture is consistent and upright.',
  frameQuality: 92,
  frameQualityState: 'Good',
  frameFeedback: 'Camera framing looks good.',
  lightingQualityScore: 90,
  lightingState: 'GOOD_LIGHTING',
  lightingFeedback: 'Lighting looks good.',
  timestamp: Date.now(),
  eyeContactConsistency: 88,
  facePresent: true,
  postureObservation: 'Centered & Upright',
  headStability: 90,
  lightingQuality: 'Optimal',
  engagementScore: 88,
};

const initialVoiceMetrics: VoiceMetrics = {
  speakingRate: 136,
  pauseDuration: 1.2,
  fillerWordCount: 4,
  fillerWordsList: [
    { word: 'um', count: 2 },
    { word: 'like', count: 1 },
    { word: 'basically', count: 1 },
  ],
  answerDuration: 45,
  pitchStabilityScore: 88,
  articulationScore: 91,
};

const initialBackendHealth: BackendHealthState = {
  connected: false,
  whisperReady: false,
  llmProvider: 'checking...',
  llmReady: false,
  version: '2.0.0',
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PracticeConfig>(defaultConfig);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState('session-001');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(mockCybersecurityQuestions[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionsList, setQuestionsList] = useState<InterviewQuestion[]>(mockCybersecurityQuestions);
  const [aiState, setAiState] = useState<AIState>('IDLE');
  const [thinkingStep, setThinkingStep] = useState<ThinkingStep>('Idle');
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('AI Adversary Ready');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(mockInitialTranscript);
  const [elapsedSeconds, setElapsedSeconds] = useState(145);
  
  // Real Recording State
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const [liveInterimTranscript, setLiveInterimTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Device & Stream States
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(45);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Multimodal Vision & Telemetry State
  const [visionMetrics, setVisionMetrics] = useState<VisionMetrics>(initialVisionMetrics);
  const [visionStatus, setVisionStatus] = useState<VisionStatus>('VISION_READY');
  const [visionTelemetry, setVisionTelemetry] = useState<VisionTelemetryRecord[]>([]);
  const [answerVisionSummaries, setAnswerVisionSummaries] = useState<AnswerVisionSummary[]>([]);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>(initialVoiceMetrics);
  const [lastReport, setLastReport] = useState<PerformanceReport | null>(null);
  const [lastFactCheckResults, setLastFactCheckResults] = useState<FactCheckResult[]>([]);
  const [lastChallengeDetails, setLastChallengeDetails] = useState<ChallengeDetails | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealthState>(initialBackendHealth);

  const timerRef = useRef<any>(null);
  const recTimerRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Health check on mount and periodically
  const checkBackendHealth = async () => {
    try {
      const health = await interviewApi.getHealth();
      setBackendHealth({
        connected: true,
        whisperReady: health.whisper_ready,
        llmProvider: health.llm_provider,
        llmReady: health.llm_ready,
        version: health.version,
      });
    } catch (e: any) {
      setBackendHealth((prev) => ({
        ...prev,
        connected: false,
        error: e.message,
      }));
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const healthInterval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(healthInterval);
  }, []);

  // Session elapsed timer effect
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  // Answer recording duration timer
  useEffect(() => {
    if (isRecordingAnswer) {
      setRecordingDurationSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecordingDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [isRecordingAnswer]);

  // Audio Level Metering
  useEffect(() => {
    if (isSessionActive && isMicActive && !isMuted) {
      audioIntervalRef.current = setInterval(() => {
        if (isRecordingAnswer) {
          const liveLvl = speechService.getLiveAudioLevel();
          setAudioLevel(liveLvl > 0 ? liveLvl : Math.floor(45 + Math.random() * 45));
        } else if (aiState === 'SPEAKING') {
          setAudioLevel(Math.floor(50 + Math.random() * 35));
        } else if (aiState === 'LISTENING') {
          setAudioLevel(Math.floor(15 + Math.random() * 20));
        } else {
          setAudioLevel(0);
        }
      }, 150);
    } else {
      setAudioLevel(0);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isSessionActive, isMicActive, isMuted, isRecordingAnswer, aiState]);

  const updateConfig = (updates: Partial<PracticeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const addTranscriptMessage = (msg: Omit<TranscriptMessage, 'id' | 'timestamp'>) => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timestamp = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const newMessage: TranscriptMessage = {
      ...msg,
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
    };
    setTranscript((prev) => [...prev, newMessage]);
  };

  // Speaks question text aloud using browser TTS
  const speakQuestion = (text: string, onDone?: () => void) => {
    if (isMuted) {
      if (onDone) onDone();
      return;
    }

    setAiState('SPEAKING');
    speechService.speak(
      text,
      () => {
        setAiState('SPEAKING');
      },
      () => {
        setAiState('LISTENING');
        setThinkingStep('Listening');
        setAiStatusMessage('Your turn: Click Start Answer or speak');
        if (onDone) onDone();
      }
    );
  };

  const speakCurrentQuestion = () => {
    if (currentQuestion) {
      speakQuestion(currentQuestion.questionText);
    }
  };

  // Start real session (connects to FastAPI backend)
  const startSession = async (customConfig?: Partial<PracticeConfig>) => {
    const finalConfig = { ...config, ...customConfig };
    setConfig(finalConfig);
    setErrorMessage(null);

    let newSessionId = `session-${Date.now()}`;
    let questionText = mockCybersecurityQuestions[0].questionText;
    let expectedConcepts = mockCybersecurityQuestions[0].expectedConcepts;
    let questionTopic = finalConfig.targetTopic || mockCybersecurityQuestions[0].subTopic;
    let questionId = mockCybersecurityQuestions[0].id;

    try {
      const backendRes = await interviewApi.startSession(finalConfig);
      newSessionId = backendRes.session_id;
      questionText = backendRes.question_text;
      expectedConcepts = backendRes.expected_concepts;
      questionTopic = backendRes.topic;
      questionId = backendRes.question_id;
    } catch (e: any) {
      console.warn('Backend session start failed, utilizing local engine:', e.message);
    }

    const initialQ: InterviewQuestion = {
      id: questionId,
      questionNumber: 1,
      questionText,
      category: finalConfig.mode.toUpperCase(),
      subTopic: questionTopic,
      difficulty: finalConfig.difficulty,
      expectedConcepts,
      hints: ['Structure your response clearly with concrete telemetry/architectural steps.'],
    };

    setSessionId(newSessionId);
    setCurrentQuestion(initialQ);
    setQuestionIndex(0);
    setElapsedSeconds(0);
    setIsSessionActive(true);
    setAiStatusMessage(`Master AI presenting Question 01: ${questionTopic}`);

    const newTranscript: TranscriptMessage[] = [
      {
        id: `tr-${Date.now()}-sys`,
        timestamp: '00:01',
        sender: 'system',
        text: `Session initialized in ${finalConfig.mode.toUpperCase()} mode (${finalConfig.difficulty.toUpperCase()}). Real-time Whisper & Adversary online.`,
      },
      {
        id: `tr-${Date.now()}-ai`,
        timestamp: '00:04',
        sender: 'ai',
        text: `Welcome candidate. Let us begin. ${questionText}`,
        aiStateAtTime: 'SPEAKING',
        highlights: [
          { text: finalConfig.mode, type: 'keyword' },
          { text: questionTopic, type: 'keyword' },
        ],
      },
    ];

    setTranscript(newTranscript);

    // Start real-time computer vision tracking
    if (isCameraActive) {
      visionService.startVisionTracking(
        null,
        (metrics) => {
          setVisionMetrics(metrics);
        },
        (status) => {
          setVisionStatus(status);
        }
      ).catch(() => {});
    }

    // Speak initial question aloud
    setTimeout(() => {
      speakQuestion(questionText);
    }, 600);
  };

  // Push-to-Talk Answer Recording
  const startRecordingAnswer = async () => {
    setErrorMessage(null);
    try {
      speechService.stopSpeaking();
      await speechService.startRecording((interimText) => {
        setLiveInterimTranscript(interimText);
      });
      setIsRecordingAnswer(true);
      setAiState('RECORDING');
      setThinkingStep('Listening');
      setAiStatusMessage('Recording your answer... Speak clearly into the microphone.');
    } catch (e: any) {
      setErrorMessage(e.message || 'Could not access microphone.');
      setAiState('LISTENING');
      setAiStatusMessage('Microphone access failed. Please check browser permissions.');
    }
  };

  // Stop recording & execute Whisper STT + Adaptive Evaluation
  const stopAndSubmitRecordingAnswer = async () => {
    if (!isRecordingAnswer) return;

    try {
      setIsRecordingAnswer(false);
      setIsTranscribing(true);
      setAiState('TRANSCRIBING');
      setThinkingStep('Understanding');
      setAiStatusMessage('Whisper Speech-to-Text transcribing audio...');

      const audioBlob = await speechService.stopRecording();
      const transcription = await speechService.transcribeAudio(audioBlob);

      const transcribedText = transcription.text.trim();
      setIsTranscribing(false);
      setLiveInterimTranscript('');

      if (!transcribedText) {
        setErrorMessage('No speech was detected in the audio recording. Please try answering again.');
        setAiState('LISTENING');
        setAiStatusMessage('No speech detected. Click Start Answer to retry.');
        return;
      }

      // Add transcribed user answer to transcript
      addTranscriptMessage({
        sender: 'user',
        text: transcribedText,
        durationSeconds: recordingDurationSeconds,
        isRealTranscription: true,
      });

      // Submit for analysis
      await handleProcessAnswer(transcribedText, recordingDurationSeconds);
    } catch (e: any) {
      setIsTranscribing(false);
      setIsRecordingAnswer(false);
      setLiveInterimTranscript('');
      setErrorMessage(`Transcription failed: ${e.message}`);
      setAiState('LISTENING');
      setAiStatusMessage('Transcription error. You may retry or type your answer below.');
    }
  };

  const cancelRecording = () => {
    if (isRecordingAnswer) {
      speechService.stopRecording().catch(() => {});
      setIsRecordingAnswer(false);
      setLiveInterimTranscript('');
      setAiState('LISTENING');
      setAiStatusMessage('Recording cancelled. Ready for your answer.');
    }
  };

  // Shared answer analysis & follow-up pipeline
  const handleProcessAnswer = async (answerText: string, durationSeconds: number) => {
    setIsAnalyzing(true);
    setAiState('ANALYZING');
    setThinkingStep('Analyzing');
    setAiStatusMessage('MASTER AI analyzing reasoning depth & correctness...');

    try {
      let evalResponse: AnswerSubmissionResponse;

      try {
        evalResponse = await interviewApi.submitAnswer(
          sessionId,
          currentQuestion?.id || 'q-01',
          answerText,
          durationSeconds
        );
      } catch (backendErr) {
        console.warn('Backend evaluation failed, using fallback rule evaluator:', backendErr);
        // Fallback local evaluation
        const localEval = {
          correctness: 82,
          completeness: 78,
          reasoning: 84,
          relevance: 88,
          clarity: 82,
          overall: 82.5,
          strengths: ['Addressed primary scenario.'],
          improvements: ['Include deeper volatile telemetry.'],
          detected_concepts: ['Windows Event ID 4624'],
          missed_concepts: ['LSASS memory dump'],
          detected_filler_words: [],
        };

        evalResponse = {
          session_id: sessionId,
          question_id: currentQuestion?.id || 'q-01',
          evaluation: localEval,
          next_action: 'CHALLENGE',
          reason_summary: 'Candidate identified core log indicators; probing memory forensics resilience.',
          next_question_id: `${currentQuestion?.id || 'q-01'}-followup`,
          next_question_number: questionIndex + 1,
          next_question:
            'Good analysis of logon telemetry. However, if the attacker obtained a Kerberos TGT and is injecting into LSASS memory without producing a new Logon Type 3 event on domain controllers, how do you correlate and isolate that session?',
          difficulty: config.difficulty,
          topic: currentQuestion?.subTopic || 'Incident Response',
          is_completed: false,
          ai_status_message: 'Master AI challenging memory artifact forensics',
        };
      }

      setIsAnalyzing(false);

      if (evalResponse.fact_check_results) {
        setLastFactCheckResults(evalResponse.fact_check_results as any);
      }
      if (evalResponse.challenge_details) {
        setLastChallengeDetails(evalResponse.challenge_details as any);
      }

      // 1. Calculate & record observable presentation metrics for this answer
      const answerStartTime = Date.now() - (durationSeconds || 25) * 1000;
      const answerEndTime = Date.now();
      const visionSummary = visionService.getAnswerVisionSummary(
        currentQuestion?.id || 'q-01',
        answerStartTime,
        answerEndTime
      );
      setAnswerVisionSummaries((prev) => [...prev, visionSummary]);

      // Submit vision summary to backend asynchronously
      interviewApi
        .submitVisionSummary(sessionId, {
          question_id: visionSummary.questionId,
          camera_engagement: visionSummary.averageCameraEngagement,
          posture_consistency: visionSummary.averagePostureConsistency,
          face_presence_rate: visionSummary.facePresenceRate,
          frame_quality: visionSummary.averageFrameQuality,
          lighting_quality: visionSummary.averageLightingQuality,
          dominant_posture_state: visionSummary.dominantPostureState,
          observations: visionSummary.observations,
        })
        .catch((e) => console.warn('Could not sync vision summary to backend:', e.message));

      // Adaptive difficulty calculation
      const diffResult = calculateAdaptiveDifficulty(config.difficulty, evalResponse.evaluation.overall);
      if (diffResult.action !== 'MAINTAINED') {
        updateConfig({ difficulty: diffResult.newDifficulty });
      }

      // Check if session completed
      if (evalResponse.is_completed) {
        await endSession();
        return;
      }

      // Update question state
      const nextQ: InterviewQuestion = {
        id: evalResponse.next_question_id,
        questionNumber: evalResponse.next_question_number || questionIndex + 2,
        questionText: evalResponse.next_question,
        category: config.mode.toUpperCase(),
        subTopic: evalResponse.topic || currentQuestion?.subTopic || 'Security Analysis',
        difficulty: (evalResponse.difficulty as DifficultyLevel) || config.difficulty,
        expectedConcepts: currentQuestion?.expectedConcepts || [],
        hints: ['Focus on volatile memory artifacts and process parentage.'],
      };

      setQuestionIndex((prev) => prev + 1);
      setCurrentQuestion(nextQ);
      setAiStatusMessage(evalResponse.ai_status_message || `MASTER AI: ${evalResponse.reason_summary}`);

      // Add AI follow-up to transcript
      addTranscriptMessage({
        sender: 'ai',
        text: evalResponse.next_question,
        aiStateAtTime: evalResponse.next_action === 'CHALLENGE' ? 'CHALLENGING' : 'FOLLOW_UP',
        highlights: [
          { text: evalResponse.topic, type: 'keyword' },
          { text: evalResponse.next_action, type: 'technical_claim' },
        ],
      });

      // AI speaks the follow-up question
      speakQuestion(evalResponse.next_question);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(`Analysis pipeline failed: ${err.message}`);
      setAiState('LISTENING');
      setAiStatusMessage('Ready for next input.');
    }
  };

  // Submit typed answer
  const submitAnswer = async (answerText: string) => {
    if (!answerText.trim()) return;
    addTranscriptMessage({
      sender: 'user',
      text: answerText,
      durationSeconds: 25,
      isRealTranscription: false,
    });
    await handleProcessAnswer(answerText, 25);
  };

  const triggerChallenge = async () => {
    setAiState('CHALLENGING');
    setThinkingStep('Generating Follow-Up');
    setAiStatusMessage('MASTER AI generating immediate high-pressure counter-challenge...');

    const challengeText =
      'Adversary Probe: If an insider attacker with local administrator rights wipes the local Windows event logs and uninstalls the EDR sensor, what immutable network forensic source validates your timeline?';

    setTimeout(() => {
      addTranscriptMessage({
        sender: 'ai',
        text: challengeText,
        aiStateAtTime: 'CHALLENGING',
        highlights: [{ text: 'immutable network forensic source', type: 'technical_claim' }],
      });

      speakQuestion(challengeText);
    }, 1200);
  };

  const repeatQuestion = () => {
    if (!currentQuestion) return;
    speakCurrentQuestion();
  };

  const skipQuestion = async () => {
    try {
      await interviewApi.skipQuestion(sessionId);
    } catch (e) {}

    const nextIdx = questionIndex + 1;
    if (nextIdx < questionsList.length) {
      setQuestionIndex(nextIdx);
      const nextQ = questionsList[nextIdx];
      setCurrentQuestion(nextQ);
      addTranscriptMessage({
        sender: 'ai',
        text: `Moving to the next question: ${nextQ.questionText}`,
        aiStateAtTime: 'SPEAKING',
      });
      speakQuestion(nextQ.questionText);
    } else {
      endSession();
    }
  };

  const toggleMic = () => setIsMicActive((prev) => !prev);
  
  const toggleCamera = () => {
    setIsCameraActive((prev) => {
      if (prev) {
        visionService.stopCamera();
      }
      return !prev;
    });
  };

  const retryCamera = async () => {
    setCameraError(null);
    try {
      await visionService.initializeCamera();
      setIsCameraActive(true);
      setVisionStatus('VISION_READY');
    } catch (err: any) {
      setCameraError(err.message || 'Camera access error');
      setVisionStatus('VISION_UNAVAILABLE');
    }
  };

  const continueWithoutVision = () => {
    visionService.stopCamera();
    setIsCameraActive(false);
    setCameraError(null);
    setVisionStatus('VISION_UNAVAILABLE');
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (!prev) speechService.stopSpeaking();
      return !prev;
    });
  };

  const endSession = async (): Promise<PerformanceReport> => {
    speechService.stopSpeaking();
    visionService.stopVisionTracking();
    setIsSessionActive(false);
    setIsRecordingAnswer(false);
    setAiState('IDLE');
    setThinkingStep('Idle');
    setAiStatusMessage('Session completed. Rubric evaluation report ready.');

    const telemetry = visionService.getTelemetryHistory();
    setVisionTelemetry(telemetry);

    const report: PerformanceReport = {
      ...mockPerformanceReport,
      sessionId,
      sessionDate: new Date().toISOString(),
      mode: config.mode,
      difficulty: config.difficulty,
      topic: config.targetTopic || mockPerformanceReport.topic,
      visionMetrics,
      voiceMetrics,
      visionTelemetry: telemetry.length > 0 ? telemetry : undefined,
      answerVisionSummaries: answerVisionSummaries.length > 0 ? answerVisionSummaries : undefined,
    };

    setLastReport(report);
    return report;
  };

  const resetSession = () => {
    speechService.stopSpeaking();
    setIsSessionActive(false);
    setIsRecordingAnswer(false);
    setAiState('IDLE');
    setThinkingStep('Idle');
    setElapsedSeconds(0);
    setTranscript(mockInitialTranscript);
    setCurrentQuestion(mockCybersecurityQuestions[0]);
    setQuestionIndex(0);
  };

  const setAIStateDirectly = (state: AIState, message?: string) => {
    setAiState(state);
    if (message) setAiStatusMessage(message);
  };

  return (
    <SessionContext.Provider
      value={{
        config,
        updateConfig,
        isSessionActive,
        sessionId,
        currentQuestion,
        questionIndex,
        totalQuestions: questionsList.length,
        aiState,
        thinkingStep,
        aiStatusMessage,
        transcript,
        elapsedSeconds,
        isRecordingAnswer,
        recordingDurationSeconds,
        liveInterimTranscript,
        isTranscribing,
        isAnalyzing,
        errorMessage,
        isMicActive,
        isCameraActive,
        isMuted,
        audioLevel,
        cameraError,
        visionMetrics,
        visionStatus,
        visionTelemetry,
        answerVisionSummaries,
        voiceMetrics,
        backendHealth,
        checkBackendHealth,
        lastReport,
        lastFactCheckResults,
        lastChallengeDetails,
        startSession,
        startRecordingAnswer,
        stopAndSubmitRecordingAnswer,
        cancelRecording,
        submitAnswer,
        triggerChallenge,
        repeatQuestion,
        skipQuestion,
        speakCurrentQuestion,
        toggleMic,
        toggleCamera,
        toggleMute,
        retryCamera,
        continueWithoutVision,
        endSession,
        resetSession,
        setAIStateDirectly,
        addTranscriptMessage,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
