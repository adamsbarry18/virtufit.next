'use client';

import { useState, useEffect } from 'react';

export type AIProvider = 'openai' | 'gemini' | 'leonardo' | 'seedream' | 'replicate';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
}

// Module-level shared state so multiple hook instances stay in sync
let sharedSettings: AISettings = { provider: 'replicate', apiKey: '' };
const listeners: Array<(s: AISettings) => void> = [];

function setSharedSettings(newSettings: AISettings) {
  sharedSettings = newSettings;
  try {
    localStorage.setItem('virtufit-ai-settings', JSON.stringify(sharedSettings));
  } catch (e) {
    console.warn('Failed to write AI settings to localStorage', e);
  }
  for (const l of listeners) {
    try {
      l(sharedSettings);
    } catch (e) {
      console.warn('AI settings listener error', e);
    }
  }
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(sharedSettings);

  // Load from localStorage once on mount (and initialize sharedSettings)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('virtufit-ai-settings');
      if (saved) {
        const parsed = JSON.parse(saved) as AISettings;
        sharedSettings = { ...sharedSettings, ...parsed };
        setSettings(sharedSettings);
      } else {
        // ensure localStorage has default
        localStorage.setItem('virtufit-ai-settings', JSON.stringify(sharedSettings));
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
    // subscribe
    listeners.push(setSettings);
    return () => {
      const idx = listeners.indexOf(setSettings);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    const merged = { ...sharedSettings, ...newSettings };
    setSharedSettings(merged);
  };

  const isConfigured = (provider: AIProvider) => {
    return sharedSettings.provider === provider && sharedSettings.apiKey.trim() !== '';
  };

  return { settings, updateSettings, isConfigured };
}
