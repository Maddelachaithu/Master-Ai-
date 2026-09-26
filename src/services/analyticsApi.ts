import { apiClient } from './apiClient';
import { AnalyticsSummary, InterviewHistoryRecord, SkillTrendItem } from '../types';

export const analyticsApi = {
  async getSummary(timeframe: string = 'all_time'): Promise<AnalyticsSummary> {
    return apiClient<AnalyticsSummary>(`/api/analytics/summary?timeframe=${timeframe}`, {
      method: 'GET',
    });
  },

  async getAnalyticsSummary(timeframe: string = 'all_time'): Promise<AnalyticsSummary> {
    return apiClient<AnalyticsSummary>(`/api/analytics/summary?timeframe=${timeframe}`, {
      method: 'GET',
    });
  },

  async getHistory(limit: number = 20): Promise<{ sessions: InterviewHistoryRecord[]; total: number }> {
    return apiClient<{ sessions: InterviewHistoryRecord[]; total: number }>(
      `/api/analytics/history?limit=${limit}`,
      { method: 'GET' }
    );
  },

  async getInterviewHistory(limit: number = 20): Promise<InterviewHistoryRecord[]> {
    const res = await apiClient<{ sessions: InterviewHistoryRecord[]; total: number }>(
      `/api/analytics/history?limit=${limit}`,
      { method: 'GET' }
    );
    return res.sessions || [];
  },

  async getSkillTrends(profileId?: string, timeframe?: string): Promise<SkillTrendItem[]> {
    const res = await apiClient<{ skill_trends: SkillTrendItem[] }>('/api/analytics/skill-trends', {
      method: 'GET',
    });
    return res.skill_trends || [];
  },

  async compareSessions(sessionIdA: string, sessionIdB: string): Promise<any> {
    return apiClient<any>('/api/analytics/compare', {
      method: 'POST',
      body: JSON.stringify({
        session_id_a: sessionIdA,
        session_id_b: sessionIdB,
      }),
    });
  },

  async clearHistory(): Promise<{ status: string; message: string }> {
    return apiClient<{ status: string; message: string }>('/api/analytics/history', {
      method: 'DELETE',
    });
  },
};
