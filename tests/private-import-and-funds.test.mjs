import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const importModel = readFileSync(new URL('../src/lib/data/privateImportBundle.ts', import.meta.url), 'utf8');
const importPanel = readFileSync(new URL('../src/components/import-review/PrivateImportCenterPanel.tsx', import.meta.url), 'utf8');
const historicalTemplates = readFileSync(new URL('../src/lib/data/historicalLedgerTemplates.ts', import.meta.url), 'utf8');
const registry = readFileSync(new URL('../src/lib/data/finflowDataRegistry.ts', import.meta.url), 'utf8');
const history = readFileSync(new URL('../src/lib/data/finflowHistoryEngine.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const funds = readFileSync(new URL('../src/lib/day-core/fundPlanningModel.ts', import.meta.url), 'utf8');
const allocation = readFileSync(new URL('../src/lib/day-core/dailyAllocationModel.ts', import.meta.url), 'utf8');

test('private import uses isolated section ledgers and never writes into active Daily Records', () => {
  assert.ok(importModel.includes('finflow_private_import_bundle_v2_53'));
  assert.ok(importModel.includes('finflow.historicalMoneyLedger.v2_53'));
  assert.ok(importModel.includes('finflow.historicalWorkLedger.v2_53'));
  assert.ok(importModel.includes('finflow.historicalFundsLedger.v2_53'));
  assert.equal(importModel.includes('finflow.dailyRecords.v1_47'), false);
  assert.ok(importModel.includes('Best-effort atomic rollback'));
});

test('private import UI exposes upload, review, editing and local backup without cloud calls', () => {
  assert.ok(importPanel.includes('Файл истории'));
  assert.ok(importPanel.includes('HistoricalRecordEditor'));
  assert.ok(importPanel.includes('подтвердить безопасные'));
  assert.ok(importPanel.includes('backup JSON'));
  assert.ok(importPanel.includes('восстановить backup'));
  assert.ok(importPanel.includes('+ ручная запись'));
  assert.ok(importPanel.includes('Шаблонный ввод вместо ручного текста'));
  assert.ok(importPanel.includes('buildHistoricalTemplateCatalog'));
  assert.ok(importPanel.includes('applyHistoricalTemplateToRecord'));
  assert.equal(importPanel.includes('fetch('), false);
  assert.equal(importPanel.includes('supabase'), false);
  assert.ok(dashboard.includes('<PrivateImportCenterPanel />'));
});

test('historical import templates preserve user fund logic and support template-first entry', () => {
  assert.ok(historicalTemplates.includes('historical_ledger_templates_v2_55'));
  assert.ok(historicalTemplates.includes('tpl-fund-working'));
  assert.ok(historicalTemplates.includes('ДР Ульяны'));
  assert.ok(historicalTemplates.includes('Полёт / переезд'));
  assert.ok(historicalTemplates.includes('Подушка'));
  assert.ok(historicalTemplates.includes('Подарок Ульяне'));
  assert.ok(historicalTemplates.includes('300000'));
  assert.ok(historicalTemplates.includes('preserveAmount'));
  assert.ok(historicalTemplates.includes('Собрано из истории'));
  assert.ok(historicalTemplates.includes('createHistoricalRecordFromTemplate'));
});

test('approved historical records are visible by section while review/rejected records stay out of history', () => {
  assert.ok(registry.includes('finflow.historicalMoneyLedger.v2_53'));
  assert.ok(registry.includes('finflow.historicalWorkLedger.v2_53'));
  assert.ok(registry.includes('finflow.historicalFundsLedger.v2_53'));
  assert.ok(history.includes("value.status !== 'approved'"));
  assert.ok(dashboard.includes("['records', 'bank', 'templates', 'money']"));
  assert.ok(dashboard.includes("['records', 'fuel', 'work']"));
});

test('fund model preserves required targets, revolving behavior and daily norm formula', () => {
  assert.ok(funds.includes("id: 'working-fund'"));
  assert.ok(funds.includes('targetAmount: 2500'));
  assert.ok(funds.includes("id: 'base-business'"));
  assert.ok(funds.includes('targetAmount: 10000'));
  assert.ok(funds.includes("id: 'ulyana-birthday'"));
  assert.ok(funds.includes("id: 'flight-move'"));
  assert.ok(funds.includes('targetAmount: 300000'));
  assert.ok(funds.includes("id: 'safety-cushion'"));
  assert.ok(funds.includes("id: 'ulyana-gift'"));
  assert.ok(funds.includes("fundType: 'revolving'"));
  assert.ok(funds.includes('Math.ceil(missingAmount / remainingDays)'));
  assert.ok(allocation.includes('buildFundPlanningSummary'));
  assert.ok(allocation.includes('plan?.dailyNorm'));
});
