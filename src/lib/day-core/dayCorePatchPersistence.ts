import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DayCoreApplyHistoryEvent } from '@/lib/day-core/dayCoreApplyLayer';
import type { ImportReviewAuditEvent } from '@/lib/import-review/importReviewActions';

export const DAY_CORE_PATCH_PERSISTENCE_VERSION = 'day_core_patch_persistence_v1_28' as const;

export type DayCoreAppliedPatchRecord = {
  id: string;
  schemaVersion: typeof DAY_CORE_PATCH_PERSISTENCE_VERSION;
  candidateId: string;
  dayId: string;
  appliedAt: string;
  beforeDayCore: DayCoreInputModel;
  afterDayCore: DayCoreInputModel;
  historyEvent: DayCoreApplyHistoryEvent;
  rolledBackAt?: string;
  rollbackAuditNote?: string;
  sensitiveDataIncluded: false;
};

export type DayCorePatchAuditRecord = {
  id: string;
  action: 'apply_day_core_patch' | 'rollback_day_core_patch' | 'clear_day_core_patch_demo_state';
  candidateId?: string;
  dayId?: string;
  createdAt: string;
  note: string;
  sensitiveDataIncluded: false;
};

export type DayCorePatchPersistedState = {
  schemaVersion: typeof DAY_CORE_PATCH_PERSISTENCE_VERSION;
  dayCore: DayCoreInputModel;
  appliedRecords: DayCoreAppliedPatchRecord[];
  auditRecords: DayCorePatchAuditRecord[];
  updatedAt: string;
  storageMode: 'browser_local' | 'supabase_ready' | 'unavailable';
};

export type DayCorePatchStorageAdapter = {
  read(): DayCorePatchPersistedState | null;
  write(state: DayCorePatchPersistedState): void;
  clear(): void;
  isAvailable(): boolean;
};

const storageKey = 'finflow.dayCorePatchState.v1_28';

export const browserLocalDayCorePatchAdapter: DayCorePatchStorageAdapter = {
  read() {
    if (!this.isAvailable()) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as DayCorePatchPersistedState;
      if (parsed.schemaVersion !== DAY_CORE_PATCH_PERSISTENCE_VERSION) return null;
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

export function createInitialDayCorePatchState(
  dayCore: DayCoreInputModel,
  now: string = new Date().toISOString()
): DayCorePatchPersistedState {
  return {
    schemaVersion: DAY_CORE_PATCH_PERSISTENCE_VERSION,
    dayCore,
    appliedRecords: [],
    auditRecords: [],
    updatedAt: now,
    storageMode: browserLocalDayCorePatchAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function createAppliedPatchRecord(params: {
  candidateId: string;
  dayId: string;
  beforeDayCore: DayCoreInputModel;
  afterDayCore: DayCoreInputModel;
  historyEvent: DayCoreApplyHistoryEvent;
  now?: string;
}): DayCoreAppliedPatchRecord {
  const appliedAt = params.now ?? new Date().toISOString();
  return {
    id: `applied-${params.candidateId}-${Math.abs(hashString(params.candidateId + appliedAt))}`,
    schemaVersion: DAY_CORE_PATCH_PERSISTENCE_VERSION,
    candidateId: params.candidateId,
    dayId: params.dayId,
    appliedAt,
    beforeDayCore: params.beforeDayCore,
    afterDayCore: params.afterDayCore,
    historyEvent: params.historyEvent,
    sensitiveDataIncluded: false
  };
}

export function addAppliedPatchRecord(
  previousState: DayCorePatchPersistedState,
  record: DayCoreAppliedPatchRecord,
  auditEvent?: ImportReviewAuditEvent,
  now: string = new Date().toISOString()
): DayCorePatchPersistedState {
  const applyAuditRecord: DayCorePatchAuditRecord = {
    id: `patch-audit-apply-${record.id}`,
    action: 'apply_day_core_patch',
    candidateId: record.candidateId,
    dayId: record.dayId,
    createdAt: now,
    note: auditEvent?.note ?? `Applied candidate ${record.candidateId} to Day Core.`,
    sensitiveDataIncluded: false
  };
  const auditRecords: DayCorePatchAuditRecord[] = [applyAuditRecord, ...previousState.auditRecords].slice(0, 80);

  return {
    ...previousState,
    dayCore: record.afterDayCore,
    appliedRecords: [record, ...previousState.appliedRecords].slice(0, 80),
    auditRecords,
    updatedAt: now,
    storageMode: browserLocalDayCorePatchAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function rollbackAppliedPatchRecord(
  previousState: DayCorePatchPersistedState,
  recordId: string,
  now: string = new Date().toISOString()
): DayCorePatchPersistedState {
  const record = previousState.appliedRecords.find(item => item.id === recordId);
  if (!record || record.rolledBackAt) return previousState;

  const rolledBackRecord: DayCoreAppliedPatchRecord = {
    ...record,
    rolledBackAt: now,
    rollbackAuditNote: `Rollback restored Day Core snapshot from before candidate ${record.candidateId}.`
  };

  return {
    ...previousState,
    dayCore: rolledBackRecord.beforeDayCore,
    appliedRecords: previousState.appliedRecords.map(item => item.id === recordId ? rolledBackRecord : item),
    auditRecords: [
      {
        id: `patch-audit-rollback-${recordId}`,
        action: 'rollback_day_core_patch',
        candidateId: record.candidateId,
        dayId: record.dayId,
        createdAt: now,
        note: rolledBackRecord.rollbackAuditNote ?? 'Rollback completed.',
        sensitiveDataIncluded: false
      } satisfies DayCorePatchAuditRecord,
      ...previousState.auditRecords
    ].slice(0, 80),
    updatedAt: now,
    storageMode: browserLocalDayCorePatchAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function getDayCorePatchStorageLabel(state: DayCorePatchPersistedState) {
  if (state.storageMode === 'browser_local') return 'Day Core patches saved locally';
  if (state.storageMode === 'supabase_ready') return 'Day Core patches ready for Supabase sync';
  return 'Day Core patch storage unavailable';
}

export function resetDayCorePatchPersistence(
  dayCore: DayCoreInputModel,
  adapter: DayCorePatchStorageAdapter = browserLocalDayCorePatchAdapter
) {
  adapter.clear();
  return createInitialDayCorePatchState(dayCore);
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}
