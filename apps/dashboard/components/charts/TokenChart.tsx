'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/format.js';

interface TokenChartProps {
  data: { date: string; inputTokens: number; outputTokens: number }[];
  height?: number;
}

export default function TokenChart({ data, height = 200 }: TokenChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="var(--text-faint)" 
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
              return val;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--text-faint)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(val: number, name: string) => [
              formatNumber(val), 
              name === 'inputTokens' ? 'Input' : 'Output'
            ]}
          />
          <Area
            type="monotone"
            dataKey="inputTokens"
            stackId="1"
            stroke="var(--sky-mid)"
            fill="var(--sky-mid)"
            fillOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="outputTokens"
            stackId="1"
            stroke="var(--gold-mid)"
            fill="var(--gold-mid)"
            fillOpacity={0.4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
