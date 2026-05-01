import React from 'react';

function bar(pct, color) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 4, background: 'var(--bg-3)',
        borderRadius: 2, overflow: 'hidden', minWidth: 60,
      }}>
        <div style={{
          width: `${Math.min(100, pct)}%`,
          height: '100%',
          background: color,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 36, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export function ProcessTable({ processes = [] }) {
  if (!processes.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
        No process data
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['PID', 'Name', 'CPU', 'Memory'].map(h => (
              <th key={h} style={{
                padding: '8px 12px', textAlign: 'left',
                color: 'var(--text-3)', fontWeight: 500,
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => (
            <tr
              key={`${p.pid}-${i}`}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                {p.pid}
              </td>
              <td style={{ padding: '8px 12px', color: 'var(--text-1)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </td>
              <td style={{ padding: '8px 12px', minWidth: 140 }}>
                {bar(p.cpu, 'var(--accent-blue)')}
              </td>
              <td style={{ padding: '8px 12px', minWidth: 140 }}>
                {bar(Math.min(100, p.mem / 10), 'var(--accent-teal)')}
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 4 }}>
                  {p.mem.toFixed(0)} MB
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
