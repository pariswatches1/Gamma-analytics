'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/types';
import { getSettings, saveSettings as persistSettings } from '@/lib/storage';

interface UseSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    try {
      const loadedSettings = getSettings();
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      persistSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}
