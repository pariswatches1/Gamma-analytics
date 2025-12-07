'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  OptionData,
  UploadSession,
  GammaByStrike,
  GammaByExpiry,
  KeyGammaLevel,
  DashboardSummary,
  DEFAULT_SETTINGS,
} from '@/lib/types';
import {
  aggregateGammaByStrike,
  aggregateGammaByExpiry,
  identifyKeyGammaLevels,
  calculateDashboardSummary,
  getTopGammaStrikes,
  getTopGammaExpiries,
} from '@/lib/calculations';
import {
  getSessions,
  getActiveSession,
  saveSession,
  setActiveSessionId,
  deleteSession,
  generateSessionId,
  getSettings,
} from '@/lib/storage';

interface UseOptionsDataReturn {
  // Data
  data: OptionData[];
  options: OptionData[];
  activeSession: UploadSession | null;
  currentSessionId: string | null;
  sessions: UploadSession[];
  
  // Aggregated data
  gammaByStrike: GammaByStrike[];
  gammaByExpiry: GammaByExpiry[];
  topGammaStrikes: GammaByStrike[];
  topGammaExpiries: GammaByExpiry[];
  keyLevels: KeyGammaLevel[];
  summary: DashboardSummary | null;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSession: (sessionId: string) => void;
  createSession: (data: OptionData[], symbol: string, spotPrice: number) => UploadSession;
  deleteSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  refreshSessions: () => void;
  setError: (error: string | null) => void;
}

export function useOptionsData(): UseOptionsDataReturn {
  const [options, setOptions] = useState<OptionData[]>([]);
  const [activeSession, setActiveSession] = useState<UploadSession | null>(null);
  const [sessions, setSessions] = useState<UploadSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    try {
      const loadedSessions = getSessions();
      setSessions(loadedSessions);

      const active = getActiveSession();
      if (active) {
        setActiveSession(active);
        setOptions(active.data);
      }
    } catch (err) {
      setError('Failed to load saved data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate derived data
  const gammaByStrike = aggregateGammaByStrike(options);
  const gammaByExpiry = aggregateGammaByExpiry(options);
  
  const settings = typeof window !== 'undefined' ? getSettings() : DEFAULT_SETTINGS;
  const topGammaStrikes = getTopGammaStrikes(gammaByStrike, settings.topLevelsCount);
  const topGammaExpiries = getTopGammaExpiries(gammaByExpiry, 5);
  const keyLevels = identifyKeyGammaLevels(gammaByStrike, settings.topLevelsCount);
  const summary = calculateDashboardSummary(options);

  // Load a specific session
  const loadSession = useCallback((sessionId: string) => {
    setIsLoading(true);
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setActiveSession(session);
        setOptions(session.data);
        setActiveSessionId(sessionId);
        setError(null);
      } else {
        setError('Session not found');
      }
    } catch (err) {
      setError('Failed to load session');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sessions]);

  // Create a new session from uploaded data
  const createSession = useCallback((data: OptionData[], symbol: string, spotPrice: number): UploadSession => {
    const session: UploadSession = {
      id: generateSessionId(),
      name: `${symbol} - ${new Date().toLocaleDateString()}`,
      symbol,
      uploadedAt: new Date().toISOString(),
      optionCount: data.length,
      underlyingPrice: spotPrice || data[0]?.underlyingPrice || 0,
      data,
    };

    saveSession(session);
    setActiveSessionId(session.id);
    setSessions((prev) => [...prev, session]);
    setActiveSession(session);
    setOptions(data);
    setError(null);

    return session;
  }, []);

  // Remove a session
  const removeSession = useCallback((sessionId: string) => {
    deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
      setOptions([]);
    }
  }, [activeSession]);

  // Alias for removeSession
  const deleteSessionAction = removeSession;

  // Refresh sessions list
  const refreshSessions = useCallback(() => {
    try {
      const loadedSessions = getSessions();
      setSessions(loadedSessions);
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
    }
  }, []);

  return {
    data: options,
    options,
    activeSession,
    currentSessionId: activeSession?.id || null,
    sessions,
    gammaByStrike,
    gammaByExpiry,
    topGammaStrikes,
    topGammaExpiries,
    keyLevels,
    summary: options.length > 0 ? summary : null,
    isLoading,
    error,
    loadSession,
    createSession,
    deleteSession: deleteSessionAction,
    removeSession,
    refreshSessions,
    setError,
  };
}
