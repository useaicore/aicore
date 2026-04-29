'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCents } from '@/lib/format';

interface SpendPieChartProps {
  data: { provider: string; costCents: number }[];
  height?: number;
}

const COLORS = {
  openai: 'var(--gold-bright)',
  anthropic: 'var(--sky-bright)',
  google: 'var(--gold-mid)',
  meta: 'var(--sky-dim)',
  mistral: 'var(--text-secondary)',
  other: 'var(--gold-dim)',
};

export default function SpendPieChart({ data, height = 260 }: SpendPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.costCents, 0);

  return (
    <div style={{ width: '100%', height }} className="relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-[var(--text-muted)] text-[10px] uppercase font-medium">Total</span>
        <span className="text-[var(--gold-cream)] text-sm font-bold">{formatCents(total)}</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="40%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="costCents"
            nameKey="provider"
            stroke="none"
            animationDuration={1800}
          >
            {data.map((entry, index) => {
              const provider = entry.provider.toLowerCase();
              const color = COLORS[provider as keyof typeof COLORS] || COLORS.other;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--text-faint)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(val) => [formatCents(Number(val ?? 0)), 'Spend']}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '10px', color: 'var(--text-muted)', paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
