import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  blue:   'var(--accent-blue)',
  teal:   'var(--accent-teal)',
  amber:  'var(--accent-amber)',
  red:    'var(--accent-red)',
  purple: 'var(--accent-purple)',
};

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function SparkChart({ data, dataKey, color = 'blue', unit = '%', height = 80 }) {
  const col = COLORS[color] || COLORS.blue;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={col} stopOpacity={0.25} />
            <stop offset="95%" stopColor={col} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis dataKey="ts" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
            color: 'var(--text-1)',
          }}
          labelFormatter={fmtTime}
          formatter={(v) => [`${v}${unit}`, dataKey]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={col}
          strokeWidth={1.5}
          fill={`url(#grad-${color})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
