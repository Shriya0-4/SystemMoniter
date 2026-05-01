const express = require('express');
const router  = express.Router();
const { getDb }          = require('../db');
const { collectMetrics } = require('../utils/metrics');

router.get('/metrics', async (req, res) => {
  try { res.json(await collectMetrics()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', async (req, res) => {
  const db      = await getDb();
  const host    = req.query.host || 'local';
  const minutes = Math.min(parseInt(req.query.minutes || '60', 10), 1440);
  const since   = Date.now() - minutes * 60 * 1000;
  const rows    = db.prepare(
    'SELECT ts,cpu,mem_used,mem_total,disk_used,disk_total FROM metrics WHERE host_id=? AND ts>=? ORDER BY ts ASC'
  ).all(host, since);
  res.json(rows);
});

router.get('/processes', async (req, res) => {
  const db   = await getDb();
  const host = req.query.host || 'local';
  const last = db.prepare('SELECT id FROM metrics WHERE host_id=? ORDER BY ts DESC LIMIT 1').get(host);
  if (!last) return res.json([]);
  res.json(db.prepare('SELECT pid,name,cpu,mem FROM processes WHERE metric_id=? ORDER BY cpu DESC').all(last.id));
});

router.get('/hosts', async (req, res) => {
  const db    = await getDb();
  const hosts = db.prepare('SELECT id,label,last_seen FROM hosts').all();
  res.json([{ id: 'local', label: 'Local Machine', last_seen: Date.now() }, ...hosts]);
});

module.exports = router;
