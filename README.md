# SysMon Pro

> A production-grade Windows system monitoring service — ships as a proper `.exe` installer, registers in `services.msc`, auto-starts on boot, and serves a real-time React dashboard.

![Dashboard Screenshot](docs/screenshot.png)

## Features

- **Real-time metrics** — CPU (per-core), memory, disk, network via WebSocket
- **Process monitor** — top 10 processes by CPU with live usage bars
- **Time-series history** — SQLite-backed, 24h retention, chart any metric
- **Alert engine** — configurable threshold rules with Windows toast notifications
- **Windows Service** — installs in `services.msc`, survives reboots
- **Professional installer** — built with Inno Setup, shows in Add/Remove Programs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js · Express · Socket.IO |
| Database | SQLite (`better-sqlite3`) |
| Metrics | `systeminformation` |
| Alerts | `node-notifier` (Windows toast) |
| Service | `node-windows` |
| Frontend | React · Recharts · Vite |
| Installer | Inno Setup 6 |

---

## Quick Start (Development)

```bash
# 1. Install all dependencies
npm install

# 2. Start the backend
npm run dev:server

# 3. In another terminal, start the frontend
npm run dev:dashboard

# Dashboard: http://localhost:5173
# API:       http://localhost:3001
```

---

## Install as Windows Service (Development Machine)

Run once as **Administrator**:

```bash
npm run install-service
```

Then open `services.msc` — you'll see **SysMon Pro** with status *Running* and startup type *Automatic*.

To uninstall:
```bash
npm run uninstall-service
```

---

## Building the Installer

### Prerequisites

1. [Inno Setup 6](https://jrsoftware.org/isdl.php) installed
2. Node.js portable binary at `installer/node/node.exe`
   - Download from [nodejs.org](https://nodejs.org/en/download) → *Windows Binary (.zip)*
   - Extract and place `node.exe` in `installer/node/`

### Build

```bat
scripts\build.bat
```

Output: `installer/dist/SysMonPro-Setup.exe`

Upload this to **GitHub Releases** and share the link.

---

## Project Structure

```
sysmon-pro/
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── index.js          ← Express entry point
│   │       ├── socket.js         ← Socket.IO + metrics loop
│   │       ├── db/index.js       ← SQLite setup + schema
│   │       ├── utils/metrics.js  ← systeminformation collector
│   │       ├── alerts/engine.js  ← threshold evaluation + notifications
│   │       ├── routes/
│   │       │   ├── system.js     ← REST: metrics, history, processes
│   │       │   └── alerts.js     ← REST: CRUD alert rules + events
│   │       └── service/
│   │           ├── install.js    ← node-windows service registration
│   │           └── uninstall.js
│   └── dashboard/
│       └── src/
│           ├── App.jsx           ← Layout + navigation
│           ├── hooks/
│           │   ├── useSocket.js  ← WebSocket + live history buffer
│           │   └── useHistory.js ← REST history fetch
│           ├── components/
│           │   ├── GaugeRing.jsx    ← SVG arc gauges
│           │   ├── SparkChart.jsx   ← Recharts area charts
│           │   ├── StatCard.jsx     ← Metric summary cards
│           │   ├── ProcessTable.jsx ← Top processes
│           │   └── AlertBanner.jsx  ← Live alert toasts
│           └── pages/
│               ├── OverviewPage.jsx ← Main dashboard
│               └── AlertsPage.jsx   ← Alert rule management
└── installer/
    ├── setup.iss                 ← Inno Setup script
    └── service-helper/
        ├── install-service.bat
        └── uninstall-service.bat
```

---

## API Reference

```
GET  /api/system/metrics          → live snapshot
GET  /api/system/history?minutes= → time-series rows
GET  /api/system/processes        → top processes
GET  /api/alerts/rules            → list rules
POST /api/alerts/rules            → create rule
PATCH /api/alerts/rules/:id       → toggle / update
DELETE /api/alerts/rules/:id      → remove rule
GET  /api/alerts/events           → recent alert firings
```

---

## Resume Talking Points

This project demonstrates:

- **Systems programming** — Windows Service lifecycle, OS-level metrics collection
- **Real-time architecture** — WebSocket push with Socket.IO, live buffered history
- **Full-stack ownership** — backend (Node/Express), frontend (React), database (SQLite), deployment (Inno Setup)
- **Production mindset** — alert cooldowns, WAL-mode SQLite, 24h data pruning, crash-restart policy
- **Packaging & distribution** — portable Node runtime bundled, professional installer, Add/Remove Programs entry

**One-line pitch for interviews:**
> "A system monitoring tool I packaged as a real Windows installer — it registers a background service in services.msc that collects CPU, memory, and disk metrics into SQLite, broadcasts them live via WebSocket to a React dashboard, and fires Windows toast alerts when thresholds are crossed."

---

## License

MIT

---

## Releasing to GitHub (Recruiter Demo)

This repo has a GitHub Actions workflow that auto-builds `SysMonPro-Setup.exe` and publishes to GitHub Releases on every version tag.

```bash
# Push code to GitHub, then tag a release:
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions (Windows runner) will:
- Build the React dashboard
- Download portable Node.js (no Node required on target machine)  
- Compile the Inno Setup installer
- Publish `SysMonPro-Setup-1.0.0.exe` to the Releases tab automatically

**Recruiters click your GitHub link → download → double-click → done.** No "clone and npm install."

### Resume bullet points (copy-paste ready)

- Built a full-stack Windows system monitoring service (Node.js + React) packaged as a professional Inno Setup installer distributed via GitHub Releases
- Implemented real-time metric streaming (CPU per-core, memory, disk, network, processes) via Socket.IO with 24h SQLite time-series persistence  
- Engineered a configurable alert engine with Windows toast notifications, cooldown logic, threshold rules, and audit trail stored in SQLite
- Registered application as a native Windows Service in `services.msc` with auto-restart policy using `node-windows`; CI/CD builds the installer on GitHub Actions Windows runners on every version tag

