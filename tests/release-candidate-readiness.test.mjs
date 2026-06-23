import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/lib/project/releaseCandidateReadiness.ts', import.meta.url), 'utf8');
const panel = readFileSync(new URL('../src/components/project/ReleaseCandidatePanel.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../src/lib/project/miniAppDeliveryPlan.ts', import.meta.url), 'utf8');

test('release candidate readiness adds an explicit v2.50 RC gate without enabling writes', () => {
  assert.ok(source.includes('release_candidate_readiness_v2_50'));
  assert.ok(source.includes('Phone bugfix + RC') || panel.includes('Phone bugfix + RC'));
  assert.ok(source.includes('Supabase writes остаются safe-off'));
  assert.equal(source.includes('supabaseWritesEnabled: true'), false);
  assert.equal(source.includes('cloudSyncEnabled: true'), false);
});

test('release candidate gate preserves locked product and visual decisions', () => {
  assert.ok(source.includes('нет глобальной вкладки История'));
  assert.ok(source.includes('Sleep остаётся Обзор / История / Редактор'));
  assert.ok(source.includes('Sleep History list, Sleep 7-day chart ПН–ВС, System grid не ломать'));
  assert.ok(source.includes('MASTER/private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/tokens'));
});

test('release candidate panel is wired only inside System QA and tracks screenshot bugs', () => {
  assert.ok(dashboard.includes("{ id: 'qa_release_candidate', label: 'RC' }"));
  assert.ok(dashboard.includes('ReleaseCandidatePanel'));
  assert.ok(panel.includes('finflow.releaseCandidate.v2_50'));
  assert.ok(panel.includes('Screenshot bug log'));
  assert.equal(dashboard.includes("{ id: 'history'"), false);
});

test('mini app delivery plan preserves earlier history and advances to v2.55 template-first historical input', () => {
  assert.ok(plan.includes('mini_app_delivery_plan_v2_55'));
  assert.ok(plan.includes('Release Candidate gate v2.50'));
  assert.ok(plan.includes('Release Candidate gate v2.50'));
  assert.ok(plan.includes('v2.56 — Real Telegram Device Acceptance'));
  assert.ok(plan.includes('private bundle upload и schema validation v2.53'));
  assert.ok(plan.includes('live historical analytics v2.54'));
  assert.ok(plan.includes('template-first historical entry v2.55'));
  assert.ok(plan.includes('МФН fund templates v2.55'));
  assert.ok(plan.includes('senior audit regression tests v2.52'));
});
