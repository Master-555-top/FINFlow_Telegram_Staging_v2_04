export const PRIVATE_IMPORT_BUNDLE_VERSION = 'finflow_private_import_bundle_v2_53' as const;
export const HISTORICAL_LEDGER_VERSION = 'finflow_historical_ledger_v2_53' as const;

export type HistoricalLedgerSection = 'money' | 'work' | 'funds';
export type HistoricalLedgerStatus = 'approved' | 'needs_review' | 'rejected';
export type HistoricalLedgerEntityKind =
  | 'expense'
  | 'income'
  | 'taxi_order'
  | 'taxi_shift'
  | 'fund'
  | 'obligation';

export type HistoricalLedgerRecord = {
  id: string;
  sourceId: string;
  sourceRecordId: string;
  sourceType: 'bank_statement' | 'telegram_expenses' | 'telegram_taxi' | 'manual';
  section: HistoricalLedgerSection;
  entityKind: HistoricalLedgerEntityKind;
  localDate: string;
  occurredAtIso?: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  status: HistoricalLedgerStatus;
  confidence: number;
  duplicateKey: string;
  duplicateOfIds: string[];
  reviewReasons: string[];
  privateLocalOnly: true;
};

export type PrivateImportSource = {
  id: string;
  type: HistoricalLedgerRecord['sourceType'];
  label: string;
  sha256: string;
  recordsCount: number;
  dateFrom?: string;
  dateTo?: string;
};

export type PrivateImportBundle = {
  schemaVersion: typeof PRIVATE_IMPORT_BUNDLE_VERSION;
  bundleId: string;
  createdAtIso: string;
  privacy: 'private_local_only';
  containsPrivateData: true;
  sources: PrivateImportSource[];
  records: HistoricalLedgerRecord[];
  notes?: string[];
};

export type HistoricalLedgerState = {
  schemaVersion: typeof HISTORICAL_LEDGER_VERSION;
  section: HistoricalLedgerSection;
  records: HistoricalLedgerRecord[];
  importedBundleIds: string[];
  updatedAtIso: string;
};

export type HistoricalLedgerBackup = {
  schemaVersion: 'finflow_historical_ledger_backup_v2_53';
  createdAtIso: string;
  privacy: 'private_local_only';
  ledgers: Record<HistoricalLedgerSection, HistoricalLedgerState>;
};

export const HISTORICAL_LEDGER_STORAGE_KEYS: Record<HistoricalLedgerSection, string> = {
  money: 'finflow.historicalMoneyLedger.v2_53',
  work: 'finflow.historicalWorkLedger.v2_53',
  funds: 'finflow.historicalFundsLedger.v2_53'
};

export const HISTORICAL_LEDGER_UPDATED_EVENT = 'finflow:historical-ledger-updated:v2_53';

export type PrivateImportParseResult = {
  bundle: PrivateImportBundle | null;
  errors: string[];
  warnings: string[];
};

const MAX_RECORDS = 10_000;
const MAX_TEXT_LENGTH = 12_000_000;

export function parsePrivateImportBundle(text: string): PrivateImportParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!text.trim()) return { bundle: null, errors: ['Выберите JSON-бundle или вставьте его содержимое.'], warnings };
  if (text.length > MAX_TEXT_LENGTH) return { bundle: null, errors: ['Bundle больше безопасного локального лимита 12 МБ.'], warnings };

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { bundle: null, errors: ['Файл не является корректным JSON.'], warnings };
  }
  if (!isObject(value)) return { bundle: null, errors: ['Корень bundle должен быть объектом.'], warnings };
  if (value.schemaVersion !== PRIVATE_IMPORT_BUNDLE_VERSION) errors.push(`Нужна схема ${PRIVATE_IMPORT_BUNDLE_VERSION}.`);
  if (value.privacy !== 'private_local_only' || value.containsPrivateData !== true) errors.push('Bundle должен быть явно помечен private_local_only.');
  if (!Array.isArray(value.records)) errors.push('В bundle нет массива records.');
  if (!Array.isArray(value.sources)) errors.push('В bundle нет массива sources.');
  if (errors.length) return { bundle: null, errors, warnings };
  const rawRecords = value.records as unknown[];
  const rawSources = value.sources as unknown[];
  if (rawRecords.length > MAX_RECORDS) errors.push(`Слишком много записей: ${rawRecords.length}; лимит ${MAX_RECORDS}.`);

  const records: HistoricalLedgerRecord[] = [];
  rawRecords.forEach((record: unknown, index: number) => {
    const parsed = parseRecord(record);
    if (!parsed) {
      if (errors.length < 20) errors.push(`Некорректная запись #${index + 1}.`);
      return;
    }
    records.push(parsed);
  });
  if (errors.length) return { bundle: null, errors, warnings };

  const sources = rawSources.filter(isPrivateImportSource) as PrivateImportSource[];
  if (sources.length !== rawSources.length) warnings.push('Часть метаданных sources пропущена как некорректная.');
  const duplicateIds = records.length - new Set(records.map(record => record.id)).size;
  if (duplicateIds) errors.push(`В bundle повторяются id: ${duplicateIds}.`);
  const missingSources = records.filter(record => !sources.some(source => source.id === record.sourceId)).length;
  if (missingSources) warnings.push(`${missingSources} записей ссылаются на sourceId без метаданных.`);
  if (errors.length) return { bundle: null, errors, warnings };

  return {
    bundle: {
      schemaVersion: PRIVATE_IMPORT_BUNDLE_VERSION,
      bundleId: cleanString(value.bundleId, 240),
      createdAtIso: cleanString(value.createdAtIso, 80),
      privacy: 'private_local_only',
      containsPrivateData: true,
      sources,
      records,
      notes: Array.isArray(value.notes) ? value.notes.filter(item => typeof item === 'string').map(item => item.slice(0, 500)) : undefined
    },
    errors,
    warnings
  };
}

export function readHistoricalLedger(section: HistoricalLedgerSection, storage: Storage | undefined = getBrowserStorage()): HistoricalLedgerState {
  const empty = createEmptyLedger(section);
  if (!storage) return empty;
  const raw = storage.getItem(HISTORICAL_LEDGER_STORAGE_KEYS[section]);
  if (!raw) return empty;
  return parseHistoricalLedgerStateRaw(section, raw);
}

export function parseHistoricalLedgerStateRaw(section: HistoricalLedgerSection, raw: string): HistoricalLedgerState {
  const empty = createEmptyLedger(section);
  try {
    const parsed = JSON.parse(raw) as Partial<HistoricalLedgerState> & { format?: string; rows?: unknown[] };
    if (parsed.schemaVersion !== HISTORICAL_LEDGER_VERSION || parsed.section !== section) return empty;
    const sourceRecords = Array.isArray(parsed.records)
      ? parsed.records
      : parsed.format === 'compact_rows_v1' && Array.isArray(parsed.rows)
        ? parsed.rows.map(row => expandCompactRow(row, section))
        : [];
    return {
      ...empty,
      records: sourceRecords.map(parseRecord).filter((record): record is HistoricalLedgerRecord => Boolean(record)),
      importedBundleIds: Array.isArray(parsed.importedBundleIds) ? parsed.importedBundleIds.filter(item => typeof item === 'string').slice(-50) : [],
      updatedAtIso: typeof parsed.updatedAtIso === 'string' ? parsed.updatedAtIso : empty.updatedAtIso
    };
  } catch {
    return empty;
  }
}

export function mergePrivateBundleIntoLedgers(bundle: PrivateImportBundle, storage: Storage | undefined = getBrowserStorage()) {
  const previous = readAllHistoricalLedgers(storage);
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const next = { ...previous };

  for (const section of ['money', 'work', 'funds'] as const) {
    const state = previous[section];
    const byId = new Map(state.records.map(record => [record.id, record]));
    const bySourceRecord = new Map(state.records.map(record => [`${record.sourceId}|${record.sourceRecordId}`, record.id]));
    for (const record of bundle.records.filter(item => item.section === section)) {
      const sourceKey = `${record.sourceId}|${record.sourceRecordId}`;
      const existingId = byId.has(record.id) ? record.id : bySourceRecord.get(sourceKey);
      if (!existingId) {
        byId.set(record.id, record);
        bySourceRecord.set(sourceKey, record.id);
        added += 1;
      } else {
        const existing = byId.get(existingId);
        if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
          byId.set(existingId, { ...record, id: existingId });
          updated += 1;
        } else {
          skipped += 1;
        }
      }
    }
    next[section] = {
      ...state,
      records: [...byId.values()].sort(sortLedgerRecords),
      importedBundleIds: Array.from(new Set([...state.importedBundleIds, bundle.bundleId])).slice(-50),
      updatedAtIso: new Date().toISOString()
    };
  }
  const persisted = writeAllHistoricalLedgers(next, storage);
  return { next: persisted ? next : previous, added: persisted ? added : 0, updated: persisted ? updated : 0, skipped, persisted };
}

export function readAllHistoricalLedgers(storage: Storage | undefined = getBrowserStorage()) {
  return {
    money: readHistoricalLedger('money', storage),
    work: readHistoricalLedger('work', storage),
    funds: readHistoricalLedger('funds', storage)
  };
}

export function writeAllHistoricalLedgers(
  states: Record<HistoricalLedgerSection, HistoricalLedgerState>,
  storage: Storage | undefined = getBrowserStorage()
) {
  if (!storage) return false;
  const previous = Object.fromEntries(
    (['money', 'work', 'funds'] as const).map(section => [section, storage.getItem(HISTORICAL_LEDGER_STORAGE_KEYS[section])])
  ) as Record<HistoricalLedgerSection, string | null>;
  try {
    for (const section of ['money', 'work', 'funds'] as const) {
      storage.setItem(HISTORICAL_LEDGER_STORAGE_KEYS[section], serializeHistoricalLedgerState(states[section]));
    }
  } catch {
    for (const section of ['money', 'work', 'funds'] as const) {
      const raw = previous[section];
      try {
        if (raw === null) storage.removeItem(HISTORICAL_LEDGER_STORAGE_KEYS[section]);
        else storage.setItem(HISTORICAL_LEDGER_STORAGE_KEYS[section], raw);
      } catch {
        // Best-effort atomic rollback when the browser quota is exhausted.
      }
    }
    return false;
  }
  notifyHistoricalLedgerUpdated();
  return true;
}

export function updateHistoricalLedgerRecord(record: HistoricalLedgerRecord, storage: Storage | undefined = getBrowserStorage()) {
  const states = readAllHistoricalLedgers(storage);
  const now = new Date().toISOString();
  for (const section of ['money', 'work', 'funds'] as const) {
    const withoutRecord = states[section].records.filter(item => item.id !== record.id);
    states[section] = {
      ...states[section],
      records: (section === record.section ? [...withoutRecord, record] : withoutRecord).sort(sortLedgerRecords),
      updatedAtIso: now
    };
  }
  const persisted = writeAllHistoricalLedgers(states, storage);
  return { states: persisted ? states : readAllHistoricalLedgers(storage), persisted };
}

export function createHistoricalLedgerExport(storage: Storage | undefined = getBrowserStorage()) {
  const ledgers = readAllHistoricalLedgers(storage);
  return JSON.stringify({
    schemaVersion: 'finflow_historical_ledger_backup_v2_53',
    createdAtIso: new Date().toISOString(),
    privacy: 'private_local_only',
    ledgers
  }, null, 2);
}

export function serializeHistoricalLedgerState(state: HistoricalLedgerState) {
  return JSON.stringify({
    schemaVersion: HISTORICAL_LEDGER_VERSION,
    section: state.section,
    format: 'compact_rows_v1',
    rows: state.records.map(compactRecord),
    importedBundleIds: state.importedBundleIds,
    updatedAtIso: state.updatedAtIso
  });
}

export function parseHistoricalLedgerBackup(text: string): { backup: HistoricalLedgerBackup | null; error?: string } {
  if (!text.trim()) return { backup: null };
  try {
    const value = JSON.parse(text) as Partial<HistoricalLedgerBackup>;
    if (value.schemaVersion !== 'finflow_historical_ledger_backup_v2_53') return { backup: null };
    if (value.privacy !== 'private_local_only' || !isObject(value.ledgers)) {
      return { backup: null, error: 'Исторический backup повреждён или не помечен private_local_only.' };
    }
    const ledgers = {} as Record<HistoricalLedgerSection, HistoricalLedgerState>;
    for (const section of ['money', 'work', 'funds'] as const) {
      const candidate = value.ledgers[section];
      if (!isObject(candidate) || !Array.isArray(candidate.records)) {
        return { backup: null, error: `В backup отсутствует реестр ${section}.` };
      }
      const records = candidate.records.map(parseRecord).filter((record): record is HistoricalLedgerRecord => Boolean(record));
      if (records.length !== candidate.records.length) {
        return { backup: null, error: `В реестре ${section} есть некорректные записи.` };
      }
      ledgers[section] = {
        schemaVersion: HISTORICAL_LEDGER_VERSION,
        section,
        records,
        importedBundleIds: Array.isArray(candidate.importedBundleIds)
          ? candidate.importedBundleIds.filter(item => typeof item === 'string').slice(-50)
          : [],
        updatedAtIso: typeof candidate.updatedAtIso === 'string' ? candidate.updatedAtIso : new Date().toISOString()
      };
    }
    return {
      backup: {
        schemaVersion: 'finflow_historical_ledger_backup_v2_53',
        createdAtIso: typeof value.createdAtIso === 'string' ? value.createdAtIso : new Date().toISOString(),
        privacy: 'private_local_only',
        ledgers
      }
    };
  } catch {
    return { backup: null };
  }
}

export function restoreHistoricalLedgerBackup(backup: HistoricalLedgerBackup, storage: Storage | undefined = getBrowserStorage()) {
  return writeAllHistoricalLedgers(backup.ledgers, storage);
}

export function createManualHistoricalRecord(section: HistoricalLedgerSection = 'money'): HistoricalLedgerRecord {
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const token = `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: `manual-${token}`,
    sourceId: 'manual-local',
    sourceRecordId: token,
    sourceType: 'manual',
    section,
    entityKind: section === 'work' ? 'taxi_order' : section === 'funds' ? 'fund' : 'expense',
    localDate,
    occurredAtIso: now.toISOString(),
    title: '',
    amount: 0,
    category: section === 'work' ? 'taxi_income' : section === 'funds' ? 'fund_contribution' : 'other',
    note: '',
    status: 'needs_review',
    confidence: 1,
    duplicateKey: `manual|${token}`,
    duplicateOfIds: [],
    reviewReasons: ['Ручная запись: проверьте дату, тип, сумму и категорию перед подтверждением.'],
    privateLocalOnly: true
  };
}

function createEmptyLedger(section: HistoricalLedgerSection): HistoricalLedgerState {
  return {
    schemaVersion: HISTORICAL_LEDGER_VERSION,
    section,
    records: [],
    importedBundleIds: [],
    updatedAtIso: new Date(0).toISOString()
  };
}

function parseRecord(value: unknown): HistoricalLedgerRecord | null {
  if (!isObject(value)) return null;
  if (!['money', 'work', 'funds'].includes(String(value.section))) return null;
  if (!['approved', 'needs_review', 'rejected'].includes(String(value.status))) return null;
  if (!['expense', 'income', 'taxi_order', 'taxi_shift', 'fund', 'obligation'].includes(String(value.entityKind))) return null;
  if (!['bank_statement', 'telegram_expenses', 'telegram_taxi', 'manual'].includes(String(value.sourceType))) return null;
  const amount = Number(value.amount);
  const confidence = Number(value.confidence);
  const localDate = cleanString(value.localDate, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(confidence)) return null;
  return {
    id: cleanString(value.id, 240),
    sourceId: cleanString(value.sourceId, 240),
    sourceRecordId: cleanString(value.sourceRecordId, 240),
    sourceType: value.sourceType as HistoricalLedgerRecord['sourceType'],
    section: value.section as HistoricalLedgerSection,
    entityKind: value.entityKind as HistoricalLedgerEntityKind,
    localDate,
    occurredAtIso: typeof value.occurredAtIso === 'string' ? value.occurredAtIso.slice(0, 80) : undefined,
    title: cleanString(value.title, 500),
    amount,
    category: cleanString(value.category, 160),
    note: cleanString(value.note, 2_000),
    status: value.status as HistoricalLedgerStatus,
    confidence: Math.max(0, Math.min(1, confidence)),
    duplicateKey: cleanString(value.duplicateKey, 500),
    duplicateOfIds: Array.isArray(value.duplicateOfIds) ? value.duplicateOfIds.filter(item => typeof item === 'string').slice(0, 20) : [],
    reviewReasons: Array.isArray(value.reviewReasons) ? value.reviewReasons.filter(item => typeof item === 'string').map(item => item.slice(0, 500)).slice(0, 20) : [],
    privateLocalOnly: true
  };
}

function compactRecord(record: HistoricalLedgerRecord) {
  return [
    record.id,
    record.sourceId,
    record.sourceRecordId,
    record.sourceType,
    record.entityKind,
    record.localDate,
    record.occurredAtIso ?? '',
    record.title,
    record.amount,
    record.category,
    record.note,
    record.status,
    record.confidence,
    record.duplicateKey,
    record.duplicateOfIds,
    record.reviewReasons
  ];
}

function expandCompactRow(value: unknown, section: HistoricalLedgerSection) {
  if (!Array.isArray(value) || value.length < 16) return null;
  return {
    id: value[0],
    sourceId: value[1],
    sourceRecordId: value[2],
    sourceType: value[3],
    section,
    entityKind: value[4],
    localDate: value[5],
    occurredAtIso: value[6] || undefined,
    title: value[7],
    amount: value[8],
    category: value[9],
    note: value[10],
    status: value[11],
    confidence: value[12],
    duplicateKey: value[13],
    duplicateOfIds: value[14],
    reviewReasons: value[15],
    privateLocalOnly: true
  };
}

function isPrivateImportSource(value: unknown): value is PrivateImportSource {
  return isObject(value)
    && typeof value.id === 'string'
    && typeof value.type === 'string'
    && typeof value.label === 'string'
    && typeof value.sha256 === 'string'
    && typeof value.recordsCount === 'number';
}

function sortLedgerRecords(a: HistoricalLedgerRecord, b: HistoricalLedgerRecord) {
  return `${b.localDate}:${b.occurredAtIso ?? ''}:${b.id}`.localeCompare(`${a.localDate}:${a.occurredAtIso ?? ''}:${a.id}`);
}

function notifyHistoricalLedgerUpdated() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(HISTORICAL_LEDGER_UPDATED_EVENT));
}

function getBrowserStorage() {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
