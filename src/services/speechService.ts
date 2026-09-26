/**
 * MASTER AI - Real Speech & Audio Service
 * 
 * Capabilities:
 * - Real Microphone recording via MediaRecorder API with buffer flushing
 * - Simultaneous live Web Speech API recognition for instant feedback
 * - Server-side faster-whisper transcription via speechApi (FastAPI backend)
 * - Intelligent fallback pipeline ensuring spoken words are never lost
 * - Browser TTS voice synthesis with rate & pitch tuning
 * - Web Audio API AnalyserNode for live mic volume levels
 * - Structured debug logging
 */

import { speechApi, TranscriptionResponse } from './speechApi';
import { VoiceMetrics } from '../types';

export interface SpeechService {
  startRecording(onInterimTranscript?: (text: string) => void): Promise<void>;
  stopRecording(): Promise<Blob>;
  transcribeAudio(blob: Blob): Promise<TranscriptionResponse>;
  speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void>;
  stopSpeaking(): void;
  getLiveAudioLevel(): number;
  isRecording(): boolean;
  getLastRecognizedText(): string;
}

class RealSpeechService implements SpeechService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private _isRecording = false;

  // Web Speech Recognition for live feedback & fallback
  private recognition: any = null;
  private liveRecognizedText = '';
  private onInterimCallback: ((text: string) => void) | null = null;

  async startRecording(onInterimTranscript?: (text: string) => void): Promise<void> {
    if (this._isRecording) {
      console.warn('[STT DEBUG] Recording already in progress');
      return;
    }

    this.onInterimCallback = onInterimTranscript || null;
    this.liveRecognizedText = '';
    this.audioChunks = [];

    console.log('[STT DEBUG] Requesting microphone access...');

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;

      // Telemetry verification
      const tracks = stream.getAudioTracks();
      console.log('[STT DEBUG] microphone stream acquired');
      console.log(`[STT DEBUG] stream active: ${stream.active}, audio tracks: ${tracks.length}`);
      if (tracks.length > 0) {
        const tr = tracks[0];
        console.log(`[STT DEBUG] track label: ${tr.label}, readyState: ${tr.readyState}, enabled: ${tr.enabled}`);
      }

      // 2. Setup Web Audio API Analyser for real-time waveform metering
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyserNode = this.audioContext.createAnalyser();
          this.analyserNode.fftSize = 64;
          source.connect(this.analyserNode);
        }
      } catch (audioCtxErr) {
        console.warn('[STT DEBUG] Could not initialize AudioContext for metering:', audioCtxErr);
      }

      // 3. Setup MediaRecorder with best supported MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`[STT DEBUG] audio chunk received: ${event.data.size} bytes`);
          this.audioChunks.push(event.data);
        }
      };

      recorder.start(100); // Collect chunk every 100ms
      this.mediaRecorder = recorder;
      this._isRecording = true;

      console.log('[STT DEBUG] MediaRecorder started');
      console.log(`[STT DEBUG] recorder state: ${recorder.state}, mimeType: ${recorder.mimeType || mimeType}, audioBitsPerSecond: ${recorder.audioBitsPerSecond}`);

      // 4. Start simultaneous browser speech recognition if supported
      this.startBrowserSpeechRecognition();
    } catch (error: any) {
      this._isRecording = false;
      console.error('[STT DEBUG] Microphone access failed:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone access was denied. Please allow microphone permissions in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone device was detected on your system.');
      }
      throw new Error(`Microphone recording initialization failed: ${error.message}`);
    }
  }

  private startBrowserSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log('[STT DEBUG] Web SpeechRecognition API not available in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log('[STT DEBUG] Web Speech recognition onstart fired');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          this.liveRecognizedText = combined;
          console.log(`[STT DEBUG] Client recognition result: "${combined}"`);
          if (this.onInterimCallback) {
            this.onInterimCallback(combined);
          }
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('[STT DEBUG] Web Speech recognition error:', e.error);
      };

      this.recognition.onend = () => {
        console.log('[STT DEBUG] Web Speech recognition onend fired');
      };

      this.recognition.start();
      console.log('[STT DEBUG] Live browser speech recognition active');
    } catch (err) {
      console.warn('[STT DEBUG] Could not start speech recognition:', err);
    }
  }

  private stopBrowserSpeechRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this._isRecording) {
        reject(new Error('MediaRecorder is not actively recording.'));
        return;
      }

      this.stopBrowserSpeechRecognition();

      const recorder = this.mediaRecorder;
      const mimeType = recorder.mimeType || 'audio/webm';

      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log('[STT DEBUG] MediaRecorder stopped');
          console.log(`[STT DEBUG] total chunks: ${this.audioChunks.length}`);
          console.log(`[STT DEBUG] total audio bytes: ${audioBlob.size}`);
          console.log(`[STT DEBUG] audioBlob.type: ${audioBlob.type}`);

          // Cleanup stream tracks
          if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => {
              track.stop();
              console.log(`[STT DEBUG] Stopped audio track: ${track.kind}`);
            });
            this.audioStream = null;
          }

          if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
          }

          this.mediaRecorder = null;
          this._isRecording = false;
          resolve(audioBlob);
        } catch (err) {
          this._isRecording = false;
          reject(err);
        }
      };

      try {
        // Request any pending data chunk before stopping
        if (recorder.state === 'recording') {
          recorder.requestData();
        }
      } catch (e) {
        console.warn('[STT DEBUG] recorder.requestData() note:', e);
      }

      recorder.stop();
    });
  }

  async transcribeAudio(blob: Blob): Promise<TranscriptionResponse> {
    console.log(`[STT DEBUG] Sending audio to Whisper (Blob size: ${blob.size} bytes, type: ${blob.type})...`);

    if (blob.size === 0) {
      console.warn('[STT DEBUG] Audio blob size is 0 bytes! Cannot transcribe empty audio.');
      if (this.liveRecognizedText && this.liveRecognizedText.trim()) {
        console.log(`[STT DEBUG] Utilizing Web Speech API fallback text: "${this.liveRecognizedText}"`);
        return {
          text: this.liveRecognizedText.trim(),
          language: 'en',
          duration: 2,
          segments: [{ start: 0, end: 2, text: this.liveRecognizedText.trim() }],
        };
      }
      return { text: '', language: 'en', duration: 0, segments: [] };
    }

    // 1. Attempt Whisper transcription via backend API
    try {
      const response = await speechApi.transcribeAudio(blob);
      console.log('[STT DEBUG] Whisper API response received:', response);
      if (response && response.text && response.text.trim()) {
        console.log(`[STT DEBUG] Whisper authoritative transcript: "${response.text.trim()}"`);
        return response;
      } else {
        console.warn('[STT DEBUG] Whisper API returned empty text segment.');
      }
    } catch (backendErr: any) {
      console.warn('[STT DEBUG] Backend transcription endpoint returned error:', backendErr.message);
    }

    // 2. Fallback: If backend Whisper returned empty or was unreachable, use live speech recognized text
    if (this.liveRecognizedText && this.liveRecognizedText.trim()) {
      console.log(`[STT DEBUG] Falling back to Web Speech recognized text: "${this.liveRecognizedText}"`);
      return {
        text: this.liveRecognizedText.trim(),
        language: 'en',
        duration: Math.max(1, Math.round(blob.size / 16000)),
        segments: [
          {
            start: 0,
            end: Math.max(1, Math.round(blob.size / 16000)),
            text: this.liveRecognizedText.trim(),
          },
        ],
      };
    }

    // 3. Return empty response if no speech captured
    console.warn('[STT DEBUG] No speech recognized by Whisper or client STT fallback.');
    return {
      text: '',
      language: 'en',
      duration: 0,
      segments: [],
    };
  }

  getLastRecognizedText(): string {
    return this.liveRecognizedText;
  }

  async speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    if (!('speechSynthesis' in window) || !window.speechSynthesis) {
      console.warn('[TTS] Browser speechSynthesis not supported');
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 2000);
      return;
    }

    // Cancel any current utterance to prevent overlapping speech
    window.speechSynthesis.cancel();

    // Small delay to ensure clean utterance trigger in Chrome
    await new Promise((resolve) => setTimeout(resolve, 60));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    // Pick an English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('David') ||
            v.name.includes('Daniel') ||
            v.name.includes('Samantha') ||
            v.name.includes('English'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    let hasEnded = false;
    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      console.log('[TTS] Speaking question...');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      console.log('[TTS] Question speech completed');
      safeEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[TTS] Speech synthesis utterance error:', e);
      safeEnd();
    };

    // Safety timeout in case utterance onend does not fire in backgrounded tabs
    const estimatedMs = Math.max(3000, (text.split(' ').length / 2.5) * 1000 + 2000);
    setTimeout(() => {
      if (!hasEnded) {
        console.log('[TTS] Safety timeout completed speech');
        safeEnd();
      }
    }, estimatedMs);

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getLiveAudioLevel(): number {
    if (!this._isRecording || !this.analyserNode) {
      return 0;
    }

    try {
      const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      return Math.min(100, Math.max(0, Math.round((avg / 128) * 100)));
    } catch {
      return 0;
    }
  }

  isRecording(): boolean {
    return this._isRecording;
  }
}

export const speechService = new RealSpeechService();
