const express = require('express');
const router  = express.Router();
const { getDb } = require('../db');

router.get('/rules', async (req, res) => {
  const db = await getDb();
  res.json(db.prepare('SELECT * FROM alert_rules ORDER BY id').all());
});

router.post('/rules', async (req, res) => {
  const { name, metric, operator, threshold } = req.body;
  if (!name || !metric || !operator || threshold === undefined)
    return res.status(400).json({ error: 'Missing fields' });
  const db = await getDb();
  const r  = db.prepare('INSERT INTO alert_rules (name,metric,operator,threshold) VALUES (?,?,?,?)').run(name, metric, operator, threshold);
  res.status(201).json({ id: r.lastInsertRowid });
});

router.patch('/rules/:id', async (req, res) => {
  const db   = await getDb();
  const { enabled, threshold, name } = req.body;
  const sets = [], vals = [];
  if (enabled   !== undefined) { sets.push('enabled=?');   vals.push(enabled ? 1 : 0); }
  if (threshold !== undefined) { sets.push('threshold=?'); vals.push(threshold); }
  if (name      !== undefined) { sets.push('name=?');      vals.push(name); }
  if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
  vals.push(req.params.id);
  db.prepare(`UPDATE alert_rules SET ${sets.join(',')} WHERE id=?`).run(...vals);
  res.json({ ok: true });
});

router.delete('/rules/:id', async (req, res) => {
  const db = await getDb();
  db.prepare('DELETE FROM alert_rules WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/events', async (req, res) => {
  const db    = await getDb();
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  res.json(db.prepare(`
    SELECT e.*, r.name as rule_name, r.metric, r.operator, r.threshold
    FROM alert_events e JOIN alert_rules r ON e.rule_id=r.id
    ORDER BY e.triggered_at DESC LIMIT ?
  `).all(limit));
});

module.exports = router;
