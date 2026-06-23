import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lockJson = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const plan = readFileSync(new URL('../src/lib/project/miniAppDeliveryPlan.ts', import.meta.url), 'utf8');
const readiness = readFileSync(new URL('../src/lib/project/ecosystemReadinessAudit.ts', import.meta.url), 'utf8');
const ecosystemPanel = readFileSync(new URL('../src/components/project/EcosystemReadinessBoard.tsx', import.meta.url), 'utf8');
const backbonePanel = readFileSync(new URL('../src/components/system/GlobalDataBackbonePanel.tsx', import.meta.url), 'utf8');

const [major, minor, patch] = packageJson.version.split('.').map(Number);
const currentDotVersion = `v${minor}.${patch}`;
const currentUnderscoreVersion = `v${minor}_${patch}`;
const staleNextBuildPattern = new RegExp(`nextBuild:\\s*['\"](?!${currentDotVersion}|v${minor}.${patch + 1})v${minor}\\.(?:${Array.from({ length: patch }, (_, index) => index).join('|')})\\b`);

test('package and lockfile versions stay synchronized', () => {
  assert.equal(packageJson.version, '0.2.60');
  assert.equal(lockJson.version, packageJson.version);
  assert.equal(lockJson.packages[''].version, packageJson.version);
  assert.equal(packageJson.engines.node, '24.x');
  assert.equal(packageJson.engines.npm, '>=11');
});

test('delivery/readiness metadata is current and nextBuild points forward', () => {
  assert.ok(plan.includes(`mini_app_delivery_plan_${currentUnderscoreVersion}`));
  assert.ok(readiness.includes(`ecosystem_readiness_audit_${currentUnderscoreVersion}`));
  assert.ok(plan.includes('v2.61 — Real Telegram Screenshot Acceptance'));  
  assert.equal(staleNextBuildPattern.test(plan), false);
  assert.equal(plan.includes('v2.53 — Real Telegram Screenshot Fixes'), false);
  assert.equal(plan.includes('deploy-safe v2.58'), false);
});

test('visible readiness labels no longer show stale board versions', () => {
  assert.ok(ecosystemPanel.includes('v2.59 • Единый дизайн'));  
  assert.ok(backbonePanel.includes('Основа данных')); 
  assert.equal(ecosystemPanel.includes('v2.47 • Strong mini app progress'), false);
  assert.equal(backbonePanel.includes('v2.45 • Data Backbone + daily save QA'), false);
});
