const path = require('path');
const fs   = require('fs');

const DB_DIR  = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'sysmon.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const initSqlJs = require('sql.js');

// ── Wrap sql.js in a synchronous-style API ────────────────────
function wrapDb(sqlDb) {
  function prepare(sql) {
    return {
      run(...params) {
        // sql.js .run() doesn't return lastInsertRowid directly
        sqlDb.run(sql, params);
        const res = sqlDb.exec('SELECT last_insert_rowid()');
        const id  = res[0]?.values[0][0] ?? null;
        return { lastInsertRowid: id, changes: sqlDb.getRowsModified() };
      },
      get(...params) {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },
      all(...params) {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
    };
  }

  return {
    prepare,
    exec(sql)   { sqlDb.run(sql); },
    pragma()    { /* no-op — sql.js handles pragmas inline */ },
    flush()     {
      const data = sqlDb.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    },
  };
}

// ── Schema ────────────────────────────────────────────────────
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id TEXT NOT NULL DEFAULT 'local',
    ts INTEGER NOT NULL,
    cpu REAL, mem_used REAL, mem_total REAL,
    disk_used REAL, disk_total REAL, uptime REAL
  );
  CREATE INDEX IF NOT EXISTS idx_metrics_host_ts ON metrics(host_id, ts);
  CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_id INTEGER NOT NULL,
    pid INTEGER, name TEXT, cpu REAL, mem REAL
  );
  CREATE TABLE IF NOT EXISTS alert_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, metric TEXT NOT NULL,
    operator TEXT NOT NULL, threshold REAL NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS alert_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL, host_id TEXT NOT NULL DEFAULT 'local',
    value REAL NOT NULL,
    triggered_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS hosts (
    id TEXT PRIMARY KEY, label TEXT NOT NULL,
    last_seen INTEGER, api_key TEXT NOT NULL
  );
`;

// ── Init ──────────────────────────────────────────────────────
async function initDb() {
  // Point sql.js at its WASM file explicitly — required in Node.js
  const wasmPath = path.join(
    require.resolve('sql.js'),
    '../../dist/sql-wasm.wasm'
  );

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  const sqlDb = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  const db = wrapDb(sqlDb);
  db.exec(SCHEMA);

  // Seed default alert rules once
  const count = db.prepare('SELECT COUNT(*) as c FROM alert_rules').get();
  if (!count || Number(count.c) === 0) {
    for (const [name, metric, op, thr] of [
      ['High CPU',        'cpu',               '>',  85],
      ['High Memory',     'mem_used_percent',  '>',  90],
      ['Low Disk Space',  'disk_free_percent', '<',  10],
    ]) {
      db.prepare(
        'INSERT INTO alert_rules (name,metric,operator,threshold) VALUES (?,?,?,?)'
      ).run(name, metric, op, thr);
    }
  }

  // Flush to disk every 10s + on exit
  setInterval(() => db.flush(), 10_000);
  process.on('exit',    () => db.flush());
  process.on('SIGINT',  () => { db.flush(); process.exit(0); });
  process.on('SIGTERM', () => { db.flush(); process.exit(0); });

  db.flush();
  console.log('[db] SQLite ready at', DB_PATH);
  return db;
}

// ── Singleton ─────────────────────────────────────────────────
let _promise = null;
function getDb() {
  if (!_promise) _promise = initDb();
  return _promise;
}

module.exports = { getDb };
