import { importReviewQueueMock, type ImportCandidate, type ImportReviewQueue } from '@/lib/import-review/importReviewQueueModel';
import type { ImportReviewAuditEvent } from '@/lib/import-review/importReviewActions';

export const IMPORT_REVIEW_PERSISTENCE_VERSION = 'import_review_persistence_v1_28' as const;

export type ImportReviewPersistenceStatus = 'browser_local' | 'supabase_ready' | 'sync_required' | 'unavailable';

export type ImportReviewPersistedState = {
  schemaVersion: typeof IMPORT_REVIEW_PERSISTENCE_VERSION;
  queue: ImportReviewQueue;
  auditEvents: ImportReviewAuditEvent[];
  updatedAt: string;
  lastSyncedAt?: string;
  storageMode: ImportReviewPersistenceStatus;
};

export type ImportReviewStorageAdapter = {
  read(): ImportReviewPersistedState | null;
  write(state: ImportReviewPersistedState): void;
  clear(): void;
  isAvailable(): boolean;
};

const storageKey = 'finflow.importReviewQueue.v1_28';

export const browserLocalImportReviewAdapter: ImportReviewStorageAdapter = {
  read() {
    if (!this.isAvailable()) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ImportReviewPersistedState;
      if (parsed.schemaVersion !== IMPORT_REVIEW_PERSISTENCE_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  write(state) {
    if (!this.isAvailable()) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  },

  clear() {
    if (!this.isAvailable()) return;
    window.localStorage.removeItem(storageKey);
  },

  isAvailable() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
};

export function createInitialImportReviewState(now: string = new Date().toISOString()): ImportReviewPersistedState {
  return {
    schemaVersion: IMPORT_REVIEW_PERSISTENCE_VERSION,
    queue: {
      ...importReviewQueueMock,
      schemaVersion: 'import_review_queue_v1_28',
      sourcePackage: 'FINFlow_v3_Latest_Working_Package_v1_28.zip',
      candidates: importReviewQueueMock.candidates
    },
    auditEvents: [],
    updatedAt: now,
    storageMode: 'browser_local'
  };
}

export function buildPersistedImportReviewState(
  candidates: ImportCandidate[],
  auditEvents: ImportReviewAuditEvent[],
  previousState?: ImportReviewPersistedState | null,
  now: string = new Date().toISOString()
): ImportReviewPersistedState {
  const base = previousState ?? createInitialImportReviewState(now);

  return {
    ...base,
    schemaVersion: IMPORT_REVIEW_PERSISTENCE_VERSION,
    queue: {
      ...base.queue,
      schemaVersion: 'import_review_queue_v1_28',
      sourcePackage: 'FINFlow_v3_Latest_Working_Package_v1_28.zip',
      candidates
    },
    auditEvents,
    updatedAt: now,
    storageMode: browserLocalImportReviewAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function getImportReviewSyncLabel(status: ImportReviewPersistenceStatus): string {
  const labels: Record<ImportReviewPersistenceStatus, string> = {
    browser_local: 'сохранено локально',
    supabase_ready: 'готово к Supabase',
    sync_required: 'нужна синхронизация',
    unavailable: 'хранилище недоступно'
  };
  return labels[status];
}

export function resetImportReviewPersistence(adapter: ImportReviewStorageAdapter = browserLocalImportReviewAdapter) {
  adapter.clear();
  return createInitialImportReviewState();
}
