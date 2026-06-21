import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const appRoot = resolve(process.cwd());
const version = 'v2_29';
const packageName = `FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_${version}.zip`;
const exportsDir = join(appRoot, 'exports');
const stagingDir = join(exportsDir, `.telegram-staging-package-${version}`);
const outputZip = join(exportsDir, packageName);
const manifestPath = join(exportsDir, `FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_${version}_MANIFEST.json`);

const allowedPaths = [
  'app',
  'src',
  'scripts/build-next.mjs',
  'package.json',
  'package-lock.json',
  '.npmrc',
  
  'tsconfig.json',
  'next-env.d.ts',
  'next.config.js',
  'vercel.json',
  '.env.example',
  '.gitignore',
  '.vercelignore',
  '.dockerignore',
  'supabase'
];

const forbiddenFragments = [
  'private_vault',
  'private_raw_data',
  'MASTER_PRIVATE_DOCS',
  'node_modules',
  '.next',
  '.npm-cache',
  '.env.local',
  '.env.production',
  '.env.development'
];

rmSync(stagingDir, { recursive: true, force: true });
rmSync(outputZip, { force: true });
mkdirSync(stagingDir, { recursive: true });
mkdirSync(exportsDir, { recursive: true });

for (const relativePath of allowedPaths) {
  const source = join(appRoot, relativePath);
  if (!existsSync(source)) continue;
  const target = join(stagingDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

writeFileSync(join(stagingDir, 'README_TELEGRAM_STAGING_v2.24.md'), `# FINFlow Telegram Staging Deploy Safe Package v2.24\n\nThis package is safe to use as the Vercel/hosting project root for the first Telegram Mini App staging + real device test.\n\n## Upload rule\nUse this deploy-safe package or the \`finflow_app\` folder only. Never upload MASTER PRIVATE FULL, \`private_vault\`, \`private_raw_data\`, raw archives, or real .env files to public GitHub/Vercel root/Supabase Storage.\n\n## Required Vercel/hosting env vars\n- TELEGRAM_BOT_TOKEN — server-only.\n- SUPABASE_URL — server-side cloud sync.\n- SUPABASE_SERVICE_ROLE_KEY — server-only, never NEXT_PUBLIC.\n- FINFLOW_ENABLE_CLOUD_SYNC=true — only when ready for cloud test.\n- FINFLOW_ENABLE_SUPABASE_WRITES=true — only after backup + manual checklist.\n\n## First staging flow\n1. Deploy this package to a private staging deployment.\n2. Open \`/api/deployment/readiness\` and confirm no secret values are returned.\n3. Put the HTTPS deployment URL into BotFather as Mini App URL.\n4. Open from real Telegram on phone, go to Sleep and System → Telegram, and run the v2.24 live-state hook extracted DailyQuickInput system, System → QA, and Telegram Test panels: initData, viewport, readiness API, cloud GET dry-run.\n5. Run local backup before any cloud write.\n`);

const manifest = {
  package: packageName,
  version: 'v2.24',
  createdBy: 'FINFlow protocol build script',
  purpose: 'Telegram Mini App staging deploy-safe package',
  sourceRoot: 'finflow_app',
  includedPaths: allowedPaths.filter(path => existsSync(join(appRoot, path))).concat(['README_TELEGRAM_STAGING_v2.24.md']),
  forbiddenFragments,
  safety: {
    includesPrivateVault: false,
    includesPrivateRawData: false,
    includesNodeModules: false,
    includesNextBuildOutput: false,
    includesRealEnvFiles: false,
    useAsVercelRoot: true
  }
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

execFileSync('zip', ['-qr', outputZip, '.'], { cwd: stagingDir, stdio: 'inherit' });
execFileSync('zip', ['-T', outputZip], { stdio: 'inherit' });
console.log(outputZip);
