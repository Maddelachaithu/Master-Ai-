/**
 * MASTER AI - Evaluation & Rubric Service (Mock Implementation)
 * 
 * Future Integration Architecture:
 * - Multi-criteria Rubric Engine (Knowledge, Reasoning, Communication, Adaptability, Delivery)
 * - LLM Evaluator Agent generating tailored strength/improvement insights
 * - Question-by-question scoring and timeline generation
 */

import { PerformanceReport, PracticeConfig, VisionMetrics, VoiceMetrics } from '../types';
import { mockPerformanceReport } from '../data/mockPerformance';

export interface EvaluationService {
  generateReport(
    sessionId: string,
    config: PracticeConfig,
    visionMetrics: VisionMetrics,
    voiceMetrics: VoiceMetrics,
    transcript: any[]
  ): Promise<PerformanceReport>;
  getReportById(reportId: string): Promise<PerformanceReport | null>;
}

class MockEvaluationService implements EvaluationService {
  async generateReport(
    sessionId: string,
    config: PracticeConfig,
    visionMetrics: VisionMetrics,
    voiceMetrics: VoiceMetrics,
    transcript: any[]
  ): Promise<PerformanceReport> {
    // Simulate rubric computation
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      ...mockPerformanceReport,
      sessionId,
      sessionDate: new Date().toISOString(),
      mode: config.mode,
      difficulty: config.difficulty,
      topic: config.targetTopic || mockPerformanceReport.topic,
      visionMetrics,
      voiceMetrics,
    };
  }

  async getReportById(reportId: string): Promise<PerformanceReport | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPerformanceReport;
  }
}

export const evaluationService = new MockEvaluationService();
