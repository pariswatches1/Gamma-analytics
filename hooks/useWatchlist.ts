'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem, DEFAULT_WATCHLIST } from '@/lib/types';
import {
  getWatchlist,
  saveWatchlist,
} from '@/lib/storage';

interface UseWatchlistReturn {
  watchlist: WatchlistItem[];
  isLoading: boolean;
  addSymbol: (symbol: string, name: string) => boolean;
  removeSymbol: (symbol: string) => void;
  addToWatchlist: (item: Partial<WatchlistItem> & { symbol: string }) => boolean;
  removeFromWatchlist: (symbol: string) => void;
  updateWatchlistItem: (symbol: string, updates: Partial<WatchlistItem>) => void;
  resetWatchlist: () => void;
}

export function useWatchlist(): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist on mount
  useEffect(() => {
    try {
      const loadedWatchlist = getWatchlist();
      setWatchlist(loadedWatchlist);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add symbol to watchlist
  const addSymbol = useCallback((symbol: string, name: string): boolean => {
    const normalizedSymbol = symbol.toUpperCase().trim();
    
    // Check if already exists
    if (watchlist.some((w) => w.symbol === normalizedSymbol)) {
      return false;
    }

    const newItem: WatchlistItem = {
      symbol: normalizedSymbol,
      name,
      addedAt: new Date().toISOString(),
    };

    setWatchlist((prev) => {
      const updated = [...prev, newItem];
      saveWatchlist(updated);
      return updated;
    });

    return true;
  }, [watchlist]);

  // Add to watchlist (alternative API)
  const addToWatchlist = useCallback((item: Partial<WatchlistItem> & { symbol: string }): boolean => {
    const normalizedSymbol = item.symbol.toUpperCase().trim();
    
    // Check if already exists
    if (watchlist.some((w) => w.symbol === normalizedSymbol)) {
      return false;
    }

    const newItem: WatchlistItem = {
      symbol: normalizedSymbol,
      name: item.name,
      notes: item.notes,
      alertPrice: item.alertPrice,
      lastPrice: item.lastPrice,
      trend: item.trend,
      addedAt: new Date().toISOString(),
    };

    setWatchlist((prev) => {
      const updated = [...prev, newItem];
      saveWatchlist(updated);
      return updated;
    });

    return true;
  }, [watchlist]);

  // Remove symbol from watchlist
  const removeSymbol = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((w) => w.symbol !== symbol);
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  // Alias for removeSymbol
  const removeFromWatchlist = removeSymbol;

  // Update watchlist item
  const updateWatchlistItem = useCallback((symbol: string, updates: Partial<WatchlistItem>) => {
    setWatchlist((prev) => {
      const updated = prev.map((item) => 
        item.symbol === symbol ? { ...item, ...updates } : item
      );
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  // Reset to default watchlist
  const resetWatchlist = useCallback(() => {
    setWatchlist(DEFAULT_WATCHLIST);
    saveWatchlist(DEFAULT_WATCHLIST);
  }, []);

  return {
    watchlist,
    isLoading,
    addSymbol,
    removeSymbol,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    resetWatchlist,
  };
}
