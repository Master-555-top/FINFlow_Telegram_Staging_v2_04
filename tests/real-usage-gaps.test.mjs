import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/lib/project/realUsageGaps.ts', import.meta.url), 'utf8');

test('real usage gaps model keeps staging safety hard stops in source', () => {
  assert.ok(source.includes("real_usage_gaps_v2_48"));
  assert.ok(source.includes('cloud-writes-safe-off'));
  assert.ok(source.includes('backup-before-staging'));
  assert.ok(source.includes('Import/apply данные показаны в preview, но не попали в Daily Records.'));
});

test('real usage gaps model must not enable cloud writes or external n8n by default', () => {
  assert.ok(source.includes('Cloud writes должны оставаться safe-off'));
  assert.ok(source.includes('n8n external calls остаются выключены'));
  assert.equal(source.includes('supabaseWritesEnabled: true'), false);
  assert.equal(source.includes('n8nExternalEnabled: true'), false);
});
