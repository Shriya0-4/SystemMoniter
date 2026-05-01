import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function AlertBanner({ alerts = [], onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      {alerts.map(a => (
        <div
          key={a.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(242,87,87,0.1)',
            border: '1px solid rgba(242,87,87,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <AlertTriangle size={15} color="var(--accent-red)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>
            <strong style={{ color: 'var(--accent-red)' }}>{a.rule?.name}</strong>
            {' — '}{a.message}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {new Date(a.ts).toLocaleTimeString()}
          </span>
          <button
            onClick={() => onDismiss(a.id)}
            style={{ color: 'var(--text-3)', padding: 2, lineHeight: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }`}</style>
    </div>
  );
}
