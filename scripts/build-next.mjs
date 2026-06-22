import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
const nextCli = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

try {
  rmSync('.next', { recursive: true, force: true });
} catch {
  // Build can continue if cleanup is unavailable.
}

function run(args) {
  const result = spawnSync(process.execPath, [nextCli, ...args], { stdio: 'inherit', env, shell: false });
  if (result.error) {
    console.error(`Unable to start Next.js build: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['build', '--experimental-build-mode', 'compile']);
run(['build', '--experimental-build-mode', 'generate']);
