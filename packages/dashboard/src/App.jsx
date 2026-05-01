import React, { useState } from 'react';
import { Activity, Bell, LayoutDashboard, Clock, Wifi, WifiOff } from 'lucide-react';
import { useSocket }    from './hooks/useSocket.js';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { AlertsPage }   from './pages/AlertsPage.jsx';
import { HistoryPage }  from './pages/HistoryPage.jsx';

const NAV = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'history',  label: 'History',  Icon: Clock },
  { id: 'alerts',   label: 'Alerts',   Icon: Bell },
];

export default function App() {
  const [page, setPage] = useState('overview');
  const { metrics, history, alerts, connected, dismissAlert } = useSocket();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 24px', height: 52,
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
            SysMon <span style={{ color: 'var(--accent-blue)' }}>Pro</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 6, fontSize: 13,
                  background: active ? 'var(--bg-3)' : 'transparent',
                  color: active ? 'var(--text-1)' : 'var(--text-2)',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                <Icon size={14} />
                {label}
                {id === 'alerts' && alerts.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 4,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--accent-red)',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Live metrics ticker */}
        {metrics && connected && (
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)' }}>
            <span>CPU <strong style={{ color: (metrics.cpu?.usagePercent ?? 0) > 80 ? 'var(--accent-red)' : 'var(--text-1)' }}>{(metrics.cpu?.usagePercent ?? 0).toFixed(0)}%</strong></span>
            <span>MEM <strong style={{ color: (metrics.memory?.usedPercent ?? 0) > 85 ? 'var(--accent-amber)' : 'var(--text-1)' }}>{(metrics.memory?.usedPercent ?? 0).toFixed(0)}%</strong></span>
            <span>DISK <strong style={{ color: 'var(--text-1)' }}>{(metrics.disk?.usedPercent ?? 0).toFixed(0)}%</strong></span>
          </div>
        )}

        {/* Connection status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: connected ? 'var(--accent-teal)' : 'var(--accent-red)',
        }}>
          {connected
            ? <><Wifi size={13} /> Live</>
            : <><WifiOff size={13} /> Disconnected</>
          }
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {page === 'overview' && (
          <OverviewPage
            metrics={metrics}
            history={history}
            alerts={alerts}
            onDismissAlert={dismissAlert}
          />
        )}
        {page === 'history' && <HistoryPage />}
        {page === 'alerts'  && <AlertsPage />}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '12px 24px', borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--text-3)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>SysMon Pro — Windows System Monitor</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
}
