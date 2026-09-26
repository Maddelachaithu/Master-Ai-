import { apiClient } from './apiClient';
import { RagContextResponse, KnowledgeStatus, RagRetrievalResult } from '../types';

export const ragApi = {
  async searchKnowledge(
    query: string,
    category?: string,
    topic?: string,
    role?: string,
    top_k: number = 4
  ): Promise<RagContextResponse> {
    return apiClient<RagContextResponse>('/api/rag/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        category,
        topic,
        role,
        top_k,
      }),
    });
  },

  async triggerIngest(forceReindex: boolean = false): Promise<any> {
    return apiClient<any>('/api/rag/ingest', {
      method: 'POST',
      body: JSON.stringify({ force_reindex: forceReindex }),
    });
  },

  async triggerIngestion(forceReindex: boolean = false): Promise<any> {
    return this.triggerIngest(forceReindex);
  },

  async getRagStatus(): Promise<KnowledgeStatus> {
    return apiClient<KnowledgeStatus>('/api/rag/status', { method: 'GET' });
  },

  async getStatus(): Promise<KnowledgeStatus> {
    return this.getRagStatus();
  },

  async listDocuments(): Promise<{ total_documents: number; documents: Array<any> }> {
    return apiClient<{ total_documents: number; documents: Array<any> }>('/api/rag/documents', {
      method: 'GET',
    });
  },
};
