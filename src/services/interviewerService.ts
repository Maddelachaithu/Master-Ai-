/**
 * MASTER AI - Interviewer Service (Mock Implementation)
 * 
 * Future Integration Architecture:
 * - Real LLM Multi-Agent Orchestration (OpenAI / Claude / Gemini / Local vLLM)
 * - Adversarial Reasoning & Dynamic Question Generator
 * - Socratic probing and contextual follow-ups
 */

import { InterviewQuestion, PracticeConfig, AIState } from '../types';
import {
  mockCybersecurityQuestions,
  mockTechnicalQuestions,
  mockDebateQuestions,
  mockBehavioralQuestions
} from '../data/mockQuestions';

export interface InterviewerService {
  startSession(config: PracticeConfig): Promise<{ sessionId: string; initialQuestion: InterviewQuestion }>;
  submitAnswer(answerText: string, currentQuestionId: string): Promise<{
    aiState: AIState;
    analysisMessage: string;
    followUpQuestion?: string;
    nextQuestion?: InterviewQuestion;
    isCompleted: boolean;
  }>;
  generateChallenge(previousAnswer: string, topic: string): Promise<string>;
  getQuestionsForMode(mode: string): InterviewQuestion[];
}

class MockInterviewerService implements InterviewerService {
  private questionsMap: Record<string, InterviewQuestion[]> = {
    cybersecurity: mockCybersecurityQuestions,
    technical: mockTechnicalQuestions,
    debate: mockDebateQuestions,
    behavioral: mockBehavioralQuestions,
    stress: mockCybersecurityQuestions,
    rapid_fire: mockTechnicalQuestions,
    custom: mockCybersecurityQuestions,
    interview: mockCybersecurityQuestions,
  };

  getQuestionsForMode(mode: string): InterviewQuestion[] {
    return this.questionsMap[mode] || mockCybersecurityQuestions;
  }

  async startSession(config: PracticeConfig): Promise<{ sessionId: string; initialQuestion: InterviewQuestion }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const questions = this.getQuestionsForMode(config.mode);
    const initialQuestion = questions[0] || mockCybersecurityQuestions[0];
    const sessionId = `session-${Date.now()}`;

    return {
      sessionId,
      initialQuestion,
    };
  }

  async submitAnswer(
    answerText: string,
    currentQuestionId: string
  ): Promise<{
    aiState: AIState;
    analysisMessage: string;
    followUpQuestion?: string;
    nextQuestion?: InterviewQuestion;
    isCompleted: boolean;
  }> {
    // Simulate LLM reasoning & analysis delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Determine mock follow-up or challenge
    const isBrief = answerText.length < 50;
    const followUp = isBrief
      ? 'Your initial premise is noted, but you omitted volatile memory triage. How would you handle LSASS process inspection under credential dumping?'
      : 'That addresses the primary telemetry layer. Now explain: if the adversary had already elevated to domain admin via Pass-the-Ticket, how would you prevent persistence across Active Directory?';

    return {
      aiState: 'CHALLENGING',
      analysisMessage: 'Verified core network logon indicators; identifying missing volatile memory artifacts.',
      followUpQuestion: followUp,
      isCompleted: false,
    };
  }

  async generateChallenge(previousAnswer: string, topic: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `Adversarial Probe: If the attacker bypasses the ${topic} controls by injecting directly into userland processes, how does your architecture prevent lateral privilege escalation?`;
  }
}

export const interviewerService = new MockInterviewerService();
