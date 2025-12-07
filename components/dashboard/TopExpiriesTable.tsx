'use client';

import { GammaByExpiry } from '@/lib/types';
import { formatNumber, formatExpiryShort, formatDate } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Calendar, Clock } from 'lucide-react';

export interface TopExpiriesTableProps {
  data: GammaByExpiry[];
  maxRows?: number;
}

export function TopExpiriesTable({ data, maxRows = 5 }: TopExpiriesTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Expiries by Gamma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] flex items-center justify-center text-text-tertiary">
            No expiry data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by total absolute gamma
  const sortedData = [...data]
    .sort((a, b) => Math.abs(b.netGamma) - Math.abs(a.netGamma))
    .slice(0, maxRows);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Expiries by Gamma</CardTitle>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Calendar className="h-3.5 w-3.5" />
            <span>{data.length} expiries</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedData.map((expiry, index) => {
            const isNearTerm = expiry.daysToExpiry <= 7;
            const isMonthly = expiry.daysToExpiry > 20 && expiry.daysToExpiry <= 40;

            return (
              <div
                key={expiry.expiry}
                className={cn(
                  'px-5 py-4 hover:bg-surface-hover transition-colors',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        isNearTerm
                          ? 'bg-gamma-negative/10 text-gamma-negative'
                          : isMonthly
                          ? 'bg-accent-blue/10 text-accent-blue'
                          : 'bg-surface-hover text-text-secondary'
                      )}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {formatDate(expiry.expiry)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <Clock className="h-3 w-3" />
                        <span>{expiry.daysToExpiry} days</span>
                        {isNearTerm && (
                          <Badge variant="negative" size="sm">
                            Near-term
                          </Badge>
                        )}
                        {isMonthly && (
                          <Badge variant="info" size="sm">
                            Monthly
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-mono font-medium',
                        expiry.netGamma >= 0 ? 'text-gamma-positive' : 'text-gamma-negative'
                      )}
                    >
                      {formatNumber(expiry.netGamma)}
                    </p>
                    <p className="text-xs text-text-tertiary">Net Gamma</p>
                  </div>
                </div>

                {/* Gamma bar visualization */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-gamma-positive transition-all duration-500"
                        style={{
                          width: `${
                            (Math.abs(expiry.callGamma) /
                              (Math.abs(expiry.callGamma) + Math.abs(expiry.putGamma))) *
                            100
                          }%`,
                        }}
                      />
                      <div
                        className="bg-gamma-negative transition-all duration-500"
                        style={{
                          width: `${
                            (Math.abs(expiry.putGamma) /
                              (Math.abs(expiry.callGamma) + Math.abs(expiry.putGamma))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-gamma-positive">
                    Call: {formatNumber(expiry.callGamma)}
                  </span>
                  <span className="text-gamma-negative">
                    Put: {formatNumber(expiry.putGamma)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
