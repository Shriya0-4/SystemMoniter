import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const METRICS = [
  { value: 'cpu',               label: 'CPU Usage %' },
  { value: 'mem_used_percent',  label: 'Memory Usage %' },
  { value: 'disk_used_percent', label: 'Disk Usage %' },
  { value: 'disk_free_percent', label: 'Disk Free %' },
];

const OPERATORS = ['>', '<', '>='];

function card(children, style = {}) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px', ...style,
    }}>
      {children}
    </div>
  );
}

export function AlertsPage() {
  const [rules, setRules]   = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm]     = useState({ name: '', metric: 'cpu', operator: '>', threshold: 85 });
  const [saving, setSaving] = useState(false);

  function loadRules()  { fetch('/api/alerts/rules').then(r => r.json()).then(setRules); }
  function loadEvents() { fetch('/api/alerts/events?limit=30').then(r => r.json()).then(setEvents); }

  useEffect(() => { loadRules(); loadEvents(); }, []);

  async function addRule(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/alerts/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, threshold: parseFloat(form.threshold) }),
    });
    setSaving(false);
    setForm({ name: '', metric: 'cpu', operator: '>', threshold: 85 });
    loadRules();
  }

  async function toggleRule(id, enabled) {
    await fetch(`/api/alerts/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    });
    loadRules();
  }

  async function deleteRule(id) {
    await fetch(`/api/alerts/rules/${id}`, { method: 'DELETE' });
    loadRules();
  }

  const inputStyle = {
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-1)',
    padding: '8px 12px', fontSize: 13,
  };
  const labelStyle = { fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Alert Rules</h2>

      {/* Add Rule Form */}
      {card(
        <>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--text-2)' }}>Add Rule</h3>
          <form onSubmit={addRule} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 100px auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="High CPU" />
            </div>
            <div>
              <label style={labelStyle}>Metric</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.metric}
                onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}>
                {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Op</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.operator}
                onChange={e => setForm(f => ({ ...f, operator: e.target.value }))}>
                {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Threshold %</label>
              <input style={{ ...inputStyle, width: '100%' }} type="number" min="0" max="100" value={form.threshold}
                onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} style={{
              background: 'var(--accent-blue)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '9px 16px', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <Plus size={14} /> Add
            </button>
          </form>
        </>
      )}

      {/* Rules List */}
      {card(
        <>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--text-2)' }}>Active Rules</h3>
          {rules.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No rules configured.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)',
                    opacity: r.enabled ? 1 : 0.5,
                    transition: 'opacity 0.2s',
                  }}>
                    <button onClick={() => toggleRule(r.id, r.enabled)} style={{ color: r.enabled ? 'var(--accent-teal)' : 'var(--text-3)', lineHeight: 0 }}>
                      {r.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <span style={{ flex: 1, fontWeight: 500 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'monospace' }}>
                      {METRICS.find(m => m.value === r.metric)?.label || r.metric} {r.operator} {r.threshold}%
                    </span>
                    <button onClick={() => deleteRule(r.id)} style={{ color: 'var(--text-3)', lineHeight: 0, padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </>
      )}

      {/* Recent Events */}
      {card(
        <>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--text-2)' }}>Recent Events</h3>
          {events.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No alert events yet.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Rule', 'Value', 'Host'].map(h => (
                      <th key={h} style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {new Date(ev.triggered_at * 1000).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--accent-red)' }}>{ev.rule_name}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{ev.value.toFixed(1)}%</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{ev.host_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </>
      )}
    </div>
  );
}
