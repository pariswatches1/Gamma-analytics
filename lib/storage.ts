import {
  UploadSession,
  UserSettings,
  WatchlistItem,
  DEFAULT_SETTINGS,
  DEFAULT_WATCHLIST,
} from './types';

const STORAGE_KEYS = {
  SESSIONS: 'gamma_analytics_sessions',
  ACTIVE_SESSION: 'gamma_analytics_active_session',
  SETTINGS: 'gamma_analytics_settings',
  WATCHLIST: 'gamma_analytics_watchlist',
};

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get item from localStorage
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
function setStorageItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// ============ Sessions ============

/**
 * Get all saved upload sessions
 */
export function getSessions(): UploadSession[] {
  return getStorageItem<UploadSession[]>(STORAGE_KEYS.SESSIONS, []);
}

/**
 * Get a specific session by ID
 */
export function getSession(id: string): UploadSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
}

/**
 * Save a new session
 */
export function saveSession(session: UploadSession): boolean {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  // Keep only the last 10 sessions to avoid storage limits
  const trimmedSessions = sessions.slice(-10);
  
  return setStorageItem(STORAGE_KEYS.SESSIONS, trimmedSessions);
}

/**
 * Delete a session by ID
 */
export function deleteSession(id: string): boolean {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  
  // If active session was deleted, clear it
  const activeId = getActiveSessionId();
  if (activeId === id) {
    clearActiveSession();
  }
  
  return setStorageItem(STORAGE_KEYS.SESSIONS, filtered);
}

/**
 * Get active session ID
 */
export function getActiveSessionId(): string | null {
  return getStorageItem<string | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
}

/**
 * Set active session ID
 */
export function setActiveSessionId(id: string): boolean {
  return setStorageItem(STORAGE_KEYS.ACTIVE_SESSION, id);
}

/**
 * Clear active session
 */
export function clearActiveSession(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get active session data
 */
export function getActiveSession(): UploadSession | null {
  const activeId = getActiveSessionId();
  if (!activeId) return null;
  return getSession(activeId);
}

// ============ Settings ============

/**
 * Get user settings
 */
export function getSettings(): UserSettings {
  return getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

/**
 * Save user settings
 */
export function saveSettings(settings: UserSettings): boolean {
  return setStorageItem(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Update partial settings
 */
export function updateSettings(updates: Partial<UserSettings>): boolean {
  const currentSettings = getSettings();
  return saveSettings({ ...currentSettings, ...updates });
}

// ============ Watchlist ============

/**
 * Get watchlist
 */
export function getWatchlist(): WatchlistItem[] {
  return getStorageItem<WatchlistItem[]>(STORAGE_KEYS.WATCHLIST, DEFAULT_WATCHLIST);
}

/**
 * Save watchlist
 */
export function saveWatchlist(watchlist: WatchlistItem[]): boolean {
  return setStorageItem(STORAGE_KEYS.WATCHLIST, watchlist);
}

/**
 * Add item to watchlist
 */
export function addToWatchlist(item: WatchlistItem): boolean {
  const watchlist = getWatchlist();
  
  // Check if already exists
  if (watchlist.some((w) => w.symbol === item.symbol)) {
    return false;
  }
  
  watchlist.push(item);
  return saveWatchlist(watchlist);
}

/**
 * Remove item from watchlist
 */
export function removeFromWatchlist(symbol: string): boolean {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter((w) => w.symbol !== symbol);
  return saveWatchlist(filtered);
}

// ============ Utility ============

/**
 * Clear all stored data
 */
export function clearAllData(): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Export all data as JSON
 */
export function exportData(): string {
  return JSON.stringify({
    sessions: getSessions(),
    activeSession: getActiveSessionId(),
    settings: getSettings(),
    watchlist: getWatchlist(),
  });
}

/**
 * Import data from JSON
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.sessions) setStorageItem(STORAGE_KEYS.SESSIONS, data.sessions);
    if (data.activeSession) setStorageItem(STORAGE_KEYS.ACTIVE_SESSION, data.activeSession);
    if (data.settings) setStorageItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.watchlist) setStorageItem(STORAGE_KEYS.WATCHLIST, data.watchlist);
    
    return true;
  } catch {
    return false;
  }
}

// Aliases for backwards compatibility
export const exportAllData = exportData;
export const importAllData = importData;
