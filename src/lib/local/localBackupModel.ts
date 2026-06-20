import { parseFinflowCloudDayDocument, type FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';

export const LOCAL_BACKUP_MODEL_VERSION = 'local_backup_model_v1_87' as const;
export const LOCAL_BACKUP_STORAGE_KEY = 'finflow.localBackups.v1_87';

export type LocalFinflowBackupEntry = {
  id: string;
  schemaVersion: typeof LOCAL_BACKUP_MODEL_VERSION;
  label: string;
  createdAt: string;
  document: FinflowCloudDayDocument;
  note: string;
};

export type LocalFinflowBackupState = {
  schemaVersion: typeof LOCAL_BACKUP_MODEL_VERSION;
  backups: LocalFinflowBackupEntry[];
  updatedAt: string;
};

export type LocalBackupSummary = {
  total: number;
  latestBackupAt: string | null;
  latestLabel: string | null;
};

export function createInitialLocalBackupState(now: string = new Date().toISOString()): LocalFinflowBackupState {
  return {
    schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
    backups: [],
    updatedAt: now
  };
}

export function parseLocalBackupState(raw: string | null): LocalFinflowBackupState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as LocalFinflowBackupState;
    if (parsed.schemaVersion !== LOCAL_BACKUP_MODEL_VERSION) return null;
    if (!Array.isArray(parsed.backups)) return null;

    return {
      schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
      backups: parsed.backups.filter(isBackupEntry).slice(0, 50),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function createLocalBackupEntry(input: {
  document: FinflowCloudDayDocument;
  label?: string;
  note?: string;
  now?: string;
}): LocalFinflowBackupEntry {
  const now = input.now ?? new Date().toISOString();
  return {
    id: `local_backup_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
    label: sanitizeText(input.label || `Backup ${input.document.dayInput.localDate} ${now.slice(11, 16)}`, 80),
    createdAt: now,
    document: input.document,
    note: sanitizeText(input.note ?? '', 500)
  };
}

export function addLocalBackup(input: {
  state: LocalFinflowBackupState;
  backup: LocalFinflowBackupEntry;
  limit?: number;
  now?: string;
}): LocalFinflowBackupState {
  const limit = input.limit ?? 15;
  const now = input.now ?? new Date().toISOString();
  return {
    schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
    backups: [
      input.backup,
      ...input.state.backups.filter(backup => backup.id !== input.backup.id)
    ].slice(0, limit),
    updatedAt: now
  };
}

export function deleteLocalBackup(input: {
  state: LocalFinflowBackupState;
  backupId: string;
  now?: string;
}): LocalFinflowBackupState {
  return {
    schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
    backups: input.state.backups.filter(backup => backup.id !== input.backupId),
    updatedAt: input.now ?? new Date().toISOString()
  };
}

export function summarizeLocalBackups(state: LocalFinflowBackupState): LocalBackupSummary {
  const sorted = [...state.backups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = sorted[0] ?? null;
  return {
    total: state.backups.length,
    latestBackupAt: latest?.createdAt ?? null,
    latestLabel: latest?.label ?? null
  };
}

export function exportLocalBackupAsJson(backup: LocalFinflowBackupEntry) {
  return JSON.stringify({
    schemaVersion: LOCAL_BACKUP_MODEL_VERSION,
    exportedAt: new Date().toISOString(),
    backup: {
      ...backup,
      note: sanitizeText(backup.note, 500)
    },
    warning: 'No secrets should be stored in backups. Do not include .env.local, tokens, bank raw PDFs/CSVs or private_raw_data.'
  }, null, 2);
}

export function parseImportedLocalBackup(raw: string): LocalFinflowBackupEntry | null {
  try {
    const parsed = JSON.parse(raw) as { backup?: LocalFinflowBackupEntry } | LocalFinflowBackupEntry;
    const candidate = 'backup' in parsed && parsed.backup ? parsed.backup : parsed;
    if (!isBackupEntry(candidate)) return null;
    return {
      ...candidate,
      id: `imported_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      label: sanitizeText(`Imported: ${candidate.label}`, 80),
      note: sanitizeText(candidate.note, 500),
      createdAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function isBackupEntry(value: unknown): value is LocalFinflowBackupEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as LocalFinflowBackupEntry;
  return entry.schemaVersion === LOCAL_BACKUP_MODEL_VERSION
    && typeof entry.id === 'string'
    && typeof entry.label === 'string'
    && typeof entry.createdAt === 'string'
    && typeof entry.note === 'string'
    && Boolean(parseFinflowCloudDayDocument(entry.document));
}

function sanitizeText(value: string, maxLength: number) {
  return String(value ?? '')
    .replace(/(service[_-]?role|bot[_-]?token|openai|api[_-]?key|telegram[_-]?bot[_-]?token)/gi, '[secret-name-redacted]')
    .replace(/eyJ[a-zA-Z0-9_\-.]+/g, '[jwt-like-token-redacted]')
    .replace(/[A-Za-z0-9_\-]{40,}/g, '[long-token-redacted]')
    .slice(0, maxLength);
}
