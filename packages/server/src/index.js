require('dotenv').config();
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const { Server } = require('socket.io');
const path    = require('path');
const fs      = require('fs');

const setupSocket  = require('./socket');
const systemRoutes = require('./routes/system');
const alertRoutes  = require('./routes/alerts');

const app    = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ── Socket.IO ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────
app.use('/api/system', systemRoutes);
app.use('/api/alerts', alertRoutes);

// ── Serve built React dashboard (production) ──────────────────
const DIST = process.env.DASHBOARD_DIST || path.join(__dirname, '../../dashboard/dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ── Start server first, THEN init socket+DB ───────────────────
// This avoids the race where a client connects before the DB is ready
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[sysmon] server running on http://localhost:${PORT}`);
  console.log(`[sysmon] dashboard  → http://localhost:5173  (dev)`);
  console.log(`[sysmon] API        → http://localhost:${PORT}/api`);

  // Init DB + socket AFTER server is listening
  setupSocket(io).catch(err => {
    console.error('[socket] setup failed:', err.message);
    process.exit(1);
  });
});

module.exports = server;
