'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  Eye,
  Settings,
  TrendingUp,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload Data', href: '/upload', icon: Upload },
  { name: 'Watchlist', href: '/watchlist', icon: Eye },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-background-secondary border-r border-border">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                GammaFlow
              </h1>
              <p className="text-xs text-text-tertiary">Options Analytics</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-accent-blue')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gamma-positive/20">
                <TrendingUp className="h-4 w-4 text-gamma-positive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">
                  Demo Mode
                </p>
                <p className="text-xs text-text-tertiary">
                  Client-side only
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
