export const FINFLOW_LOCAL_BACKUP_VERSION = 'finflow_local_backup_v1_90' as const;
export const FINFLOW_LOCAL_BACKUP_APP_VERSION = '0.1.90' as const;
export const FINFLOW_BACKUP_MAX_FILE_BYTES = 5_000_000;
export const FINFLOW_BACKUP_MAX_TOTAL_VALUE_BYTES = 4_000_000;
export const FINFLOW_BACKUP_MAX_ENTRIES = 100;

export type FinflowLocalBackupEntry = {
  key: string;
  value: string;
};

export type FinflowLocalBackup = {
  schemaVersion: typeof FINFLOW_LOCAL_BACKUP_VERSION;
  appVersion: string;
  createdAt: string;
  mode: 'merge_only';
  entries: FinflowLocalBackupEntry[];
  checksum: string;
};

export type FinflowBackupPreview = {
  totalEntries: number;
  newEntries: number;
  changedEntries: number;
  unchangedEntries: number;
  totalValueBytes: number;
};

export type FinflowBackupRollbackSnapshot = {
  schemaVersion: 'finflow_backup_rollback_v1_90';
  createdAt: string;
  entries: Array<{ key: string; value: string | null }>;
};

export type FinflowBackupParseResult =
  | { ok: true; backup: FinflowLocalBackup }
  | { ok: false; reason: string };

type StorageReader = Pick<Storage, 'length' | 'key' | 'getItem'>;
type StorageWriter = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createFinflowLocalBackup(
  storage: StorageReader,
  now: string = new Date().toISOString()
): FinflowLocalBackup {
  const entries: FinflowLocalBackupEntry[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isAllowedFinflowStorageKey(key)) continue;
    const value = storage.getItem(key);
    if (value === null) continue;
    entries.push({ key, value });
  }

  entries.sort(compareStorageKeys);
  if (entries.length > FINFLOW_BACKUP_MAX_ENTRIES) {
    throw new Error('too_many_finflow_storage_entries');
  }
  if (measureEntries(entries) > FINFLOW_BACKUP_MAX_TOTAL_VALUE_BYTES) {
    throw new Error('finflow_storage_backup_too_large');
  }

  const base = {
    schemaVersion: FINFLOW_LOCAL_BACKUP_VERSION,
    appVersion: FINFLOW_LOCAL_BACKUP_APP_VERSION,
    createdAt: now,
    mode: 'merge_only' as const,
    entries
  };

  return {
    ...base,
    checksum: calculateBackupChecksum(base)
  };
}

export function serializeFinflowLocalBackup(backup: FinflowLocalBackup) {
  return JSON.stringify(backup, null, 2);
}

export function parseFinflowLocalBackup(raw: string): FinflowBackupParseResult {
  if (utf8ByteLength(raw) > FINFLOW_BACKUP_MAX_FILE_BYTES) {
    return { ok: false, reason: 'backup_file_too_large' };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_backup_json' };
  }

  if (!isObject(value)) return { ok: false, reason: 'invalid_backup_root' };
  if (value.schemaVersion !== FINFLOW_LOCAL_BACKUP_VERSION) {
    return { ok: false, reason: 'unsupported_backup_schema' };
  }
  if (value.mode !== 'merge_only') return { ok: false, reason: 'unsupported_restore_mode' };
  if (typeof value.appVersion !== 'string' || value.appVersion.length > 40) {
    return { ok: false, reason: 'invalid_backup_app_version' };
  }
  if (typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) {
    return { ok: false, reason: 'invalid_backup_created_at' };
  }
  if (!Array.isArray(value.entries) || value.entries.length > FINFLOW_BACKUP_MAX_ENTRIES) {
    return { ok: false, reason: 'invalid_backup_entries' };
  }
  if (typeof value.checksum !== 'string') return { ok: false, reason: 'missing_backup_checksum' };

  const seen = new Set<string>();
  const entries: FinflowLocalBackupEntry[] = [];
  for (const candidate of value.entries) {
    if (!isObject(candidate) || typeof candidate.key !== 'string' || typeof candidate.value !== 'string') {
      return { ok: false, reason: 'invalid_backup_entry' };
    }
    if (!isAllowedFinflowStorageKey(candidate.key)) {
      return { ok: false, reason: 'backup_contains_disallowed_key' };
    }
    if (seen.has(candidate.key)) return { ok: false, reason: 'backup_contains_duplicate_key' };
    seen.add(candidate.key);
    entries.push({ key: candidate.key, value: candidate.value });
  }

  entries.sort(compareStorageKeys);
  if (measureEntries(entries) > FINFLOW_BACKUP_MAX_TOTAL_VALUE_BYTES) {
    return { ok: false, reason: 'backup_values_too_large' };
  }

  const base = {
    schemaVersion: FINFLOW_LOCAL_BACKUP_VERSION,
    appVersion: value.appVersion,
    createdAt: value.createdAt,
    mode: 'merge_only' as const,
    entries
  };
  const expectedChecksum = calculateBackupChecksum(base);
  if (value.checksum !== expectedChecksum) {
    return { ok: false, reason: 'backup_checksum_mismatch' };
  }

  return { ok: true, backup: { ...base, checksum: expectedChecksum } };
}

export function previewFinflowBackupRestore(
  storage: Pick<Storage, 'getItem'>,
  backup: FinflowLocalBackup
): FinflowBackupPreview {
  let newEntries = 0;
  let changedEntries = 0;
  let unchangedEntries = 0;

  for (const entry of backup.entries) {
    const current = storage.getItem(entry.key);
    if (current === null) newEntries += 1;
    else if (current === entry.value) unchangedEntries += 1;
    else changedEntries += 1;
  }

  return {
    totalEntries: backup.entries.length,
    newEntries,
    changedEntries,
    unchangedEntries,
    totalValueBytes: measureEntries(backup.entries)
  };
}

export function applyFinflowBackupRestore(storage: StorageWriter, backup: FinflowLocalBackup) {
  const rollback = createRollbackSnapshot(storage, backup);
  try {
    for (const entry of backup.entries) storage.setItem(entry.key, entry.value);
    return { ok: true as const, rollback, appliedEntries: backup.entries.length };
  } catch {
    restoreRollbackSnapshot(storage, rollback);
    return { ok: false as const, reason: 'local_storage_write_failed_and_rolled_back' };
  }
}

export function restoreRollbackSnapshot(storage: StorageWriter, snapshot: FinflowBackupRollbackSnapshot) {
  try {
    for (const entry of snapshot.entries) {
      if (entry.value === null) storage.removeItem(entry.key);
      else storage.setItem(entry.key, entry.value);
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: 'rollback_write_failed' };
  }
}

export function parseRollbackSnapshot(raw: string | null): FinflowBackupRollbackSnapshot | null {
  if (!raw || utf8ByteLength(raw) > FINFLOW_BACKUP_MAX_FILE_BYTES) return null;
  try {
    const parsed = JSON.parse(raw) as FinflowBackupRollbackSnapshot;
    if (parsed.schemaVersion !== 'finflow_backup_rollback_v1_90') return null;
    if (!Array.isArray(parsed.entries) || parsed.entries.length > FINFLOW_BACKUP_MAX_ENTRIES) return null;
    if (typeof parsed.createdAt !== 'string') return null;
    const entries: FinflowBackupRollbackSnapshot['entries'] = [];
    for (const entry of parsed.entries) {
      if (!entry || !isAllowedFinflowStorageKey(entry.key)) return null;
      if (entry.value !== null && typeof entry.value !== 'string') return null;
      entries.push({ key: entry.key, value: entry.value });
    }
    return { schemaVersion: 'finflow_backup_rollback_v1_90', createdAt: parsed.createdAt, entries };
  } catch {
    return null;
  }
}

export function isAllowedFinflowStorageKey(key: string) {
  return /^finflow(?:\.|_)[A-Za-z0-9._-]{1,180}$/.test(key);
}

function createRollbackSnapshot(
  storage: Pick<Storage, 'getItem'>,
  backup: FinflowLocalBackup
): FinflowBackupRollbackSnapshot {
  return {
    schemaVersion: 'finflow_backup_rollback_v1_90',
    createdAt: new Date().toISOString(),
    entries: backup.entries.map(entry => ({ key: entry.key, value: storage.getItem(entry.key) }))
  };
}

function calculateBackupChecksum(input: Omit<FinflowLocalBackup, 'checksum'>) {
  const canonical = [
    input.schemaVersion,
    input.appVersion,
    input.createdAt,
    input.mode,
    ...input.entries.flatMap(entry => [entry.key, entry.value])
  ].join('\u0000');
  return `fnv1a32:${fnv1a32(canonical)}`;
}

function fnv1a32(value: string) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function measureEntries(entries: FinflowLocalBackupEntry[]) {
  return entries.reduce((sum, entry) => sum + utf8ByteLength(entry.key) + utf8ByteLength(entry.value), 0);
}

function compareStorageKeys(left: FinflowLocalBackupEntry, right: FinflowLocalBackupEntry) {
  return left.key < right.key ? -1 : left.key > right.key ? 1 : 0;
}

function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
