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
import { formatCents } from '@/lib/format';

interface SpendAreaChartProps {
  data: { date: string; costCents: number }[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    return (
      <div className="glass-strong border-gold-mid/30 p-4 rounded-xl shadow-2xl backdrop-blur-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold-bright animate-pulse" />
          <p className="text-gold-cream text-lg font-black tracking-tight">
            {formatCents(payload[0].value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

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
              <stop offset="5%" stopColor="var(--gold-mid)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--gold-mid)" stopOpacity={0} />
            </linearGradient>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false} 
            stroke="rgba(255,255,255,0.03)" 
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
            minTickGap={30}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(val) => formatCents(val)}
            dx={-10}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(232, 184, 75, 0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="costCents"
            stroke="var(--gold-bright)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSpend)"
            animationDuration={2000}
            animationBegin={300}
            style={{ filter: 'url(#shadow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
