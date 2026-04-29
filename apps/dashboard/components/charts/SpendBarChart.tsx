'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCents } from '@/lib/format.js';

interface SpendBarChartProps {
  data: { model: string; costCents: number }[];
  height?: number;
}

export default function SpendBarChart({ data, height = 260 }: SpendBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--text-faint)" />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickFormatter={(val) => formatCents(val)}
          />
          <YAxis
            dataKey="model"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            width={80}
            tickFormatter={(str) => str.length > 15 ? `${str.substring(0, 15)}...` : str}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--text-faint)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(val: number) => [formatCents(val), 'Spend']}
            cursor={{ fill: 'var(--bg-subtle)', opacity: 0.4 }}
          />
          <Bar dataKey="costCents" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--gold-mid)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
