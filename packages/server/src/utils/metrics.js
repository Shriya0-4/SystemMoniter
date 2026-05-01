const si = require('systeminformation');

async function collectMetrics() {
  const [cpu, mem, disk, networkStats, processes, osInfo] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.processes(),
    si.osInfo(),
  ]);

  // Primary disk
  const primaryDisk = (disk || [])
    .filter(d => d && d.size > 0)
    .sort((a, b) => b.size - a.size)[0] || { size: 0, used: 0, use: 0, mount: '/' };

  const diskTotal = primaryDisk.size   || 0;
  const diskUsed  = primaryDisk.used   || 0;
  const diskFree  = diskTotal - diskUsed;
  const diskUsedPct = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;
  const diskFreePct = diskTotal > 0 ? (diskFree / diskTotal) * 100 : 0;

  // Memory — fall back to 0 if fields missing
  const memTotal = mem?.total     || 0;
  const memAvail = mem?.available || mem?.free || 0;
  const memUsed  = memTotal - memAvail;
  const memUsedPct = memTotal > 0 ? (memUsed / memTotal) * 100 : 0;

  // CPU — currentLoad can be undefined on first call on Windows
  const cpuLoad   = cpu?.currentLoad ?? 0;
  const coresLoad = (cpu?.cpus || []).map(c => parseFloat((c.load ?? 0).toFixed(1)));

  // Top 10 processes by CPU
  const topProcs = ((processes?.list) || [])
    .filter(p => p)
    .sort((a, b) => (b.pcpu || 0) - (a.pcpu || 0))
    .slice(0, 10)
    .map(p => ({
      pid:  p.pid,
      name: p.name,
      cpu:  parseFloat((p.pcpu  || 0).toFixed(1)),
      mem:  parseFloat(((p.mem_rss || 0) / 1024 / 1024).toFixed(1)),
    }));

  // Network
  const nets   = networkStats || [];
  const netIn  = nets.reduce((s, n) => s + (n.rx_sec || 0), 0);
  const netOut = nets.reduce((s, n) => s + (n.tx_sec || 0), 0);

  return {
    ts:       Date.now(),
    host:     osInfo?.hostname  || 'localhost',
    platform: osInfo?.platform  || process.platform,
    uptime:   process.uptime(),

    cpu: {
      usagePercent: parseFloat(cpuLoad.toFixed(1)),
      cores:        coresLoad.length || 1,
      coresLoad,
    },

    memory: {
      totalMb:     parseFloat((memTotal / 1024 / 1024).toFixed(0)),
      usedMb:      parseFloat((memUsed  / 1024 / 1024).toFixed(0)),
      freeMb:      parseFloat((memAvail / 1024 / 1024).toFixed(0)),
      usedPercent: parseFloat(memUsedPct.toFixed(1)),
    },

    disk: {
      totalMb:     parseFloat((diskTotal / 1024 / 1024).toFixed(0)),
      usedMb:      parseFloat((diskUsed  / 1024 / 1024).toFixed(0)),
      freeMb:      parseFloat((diskFree  / 1024 / 1024).toFixed(0)),
      usedPercent: parseFloat(diskUsedPct.toFixed(1)),
      freePercent: parseFloat(diskFreePct.toFixed(1)),
      mount:       primaryDisk.mount || 'C:',
    },

    network: {
      rxBytesPerSec: Math.round(netIn),
      txBytesPerSec: Math.round(netOut),
    },

    processes: topProcs,
  };
}

module.exports = { collectMetrics };