import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatIsoDateInTimeZone,
  formatLocalIsoDate,
  isValidIsoLocalDate
} from '../src/lib/time/localDate.ts';
import {
  applyFinflowBackupRestore,
  createFinflowLocalBackup,
  parseRollbackSnapshot
} from '../src/lib/backup/localBackupRestore.ts';

test('local date helpers do not shift Kamchatka dates back to UTC day', () => {
  const instant = new Date('2026-06-22T13:30:00.000Z');
  assert.equal(formatIsoDateInTimeZone(instant, 'Asia/Kamchatka'), '2026-06-23');

  const localDate = new Date(2026, 5, 23, 1, 30);
  assert.equal(formatLocalIsoDate(localDate), '2026-06-23');
});

test('ISO local date validation rejects calendar-impossible values', () => {
  assert.equal(isValidIsoLocalDate('2026-06-23'), true);
  assert.equal(isValidIsoLocalDate('2024-02-29'), true);
  assert.equal(isValidIsoLocalDate('2026-02-29'), false);
  assert.equal(isValidIsoLocalDate('2026-99-99'), false);
});

test('backup restore reports whether automatic rollback actually succeeded', () => {
  const backup = createFinflowLocalBackup(createStorageReader({ 'finflow.test': 'new' }));

  let recoverableWrites = 0;
  const recoverableWriter = {
    getItem: () => 'old',
    setItem: () => {
      recoverableWrites += 1;
      if (recoverableWrites === 1) throw new Error('quota');
    },
    removeItem: () => {}
  };
  const recovered = applyFinflowBackupRestore(recoverableWriter, backup);
  assert.equal(recovered.ok, false);
  assert.equal(recovered.rolledBack, true);
  assert.equal(recovered.reason, 'local_storage_write_failed_and_rolled_back');

  const brokenWriter = {
    getItem: () => 'old',
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('quota'); }
  };
  const unrecovered = applyFinflowBackupRestore(brokenWriter, backup);
  assert.equal(unrecovered.ok, false);
  assert.equal(unrecovered.rolledBack, false);
  assert.equal(unrecovered.reason, 'local_storage_write_failed_rollback_failed');
});

test('rollback snapshots reject duplicate keys and invalid timestamps', () => {
  const base = {
    schemaVersion: 'finflow_backup_rollback_v1_90',
    createdAt: '2026-06-23T00:00:00.000Z',
    entries: [{ key: 'finflow.test', value: 'one' }]
  };
  assert.deepEqual(parseRollbackSnapshot(JSON.stringify(base)), base);
  assert.equal(parseRollbackSnapshot(JSON.stringify({ ...base, createdAt: 'not-a-date' })), null);
  assert.equal(parseRollbackSnapshot(JSON.stringify({ ...base, entries: [...base.entries, ...base.entries] })), null);
});

function createStorageReader(values) {
  const entries = Object.entries(values);
  return {
    length: entries.length,
    key: index => entries[index]?.[0] ?? null,
    getItem: key => values[key] ?? null
  };
}
