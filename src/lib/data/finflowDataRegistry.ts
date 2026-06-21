export type FinflowDataSection = 'all' | 'day' | 'records' | 'sleep' | 'history' | 'fuel' | 'bank' | 'templates' | 'tasks' | 'funds';

export type FinflowDataKey = {
  key: string;
  label: string;
  section: FinflowDataSection;
  periodField?: string;
};

export const FINFLOW_DATA_KEYS: FinflowDataKey[] = [
  { key: 'finflow.dailyQuickInput.v1_47', label: 'День / фонды / задачи', section: 'day', periodField: 'localDate' },
  { key: 'finflow.dailyRecords.v1_47', label: 'Записи доходов/расходов/смен', section: 'records', periodField: 'createdAtIso' },
  { key: 'finflow.customRecordTemplates.v1_47', label: 'Шаблоны записей', section: 'templates' },
  { key: 'finflow.bankCandidateDecisions.v1_47', label: 'Bank review решения', section: 'bank' },
  { key: 'finflow_sleep_records_v2_17', label: 'Сон: история', section: 'sleep', periodField: 'toDate' },
  { key: 'finflow_sleep_live_session_v2_17', label: 'Сон: активная сессия', section: 'sleep', periodField: 'fromDate' },
  { key: 'finflow.dailyHistory.v1_47', label: 'История дневных снимков', section: 'history', periodField: 'snapshots.localDate' },
  { key: 'finflow.activeDaySession.v2_01', label: 'Активный день', section: 'day', periodField: 'activeLocalDate' },
  { key: 'finflow.activeDayRolloverArchive.v2_01', label: 'Rollover archive', section: 'history', periodField: 'entries.previousLocalDate' },
  { key: 'finflow.editableFuelInputs.v1_64', label: 'Топливо: текущие параметры', section: 'fuel' },
  { key: 'finflow.fuelOdometerHistory.v1_66', label: 'Топливо: история пробега', section: 'fuel', periodField: 'entries.createdAtIso' }
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
  bytes: number;
  willReset: boolean;
};

export type FinflowDataPreview = {
  generatedAtIso: string;
  scope: FinflowDataScope;
  items: FinflowDataPreviewItem[];
  totalCount: number;
  totalBytes: number;
};

export type FinflowResetBackup = {
  id: string;
  createdAtIso: string;
  scope: FinflowDataScope;
  values: { key: string; value: string | null }[];
};

export const FINFLOW_LAST_RESET_BACKUP_KEY = 'finflow.lastResetBackup.v2_26';

export function buildFinflowDataPreview(scope: FinflowDataScope, storage: Storage | undefined = getBrowserLocalStorage()): FinflowDataPreview {
  const items = FINFLOW_DATA_KEYS.map(item => {
    const raw = storage?.getItem(item.key) ?? null;
    const bytes = raw ? raw.length : 0;
    return {
      key: item.key,
      label: item.label,
      section: item.section,
      count: countStoredValue(raw),
      bytes,
      willReset: raw !== null && isKeyInScope(item, scope)
    };
  });
  const resetItems = items.filter(item => item.willReset);
  return {
    generatedAtIso: new Date().toISOString(),
    scope,
    items,
    totalCount: resetItems.reduce((sum, item) => sum + item.count, 0),
    totalBytes: resetItems.reduce((sum, item) => sum + item.bytes, 0)
  };
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
  storage.setItem(FINFLOW_LAST_RESET_BACKUP_KEY, JSON.stringify(backup));
  for (const item of FINFLOW_DATA_KEYS) {
    if (isKeyInScope(item, scope)) storage.removeItem(item.key);
  }
  return backup;
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
    .map(item => ({ ...item, value: storage?.getItem(item.key) ?? null }))
    .filter(item => item.value !== null);
  if (format === 'json') return JSON.stringify({ version: 'finflow_storage_export_v2_26', exportedAtIso: new Date().toISOString(), scope, values }, null, 2);
  const lines = [
    `FINFlow data export v2.26`,
    `Scope: ${scope.section} / ${scope.period} / ${scope.anchorDateIso}`,
    `Blocks: ${values.length}`,
    `Records approx: ${preview.totalCount}`,
    ''
  ];
  for (const item of values) {
    lines.push(`## ${item.label}`);
    if (format === 'summary') lines.push(`key=${item.key}; bytes=${item.value?.length ?? 0}; count=${countStoredValue(item.value)}`);
    else lines.push(item.value ?? '');
    lines.push('');
  }
  if (format === 'ai_prompt') {
    return `Проанализируй мои данные FINFlow. Учитывай, что это личная экосистема: день, такси, деньги, сон, фонды, задачи и риски. Не делай выводов сверх данных.\n\n${lines.join('\n')}`;
  }
  return lines.join('\n');
}

function isKeyInScope(item: FinflowDataKey, scope: FinflowDataScope) {
  return scope.section === 'all' || item.section === scope.section || (scope.section === 'tasks' && item.section === 'day');
}

function countStoredValue(raw: string | null) {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.records)) return parsed.records.length;
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
