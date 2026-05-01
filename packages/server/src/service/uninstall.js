const { execSync } = require('child_process');
const path = require('path');

const NSSM     = path.join(__dirname, '../../../nssm/nssm.exe');
const SVC_NAME = 'SysMonPro';

function run(cmd) {
  try { execSync(cmd, { encoding: 'utf8' }); } catch (_) {}
}

console.log('Removing SysMonPro service...');
run(`"${NSSM}" stop ${SVC_NAME}`);
run(`"${NSSM}" remove ${SVC_NAME} confirm`);
console.log('✅  SysMonPro service removed.');