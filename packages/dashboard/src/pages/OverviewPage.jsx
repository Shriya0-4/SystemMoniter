import React from 'react';
import { Cpu, MemoryStick, HardDrive, Network, Clock, Server } from 'lucide-react';
import { GaugeRing }    from '../components/GaugeRing.jsx';
import { SparkChart }   from '../components/SparkChart.jsx';
import { StatCard }     from '../components/StatCard.jsx';
import { ProcessTable } from '../components/ProcessTable.jsx';
import { AlertBanner }  from '../components/AlertBanner.jsx';

function fmt(mb) {
  if (!mb) return '—';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function fmtNet(bytes) {
  if (bytes === undefined) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB/s`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB/s`;
  return `${bytes} B/s`;
}

function fmtUptime(secs) {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const panel = (children, style = {}) => (
  <div style={{
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px 24px', ...style,
  }}>
    {children}
  </div>
);

const sectionTitle = (title, sub) => (
  <div style={{ marginBottom: 16 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{title}</span>
    {sub && <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>{sub}</span>}
  </div>
);

export function OverviewPage({ metrics, history, alerts, onDismissAlert }) {
  const cpu  = metrics?.cpu    ?? {};
  const mem  = metrics?.memory ?? {};
  const disk = metrics?.disk   ?? {};
  const net  = metrics?.network ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Alert banners */}
      <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

      {/* Host info strip */}
      {metrics && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          fontSize: 13, color: 'var(--text-2)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Server size={14} />
            <strong style={{ color: 'var(--text-1)' }}>{metrics.host || 'localhost'}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Uptime {fmtUptime(metrics.uptime)}
          </span>
          <span style={{ color: 'var(--text-3)' }}>{metrics.platform}</span>
          {cpu.cores && (
            <span style={{ color: 'var(--text-3)' }}>{cpu.cores} cores</span>
          )}
        </div>
      )}

      {/* Gauge row */}
      {panel(
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          flexWrap: 'wrap', gap: 24,
        }}>
          <GaugeRing value={cpu.usagePercent  ?? 0} label="CPU"    color="blue"  sub={`${cpu.cores ?? 0} cores`} />
          <GaugeRing value={mem.usedPercent   ?? 0} label="Memory" color="teal"  sub={`${fmt(mem.usedMb)} / ${fmt(mem.totalMb)}`} />
          <GaugeRing value={disk.usedPercent  ?? 0} label="Disk"   color="amber" sub={`${fmt(disk.usedMb)} / ${fmt(disk.totalMb)}`} />
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard label="CPU Usage"     value={`${(cpu.usagePercent ?? 0).toFixed(1)}%`}         accent="var(--accent-blue)"   icon={<Cpu size={14}/>} />
        <StatCard label="Memory Used"   value={fmt(mem.usedMb)}    sub={`${(mem.usedPercent ?? 0).toFixed(1)}% of ${fmt(mem.totalMb)}`} accent="var(--accent-teal)"   icon={<MemoryStick size={14}/>} />
        <StatCard label="Disk Used"     value={fmt(disk.usedMb)}   sub={`${(disk.usedPercent ?? 0).toFixed(1)}% of ${fmt(disk.totalMb)}`} accent="var(--accent-amber)"  icon={<HardDrive size={14}/>} />
        <StatCard label="Network In"    value={fmtNet(net.rxBytesPerSec)}                          accent="var(--accent-purple)" icon={<Network size={14}/>} />
        <StatCard label="Network Out"   value={fmtNet(net.txBytesPerSec)}                          accent="var(--accent-purple)" icon={<Network size={14}/>} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {panel(<>
          {sectionTitle('CPU', 'last 3 min')}
          <SparkChart data={history} dataKey="cpu" color="blue" unit="%" height={90} />
        </>)}
        {panel(<>
          {sectionTitle('Memory', 'last 3 min')}
          <SparkChart data={history} dataKey="memPercent" color="teal" unit="%" height={90} />
        </>)}
        {panel(<>
          {sectionTitle('Network RX', 'KB/s')}
          <SparkChart data={history} dataKey="rxKB" color="purple" unit=" KB/s" height={90} />
        </>)}
      </div>

      {/* Per-core CPU */}
      {cpu.coresLoad && cpu.coresLoad.length > 0 && panel(
        <>
          {sectionTitle('Per-Core CPU')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {cpu.coresLoad.map((load, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
                  <span>Core {i}</span>
                  <span>{load}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2 }}>
                  <div style={{
                    width: `${load}%`, height: '100%', borderRadius: 2,
                    background: load > 80 ? 'var(--accent-red)' : load > 60 ? 'var(--accent-amber)' : 'var(--accent-blue)',
                    transition: 'width 0.5s ease, background 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Process table */}
      {panel(<>
        {sectionTitle('Top Processes', 'by CPU')}
        <ProcessTable processes={metrics?.processes ?? []} />
      </>)}
    </div>
  );
}
