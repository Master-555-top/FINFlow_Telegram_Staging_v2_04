import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../src/lib/project/miniAppDeliveryPlan.ts', import.meta.url), 'utf8');
const registry = readFileSync(new URL('../src/lib/data/finflowDataRegistry.ts', import.meta.url), 'utf8');
const history = readFileSync(new URL('../src/lib/data/finflowHistoryEngine.ts', import.meta.url), 'utf8');
const privateImport = readFileSync(new URL('../src/components/import-review/PrivateImportCenterPanel.tsx', import.meta.url), 'utf8');

test('v2.60 keeps v2.59 baseline design while adding template-first historical input', () => {
  assert.equal(pkg.version, '0.2.60');
  assert.ok(layout.includes("import './finflow-baseline-v2-59.css';"));
  assert.ok(layout.includes('data-design-version="v2.60-template-first-sync-baseline"'));
  assert.ok(dashboard.includes('<PrivateImportCenterPanel />'));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="money" />'));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="work" />'));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="funds" />'));
});

test('v2.60 registers historical ledgers without creating a global History tab', () => {
  assert.ok(registry.includes('finflow.historicalMoneyLedger.v2_53'));
  assert.ok(registry.includes('finflow.historicalWorkLedger.v2_53'));
  assert.ok(registry.includes('finflow.historicalFundsLedger.v2_53'));
  assert.ok(history.includes('parseHistoricalLedgerStateRaw'));
  assert.equal(dashboard.includes("id: 'history'"), false);
  assert.ok(dashboard.includes("SleepDashboard"));
});

test('v2.60 sync keeps user-facing copy clean', () => {
  assert.ok(privateImport.includes('История и шаблоны'));
  assert.ok(privateImport.includes('Файл истории'));
  assert.equal(privateImport.includes('Private JSON bundle'), false);
  assert.equal(privateImport.includes('Private Local Import'), false);
  assert.ok(plan.includes('mini_app_delivery_plan_v2_60'));
  assert.ok(plan.includes('v2.61'));
});
