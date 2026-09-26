import { apiClient } from './apiClient';

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  duration: number;
  segments: TranscriptionSegment[];
}

export interface SpeechHealthResponse {
  status: string;
  whisper_available: boolean;
  whisper_model: string;
  device: string;
}

export const speechApi = {
  async transcribeAudio(audioBlob: Blob, filename = 'recording.webm'): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);

    return apiClient<TranscriptionResponse>('/api/speech/transcribe', {
      method: 'POST',
      body: formData,
    });
  },

  async getHealth(): Promise<SpeechHealthResponse> {
    return apiClient<SpeechHealthResponse>('/api/speech/health', {
      method: 'GET',
    });
  },
};
