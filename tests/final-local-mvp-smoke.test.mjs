import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/lib/project/finalLocalMvpSmoke.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

test('final local MVP smoke locks the approved visual baselines', () => {
  assert.ok(source.includes('final_local_mvp_smoke_v2_49'));
  assert.ok(source.includes('sleep-history-list'));
  assert.ok(source.includes('sleep-weekly-7-day-chart'));
  assert.ok(source.includes('system-grid'));
  assert.ok(source.includes('не менять визуальный стиль'));
});

test('final local MVP smoke keeps release safety hard stops', () => {
  assert.ok(source.includes('cloud writes включены до backup + RLS + conflict manual test'));
  assert.ok(source.includes('MASTER/private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/tokens'));
  assert.ok(source.includes('n8n external calls включены без auth/redaction/private staging'));
  assert.equal(source.includes('supabaseWritesEnabled: true'), false);
  assert.equal(source.includes('cloudSyncEnabled: true'), false);
});

test('final local MVP smoke is available only inside the System QA section', () => {
  assert.ok(dashboard.includes("{ id: 'qa_mvp_smoke', label: 'MVP' }"));
  assert.ok(dashboard.includes('FinalLocalMvpSmokePanel'));
  assert.equal(dashboard.includes("{ id: 'history'"), false);
});
