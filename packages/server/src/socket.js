const { collectMetrics } = require('./utils/metrics');
const { runAlerts }      = require('./alerts/engine');
const { getDb }          = require('./db');

const INTERVAL = parseInt(process.env.METRICS_INTERVAL || '3000', 10);

async function persistMetrics(db, snapshot, hostId = 'local') {
  const row = db.prepare(`
    INSERT INTO metrics (host_id,ts,cpu,mem_used,mem_total,disk_used,disk_total,uptime)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    hostId,
    snapshot.ts,
    snapshot.cpu.usagePercent,
    snapshot.memory.usedMb,
    snapshot.memory.totalMb,
    snapshot.disk.usedMb,
    snapshot.disk.totalMb,
    snapshot.uptime,
  );

  const ins = db.prepare(
    'INSERT INTO processes (metric_id,pid,name,cpu,mem) VALUES (?,?,?,?,?)'
  );
  for (const p of snapshot.processes || []) {
    ins.run(row.lastInsertRowid, p.pid, p.name, p.cpu, p.mem);
  }
}

function pruneOldData(db) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  db.prepare('DELETE FROM metrics WHERE ts < ?').run(cutoff);
  console.log('[db] pruned old metrics');
}

module.exports = async function setupSocket(io) {
  const db = await getDb();

  pruneOldData(db);
  setInterval(() => pruneOldData(db), 60 * 60 * 1000);

  // Collect once immediately so the dashboard has data on first connect
  let latestSnapshot = null;
  try {
    latestSnapshot = await collectMetrics();
    await persistMetrics(db, latestSnapshot);
  } catch (e) {
    console.warn('[metrics] initial collection failed:', e.message);
  }

  // Background collection loop — broadcasts to ALL connected clients
  const broadcastAlert = (payload) => io.emit('alert', payload);

  setInterval(async () => {
    try {
      latestSnapshot = await collectMetrics();
      await persistMetrics(db, latestSnapshot);
      runAlerts(db, latestSnapshot, 'local', broadcastAlert);
      io.emit('systemMetrics', latestSnapshot);
    } catch (err) {
      console.error('[metrics] collection error:', err.message);
    }
  }, INTERVAL);

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    // Send latest snapshot immediately so dashboard isn't blank
    if (latestSnapshot) {
      socket.emit('systemMetrics', latestSnapshot);
    }

    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  console.log(`[socket] metrics loop started (every ${INTERVAL}ms)`);
};
