import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/finflow-redesign-v2-56.css', import.meta.url), 'utf8');
const model = readFileSync(new URL('../src/lib/project/globalRedesignAcceptance.ts', import.meta.url), 'utf8');

test('v2.56 full redesign is active in the app shell, not only in a QA card', () => {
  assert.ok(layout.includes("./finflow-redesign-v2-56.css"));
  assert.ok(layout.includes('data-design-version="v2.58-decluttered-ui"'));
  assert.ok(layout.includes("./finflow-ux-copy-v2-57.css"));
  assert.ok(layout.includes("./finflow-declutter-v2-58.css"));
  assert.ok(dashboard.includes('SectionCommandCenter'));
  assert.ok(dashboard.includes('redesign-command-center'));
  assert.ok(dashboard.includes('COMMAND_CENTER_META'));
});

test('v2.56 redesign CSS covers global shell, surfaces, controls, sleep baseline and bottom nav', () => {
  for (const required of [
    'Full system redesign',
    '.redesign-command-center',
    '.bottom-nav.premium-bottom-nav',
    '.system-premium-grid',
    '.sleep-week-chart',
    '.sleep-history-list',
    'input, textarea, select',
    'Protected visual baseline'
  ]) {
    assert.ok(css.includes(required), `missing ${required}`);
  }
});

test('v2.56 redesign keeps hard safety stops and locked navigation decisions', () => {
  assert.equal(dashboard.includes("{ id: 'history'"), false);
  assert.ok(model.includes('нельзя возвращать глобальную вкладку История'));
  assert.ok(model.includes('нельзя включать Supabase writes/n8n external calls через redesign'));
  assert.equal(model.includes('supabaseWritesEnabled: true'), false);
  assert.equal(model.includes('cloudSyncEnabled: true'), false);
});
