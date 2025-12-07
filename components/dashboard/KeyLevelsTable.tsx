'use client';

import { KeyGammaLevel, GammaByStrike } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, ArrowUpDown, Target } from 'lucide-react';

export interface KeyLevelsTableProps {
  levels?: KeyGammaLevel[];
  keyLevels?: KeyGammaLevel[];
  topStrikes?: GammaByStrike[];
  spotPrice?: number;
  underlyingPrice?: number;
  maxLevels?: number;
}

export function KeyLevelsTable({
  levels,
  keyLevels,
  topStrikes = [],
  spotPrice,
  underlyingPrice,
  maxLevels = 10,
}: KeyLevelsTableProps) {
  // Use levels or keyLevels (levels takes precedence)
  const displayLevels = (levels || keyLevels || []).slice(0, maxLevels);
  // Use spotPrice or underlyingPrice (spotPrice takes precedence)
  const priceRef = spotPrice ?? underlyingPrice;
  const getTypeIcon = (type: KeyGammaLevel['type']) => {
    switch (type) {
      case 'positive':
        return TrendingUp;
      case 'negative':
        return TrendingDown;
      case 'flip':
        return ArrowUpDown;
      default:
        return Target;
    }
  };

  const getTypeBadge = (type: KeyGammaLevel['type']) => {
    switch (type) {
      case 'positive':
        return <Badge variant="positive">Support</Badge>;
      case 'negative':
        return <Badge variant="negative">Resistance</Badge>;
      case 'flip':
        return <Badge variant="neutral">Flip Zone</Badge>;
      default:
        return <Badge variant="default">Level</Badge>;
    }
  };

  const getDistanceFromSpot = (strike: number) => {
    if (!priceRef) return null;
    const diff = strike - priceRef;
    const percent = (diff / priceRef) * 100;
    return { diff, percent };
  };

  if (displayLevels.length === 0 && topStrikes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Gamma Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-text-tertiary">
            No data available. Upload options data to see key levels.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Key Gamma Levels</CardTitle>
          {priceRef && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-accent-blue" />
              <span className="text-text-secondary">
                Spot: <span className="font-medium text-accent-blue">{formatCurrency(priceRef)}</span>
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Strike
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Net Gamma
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Call OI
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Put OI
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Distance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Key Levels first */}
              {displayLevels.map((level, index) => {
                const Icon = getTypeIcon(level.type);
                const distance = getDistanceFromSpot(level.strike);
                const strikeData = topStrikes.find((s) => s.strike === level.strike);

                return (
                  <tr
                    key={`level-${index}`}
                    className={cn(
                      'hover:bg-surface-hover transition-colors',
                      level.type === 'flip' && 'bg-amber-500/5'
                    )}
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            level.type === 'positive' && 'text-gamma-positive',
                            level.type === 'negative' && 'text-gamma-negative',
                            level.type === 'flip' && 'text-gamma-neutral'
                          )}
                        />
                        <span className="font-medium text-text-primary">
                          {formatCurrency(level.strike)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getTypeBadge(level.type)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span
                        className={cn(
                          'font-mono text-sm',
                          level.netGamma >= 0 ? 'text-gamma-positive' : 'text-gamma-negative'
                        )}
                      >
                        {formatNumber(level.netGamma)}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className="font-mono text-sm text-text-secondary">
                        {strikeData ? formatNumber(strikeData.callOI, 0) : level.totalOI ? formatNumber(level.totalOI / 2, 0) : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className="font-mono text-sm text-text-secondary">
                        {strikeData ? formatNumber(strikeData.putOI, 0) : level.totalOI ? formatNumber(level.totalOI / 2, 0) : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {distance && (
                        <span
                          className={cn(
                            'font-mono text-sm',
                            distance.diff > 0 ? 'text-gamma-positive' : 'text-gamma-negative'
                          )}
                        >
                          {distance.diff > 0 ? '+' : ''}
                          {distance.percent.toFixed(2)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Top strikes that aren't already in key levels */}
              {topStrikes
                .filter((strike) => !displayLevels.some((l) => l.strike === strike.strike))
                .slice(0, 5)
                .map((strike, index) => {
                  const distance = getDistanceFromSpot(strike.strike);
                  const type: KeyGammaLevel['type'] = strike.netGamma >= 0 ? 'positive' : 'negative';
                  const Icon = getTypeIcon(type);

                  return (
                    <tr
                      key={`strike-${index}`}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              type === 'positive' ? 'text-gamma-positive' : 'text-gamma-negative'
                            )}
                          />
                          <span className="font-medium text-text-primary">
                            {formatCurrency(strike.strike)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getTypeBadge(type)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span
                          className={cn(
                            'font-mono text-sm',
                            strike.netGamma >= 0 ? 'text-gamma-positive' : 'text-gamma-negative'
                          )}
                        >
                          {formatNumber(strike.netGamma)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span className="font-mono text-sm text-text-secondary">
                          {formatNumber(strike.callOI, 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span className="font-mono text-sm text-text-secondary">
                          {formatNumber(strike.putOI, 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {distance && (
                          <span
                            className={cn(
                              'font-mono text-sm',
                              distance.diff > 0 ? 'text-gamma-positive' : 'text-gamma-negative'
                            )}
                          >
                            {distance.diff > 0 ? '+' : ''}
                            {distance.percent.toFixed(2)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
