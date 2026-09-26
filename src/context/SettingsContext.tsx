import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIPersonality, DifficultyLevel, InterviewMode } from '../types';

export interface AppSettings {
  // General & Interview Preferences
  defaultMode: InterviewMode;
  defaultDifficulty: DifficultyLevel;
  defaultDurationMinutes: number;
  
  // AI Adversary Preferences
  aiPersonality: AIPersonality;
  followUpIntensity: 'moderate' | 'high' | 'adversarial';
  adaptiveDifficulty: boolean;
  enableFactChecking: boolean;
  
  // Audio & Vision Settings
  selectedCameraId: string;
  selectedMicrophoneId: string;
  enableVisualTracking: boolean;
  enableSpeechDetection: boolean;
  
  // Responsible AI & Privacy
  privacyLocalProcessingOnly: boolean;
  zeroRawVideoStorage: boolean;
  retentionDays: number;
  shareAnonymousMetrics: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  defaultMode: 'cybersecurity',
  defaultDifficulty: 'advanced',
  defaultDurationMinutes: 15,
  aiPersonality: 'socratic',
  followUpIntensity: 'adversarial',
  adaptiveDifficulty: true,
  enableFactChecking: true,
  selectedCameraId: 'default',
  selectedMicrophoneId: 'default',
  enableVisualTracking: true,
  enableSpeechDetection: true,
  privacyLocalProcessingOnly: true,
  zeroRawVideoStorage: true,
  retentionDays: 30,
  shareAnonymousMetrics: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('master_ai_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('master_ai_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
