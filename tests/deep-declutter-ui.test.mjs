
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const rcPanel = readFileSync(new URL('../src/components/project/ReleaseCandidatePanel.tsx', import.meta.url), 'utf8');
const automationPanel = readFileSync(new URL('../src/components/automation/N8nAutomationPanel.tsx', import.meta.url), 'utf8');
const cloudPanel = readFileSync(new URL('../src/components/cloud/SupabaseStagingPanel.tsx', import.meta.url), 'utf8');
const backupPanel = readFileSync(new URL('../src/components/local/LocalBackupRestorePanel.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/finflow-declutter-v2-58.css', import.meta.url), 'utf8');

test('v2.58 declutter layer is active after redesign and clean copy', () => {
  assert.ok(layout.includes("./finflow-redesign-v2-56.css"));
  assert.ok(layout.includes("./finflow-ux-copy-v2-57.css"));
  assert.ok(layout.includes("./finflow-declutter-v2-58.css"));
  assert.ok(layout.includes('data-design-version="v2.58-decluttered-ui"'));
  assert.ok(css.includes('FINFlow v2.58'));
});

test('visible dashboard copy no longer contains the worst service labels', () => {
  for (const forbidden of ['Deploy-safe пакет', 'TELEGRAM_BOT_TOKEN server-only', 'Raw initData', 'Cloud write off', 'safe-off', 'UI pass', 'dev log']) {
    assert.equal(dashboard.includes(forbidden), false, forbidden);
  }
  assert.ok(dashboard.includes('чистый пакет'));
  assert.ok(dashboard.includes('только на сервере'));
});

test('phone acceptance, automation, cloud and backup panels use human copy', () => {
  for (const [fileName, source, forbidden] of [
    ['rc', rcPanel, ['Screenshot bug log', '+ blocker', '+ major', '+ minor', 'label="Pass"', 'label="Watch"', 'label="Blocked"', 'label="Bugs"', 'locked</span>']],
    ['automation', automationPanel, ['external call:', '<p>secretsReturned', '<p>dryRunOnly', 'Private n8n', 'payload keys', 'safety gates']],
    ['cloud', cloudPanel, ['RLS / security checklist', 'before writes', 'safe-off', 'candidate', 'Migrations</b>', 'files</span>']],
    ['backup', backupPanel, ['Backup Diff / Restore Preview', 'backup label', 'Import failed:', 'preview restore', 'confirm restore', 'paste backup JSON here to import']]
  ]) {
    for (const item of forbidden) assert.equal(source.includes(item), false, `${fileName}: ${item}`);
  }
});
