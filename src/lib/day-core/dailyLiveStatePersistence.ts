import type { EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import type { FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';
import type { BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';
import type { CustomDailyRecordTemplate, DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';

export const DAILY_LIVE_STATE_SCHEMA_VERSION = 'daily_live_state_v2_00' as const;
export const DAILY_LIVE_STATE_STORAGE_KEY = 'finflow.dailyLiveState.v2_00';
export const DAILY_LIVE_STATE_EVENT_NAME = 'finflow:daily-live-state:v2_00';
export const DAILY_LIVE_STATE_BROADCAST_CHANNEL = 'finflow.dailyLiveState.v2_00';

export type DailyLiveStateSource =
  | 'local_input'
  | 'cloud_load'
  | 'backup_restore'
  | 'history_restore'
  | 'day_rollover'
  | 'system_reset'
  | 'external_tab';

export type DailyLiveStateSnapshot = {
  schemaVersion: typeof DAILY_LIVE_STATE_SCHEMA_VERSION;
  savedAtIso: string;
  updatedAtMs: number;
  originTabId: string;
  source: DailyLiveStateSource;
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  fuelInputState: EditableFuelInputState;
  fuelHistoryState: FuelOdometerHistoryState;
};

export type DailyLiveStateSnapshotInput = Omit<DailyLiveStateSnapshot, 'schemaVersion' | 'savedAtIso' | 'updatedAtMs'>;

export function createDailyLiveStateOriginId() {
  return `finflow_tab_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createDailyLiveStateSnapshot(input: DailyLiveStateSnapshotInput): DailyLiveStateSnapshot {
  return {
    schemaVersion: DAILY_LIVE_STATE_SCHEMA_VERSION,
    savedAtIso: new Date().toISOString(),
    updatedAtMs: Date.now(),
    ...input
  };
}

export function createDailyLiveStateSignature(snapshot: Pick<DailyLiveStateSnapshot, 'dayInput' | 'records' | 'customTemplates' | 'bankDecisions' | 'fuelInputState' | 'fuelHistoryState'>) {
  return JSON.stringify({
    dayInput: snapshot.dayInput,
    records: snapshot.records,
    customTemplates: snapshot.customTemplates,
    bankDecisions: snapshot.bankDecisions,
    fuelInputState: snapshot.fuelInputState,
    fuelHistoryState: snapshot.fuelHistoryState
  });
}

export function parseDailyLiveStateSnapshot(raw: string | null): DailyLiveStateSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DailyLiveStateSnapshot>;
    if (parsed.schemaVersion !== DAILY_LIVE_STATE_SCHEMA_VERSION) return null;
    if (!parsed.dayInput || !Array.isArray(parsed.records)) return null;
    if (!Array.isArray(parsed.customTemplates) || !Array.isArray(parsed.bankDecisions)) return null;
    if (!parsed.fuelInputState || !parsed.fuelHistoryState) return null;

    return {
      schemaVersion: DAILY_LIVE_STATE_SCHEMA_VERSION,
      savedAtIso: typeof parsed.savedAtIso === 'string' ? parsed.savedAtIso : new Date().toISOString(),
      updatedAtMs: typeof parsed.updatedAtMs === 'number' ? parsed.updatedAtMs : Date.now(),
      originTabId: typeof parsed.originTabId === 'string' ? parsed.originTabId : 'unknown_tab',
      source: normalizeDailyLiveStateSource(parsed.source),
      dayInput: parsed.dayInput,
      records: parsed.records,
      customTemplates: parsed.customTemplates,
      bankDecisions: parsed.bankDecisions,
      fuelInputState: parsed.fuelInputState,
      fuelHistoryState: parsed.fuelHistoryState
    };
  } catch {
    return null;
  }
}

export function readDailyLiveStateSnapshot(storage: Storage | undefined = getBrowserLocalStorage()) {
  if (!storage) return null;
  return parseDailyLiveStateSnapshot(storage.getItem(DAILY_LIVE_STATE_STORAGE_KEY));
}

export function writeDailyLiveStateSnapshot(snapshot: DailyLiveStateSnapshot, options: { notify?: boolean } = {}) {
  const storage = getBrowserLocalStorage();
  if (!storage) return false;

  storage.setItem(DAILY_LIVE_STATE_STORAGE_KEY, JSON.stringify(snapshot));

  if (options.notify !== false) {
    notifyDailyLiveStateSubscribers(snapshot);
  }

  return true;
}

export function subscribeDailyLiveState(callback: (snapshot: DailyLiveStateSnapshot) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key !== DAILY_LIVE_STATE_STORAGE_KEY) return;
    const snapshot = parseDailyLiveStateSnapshot(event.newValue);
    if (snapshot) callback(snapshot);
  };

  const onCustomEvent = (event: Event) => {
    const snapshot = (event as CustomEvent<DailyLiveStateSnapshot>).detail;
    if (snapshot?.schemaVersion === DAILY_LIVE_STATE_SCHEMA_VERSION) callback(snapshot);
  };

  const channel = createBroadcastChannel();
  const onBroadcastMessage = (event: MessageEvent<DailyLiveStateSnapshot>) => {
    const snapshot = event.data;
    if (snapshot?.schemaVersion === DAILY_LIVE_STATE_SCHEMA_VERSION) callback(snapshot);
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(DAILY_LIVE_STATE_EVENT_NAME, onCustomEvent);
  channel?.addEventListener('message', onBroadcastMessage);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(DAILY_LIVE_STATE_EVENT_NAME, onCustomEvent);
    channel?.removeEventListener('message', onBroadcastMessage);
    channel?.close();
  };
}

function notifyDailyLiveStateSubscribers(snapshot: DailyLiveStateSnapshot) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(DAILY_LIVE_STATE_EVENT_NAME, { detail: snapshot }));
  const channel = createBroadcastChannel();
  channel?.postMessage(snapshot);
  channel?.close();
}

function createBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  return new BroadcastChannel(DAILY_LIVE_STATE_BROADCAST_CHANNEL);
}

function getBrowserLocalStorage() {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeDailyLiveStateSource(source: unknown): DailyLiveStateSource {
  if (
    source === 'local_input' ||
    source === 'cloud_load' ||
    source === 'backup_restore' ||
    source === 'history_restore' ||
    source === 'day_rollover' ||
    source === 'system_reset' ||
    source === 'external_tab'
  ) return source;

  return 'external_tab';
}
