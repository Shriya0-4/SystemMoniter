import React from 'react';

const RADIUS = 54;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const COLOR_MAP = {
  blue:   'var(--accent-blue)',
  teal:   'var(--accent-teal)',
  amber:  'var(--accent-amber)',
  red:    'var(--accent-red)',
  purple: 'var(--accent-purple)',
};

function getColor(value, colorKey) {
  if (value >= 90) return 'var(--accent-red)';
  if (value >= 75) return 'var(--accent-amber)';
  return COLOR_MAP[colorKey] || 'var(--accent-blue)';
}

export function GaugeRing({ value = 0, label, sub, color = 'blue', size = 140 }) {
  const pct = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const col = getColor(pct, color);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64" cy="64" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {/* Arc */}
        <circle
          cx="64" cy="64" r={RADIUS}
          fill="none"
          stroke={col}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
        {/* Value text */}
        <text
          x="64" y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill={col}
          fontSize="22"
          fontWeight="600"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          {pct.toFixed(0)}%
        </text>
        {/* Sub text */}
        {sub && (
          <text
            x="64" y="82"
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.35)"
            fontSize="11"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {sub}
          </text>
        )}
      </svg>
      <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}
