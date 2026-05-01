import React from 'react';

export function StatCard({ label, value, sub, accent = 'var(--accent-blue)', icon }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && (
          <span style={{
            width: 28, height: 28, borderRadius: 6,
            background: `${accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent, flexShrink: 0,
          }}>
            {icon}
          </span>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{sub}</div>
      )}
    </div>
  );
}
