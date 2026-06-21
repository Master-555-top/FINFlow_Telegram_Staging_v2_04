import type { Dispatch, SetStateAction } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord, CustomDailyRecordTemplate } from '@/lib/day-core/dailyRecordsModel';
import type { BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';
import type { EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import type { FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';
import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import {
  addDailyHistorySnapshot,
  browserLocalDailyHistoryAdapter,
  createDailyHistorySnapshot,
  deleteDailyHistorySnapshot,
  getDailyHistorySnapshotById,
  toggleDailyHistorySnapshotLock,
  type DailyHistoryState
} from '@/lib/day-core/dailyHistoryModel';
import { createDailyLiveStateSnapshot } from '@/lib/day-core/dailyLiveStatePersistence';
import {
  addActiveDayRolloverArchiveEntry,
  buildNewActiveDayDraft,
  createActiveDayRolloverArchiveEntry,
  createActiveDaySessionState,
  createInitialActiveDayArchiveState,
  getLatestActiveDayRolloverEntry,
  readActiveDayRolloverArchiveState,
  writeActiveDayRolloverArchiveState,
  writeActiveDaySessionState,
  type ActiveDayRolloverArchiveEntry,
  type ActiveDaySessionState
} from '@/lib/day-core/activeDaySessionModel';
import { markNote } from '@/components/day-core/DailyQuickInputShared';

export type DailyQuickInputHistoryActionsArgs = {
  dailyLiveOriginId: string;
  dayInput: DayCoreInputModel;
  net: NetCalculationResult;
  historyState: DailyHistoryState;
  selectedSnapshotId: string;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  fuelInputState: EditableFuelInputState;
  fuelHistoryState: FuelOdometerHistoryState;
  latestRolloverEntry: ActiveDayRolloverArchiveEntry | null;
  setSelectedSnapshotId: (id: string) => void;
  setDayInput: Dispatch<SetStateAction<DayCoreInputModel>>;
  setHistoryState: Dispatch<SetStateAction<DailyHistoryState>>;
  setRecords: Dispatch<SetStateAction<DailyRecord[]>>;
  setCustomTemplates: Dispatch<SetStateAction<CustomDailyRecordTemplate[]>>;
  setBankDecisions: Dispatch<SetStateAction<BankCandidateDecision[]>>;
  setFuelInputState: Dispatch<SetStateAction<EditableFuelInputState>>;
  setFuelHistoryState: Dispatch<SetStateAction<FuelOdometerHistoryState>>;
  setLatestRolloverEntry: Dispatch<SetStateAction<ActiveDayRolloverArchiveEntry | null>>;
  setActiveDaySession: Dispatch<SetStateAction<ActiveDaySessionState | null>>;
  setRolloverStatus: Dispatch<SetStateAction<string>>;
};

export function useDailyQuickInputHistoryActions(args: DailyQuickInputHistoryActionsArgs) {
  function persistHistory(nextState: DailyHistoryState) {
    args.setHistoryState(nextState);
    browserLocalDailyHistoryAdapter.write(nextState);
  }

  function saveDaySnapshot() {
    const snapshot = createDailyHistorySnapshot(args.dayInput, args.net);
    persistHistory(addDailyHistorySnapshot(args.historyState, snapshot));
  }

  function deleteSnapshot(snapshotId: string) {
    persistHistory(deleteDailyHistorySnapshot(args.historyState, snapshotId));
    if (args.selectedSnapshotId === snapshotId) args.setSelectedSnapshotId('');
  }

  function toggleSnapshotLock(snapshotId: string) {
    persistHistory(toggleDailyHistorySnapshotLock(args.historyState, snapshotId));
  }

  function restoreSnapshot(snapshotId: string) {
    const snapshot = getDailyHistorySnapshotById(args.historyState, snapshotId);
    if (!snapshot) return;
    args.setDayInput({
      ...snapshot.dayInput,
      status: 'review_needed',
      reviewNotes: markNote(snapshot.dayInput.reviewNotes, `Восстановлено из истории: ${snapshot.localDate}.`)
    });
    args.setSelectedSnapshotId(snapshot.id);
  }

  function loadCloudDocument(document: FinflowCloudDayDocument) {
    args.setDayInput(document.dayInput);
    args.setRecords(document.records);
    args.setCustomTemplates(document.customTemplates);
    args.setBankDecisions(document.bankDecisions);
    args.setFuelInputState(document.fuelInputState);
    args.setFuelHistoryState(document.fuelHistoryState);
  }

  function startNewActiveDay() {
    const approved = window.confirm('Закрыть текущий день и начать новый? FINFlow сохранит вечерний снимок + rollover archive, а заказы/расходы нового дня начнутся с нуля.');
    if (!approved) return;

    const now = new Date();
    const currentSnapshot = createDailyLiveStateSnapshot({
      originTabId: args.dailyLiveOriginId,
      source: 'day_rollover',
      dayInput: args.dayInput,
      records: args.records,
      customTemplates: args.customTemplates,
      bankDecisions: args.bankDecisions,
      fuelInputState: args.fuelInputState,
      fuelHistoryState: args.fuelHistoryState
    });
    const nextDraft = buildNewActiveDayDraft({
      previousDayInput: args.dayInput,
      previousRecords: args.records,
      customTemplates: args.customTemplates,
      bankDecisions: args.bankDecisions,
      fuelInputState: args.fuelInputState,
      now
    });
    const archiveEntry = createActiveDayRolloverArchiveEntry({ snapshot: currentSnapshot, nextDayId: nextDraft.dayInput.dayId, nextLocalDate: nextDraft.dayInput.localDate, now: now.toISOString() });
    const previousArchiveState = readActiveDayRolloverArchiveState() ?? createInitialActiveDayArchiveState(now.toISOString());
    const nextArchiveState = addActiveDayRolloverArchiveEntry(previousArchiveState, archiveEntry, now.toISOString());
    writeActiveDayRolloverArchiveState(nextArchiveState);

    const closingSnapshot = createDailyHistorySnapshot(args.dayInput, args.net, now.toISOString());
    persistHistory(addDailyHistorySnapshot(args.historyState, closingSnapshot, now.toISOString()));

    args.setDayInput(nextDraft.dayInput);
    args.setRecords(nextDraft.records);
    args.setCustomTemplates(nextDraft.customTemplates);
    args.setBankDecisions(nextDraft.bankDecisions);
    args.setFuelInputState(nextDraft.fuelInputState);
    args.setLatestRolloverEntry(archiveEntry);

    const nextSession = createActiveDaySessionState({
      activeDayId: nextDraft.dayInput.dayId,
      activeLocalDate: nextDraft.dayInput.localDate,
      startedAtIso: now.toISOString(),
      lastRolloverAtIso: now.toISOString(),
      lastClosedDayId: args.dayInput.dayId
    });
    writeActiveDaySessionState(nextSession);
    args.setActiveDaySession(nextSession);
    args.setRolloverStatus(`Новый день ${nextDraft.dayInput.localDate} создан. Предыдущий день сохранён в истории и rollback archive.`);
  }

  function restoreLatestRolloverDay() {
    const archiveEntry = args.latestRolloverEntry ?? getLatestActiveDayRolloverEntry(readActiveDayRolloverArchiveState() ?? createInitialActiveDayArchiveState());
    if (!archiveEntry) return;
    const approved = window.confirm(`Вернуть день ${archiveEntry.previousLocalDate} из последнего rollover archive? Текущий активный день будет заменён локально.`);
    if (!approved) return;

    const snapshot = archiveEntry.snapshot;
    args.setDayInput({
      ...snapshot.dayInput,
      status: 'review_needed',
      reviewNotes: markNote(snapshot.dayInput.reviewNotes, `Откат после New Day: восстановлен день ${archiveEntry.previousLocalDate}.`)
    });
    args.setRecords(snapshot.records);
    args.setCustomTemplates(snapshot.customTemplates);
    args.setBankDecisions(snapshot.bankDecisions);
    args.setFuelInputState(snapshot.fuelInputState);
    args.setFuelHistoryState(snapshot.fuelHistoryState);

    const restoredSession = createActiveDaySessionState({
      activeDayId: snapshot.dayInput.dayId,
      activeLocalDate: snapshot.dayInput.localDate,
      startedAtIso: new Date().toISOString(),
      lastRolloverAtIso: archiveEntry.closedAtIso,
      lastClosedDayId: archiveEntry.nextDayId
    });
    writeActiveDaySessionState(restoredSession);
    args.setActiveDaySession(restoredSession);
    args.setRolloverStatus(`Восстановлен предыдущий активный день ${archiveEntry.previousLocalDate} из rollover archive.`);
  }

  return {
    saveDaySnapshot,
    deleteSnapshot,
    toggleSnapshotLock,
    restoreSnapshot,
    loadCloudDocument,
    startNewActiveDay,
    restoreLatestRolloverDay
  };
}
