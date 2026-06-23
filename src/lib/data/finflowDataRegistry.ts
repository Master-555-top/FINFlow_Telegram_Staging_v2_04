import {
  extractHistoryEntriesFromRaw,
  filterHistoryEntries,
  filterRawValueByHistoryScope,
  type FinflowHistoryEntry
} from '@/lib/data/finflowHistoryEngine';

export type FinflowDataSection = 'all' | 'day' | 'records' | 'money' | 'work' | 'sleep' | 'history' | 'fuel' | 'bank' | 'templates' | 'tasks' | 'funds' | 'ai' | 'system' | 'import' | 'n8n';

export type FinflowDataKey = {
  key: string;
  label: string;
  section: FinflowDataSection;
  periodField?: string;
  exactPeriodReset?: boolean;
};

export const FINFLOW_DATA_KEYS: FinflowDataKey[] = [
  { key: 'finflow.dailyQuickInput.v1_47', label: 'День / фонды / задачи', section: 'day', periodField: 'localDate', exactPeriodReset: true },
  { key: 'finflow.dailyRecords.v1_47', label: 'Записи доходов/расходов/смен', section: 'records', periodField: 'createdAtIso', exactPeriodReset: true },
  { key: 'finflow.customRecordTemplates.v1_47', label: 'Шаблоны записей', section: 'templates' },
  { key: 'finflow.bankCandidateDecisions.v1_47', label: 'Bank review решения', section: 'bank' },
  { key: 'finflow.historicalMoneyLedger.v2_53', label: 'Исторический реестр: деньги', section: 'money', periodField: 'records.localDate', exactPeriodReset: true },
  { key: 'finflow.historicalWorkLedger.v2_53', label: 'Исторический реестр: работа', section: 'work', periodField: 'records.localDate', exactPeriodReset: true },
  { key: 'finflow.historicalFundsLedger.v2_53', label: 'Исторический реестр: фонды', section: 'funds', periodField: 'records.localDate', exactPeriodReset: true },
  { key: 'finflow_sleep_records_v2_17', label: 'Сон: история', section: 'sleep', periodField: 'toDate', exactPeriodReset: true },
  { key: 'finflow_sleep_live_session_v2_17', label: 'Сон: активная сессия', section: 'sleep', periodField: 'fromDate', exactPeriodReset: true },
  { key: 'finflow.dailyHistory.v1_33', label: 'История дневных снимков', section: 'history', periodField: 'snapshots.localDate', exactPeriodReset: true },
  { key: 'finflow.dailyHistory.v1_47', label: 'История дневных снимков legacy', section: 'history', periodField: 'snapshots.localDate', exactPeriodReset: true },
  { key: 'finflow.activeDaySession.v2_01', label: 'Активный день', section: 'day', periodField: 'activeLocalDate', exactPeriodReset: true },
  { key: 'finflow.activeDayRolloverArchive.v2_01', label: 'Rollover archive', section: 'history', periodField: 'entries.previousLocalDate', exactPeriodReset: true },
  { key: 'finflow.editableFuelInputs.v1_64', label: 'Топливо: текущие параметры', section: 'fuel' },
  { key: 'finflow.fuelOdometerHistory.v1_68', label: 'Топливо: история пробега', section: 'fuel', periodField: 'entries.date', exactPeriodReset: true },
  { key: 'finflow.fuelOdometerHistory.v1_66', label: 'Топливо: история пробега legacy', section: 'fuel', periodField: 'entries.date', exactPeriodReset: true },
  { key: 'finflow.importReviewQueue.v1_28', label: 'Импорт: review queue', section: 'import', periodField: 'updatedAt', exactPeriodReset: false },
  { key: 'finflow.n8nAutomationEvents.v2_32', label: 'n8n: события автоматизации', section: 'n8n', periodField: 'createdAtIso', exactPeriodReset: true }
];

export type FinflowDataScope = {
  section: FinflowDataSection;
  period: 'all' | 'year' | 'month' | 'week' | 'day';
  anchorDateIso: string;
};

export type FinflowDataPreviewItem = {
  key: string;
  label: string;
  section: FinflowDataSection;
  count: number;
  scopedCount: number;
  bytes: number;
  willReset: boolean;
  exactPeriodReset: boolean;
};

export type FinflowDataPreview = {
  generatedAtIso: string;
  scope: FinflowDataScope;
  items: FinflowDataPreviewItem[];
  totalCount: number;
  totalBytes: number;
  exactCount: number;
  timeline: FinflowHistoryEntry[];
};

export type FinflowResetBackup = {
  id: string;
  createdAtIso: string;
  scope: FinflowDataScope;
  values: { key: string; value: string | null }[];
};

export const FINFLOW_LAST_RESET_BACKUP_KEY = 'finflow.lastResetBackup.v2_28';

export function buildFinflowDataPreview(scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()): FinflowDataPreview {
  const timeline = buildFinflowHistoryTimeline(scope, storage);
  const items = FINFLOW_DATA_KEYS.map(item => {
    const raw = storage?.getItem(item.key) ?? null;
    const bytes = raw ? raw.length : 0;
    const entries = extractHistoryEntriesFromRaw(item, raw);
    const scopedEntries = filterHistoryEntries(entries, scope);
    const inScope = isKeyInScope(item, scope);
    const count = entries.length || countStoredValue(raw);
    const scopedCount = scope.period === 'all' ? count : scopedEntries.length;
    return {
      key: item.key,
      label: item.label,
      section: item.section,
      count,
      scopedCount,
      bytes,
      willReset: raw !== null && inScope && (scope.period === 'all' || scopedCount > 0 || !item.exactPeriodReset),
      exactPeriodReset: item.exactPeriodReset ?? false
    };
  });
  const resetItems = items.filter(item => item.willReset);
  return {
    generatedAtIso: new Date().toISOString(),
    scope,
    items,
    totalCount: resetItems.reduce((sum, item) => sum + (scope.period === 'all' ? item.count : item.scopedCount), 0),
    totalBytes: resetItems.reduce((sum, item) => sum + item.bytes, 0),
    exactCount: timeline.length,
    timeline
  };
}

export function buildFinflowHistoryTimeline(scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()) {
  const entries = FINFLOW_DATA_KEYS
    .filter(item => isKeyInScope(item, scope))
    .flatMap(item => extractHistoryEntriesFromRaw(item, storage?.getItem(item.key) ?? null));
  return filterHistoryEntries(entries, scope)
    .sort((a, b) => `${b.dateIso}:${b.id}`.localeCompare(`${a.dateIso}:${a.id}`));
}

export function createResetBackup(scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()): FinflowResetBackup {
  const values = FINFLOW_DATA_KEYS
    .filter(item => isKeyInScope(item, scope))
    .map(item => ({ key: item.key, value: storage?.getItem(item.key) ?? null }));
  return { id: `reset-${new Date().toISOString()}`, createdAtIso: new Date().toISOString(), scope, values };
}

export function applyFinflowDataReset(scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()) {
  if (!storage) return null;
  const backup = createResetBackup(scope, storage);
  let changed = false;
  storage.setItem(FINFLOW_LAST_RESET_BACKUP_KEY, JSON.stringify(backup));

  for (const item of FINFLOW_DATA_KEYS) {
    if (!isKeyInScope(item, scope)) continue;
    const raw = storage.getItem(item.key);
    if (raw === null) continue;

    if (scope.period === 'all' || !item.exactPeriodReset) {
      storage.removeItem(item.key);
      changed = true;
      continue;
    }

    const result = filterRawValueByHistoryScope(item, raw, scope);
    if (!result.changed) continue;
    if (result.nextRaw === null) storage.removeItem(item.key);
    else storage.setItem(item.key, result.nextRaw);
    changed = true;
  }

  return changed ? backup : null;
}

export function restoreLastReset(storage: Storage | undefined = getBrowserLocalStorage()) {
  const raw = storage?.getItem(FINFLOW_LAST_RESET_BACKUP_KEY);
  if (!storage || !raw) return null;
  const backup = JSON.parse(raw) as FinflowResetBackup;
  for (const item of backup.values) {
    if (item.value === null) storage.removeItem(item.key);
    else storage.setItem(item.key, item.value);
  }
  storage.removeItem(FINFLOW_LAST_RESET_BACKUP_KEY);
  return backup;
}

export function buildFinflowStorageExport(format: 'summary' | 'text' | 'json' | 'ai_prompt', scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()) {
  const preview = buildFinflowDataPreview(scope, storage);
  const values = FINFLOW_DATA_KEYS
    .filter(item => isKeyInScope(item, scope))
    .map(item => {
      const raw = storage?.getItem(item.key) ?? null;
      if (!raw) return { ...item, value: null, entries: [] as FinflowHistoryEntry[] };
      const entries = filterHistoryEntries(extractHistoryEntriesFromRaw(item, raw), scope);
      if (scope.period === 'all') return { ...item, value: raw, entries };
      const filtered = filterRawValueByHistoryScope(item, raw, scope);
      // filterRawValueByHistoryScope returns the value after removing scoped entries;
      // for export we need the opposite, so we keep the raw and expose entries summary.
      return { ...item, value: raw, entries };
    })
    .filter(item => item.value !== null || item.entries.length > 0);

  if (format === 'json') {
    return JSON.stringify({
      version: 'finflow_storage_export_v2_33',
      exportedAtIso: new Date().toISOString(),
      scope,
      timeline: preview.timeline,
      blocks: values.map(item => ({ key: item.key, label: item.label, section: item.section, entries: item.entries }))
    }, null, 2);
  }

  const lines = [
    `FINFlow data export v2.33`,
    `Scope: ${scope.section} / ${scope.period} / ${scope.anchorDateIso}`,
    `Blocks: ${values.length}`,
    `Exact timeline entries: ${preview.timeline.length}`,
    ''
  ];

  if (format === 'summary') {
    for (const item of values) lines.push(`- ${item.label}: ${item.entries.length || countStoredValue(item.value)} записей; key=${item.key}`);
  } else {
    for (const item of values) {
      lines.push(`## ${item.label}`);
      if (item.entries.length) {
        for (const entry of item.entries) lines.push(`- ${entry.dateIso}: ${entry.title} — ${entry.summary}`);
      } else {
        lines.push(item.value ?? '');
      }
      lines.push('');
    }
  }

  if (format === 'ai_prompt') {
    return `Проанализируй мои данные FINFlow. Учитывай, что это личная экосистема: день, такси, деньги, сон, фонды, задачи и риски. Не делай выводов сверх данных. Данные ниже уже отфильтрованы по выбранному периоду и построены из актуального local-state.\n\n${lines.join('\n')}`;
  }
  return lines.join('\n');
}

function isKeyInScope(item: FinflowDataKey, scope: FinflowDataScope) {
  return scope.section === 'all'
    || item.section === scope.section
    || (scope.section === 'tasks' && item.section === 'day')
    || (scope.section === 'funds' && item.section === 'day')
    || (scope.section === 'money' && ['records', 'bank', 'templates'].includes(item.section))
    || (scope.section === 'work' && ['records', 'fuel'].includes(item.section))
    || (scope.section === 'ai' && ['day', 'sleep', 'records', 'history'].includes(item.section))
    || (scope.section === 'system' && ['import', 'n8n', 'templates', 'bank'].includes(item.section));
}

function countStoredValue(raw: string | null) {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.records)) return parsed.records.length;
      if (Array.isArray(parsed.rows)) return parsed.rows.length;
      if (Array.isArray(parsed.snapshots)) return parsed.snapshots.length;
      if (Array.isArray(parsed.entries)) return parsed.entries.length;
      return Object.keys(parsed).length;
    }
  } catch {
    return 1;
  }
  return 1;
}

function getBrowserLocalStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}
