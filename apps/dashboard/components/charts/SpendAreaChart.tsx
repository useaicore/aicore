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
import { formatCents } from '@/lib/format.js';

interface SpendAreaChartProps {
  data: { date: string; costCents: number }[];
  height?: number;
}

export default function SpendAreaChart({ data, height = 220 }: SpendAreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--gold-mid)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--gold-mid)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(val) => formatCents(val)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--gold-dim)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(val: number) => [formatCents(val), 'Spend']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }}
          />
          <Area
            type="monotone"
            dataKey="costCents"
            stroke="var(--gold-bright)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSpend)"
            animationDuration={1500}
            animationBegin={200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
