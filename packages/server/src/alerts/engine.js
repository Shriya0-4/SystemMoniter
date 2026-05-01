const notifier = require('node-notifier');
const path     = require('path');

const cooldowns = new Map();
const COOLDOWN_MS = 5 * 60 * 1000;

function extractValue(metrics, key) {
  return {
    cpu:               metrics.cpu.usagePercent,
    mem_used_percent:  metrics.memory.usedPercent,
    disk_used_percent: metrics.disk.usedPercent,
    disk_free_percent: metrics.disk.freePercent,
  }[key] ?? null;
}

function evaluate(op, val, thr) {
  if (op === '>')  return val > thr;
  if (op === '<')  return val < thr;
  if (op === '>=') return val >= thr;
  return false;
}

// db is now passed in (since it's async-initialised)
function runAlerts(db, metrics, hostId = 'local', onAlert) {
  const rules = db.prepare('SELECT * FROM alert_rules WHERE enabled=1').all();

  for (const rule of rules) {
    const value = extractValue(metrics, rule.metric);
    if (value === null || !evaluate(rule.operator, value, rule.threshold)) continue;

    const key     = `${rule.id}:${hostId}`;
    const lastFired = cooldowns.get(key) || 0;
    if (Date.now() - lastFired < COOLDOWN_MS) continue;
    cooldowns.set(key, Date.now());

    db.prepare('INSERT INTO alert_events (rule_id,host_id,value) VALUES (?,?,?)').run(rule.id, hostId, value);

    notifier.notify({
      title: 'SysMon Pro Alert',
      message: `${rule.name}: ${value.toFixed(1)}% (${rule.operator}${rule.threshold}%)`,
      sound: false,
    });

    if (typeof onAlert === 'function') {
      onAlert({ rule, value, message: `${rule.name}: ${value.toFixed(1)}%`, ts: Date.now(), hostId });
    }
  }
}

module.exports = { runAlerts };
