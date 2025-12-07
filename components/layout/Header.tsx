'use client';

import { usePathname } from 'next/navigation';
import { Bell, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Monitor gamma exposure and key levels',
  },
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Monitor gamma exposure and key levels',
  },
  '/upload': {
    title: 'Upload Data',
    subtitle: 'Import options chain data from CSV',
  },
  '/watchlist': {
    title: 'Watchlist',
    subtitle: 'Track your favorite symbols',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Configure your preferences',
  },
};

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  lastUpdate?: Date | string | null;
}

export function Header({ 
  title, 
  subtitle, 
  onRefresh, 
  isRefreshing,
  isLoading, 
  lastUpdate 
}: HeaderProps) {
  const pathname = usePathname();
  const defaultPageInfo = pageTitles[pathname] || { title: 'GammaScope', subtitle: '' };
  
  const displayTitle = title || defaultPageInfo.title;
  const displaySubtitle = subtitle || defaultPageInfo.subtitle;

  const formatLastUpdate = () => {
    if (!lastUpdate) return null;
    const date = lastUpdate instanceof Date ? lastUpdate : new Date(lastUpdate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const loading = isRefreshing || isLoading;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:ml-0 ml-12">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-sm text-text-tertiary hidden sm:block">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="hidden md:flex items-center gap-2 text-sm text-text-tertiary">
              <Calendar className="h-4 w-4" />
              <span>Last update: {formatLastUpdate()}</span>
            </div>
          )}

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-blue text-[10px] font-medium flex items-center justify-center text-white">
              2
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
