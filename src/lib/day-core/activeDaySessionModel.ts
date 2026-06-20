import type { EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import type { BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';
import type { CustomDailyRecordTemplate, DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyLiveStateSnapshot } from '@/lib/day-core/dailyLiveStatePersistence';

export const ACTIVE_DAY_SESSION_MODEL_VERSION = 'active_day_session_v2_01' as const;
export const ACTIVE_DAY_ROLLOVER_ARCHIVE_STORAGE_KEY = 'finflow.activeDayRolloverArchive.v2_01';
export const ACTIVE_DAY_SESSION_STATE_STORAGE_KEY = 'finflow.activeDaySession.v2_01';

export type ActiveDayRolloverMode = 'close_and_start_next' | 'manual_new_day' | 'restore_previous_day';

export type ActiveDayRolloverArchiveEntry = {
  id: string;
  schemaVersion: typeof ACTIVE_DAY_SESSION_MODEL_VERSION;
  closedAtIso: string;
  mode: ActiveDayRolloverMode;
  previousDayId: string;
  previousLocalDate: string;
  nextDayId: string;
  nextLocalDate: string;
  snapshot: DailyLiveStateSnapshot;
  sensitiveDataIncluded: false;
};

export type ActiveDayRolloverArchiveState = {
  schemaVersion: typeof ACTIVE_DAY_SESSION_MODEL_VERSION;
  updatedAtIso: string;
  entries: ActiveDayRolloverArchiveEntry[];
};

export type ActiveDaySessionState = {
  schemaVersion: typeof ACTIVE_DAY_SESSION_MODEL_VERSION;
  activeDayId: string;
  activeLocalDate: string;
  startedAtIso: string;
  lastRolloverAtIso?: string;
  lastClosedDayId?: string;
};

export type NewActiveDayDraft = {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  fuelInputState: EditableFuelInputState;
};

export function createInitialActiveDayArchiveState(now: string = new Date().toISOString()): ActiveDayRolloverArchiveState {
  return {
    schemaVersion: ACTIVE_DAY_SESSION_MODEL_VERSION,
    updatedAtIso: now,
    entries: []
  };
}

export function createActiveDaySessionState(input: {
  activeDayId: string;
  activeLocalDate: string;
  startedAtIso?: string;
  lastRolloverAtIso?: string;
  lastClosedDayId?: string;
}): ActiveDaySessionState {
  return {
    schemaVersion: ACTIVE_DAY_SESSION_MODEL_VERSION,
    activeDayId: input.activeDayId,
    activeLocalDate: input.activeLocalDate,
    startedAtIso: input.startedAtIso ?? new Date().toISOString(),
    lastRolloverAtIso: input.lastRolloverAtIso,
    lastClosedDayId: input.lastClosedDayId
  };
}

export function createActiveDayRolloverArchiveEntry(input: {
  snapshot: DailyLiveStateSnapshot;
  nextDayId: string;
  nextLocalDate: string;
  mode?: ActiveDayRolloverMode;
  now?: string;
}): ActiveDayRolloverArchiveEntry {
  const now = input.now ?? new Date().toISOString();
  return {
    id: `rollover-${input.snapshot.dayInput.dayId}-${Math.abs(hashString(input.snapshot.dayInput.dayId + now))}`,
    schemaVersion: ACTIVE_DAY_SESSION_MODEL_VERSION,
    closedAtIso: now,
    mode: input.mode ?? 'close_and_start_next',
    previousDayId: input.snapshot.dayInput.dayId,
    previousLocalDate: input.snapshot.dayInput.localDate,
    nextDayId: input.nextDayId,
    nextLocalDate: input.nextLocalDate,
    snapshot: input.snapshot,
    sensitiveDataIncluded: false
  };
}

export function buildNewActiveDayDraft(input: {
  previousDayInput: DayCoreInputModel;
  previousRecords: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  fuelInputState: EditableFuelInputState;
  now?: Date;
}): NewActiveDayDraft {
  const now = input.now ?? new Date();
  const localDate = formatLocalDate(now);
  const localTime = formatLocalTime(now);
  const nextDayId = `active-${localDate}-${Math.abs(hashString(`${input.previousDayInput.dayId}-${now.toISOString()}`))}`;
  const cleanTasks = input.previousDayInput.tasks
    .filter(task => !task.id.startsWith('record-task-'))
    .map(task => ({ ...task, plannedToday: task.priority === 'critical' || task.priority === 'high' || task.plannedToday }));

  return {
    dayInput: {
      ...input.previousDayInput,
      dayId: nextDayId,
      localDate,
      localTime,
      source: 'manual',
      status: 'review_needed',
      taxi: {
        ...input.previousDayInput.taxi,
        ordersDone: 0,
        grossDone: 0,
        activeHours: 0,
        fullShiftHours: 0,
        expectedGrossByEvening: input.previousDayInput.taxi.targetGrossToday,
        fuelAlreadyPaid: 0
      },
      tasks: cleanTasks,
      reviewNotes: [
        `Новый активный день создан из ${input.previousDayInput.localDate}. Предыдущий день сохранён в history + rollover archive.`,
        'Заказы, бензин и дневные расходы очищены для нового дня; цели, обязательства, фонды и текущие деньги сохранены.',
        ...input.previousDayInput.reviewNotes.filter(note => !note.startsWith('Новый активный день создан из'))
      ].slice(0, 12)
    },
    records: [],
    customTemplates: input.customTemplates,
    bankDecisions: input.bankDecisions,
    fuelInputState: rollFuelInputToNextDay(input.fuelInputState)
  };
}

export function rollFuelInputToNextDay(input: EditableFuelInputState): EditableFuelInputState {
  return {
    ...input,
    previousOdometerKm: input.currentOdometerKm
  };
}

export function addActiveDayRolloverArchiveEntry(
  state: ActiveDayRolloverArchiveState,
  entry: ActiveDayRolloverArchiveEntry,
  now: string = new Date().toISOString()
): ActiveDayRolloverArchiveState {
  return {
    ...state,
    updatedAtIso: now,
    entries: [entry, ...state.entries].slice(0, 30)
  };
}

export function getLatestActiveDayRolloverEntry(state: ActiveDayRolloverArchiveState) {
  return state.entries[0] ?? null;
}

export function readActiveDayRolloverArchiveState(storage: Storage | undefined = getBrowserLocalStorage()): ActiveDayRolloverArchiveState | null {
  if (!storage) return null;
  return parseActiveDayRolloverArchiveState(storage.getItem(ACTIVE_DAY_ROLLOVER_ARCHIVE_STORAGE_KEY));
}

export function writeActiveDayRolloverArchiveState(state: ActiveDayRolloverArchiveState, storage: Storage | undefined = getBrowserLocalStorage()) {
  if (!storage) return false;
  storage.setItem(ACTIVE_DAY_ROLLOVER_ARCHIVE_STORAGE_KEY, JSON.stringify(state));
  return true;
}

export function readActiveDaySessionState(storage: Storage | undefined = getBrowserLocalStorage()): ActiveDaySessionState | null {
  if (!storage) return null;
  return parseActiveDaySessionState(storage.getItem(ACTIVE_DAY_SESSION_STATE_STORAGE_KEY));
}

export function writeActiveDaySessionState(state: ActiveDaySessionState, storage: Storage | undefined = getBrowserLocalStorage()) {
  if (!storage) return false;
  storage.setItem(ACTIVE_DAY_SESSION_STATE_STORAGE_KEY, JSON.stringify(state));
  return true;
}

export function parseActiveDayRolloverArchiveState(raw: string | null): ActiveDayRolloverArchiveState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ActiveDayRolloverArchiveState>;
    if (parsed.schemaVersion !== ACTIVE_DAY_SESSION_MODEL_VERSION || !Array.isArray(parsed.entries)) return null;

    return {
      schemaVersion: ACTIVE_DAY_SESSION_MODEL_VERSION,
      updatedAtIso: typeof parsed.updatedAtIso === 'string' ? parsed.updatedAtIso : new Date().toISOString(),
      entries: parsed.entries
        .filter((entry): entry is ActiveDayRolloverArchiveEntry => Boolean(entry?.snapshot?.dayInput && entry?.previousDayId && entry?.nextDayId))
        .slice(0, 30)
    };
  } catch {
    return null;
  }
}

export function parseActiveDaySessionState(raw: string | null): ActiveDaySessionState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ActiveDaySessionState>;
    if (parsed.schemaVersion !== ACTIVE_DAY_SESSION_MODEL_VERSION || !parsed.activeDayId || !parsed.activeLocalDate) return null;

    return {
      schemaVersion: ACTIVE_DAY_SESSION_MODEL_VERSION,
      activeDayId: String(parsed.activeDayId),
      activeLocalDate: String(parsed.activeLocalDate),
      startedAtIso: typeof parsed.startedAtIso === 'string' ? parsed.startedAtIso : new Date().toISOString(),
      lastRolloverAtIso: typeof parsed.lastRolloverAtIso === 'string' ? parsed.lastRolloverAtIso : undefined,
      lastClosedDayId: typeof parsed.lastClosedDayId === 'string' ? parsed.lastClosedDayId : undefined
    };
  } catch {
    return null;
  }
}

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getBrowserLocalStorage() {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}
