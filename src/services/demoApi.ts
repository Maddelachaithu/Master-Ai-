import { apiClient } from './apiClient';

export interface DemoTurnData {
  turn_index: number;
  question_id: string;
  question: string;
  topic: string;
  difficulty: string;
  why_asked: string;
  candidate_answer: string;
  whisper_transcript: string;
  rag_evidence: {
    document_name: string;
    category: string;
    source: string;
    content_excerpt: string;
    confidence: number;
    grounded: boolean;
  };
  fact_check: {
    claim: string;
    status: 'VERIFIED' | 'PARTIALLY_SUPPORTED' | 'UNVERIFIED';
    confidence: number;
    source: string;
    evidence_summary: string;
  };
  challenger_probe: string;
  rubric_evaluation: {
    technical_correctness: number;
    reasoning_depth: number;
    clarity: number;
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
  };
  vision_metrics: {
    camera_engagement: number;
    posture_consistency: number;
    frame_quality: number;
    lighting_quality: number;
    dominant_posture: string;
  };
  voice_metrics: {
    speaking_rate_wpm: number;
    filler_count: number;
    pause_duration_avg: number;
    duration_seconds: number;
  };
  timeline: Array<{
    timestamp: string;
    agent: string;
    action: string;
  }>;
}

export interface DemoScenario {
  session_id: string;
  title: string;
  role: string;
  difficulty: string;
  mode: string;
  is_demo: boolean;
  total_turns: number;
  questions: string[];
  average_score: number;
  technical_score: number;
  reasoning_score: number;
  communication_score: number;
  presentation_score: number;
}

export const demoApi = {
  async getScenario(): Promise<DemoScenario> {
    return apiClient<DemoScenario>('/api/demo/scenario', { method: 'GET' });
  },

  async getTurn(turnIndex: number): Promise<DemoTurnData> {
    return apiClient<DemoTurnData>(`/api/demo/turn/${turnIndex}`, { method: 'GET' });
  },

  async resetDemo(): Promise<{ status: string; message: string }> {
    return apiClient<{ status: string; message: string }>('/api/demo/reset', { method: 'POST' });
  },
};
