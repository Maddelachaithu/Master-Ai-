import { apiClient, getApiBaseUrl } from './apiClient';
import { CandidateProfile, SkillGapAnalysis, JobMatchAnalysis, ParsedResumeData } from '../types';

export const profileApi = {
  async getProfile(): Promise<CandidateProfile> {
    return apiClient<CandidateProfile>('/api/profile', { method: 'GET' });
  },

  async updateProfile(updates: Partial<CandidateProfile>): Promise<{ status: string; profile: string }> {
    return apiClient<{ status: string; profile: string }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  async saveProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    await apiClient<{ status: string; profile: string }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    return apiClient<CandidateProfile>('/api/profile', { method: 'GET' });
  },

  async uploadResume(file: File): Promise<{ status: string; parsed_resume: ParsedResumeData; updated_profile_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${getApiBaseUrl()}/api/profile/resume`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload resume' }));
      throw new Error(err.detail || 'Resume upload failed');
    }

    return res.json();
  },

  async analyzeJobDescription(
    jobDescription: string,
    targetCompany?: string,
    targetRole?: string
  ): Promise<JobMatchAnalysis> {
    return apiClient<JobMatchAnalysis>('/api/profile/job-description', {
      method: 'POST',
      body: JSON.stringify({
        job_description: jobDescription,
        target_company: targetCompany,
        target_role: targetRole,
      }),
    });
  },

  async getSkillsBreakdown(): Promise<SkillGapAnalysis> {
    return apiClient<SkillGapAnalysis>('/api/profile/skills', { method: 'GET' });
  },

  async getSkillGaps(profileId?: string, targetRole?: string): Promise<SkillGapAnalysis> {
    return apiClient<SkillGapAnalysis>('/api/profile/skills', { method: 'GET' });
  },

  async deleteResume(): Promise<{ status: string; message: string }> {
    return apiClient<{ status: string; message: string }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ has_resume: false, skills: [] }),
    });
  },

  async deleteProfile(): Promise<{ status: string; message: string }> {
    return apiClient<{ status: string; message: string }>('/api/profile', { method: 'DELETE' });
  },
};
