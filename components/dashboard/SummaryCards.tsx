'use client';

import { DashboardSummary } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Layers,
  ArrowUpDown,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: DashboardSummary;
  underlyingPrice?: number;
}

export function SummaryCards({ summary, underlyingPrice }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Net Gamma Exposure',
      value: formatNumber(summary.totalNetGamma),
      subtitle: summary.totalNetGamma >= 0 ? 'Positive positioning' : 'Negative positioning',
      icon: Activity,
      trend: summary.totalNetGamma >= 0 ? 'positive' : 'negative',
      description: 'Call gamma minus put gamma',
    },
    {
      title: 'Top Positive Strike',
      value: summary.topPositiveStrike ? formatCurrency(summary.topPositiveStrike) : 'N/A',
      subtitle: 'Highest call gamma',
      icon: TrendingUp,
      trend: 'positive' as const,
      description: 'Major support level',
    },
    {
      title: 'Top Negative Strike',
      value: summary.topNegativeStrike ? formatCurrency(summary.topNegativeStrike) : 'N/A',
      subtitle: 'Highest put gamma',
      icon: TrendingDown,
      trend: 'negative' as const,
      description: 'Major resistance level',
    },
    {
      title: 'Gamma Flip Level',
      value: summary.gammaFlipLevel ? formatCurrency(summary.gammaFlipLevel) : 'N/A',
      subtitle: 'Volatility transition zone',
      icon: ArrowUpDown,
      trend: 'neutral' as const,
      description: 'Where net gamma changes sign',
    },
    {
      title: 'Call Gamma Total',
      value: formatNumber(summary.callGammaTotal),
      subtitle: `${summary.uniqueStrikes} strikes`,
      icon: BarChart3,
      trend: 'positive' as const,
      description: 'Total call option gamma',
    },
    {
      title: 'Put Gamma Total',
      value: formatNumber(summary.putGammaTotal),
      subtitle: `${summary.uniqueExpiries} expiries`,
      icon: BarChart3,
      trend: 'negative' as const,
      description: 'Total put option gamma',
    },
    {
      title: 'Total Open Interest',
      value: formatNumber(summary.totalOpenInterest, 0),
      subtitle: 'Contracts outstanding',
      icon: Layers,
      trend: 'neutral' as const,
      description: 'All options combined',
    },
    {
      title: 'Underlying Price',
      value: underlyingPrice ? formatCurrency(underlyingPrice) : 'N/A',
      subtitle: 'Reference price',
      icon: Target,
      trend: 'neutral' as const,
      description: 'Current spot price',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            'group relative p-5 rounded-xl bg-surface border border-border',
            'hover:border-border-strong hover:shadow-card transition-all duration-300',
            'animate-fade-in'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Background gradient based on trend */}
          <div
            className={cn(
              'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              card.trend === 'positive' && 'bg-gradient-to-br from-gamma-positive/5 to-transparent',
              card.trend === 'negative' && 'bg-gradient-to-br from-gamma-negative/5 to-transparent',
              card.trend === 'neutral' && 'bg-gradient-to-br from-accent-blue/5 to-transparent'
            )}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-secondary">{card.title}</span>
              <div
                className={cn(
                  'p-2 rounded-lg',
                  card.trend === 'positive' && 'bg-gamma-positive/10',
                  card.trend === 'negative' && 'bg-gamma-negative/10',
                  card.trend === 'neutral' && 'bg-accent-blue/10'
                )}
              >
                <card.icon
                  className={cn(
                    'h-4 w-4',
                    card.trend === 'positive' && 'text-gamma-positive',
                    card.trend === 'negative' && 'text-gamma-negative',
                    card.trend === 'neutral' && 'text-accent-blue'
                  )}
                />
              </div>
            </div>

            <div className="mb-1">
              <span
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  card.trend === 'positive' && 'text-gamma-positive',
                  card.trend === 'negative' && 'text-gamma-negative',
                  card.trend === 'neutral' && 'text-text-primary'
                )}
              >
                {card.value}
              </span>
            </div>

            <p className="text-sm text-text-tertiary">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
