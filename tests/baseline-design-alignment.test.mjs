import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/finflow-baseline-v2-59.css', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('v2.59 baseline design layer is active', () => {
  assert.equal(packageJson.version, '0.2.60');
  assert.ok(layout.includes("import './finflow-baseline-v2-59.css';"));
  assert.ok(layout.includes('data-design-version="v2.60-template-first-sync-baseline"'));
  assert.ok(css.includes('Baseline Design Alignment'));
});

test('system grid keeps user-approved baseline structure and live version badge', () => {
  assert.ok(dashboard.includes('<h1>Система</h1>'));
  assert.ok(dashboard.includes('<span>{SYSTEM_UI_VERSION}</span>'));
  assert.ok(dashboard.includes("shortTitle: 'Telegram'"));
  assert.ok(dashboard.includes("shortTitle: 'Аудит'"));
  assert.ok(dashboard.includes("shortTitle: 'Данные'"));
  assert.ok(dashboard.includes("shortTitle: 'Cloud'"));
  assert.ok(dashboard.includes("shortTitle: 'Backup'"));
  assert.ok(dashboard.includes("shortTitle: 'QA'"));
  assert.ok(dashboard.includes("shortTitle: 'Dev'"));
  assert.equal(dashboard.includes('<span>готово</span>'), false);
});

test('section command centers are compact headers, not verbose cards', () => {
  assert.ok(dashboard.includes("title: 'День'"));
  assert.ok(dashboard.includes("title: 'Деньги'"));
  assert.ok(dashboard.includes("title: 'Работа'"));
  assert.ok(dashboard.includes("title: 'Фонды'"));
  assert.ok(dashboard.includes("title: 'Сон'"));
  assert.ok(dashboard.includes("title: 'AI'"));
  assert.equal(dashboard.includes('Сегодняшние деньги, работа, сон и решения'), false);
  assert.equal(dashboard.includes('Данные связаны между разделами'), true);
  assert.ok(css.includes('.redesign-command-side'));
  assert.ok(css.includes('display: none !important'));
});
