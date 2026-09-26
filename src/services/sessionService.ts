/**
 * MASTER AI - Session Storage & Management Service
 */

import { InterviewSession, PracticeConfig } from '../types';
import { mockSessions } from '../data/mockSessions';

export interface SessionService {
  getSessions(): Promise<InterviewSession[]>;
  getSessionById(id: string): Promise<InterviewSession | null>;
  saveSession(session: InterviewSession): Promise<void>;
  createSessionFromConfig(config: PracticeConfig): InterviewSession;
}

class MockSessionService implements SessionService {
  private sessions: InterviewSession[] = [...mockSessions];

  async getSessions(): Promise<InterviewSession[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...this.sessions];
  }

  async getSessionById(id: string): Promise<InterviewSession | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.sessions.find((s) => s.id === id) || null;
  }

  async saveSession(session: InterviewSession): Promise<void> {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      this.sessions[index] = session;
    } else {
      this.sessions.unshift(session);
    }
  }

  createSessionFromConfig(config: PracticeConfig): InterviewSession {
    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      title: `${config.targetTopic || config.mode.toUpperCase()} Session`,
      date: new Date().toISOString(),
      mode: config.mode,
      topic: config.targetTopic || 'General Practice',
      difficulty: config.difficulty,
      durationSeconds: 0,
      score: 84,
      status: 'in_progress',
    };
    return newSession;
  }
}

export const sessionService = new MockSessionService();
