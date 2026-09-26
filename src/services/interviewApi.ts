import { apiClient } from './apiClient';
import { PracticeConfig, DifficultyLevel, InterviewMode, AIPersonality } from '../types';

export interface AnswerEvaluation {
  correctness: number;
  completeness: number;
  reasoning: number;
  relevance: number;
  clarity: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  detected_concepts: string[];
  missed_concepts: string[];
  detected_filler_words: string[];
}

export interface SessionStartResponse {
  session_id: string;
  mode: string;
  difficulty: string;
  ai_personality: string;
  topic: string;
  question_id: string;
  question_number: number;
  question_text: string;
  expected_concepts: string[];
  hints: string[];
}

export interface AnswerSubmissionResponse {
  session_id: string;
  question_id: string;
  evaluation: AnswerEvaluation;
  next_action: string;
  reason_summary: string;
  next_question_id: string;
  next_question_number: number;
  next_question: string;
  difficulty: string;
  topic: string;
  is_completed: boolean;
  ai_status_message?: string;
  fact_check_results?: Array<{
    claim: string;
    verdict: string;
    confidence: number;
    sources: Array<{ title: string; url: string; snippet?: string; publisher?: string }>;
    explanation: string;
    cached?: boolean;
  }>;
  challenge_details?: {
    is_challenge_needed: boolean;
    challenge_mode: string;
    challenge_question: string;
    challenge_reason: string;
    contradiction?: {
      contradiction_detected: boolean;
      severity?: string;
      description?: string;
      earlier_statement?: string;
      current_statement?: string;
    };
  };
  events_log?: Array<{
    timestamp: string;
    agent: string;
    event: string;
    severity: string;
    details?: any;
  }>;
  safe_ui_status?: string;
}

export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  whisper_ready: boolean;
  llm_provider: string;
  llm_ready: boolean;
}

export const interviewApi = {
  async getHealth(): Promise<HealthResponse> {
    return apiClient<HealthResponse>('/api/health', {
      method: 'GET',
    });
  },

  async startSession(config: PracticeConfig): Promise<SessionStartResponse> {
    return apiClient<SessionStartResponse>('/api/interview/session', {
      method: 'POST',
      body: JSON.stringify({
        mode: config.mode,
        difficulty: config.difficulty,
        duration_minutes: config.durationMinutes,
        ai_personality: config.aiPersonality,
        target_topic: config.targetTopic,
        pressure_level: 3,
        enable_fact_checking: config.enableFactChecking,
        enable_visual_analysis: config.enableVisualAnalysis,
        enable_adaptive_difficulty: config.enableAdaptiveDifficulty,
        enable_follow_ups: config.enableFollowUps,
      }),
    });
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    durationSeconds = 0,
    pressureLevel = 3
  ): Promise<AnswerSubmissionResponse> {
    return apiClient<AnswerSubmissionResponse>(`/api/interview/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        answer,
        duration_seconds: durationSeconds,
        pressure_level: pressureLevel,
      }),
    });
  },

  async skipQuestion(sessionId: string): Promise<any> {
    return apiClient<any>(`/api/interview/${sessionId}/next-question`, {
      method: 'POST',
      body: JSON.stringify({ action: 'skip' }),
    });
  },

  async submitVisionSummary(
    sessionId: string,
    visionSummary: {
      question_id: string;
      camera_engagement: number;
      posture_consistency: number;
      face_presence_rate: number;
      frame_quality: number;
      lighting_quality?: number;
      dominant_posture_state?: string;
      observations?: string[];
    }
  ): Promise<{ status: string; session_id: string; question_id: string; summary_recorded: boolean }> {
    return apiClient<{ status: string; session_id: string; question_id: string; summary_recorded: boolean }>(
      `/api/interview/${sessionId}/vision-summary`,
      {
        method: 'POST',
        body: JSON.stringify(visionSummary),
      }
    );
  },

  async getSessionState(sessionId: string): Promise<any> {
    return apiClient<any>(`/api/interview/${sessionId}`, {
      method: 'GET',
    });
  },

  // Debate Endpoints
  async startDebate(topic: string, candidateStance: 'FOR' | 'AGAINST', maxRounds = 4): Promise<any> {
    return apiClient<any>('/api/debate/start', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        candidate_stance: candidateStance,
        max_rounds: maxRounds,
      }),
    });
  },

  async submitDebateTurn(sessionId: string, candidateSpeech: string): Promise<any> {
    return apiClient<any>(`/api/debate/${sessionId}/turn`, {
      method: 'POST',
      body: JSON.stringify({
        candidate_speech: candidateSpeech,
      }),
    });
  },

  async getDebateState(sessionId: string): Promise<any> {
    return apiClient<any>(`/api/debate/${sessionId}`, {
      method: 'GET',
    });
  },
};

