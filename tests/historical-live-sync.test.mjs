import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createHistoricalLedgerExport,
  HISTORICAL_LEDGER_STORAGE_KEYS,
  mergePrivateBundleIntoLedgers,
  parseHistoricalLedgerBackup,
  parsePrivateImportBundle,
  readAllHistoricalLedgers,
  restoreHistoricalLedgerBackup
} from '../src/lib/data/privateImportBundle.ts';

const panel = readFileSync(new URL('../src/components/import-review/PrivateImportCenterPanel.tsx', import.meta.url), 'utf8');
const analyticsPanel = readFileSync(new URL('../src/components/history/HistoricalLedgerAnalyticsPanel.tsx', import.meta.url), 'utf8');
const analyticsModel = readFileSync(new URL('../src/lib/data/historicalLedgerAnalytics.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function bundleText() {
  return JSON.stringify({
    schemaVersion: 'finflow_private_import_bundle_v2_53',
    bundleId: 'test-bundle',
    createdAtIso: '2026-06-23T10:00:00.000Z',
    privacy: 'private_local_only',
    containsPrivateData: true,
    sources: [{ id: 'manual-source', type: 'manual', label: 'Test', sha256: 'test', recordsCount: 1 }],
    records: [{
      id: 'record-1', sourceId: 'manual-source', sourceRecordId: '1', sourceType: 'manual',
      section: 'money', entityKind: 'expense', localDate: '2026-06-23', title: 'Еда', amount: 500,
      category: 'food', note: '', status: 'approved', confidence: 1, duplicateKey: 'test|1',
      duplicateOfIds: [], reviewReasons: [], privateLocalOnly: true
    }]
  });
}

test('historical ledgers use compact storage while preserving complete records', () => {
  const storage = new MemoryStorage();
  const parsed = parsePrivateImportBundle(bundleText());
  assert.ok(parsed.bundle);
  assert.equal(mergePrivateBundleIntoLedgers(parsed.bundle, storage).persisted, true);
  const raw = storage.getItem(HISTORICAL_LEDGER_STORAGE_KEYS.money);
  assert.match(raw, /"format":"compact_rows_v1"/);
  assert.equal(raw.includes('"records"'), false);
  assert.equal(readAllHistoricalLedgers(storage).money.records[0].title, 'Еда');
});

test('historical backup exported by FINFlow can be parsed and restored atomically', () => {
  const source = new MemoryStorage();
  const parsed = parsePrivateImportBundle(bundleText());
  mergePrivateBundleIntoLedgers(parsed.bundle, source);
  const backup = parseHistoricalLedgerBackup(createHistoricalLedgerExport(source));
  assert.ok(backup.backup);
  const target = new MemoryStorage();
  assert.equal(restoreHistoricalLedgerBackup(backup.backup, target), true);
  assert.equal(readAllHistoricalLedgers(target).money.records.length, 1);
});

test('editor saves an explicit draft and live analytics refresh all three sections', () => {
  assert.ok(panel.includes('+ ручная запись'));
  assert.ok(panel.includes('Шаблонный ввод вместо ручного текста'));
  assert.ok(panel.includes('templates={templateCatalog}'));
  assert.ok(panel.includes('onSave={saveRecord}'));
  assert.ok(panel.includes('setDraft(previous'));
  assert.ok(panel.includes('applyHistoricalTemplateToRecord(previous, template)'));
  assert.equal(panel.includes('onChange={patch => updateRecord'), false);
  assert.ok(analyticsPanel.includes('HISTORICAL_LEDGER_UPDATED_EVENT'));
  assert.ok(analyticsModel.includes('calculateWorkGross'));
  assert.ok(analyticsModel.includes("record.status === 'approved'"));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="money" />'));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="work" />'));
  assert.ok(dashboard.includes('<HistoricalLedgerAnalyticsPanel section="funds" />'));
});
