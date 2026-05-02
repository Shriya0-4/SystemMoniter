const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// Works both from repo (packages/nssm) and installed location (nssm/)
const NSSM = fs.existsSync(path.join(__dirname, '../../../nssm/nssm.exe'))
  ? path.join(__dirname, '../../../nssm/nssm.exe')
  : path.join(__dirname, '../../../../nssm/nssm.exe');
const NODE      = process.execPath;
const SCRIPT    = path.join(__dirname, '../index.js');
const SVC_NAME  = 'SysMon Pro';
const LOG_DIR = fs.existsSync(path.join(__dirname, '../../../nssm/nssm.exe'))
  ? path.join(__dirname, '../../../logs')
  : path.join(__dirname, '../../../../logs');
const DASHBOARD = path.join(__dirname, '../../../../dashboard');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', ...opts });
    if (out.trim()) console.log(out.trim());
  } catch (e) {
    if (e.stderr) console.log(e.stderr.toString().trim());
  }
}

console.log('Installing SysMonPro as a Windows Service via NSSM...');

// ── Step 1: Build the React dashboard ────────────────────────
// Skip dashboard build when running from installed location
// (dashboard is already built and bundled by the installer)
const isInstalledContext = !fs.existsSync(path.join(__dirname, '../../../../packages/dashboard'));
if (!isInstalledContext) {
  console.log('\n[1/2] Building dashboard...');
  run('npm install', { cwd: DASHBOARD });
  run('npm run build', { cwd: DASHBOARD });
  console.log('✅  Dashboard built.');
} else {
  console.log('\n[1/2] Skipping dashboard build (installed context).');
}

// ── Step 2: Register Windows Service ─────────────────────────
console.log('\n[2/2] Registering Windows Service...');

// Clean up any existing
run(`"${NSSM}" stop "${SVC_NAME}"`);
run(`"${NSSM}" remove "${SVC_NAME}" confirm`);

run(`"${NSSM}" install "${SVC_NAME}" "${NODE}"`);
run(`"${NSSM}" set "${SVC_NAME}" AppParameters "\\"${SCRIPT}\\""`);
run(`"${NSSM}" set "${SVC_NAME}" DisplayName "SysMon Pro"`);
run(`"${NSSM}" set "${SVC_NAME}" Description "Real-time system monitoring service"`);
run(`"${NSSM}" set "${SVC_NAME}" AppDirectory "${path.dirname(SCRIPT)}"`);
run(`"${NSSM}" set "${SVC_NAME}" Start SERVICE_AUTO_START`);
run(`"${NSSM}" set "${SVC_NAME}" AppStdout "${path.join(LOG_DIR, 'service.log')}"`);
run(`"${NSSM}" set "${SVC_NAME}" AppStderr "${path.join(LOG_DIR, 'error.log')}"`);
run(`"${NSSM}" set "${SVC_NAME}" AppRotateFiles 1`);
run(`"${NSSM}" set "${SVC_NAME}" AppRestartDelay 3000`);
run(`"${NSSM}" set "${SVC_NAME}" AppEnvironmentExtra PORT=3001 NODE_ENV=production`);
run(`"${NSSM}" start "${SVC_NAME}"`);

console.log('\n✅  SysMon Pro installed and started.');
console.log('    Open services.msc — look for "SysMon Pro"');
console.log('    Dashboard: http://localhost:3001');