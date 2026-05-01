import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory.js';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RANGES = [
  { label: '30m', minutes: 30 },
  { label: '1h',  minutes: 60 },
  { label: '6h',  minutes: 360 },
  { label: '24h', minutes: 1440 },
];

function fmtLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text-1)',
  },
  labelStyle: { color: 'var(--text-2)' },
};

function ChartPanel({ title, data, series, loading }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{title}</div>
      {loading ? (
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          Loading…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`hg-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="ts"
              tickFormatter={fmtLabel}
              tick={{ fontSize: 11, fill: 'var(--text-3)' }}
              tickLine={false}
              axisLine={false}
              minTickGap={60}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--text-3)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={fmtLabel}
              formatter={(v, name) => [`${v}%`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(v) => <span style={{ color: 'var(--text-2)' }}>{v}</span>}
            />
            {series.map(s => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={1.5}
                fill={`url(#hg-${s.key})`}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function HistoryPage() {
  const [minutes, setMinutes] = useState(60);
  const { data, loading } = useHistory(minutes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header + range selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>History</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <button
              key={r.minutes}
              onClick={() => setMinutes(r.minutes)}
              style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 13,
                background: minutes === r.minutes ? 'var(--accent-blue)' : 'var(--bg-3)',
                color:      minutes === r.minutes ? '#fff' : 'var(--text-2)',
                border: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary count */}
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
        {loading ? 'Loading…' : `${data.length} data points over the last ${minutes >= 60 ? `${minutes/60}h` : `${minutes}m`}`}
      </div>

      <ChartPanel
        title="CPU Usage"
        data={data}
        loading={loading}
        series={[{ key: 'cpu', name: 'CPU %', color: 'var(--accent-blue)' }]}
      />

      <ChartPanel
        title="Memory Usage"
        data={data}
        loading={loading}
        series={[{ key: 'memPercent', name: 'Memory %', color: 'var(--accent-teal)' }]}
      />

      <ChartPanel
        title="Disk Usage"
        data={data}
        loading={loading}
        series={[{ key: 'diskPercent', name: 'Disk %', color: 'var(--accent-amber)' }]}
      />

      <ChartPanel
        title="All Metrics"
        data={data}
        loading={loading}
        series={[
          { key: 'cpu',         name: 'CPU %',    color: 'var(--accent-blue)'   },
          { key: 'memPercent',  name: 'Memory %', color: 'var(--accent-teal)'   },
          { key: 'diskPercent', name: 'Disk %',   color: 'var(--accent-amber)'  },
        ]}
      />
    </div>
  );
}
