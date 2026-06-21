import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { LocalApplyAuditEvent, LocalApplyBatch } from '@/lib/apply/localApplyEngine';

export const LOCAL_APPLY_PERSISTENCE_VERSION = 'local_apply_persistence_v2_42' as const;
export const LOCAL_APPLY_STORAGE_KEY = 'finflow.localApply.v2_42';

export type LocalApplyPersistedState = {
  schemaVersion: typeof LOCAL_APPLY_PERSISTENCE_VERSION;
  updatedAtIso: string;
  records: DailyRecord[];
  batches: LocalApplyBatch[];
  auditEvents: LocalApplyAuditEvent[];
  storageMode: 'browser_local' | 'unavailable';
};

export type LocalApplyStorageAdapter = {
  read(): LocalApplyPersistedState | null;
  write(state: LocalApplyPersistedState): void;
  clear(): void;
  isAvailable(): boolean;
};

export const browserLocalApplyAdapter: LocalApplyStorageAdapter = {
  read() {
    if (!this.isAvailable()) return null;
    const raw = window.localStorage.getItem(LOCAL_APPLY_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<LocalApplyPersistedState>;
      if (parsed.schemaVersion !== LOCAL_APPLY_PERSISTENCE_VERSION) return null;
      if (!Array.isArray(parsed.records) || !Array.isArray(parsed.batches) || !Array.isArray(parsed.auditEvents)) return null;
      return {
        schemaVersion: LOCAL_APPLY_PERSISTENCE_VERSION,
        updatedAtIso: typeof parsed.updatedAtIso === 'string' ? parsed.updatedAtIso : new Date().toISOString(),
        records: parsed.records,
        batches: parsed.batches,
        auditEvents: parsed.auditEvents,
        storageMode: 'browser_local'
      };
    } catch {
      return null;
    }
  },

  write(state) {
    if (!this.isAvailable()) return;
    window.localStorage.setItem(LOCAL_APPLY_STORAGE_KEY, JSON.stringify(state));
  },

  clear() {
    if (!this.isAvailable()) return;
    window.localStorage.removeItem(LOCAL_APPLY_STORAGE_KEY);
  },

  isAvailable() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
};

export function createInitialLocalApplyState(records: DailyRecord[], nowIso = new Date().toISOString()): LocalApplyPersistedState {
  return {
    schemaVersion: LOCAL_APPLY_PERSISTENCE_VERSION,
    updatedAtIso: nowIso,
    records,
    batches: [],
    auditEvents: [],
    storageMode: browserLocalApplyAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function buildNextLocalApplyState(input: {
  previous: LocalApplyPersistedState;
  records: DailyRecord[];
  batches?: LocalApplyBatch[];
  auditEvents?: LocalApplyAuditEvent[];
  nowIso?: string;
}): LocalApplyPersistedState {
  return {
    ...input.previous,
    schemaVersion: LOCAL_APPLY_PERSISTENCE_VERSION,
    updatedAtIso: input.nowIso ?? new Date().toISOString(),
    records: input.records,
    batches: input.batches ?? input.previous.batches,
    auditEvents: input.auditEvents ?? input.previous.auditEvents,
    storageMode: browserLocalApplyAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function getLocalApplyStorageLabel(state: LocalApplyPersistedState) {
  if (state.storageMode === 'browser_local') return 'Local Apply сохранён в браузере';
  return 'Local Apply storage недоступен';
}
