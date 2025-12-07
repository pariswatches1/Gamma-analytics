'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { GammaByStrike } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/calculations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export interface GammaByStrikeChartProps {
  data: GammaByStrike[];
  spotPrice?: number;
  underlyingPrice?: number;
  showCallPutSeparate?: boolean;
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
        Strike: {formatCurrency(Number(label))}
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

export function GammaByStrikeChart({
  data,
  spotPrice,
  underlyingPrice,
  showCallPutSeparate = true,
}: GammaByStrikeChartProps) {
  // Use spotPrice or underlyingPrice (spotPrice takes precedence)
  const priceRef = spotPrice ?? underlyingPrice;
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      strike: item.strike.toString(),
    }));
  }, [data]);

  // Calculate domain for Y axis
  const yDomain = useMemo(() => {
    if (data.length === 0) return [-1, 1];
    const maxAbs = Math.max(
      ...data.map((d) =>
        showCallPutSeparate
          ? Math.max(Math.abs(d.callGamma), Math.abs(d.putGamma))
          : Math.abs(d.netGamma)
      )
    );
    return [-maxAbs * 1.1, maxAbs * 1.1];
  }, [data, showCallPutSeparate]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gamma by Strike</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-text-tertiary">
            No data available. Upload options data to see gamma distribution.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gamma by Strike</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gamma-positive" />
              <span className="text-text-secondary">Call Gamma</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gamma-negative" />
              <span className="text-text-secondary">Put Gamma</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="strike"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#374151' }}
                tickFormatter={(value) => formatNumber(value, 1)}
                domain={yDomain}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference line at current price */}
              {priceRef && (
                <ReferenceLine
                  x={priceRef.toString()}
                  stroke="#60a5fa"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Spot: ${formatCurrency(priceRef)}`,
                    position: 'top',
                    fill: '#60a5fa',
                    fontSize: 11,
                  }}
                />
              )}

              {/* Zero line */}
              <ReferenceLine y={0} stroke="#374151" />

              {showCallPutSeparate ? (
                <>
                  <Bar
                    dataKey="callGamma"
                    fill="#10b981"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="putGamma"
                    fill="#ef4444"
                    radius={[0, 0, 2, 2]}
                    maxBarSize={40}
                  />
                </>
              ) : (
                <Bar dataKey="netGamma" radius={[2, 2, 2, 2]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.netGamma >= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
