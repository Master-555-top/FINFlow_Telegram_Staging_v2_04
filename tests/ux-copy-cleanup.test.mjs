import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/finflow-ux-copy-v2-57.css', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../src/lib/project/miniAppDeliveryPlan.ts', import.meta.url), 'utf8');
const readiness = readFileSync(new URL('../src/lib/project/ecosystemReadinessAudit.ts', import.meta.url), 'utf8');

test('v2.57 clean UX copy layer is active after the full redesign', () => {
  assert.ok(layout.includes("./finflow-redesign-v2-56.css"));
  assert.ok(layout.includes("./finflow-ux-copy-v2-57.css"));
  assert.ok(layout.includes('data-design-version="v2.58-decluttered-ui"'));
  assert.ok(layout.includes("./finflow-declutter-v2-58.css"));
  assert.ok(css.includes('FINFlow v2.57 — Clean UX copy pass'));
});

test('top-level navigation copy avoids developer jargon', () => {
  for (const forbiddenVisibleLabel of ['Preflight', 'Backbone', 'CSV/JSON', 'Staging', 'Runner', 'Live-state']) {
    assert.equal(dashboard.includes(`label: '${forbiddenVisibleLabel}'`), false, forbiddenVisibleLabel);
  }
  assert.ok(dashboard.includes("label: 'Перед стартом'"));
  assert.ok(dashboard.includes("label: 'Основа'"));
  assert.ok(dashboard.includes("label: 'Импорт'"));
  assert.ok(dashboard.includes('<span>Обновлено</span>'));
});

test('metadata points from v2.58 to the next real phone acceptance pass', () => {
  assert.ok(plan.includes('mini_app_delivery_plan_v2_58'));
  assert.ok(readiness.includes('ecosystem_readiness_audit_v2_58'));
  assert.ok(plan.includes('v2.59 — Real Telegram Screenshot Acceptance'));
  assert.ok(plan.includes('Deep declutter pass v2.58'));
});
