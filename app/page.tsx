'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { GammaByStrikeChart } from '@/components/dashboard/GammaByStrikeChart';
import { GammaByExpiryChart } from '@/components/dashboard/GammaByExpiryChart';
import { KeyLevelsTable } from '@/components/dashboard/KeyLevelsTable';
import { TopExpiriesTable } from '@/components/dashboard/TopExpiriesTable';
import { Alert } from '@/components/ui';
import { useOptionsData } from '@/hooks/useOptionsData';
import { useSettings } from '@/hooks/useSettings';
import { Upload, TrendingUp, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { 
    data, 
    sessions, 
    currentSessionId,
    isLoading, 
    error, 
    loadSession,
    gammaByStrike,
    gammaByExpiry,
    keyLevels,
    summary
  } = useOptionsData();
  
  const { settings } = useSettings();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set last update time when data changes
  useEffect(() => {
    if (data.length > 0) {
      setLastUpdate(new Date());
    }
  }, [data]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    if (currentSessionId) {
      loadSession(currentSessionId);
    }
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // Show empty state if no data
  const hasData = data.length > 0;
  const hasSession = sessions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Dashboard" 
        subtitle={summary ? `${summary.symbol} Analysis` : 'Options Gamma Analytics'}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="fade-in">
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!hasData && !isLoading && (
          <div className="fade-in">
            <div className="bg-surface rounded-xl border border-border p-8 lg:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">
                  Welcome to GammaScope
                </h2>
                <p className="text-text-secondary mb-6">
                  Upload your options data to start analyzing gamma exposure, key levels, and positioning.
                </p>
                
                {hasSession ? (
                  <div className="space-y-4">
                    <p className="text-text-muted text-sm">
                      You have {sessions.length} saved session{sessions.length !== 1 ? 's' : ''}. 
                      Load one to continue or upload new data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/upload"
                        className="btn-primary inline-flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Data
                      </Link>
                      <button
                        onClick={() => sessions[0] && loadSession(sessions[0].id)}
                        className="btn-secondary inline-flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Load Latest Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/upload"
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload CSV Data
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-lg border border-border p-5">
                <div className="text-2xl font-bold text-accent mb-2">1</div>
                <h3 className="font-semibold text-text-primary mb-1">Export Data</h3>
                <p className="text-text-secondary text-sm">
                  Export your options chain data from Thinkorswim, IBKR, or other broker as CSV.
                </p>
              </div>
              <div className="bg-surface rounded-lg border border-border p-5">
                <div className="text-2xl font-bold text-accent mb-2">2</div>
                <h3 className="font-semibold text-text-primary mb-1">Upload & Parse</h3>
                <p className="text-text-secondary text-sm">
                  Upload your CSV file. We'll automatically detect columns and parse the data.
                </p>
              </div>
              <div className="bg-surface rounded-lg border border-border p-5">
                <div className="text-2xl font-bold text-accent mb-2">3</div>
                <h3 className="font-semibold text-text-primary mb-1">Analyze</h3>
                <p className="text-text-secondary text-sm">
                  View gamma by strike, key levels, and insights to inform your trading decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border p-4 h-24 loading-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-lg border border-border h-80 loading-pulse" />
              <div className="bg-surface rounded-lg border border-border h-80 loading-pulse" />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {hasData && !isLoading && summary && (
          <div className="space-y-6 stagger-children">
            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <GammaByStrikeChart 
                data={gammaByStrike} 
                spotPrice={summary.spotPrice}
              />
              <GammaByExpiryChart 
                data={gammaByExpiry}
              />
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <KeyLevelsTable 
                levels={keyLevels}
                spotPrice={summary.spotPrice}
                maxLevels={settings.maxLevelsToDisplay}
              />
              <TopExpiriesTable 
                data={gammaByExpiry}
                maxRows={settings.maxLevelsToDisplay}
              />
            </div>

            {/* Additional Info */}
            <div className="bg-surface rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span>
                  <strong className="text-text-primary">{data.length.toLocaleString()}</strong> options loaded
                </span>
                <span className="text-border">•</span>
                <span>
                  <strong className="text-text-primary">{gammaByStrike.length}</strong> strikes analyzed
                </span>
                <span className="text-border">•</span>
                <span>
                  <strong className="text-text-primary">{gammaByExpiry.length}</strong> expiries tracked
                </span>
                {currentSessionId && (
                  <>
                    <span className="text-border">•</span>
                    <span>
                      Session: <strong className="text-text-primary">{currentSessionId.slice(0, 8)}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
