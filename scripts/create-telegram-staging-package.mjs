import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const appRoot = resolve(process.cwd());
const packageJson = JSON.parse(readFileSync(join(appRoot, 'package.json'), 'utf8'));
const version = toPackageVersion(packageJson.version);
const packageName = `FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_${version}.zip`;
const exportsDir = join(appRoot, 'exports');
const stagingDir = join(exportsDir, `.telegram-staging-package-${version}`);
const stagedAppDir = join(stagingDir, 'finflow_app');
const outputZip = join(exportsDir, packageName);
const manifestName = `FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_${version}_MANIFEST.json`;
const manifestPath = join(exportsDir, manifestName);

const allowedPaths = [
  'app',
  'src',
  'scripts',
  'tests',
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

const forbiddenPathFragments = [
  'private_vault',
  'private_raw_data',
  'master_private_docs',
  'docs',
  'node_modules',
  '.next',
  '.npm-cache',
  'exports',
  '.env.local',
  '.env.production',
  '.env.development',
  'tsconfig.tsbuildinfo'
];

const secretValuePatterns = [
  { name: 'private_key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
  { name: 'telegram_bot_token', pattern: /\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/ },
  { name: 'openai_api_key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { name: 'non_empty_secret_env', pattern: /\b(?:TELEGRAM_BOT_TOKEN|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY)=[ \t]*[^\s#]+/i }
];

mkdirSync(exportsDir, { recursive: true });
rmSync(stagingDir, { recursive: true, force: true });
rmSync(outputZip, { force: true });
mkdirSync(stagedAppDir, { recursive: true });

for (const relativePath of allowedPaths) {
  const source = join(appRoot, relativePath);
  if (!existsSync(source)) throw new Error(`Required deploy path is missing: ${relativePath}`);
  const target = join(stagedAppDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

const readmeName = `README_TELEGRAM_STAGING_${version.replace('_', '.')}.md`;
writeFileSync(join(stagedAppDir, readmeName), buildReadme(version));

const scannedFiles = scanDeploySafeTree(stagedAppDir);
const manifest = {
  package: packageName,
  appVersion: packageJson.version,
  version,
  createdAt: new Date().toISOString(),
  createdBy: 'FINFlow audited deploy-safe packaging script',
  purpose: 'Telegram Mini App private staging deploy-safe package',
  sourceRoot: 'finflow_app',
  includedPaths: [...allowedPaths, readmeName],
  forbiddenPathFragments,
  fileCount: scannedFiles.length,
  files: scannedFiles,
  safety: {
    allowlistEnforced: true,
    contentSecretScanPassed: true,
    includesProjectDocs: false,
    includesPrivateVault: false,
    includesPrivateRawData: false,
    includesNodeModules: false,
    includesNextBuildOutput: false,
    includesRealEnvFiles: false,
    externalAutomationEnabledByDefault: false,
    useAsVercelRoot: true
  }
};

const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(join(stagedAppDir, 'FINFLOW_DEPLOY_SAFE_MANIFEST.json'), manifestJson);
writeFileSync(manifestPath, manifestJson);

createZip(stagingDir, outputZip);
verifyZip(outputZip);

console.log(JSON.stringify({ outputZip, manifestPath, fileCount: scannedFiles.length }, null, 2));

function scanDeploySafeTree(root) {
  return listFiles(root).map(filePath => {
    const relativePath = relative(root, filePath).replaceAll('\\', '/');
    const normalizedPath = `/${relativePath.toLowerCase()}/`;
    const forbidden = forbiddenPathFragments.find(fragment => normalizedPath.includes(`/${fragment.toLowerCase()}/`) || normalizedPath.endsWith(`/${fragment.toLowerCase()}/`));
    if (forbidden) throw new Error(`Forbidden deploy path fragment "${forbidden}" in ${relativePath}`);

    const content = readFileSync(filePath);
    const text = content.toString('utf8');
    for (const secretPattern of secretValuePatterns) {
      if (secretPattern.pattern.test(text)) {
        throw new Error(`Secret-shaped value (${secretPattern.name}) found in ${relativePath}`);
      }
    }

    return {
      path: relativePath,
      bytes: content.byteLength,
      sha256: createHash('sha256').update(content).digest('hex')
    };
  });
}

function listFiles(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry);
    if (statSync(fullPath).isDirectory()) files.push(...listFiles(fullPath));
    else files.push(fullPath);
  }
  return files.sort();
}

function createZip(sourceDir, destinationZip) {
  if (process.platform === 'win32') {
    execFileSync('tar.exe', ['-a', '-c', '-f', destinationZip, 'finflow_app'], { cwd: sourceDir, stdio: 'inherit' });
    return;
  }

  execFileSync('zip', ['-qr', destinationZip, '.'], { cwd: sourceDir, stdio: 'inherit' });
}

function verifyZip(zipPath) {
  if (process.platform === 'win32') {
    execFileSync('tar.exe', ['-t', '-f', zipPath], { stdio: 'ignore' });
    return;
  }

  execFileSync('zip', ['-T', zipPath], { stdio: 'inherit' });
}

function toPackageVersion(value) {
  const match = String(value).match(/^\d+\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Unsupported package version: ${value}`);
  return `v${Number(match[1])}_${Number(match[2])}`;
}

function buildReadme(currentVersion) {
  return `# FINFlow Telegram Staging Deploy Safe Package ${currentVersion.replace('_', '.')}\n\nThis package is generated from an explicit runtime allowlist. Project history, chat transcripts, private docs, vaults, raw data, build output and real env files are excluded.\n\n## Upload rule\nUse this deploy-safe package as the Vercel/private staging project root. Never upload MASTER PRIVATE FULL, private_vault, private_raw_data, MASTER_PRIVATE_DOCS or real .env files to GitHub/Vercel/public cloud.\n\n## Required server env vars\n- TELEGRAM_BOT_TOKEN\n- SUPABASE_URL\n- SUPABASE_SERVICE_ROLE_KEY\n- FINFLOW_ENABLE_CLOUD_SYNC=true only during an approved cloud test\n- FINFLOW_ENABLE_SUPABASE_WRITES=true only after backup + RLS + conflict checks\n\nExternal n8n calls remain fail-closed until webhook, auth, redaction, backup and explicit enable gates are all true.\n\n## First staging flow\n1. Deploy to private staging.\n2. Open /api/deployment/readiness and confirm no secret values are returned.\n3. Configure the HTTPS URL in BotFather.\n4. Run Telegram device, viewport, readiness and cloud GET dry-run checks.\n5. Create a local backup before any cloud write.\n`;
}
