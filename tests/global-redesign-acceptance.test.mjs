import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const model = readFileSync(new URL('../src/lib/project/globalRedesignAcceptance.ts', import.meta.url), 'utf8');
const panel = readFileSync(new URL('../src/components/project/GlobalRedesignAcceptancePanel.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/finflow-redesign-v2-51.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../src/lib/project/miniAppDeliveryPlan.ts', import.meta.url), 'utf8');

test('v2.51 global redesign exists as a separate final CSS contract', () => {
  assert.ok(layout.includes("./finflow-redesign-v2-51.css"));
  assert.ok(css.includes('FINFlow v2.51 — Global redesign contract'));
  assert.ok(css.includes('safe-area'));
  assert.ok(css.includes('Protected baseline'));
});

test('global redesign acceptance preserves locked baseline and does not enable cloud writes', () => {
  assert.ok(model.includes('global_redesign_acceptance_v2_51'));
  assert.ok(model.includes('Sleep History list'));
  assert.ok(model.includes('Sleep 7-day chart'));
  assert.ok(model.includes('System grid'));
  assert.ok(model.includes('нельзя возвращать глобальную вкладку История'));
  assert.equal(model.includes('supabaseWritesEnabled: true'), false);
  assert.equal(model.includes('cloudSyncEnabled: true'), false);
});

test('global redesign acceptance is wired in System QA without adding a global History tab', () => {
  assert.ok(dashboard.includes("{ id: 'qa_design_acceptance', label: 'Дизайн' }"));
  assert.ok(dashboard.includes('GlobalRedesignAcceptancePanel'));
  assert.ok(panel.includes('finflow.globalRedesign.v2_51'));
  assert.equal(dashboard.includes("{ id: 'history'"), false);
});

test('mini app plan advances to v2.55 while preserving explicit redesign approval and v2.52 audit sync', () => {
  assert.ok(plan.includes('mini_app_delivery_plan_v2_55'));
  assert.ok(plan.includes('Global redesign contract v2.51'));
  assert.ok(plan.includes('Senior audit date/backup/API hardening sync v2.52'));
  assert.ok(plan.includes('v2.52'));
  assert.ok(plan.includes('не делать самовольный редизайн'));
});
