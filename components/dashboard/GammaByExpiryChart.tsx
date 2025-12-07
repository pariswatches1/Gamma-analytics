'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { GammaByExpiry } from '@/lib/types';
import { formatNumber, formatExpiryShort } from '@/lib/calculations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface GammaByExpiryChartProps {
  data: GammaByExpiry[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-surface-hover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary mb-2">
        {formatExpiryShort(data.expiry)} ({data.daysToExpiry}d)
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gamma-positive">Call Gamma:</span>
          <span className="text-xs font-medium text-gamma-positive">
            {formatNumber(data.callGamma)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gamma-negative">Put Gamma:</span>
          <span className="text-xs font-medium text-gamma-negative">
            {formatNumber(data.putGamma)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
          <span className="text-xs text-text-secondary">Net Gamma:</span>
          <span
            className={`text-xs font-medium ${
              data.netGamma >= 0 ? 'text-gamma-positive' : 'text-gamma-negative'
            }`}
          >
            {formatNumber(data.netGamma)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function GammaByExpiryChart({ data }: GammaByExpiryChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      name: `${formatExpiryShort(item.expiry)} (${item.daysToExpiry}d)`,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gamma by Expiry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-text-tertiary">
            No data available. Upload options data to see gamma by expiry.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gamma by Expiry</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gamma-positive opacity-60" />
              <span className="text-text-secondary">Call</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gamma-negative opacity-60" />
              <span className="text-text-secondary">Put</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorCall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPut" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={(value) => formatNumber(value, 1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="callGamma"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCall)"
              />
              <Area
                type="monotone"
                dataKey="putGamma"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
