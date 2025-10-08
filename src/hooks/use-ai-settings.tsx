"use client";

import { useState, useEffect } from 'react';

export type AIProvider = 'openai' | 'gemini' | 'leonardo' | 'seedream';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>({
    provider: 'gemini',
    apiKey: '',
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('virtufit-ai-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('virtufit-ai-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings,
    isConfigured: (provider: AIProvider) => {
      return settings.provider === provider && settings.apiKey.trim() !== '';
    }
  };
}
