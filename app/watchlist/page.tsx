'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Input, Alert, Badge } from '@/components/ui';
import { useWatchlist } from '@/hooks/useWatchlist';
import { 
  Plus, 
  Trash2, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  Eye
} from 'lucide-react';

// Default symbols for quick add
const POPULAR_SYMBOLS = ['SPX', 'SPY', 'QQQ', 'IWM', 'DIA', 'VIX', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];

export default function WatchlistPage() {
  const { watchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle adding new symbol
  const handleAddSymbol = (symbol?: string) => {
    const symbolToAdd = (symbol || newSymbol).toUpperCase().trim();
    
    if (!symbolToAdd) {
      setError('Please enter a symbol');
      return;
    }

    if (watchlist.some(item => item.symbol === symbolToAdd)) {
      setError(`${symbolToAdd} is already in your watchlist`);
      return;
    }

    addToWatchlist({
      symbol: symbolToAdd,
      notes: '',
      alertPrice: undefined,
    });

    setNewSymbol('');
    setError(null);
    setSuccess(`${symbolToAdd} added to watchlist`);
    setTimeout(() => setSuccess(null), 2000);
  };

  // Handle removing symbol
  const handleRemoveSymbol = (symbol: string) => {
    removeFromWatchlist(symbol);
    setSuccess(`${symbol} removed from watchlist`);
    setTimeout(() => setSuccess(null), 2000);
  };

  // Handle notes update
  const handleNotesUpdate = (symbol: string, notes: string) => {
    updateWatchlistItem(symbol, { notes });
  };

  // Get trend icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-gamma-positive" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-gamma-negative" />;
      default:
        return <Minus className="w-4 h-4 text-text-muted" />;
    }
  };

  // Get symbols not in watchlist for quick add
  const availableSymbols = POPULAR_SYMBOLS.filter(
    symbol => !watchlist.some(item => item.symbol === symbol)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Watchlist" 
        subtitle="Track your favorite symbols"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="error" className="fade-in" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="fade-in">
            {success}
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Watchlist */}
          <div className="xl:col-span-2 space-y-6">
            {/* Add Symbol */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Add Symbol
              </h3>
              <div className="flex gap-3">
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol (e.g., AAPL)"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                />
                <Button onClick={() => handleAddSymbol()}>
                  Add
                </Button>
              </div>
            </Card>

            {/* Watchlist Items */}
            <Card>
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  My Watchlist
                  <Badge variant="default" className="ml-2">
                    {watchlist.length}
                  </Badge>
                </h3>
              </div>

              {watchlist.length === 0 ? (
                <div className="p-8 text-center">
                  <Eye className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary mb-2">Your watchlist is empty</p>
                  <p className="text-text-muted text-sm">
                    Add symbols above or use quick add below
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {watchlist.map((item) => (
                    <div 
                      key={item.symbol}
                      className="p-4 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg text-text-primary">
                              {item.symbol}
                            </span>
                            {getTrendIcon(item.trend)}
                            {item.lastPrice && (
                              <span className="text-text-secondary">
                                ${item.lastPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) => handleNotesUpdate(item.symbol, e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-transparent text-sm text-text-secondary placeholder-text-muted resize-none focus:outline-none"
                            rows={2}
                          />

                          <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                            <span>
                              Added {new Date(item.addedAt).toLocaleDateString()}
                            </span>
                            {item.alertPrice && (
                              <span className="flex items-center gap-1 text-warning">
                                <AlertCircle className="w-3 h-3" />
                                Alert at ${item.alertPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSymbol(item.symbol)}
                          className="text-gamma-negative hover:text-gamma-negative hover:bg-gamma-negative/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Add */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Quick Add</h3>
              {availableSymbols.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => handleAddSymbol(symbol)}
                      className="px-3 py-1.5 text-sm bg-surface-elevated hover:bg-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                    >
                      + {symbol}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">
                  All popular symbols are in your watchlist!
                </p>
              )}
            </Card>

            {/* Index Symbols */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Index Symbols</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>SPX</span>
                  <span>S&P 500 Index</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>SPY</span>
                  <span>S&P 500 ETF</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>QQQ</span>
                  <span>Nasdaq 100 ETF</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>IWM</span>
                  <span>Russell 2000 ETF</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>VIX</span>
                  <span>Volatility Index</span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Tips</h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Add notes to track your thesis for each symbol</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Focus on high-volume index options for best gamma analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Watchlist is saved locally in your browser</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
