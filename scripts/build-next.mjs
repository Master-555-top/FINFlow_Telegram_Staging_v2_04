import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
const command = process.platform === 'win32' ? 'node_modules\\.bin\\next.cmd' : 'node_modules/.bin/next';

try {
  rmSync('.next', { recursive: true, force: true });
} catch {
  // Build can continue if cleanup is unavailable.
}

function run(args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env, shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['build', '--experimental-build-mode', 'compile']);
run(['build', '--experimental-build-mode', 'generate']);
