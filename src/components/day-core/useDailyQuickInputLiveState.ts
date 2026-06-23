'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { dayCoreInputMock, type DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import { EDITABLE_FUEL_INPUTS_STORAGE_KEY, createEditableFuelInputStoredState, parseEditableFuelInputStoredState } from '@/lib/car/editableFuelInputsPersistence';
import { createDefaultEditableFuelInputState, type EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import { FUEL_ODOMETER_HISTORY_STORAGE_KEY, createInitialFuelOdometerHistoryState, parseFuelOdometerHistoryState, type FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';
import { createInitialDailyRecordsFromInput, deriveDayInputFromRecords, type CustomDailyRecordTemplate, type DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { type BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import {
  createDailyLiveStateOriginId,
  createDailyLiveStateSignature,
  createDailyLiveStateSnapshot,
  readDailyLiveStateSnapshot,
  subscribeDailyLiveState,
  writeDailyLiveStateSnapshot
} from '@/lib/day-core/dailyLiveStatePersistence';
import {
  getLatestActiveDayRolloverEntry,
  readActiveDayRolloverArchiveState,
  readActiveDaySessionState,
  type ActiveDayRolloverArchiveEntry,
  type ActiveDaySessionState
} from '@/lib/day-core/activeDaySessionModel';
import { bankDecisionsStorageKey, customTemplatesStorageKey, recordsStorageKey, storageKey } from '@/components/day-core/DailyQuickInputConfig';
import { reconcileDayCoreFundSystem } from '@/lib/day-core/fundPlanningModel';

type UseDailyQuickInputLiveStateInput = {
  onDayInputChange?: (input: DayCoreInputModel) => void;
};

export function useDailyQuickInputLiveState(input: UseDailyQuickInputLiveStateInput = {}) {
  const dailyLiveOriginId = useMemo(() => createDailyLiveStateOriginId(), []);
  const lastDailyLiveSignatureRef = useRef('');
  const [dayInput, setDayInput] = useState<DayCoreInputModel>(() => reconcileDayCoreFundSystem(dayCoreInputMock));
  const [hydrated, setHydrated] = useState(false);
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => ({
    ...createInitialDailyHistoryState(`${dayCoreInputMock.localDate}T00:00:00.000Z`),
    storageMode: 'unavailable'
  }));
  const [records, setRecords] = useState<DailyRecord[]>(() => createInitialDailyRecordsFromInput(dayCoreInputMock));
  const [customTemplates, setCustomTemplates] = useState<CustomDailyRecordTemplate[]>([]);
  const [bankDecisions, setBankDecisions] = useState<BankCandidateDecision[]>([]);
  const [fuelInputState, setFuelInputState] = useState<EditableFuelInputState>(() => createDefaultEditableFuelInputState());
  const [fuelHistoryState, setFuelHistoryState] = useState<FuelOdometerHistoryState>(() => createInitialFuelOdometerHistoryState());
  const [dailyLiveSyncedAt, setDailyLiveSyncedAt] = useState('');
  const [activeDaySession, setActiveDaySession] = useState<ActiveDaySessionState | null>(null);
  const [latestRolloverEntry, setLatestRolloverEntry] = useState<ActiveDayRolloverArchiveEntry | null>(null);
  const [rolloverStatus, setRolloverStatus] = useState('');

  useEffect(() => {
    try {
      const liveSnapshot = readDailyLiveStateSnapshot();

      if (liveSnapshot) {
        setDayInput(reconcileDayCoreFundSystem(liveSnapshot.dayInput));
        setRecords(liveSnapshot.records);
        setCustomTemplates(liveSnapshot.customTemplates);
        setBankDecisions(liveSnapshot.bankDecisions);
        setFuelInputState(liveSnapshot.fuelInputState);
        setFuelHistoryState(liveSnapshot.fuelHistoryState);
        setDailyLiveSyncedAt(liveSnapshot.savedAtIso);
        lastDailyLiveSignatureRef.current = createDailyLiveStateSignature(liveSnapshot);
      } else {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) setDayInput(reconcileDayCoreFundSystem(JSON.parse(raw) as DayCoreInputModel));
        const recordsRaw = window.localStorage.getItem(recordsStorageKey);
        if (recordsRaw) setRecords(JSON.parse(recordsRaw) as DailyRecord[]);
        const templatesRaw = window.localStorage.getItem(customTemplatesStorageKey);
        if (templatesRaw) setCustomTemplates(JSON.parse(templatesRaw) as CustomDailyRecordTemplate[]);
        const bankDecisionsRaw = window.localStorage.getItem(bankDecisionsStorageKey);
        if (bankDecisionsRaw) setBankDecisions(JSON.parse(bankDecisionsRaw) as BankCandidateDecision[]);
        const fuelInputRaw = window.localStorage.getItem(EDITABLE_FUEL_INPUTS_STORAGE_KEY);
        const parsedFuelInput = parseEditableFuelInputStoredState(fuelInputRaw);
        if (parsedFuelInput) setFuelInputState(parsedFuelInput);
        const fuelHistoryRaw = window.localStorage.getItem(FUEL_ODOMETER_HISTORY_STORAGE_KEY);
        const parsedFuelHistory = parseFuelOdometerHistoryState(fuelHistoryRaw);
        if (parsedFuelHistory) setFuelHistoryState(parsedFuelHistory);
      }

      const historyRaw = browserLocalDailyHistoryAdapter.read();
      setHistoryState(historyRaw ?? createInitialDailyHistoryState());

      const sessionRaw = readActiveDaySessionState();
      if (sessionRaw) setActiveDaySession(sessionRaw);
      const archiveRaw = readActiveDayRolloverArchiveState();
      setLatestRolloverEntry(archiveRaw ? getLatestActiveDayRolloverEntry(archiveRaw) : null);
    } catch {
      // Keep safe demo input if localStorage is unavailable or corrupted.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    return subscribeDailyLiveState(snapshot => {
      if (snapshot.originTabId === dailyLiveOriginId) return;

      const incomingSignature = createDailyLiveStateSignature(snapshot);
      if (incomingSignature === lastDailyLiveSignatureRef.current) return;

      lastDailyLiveSignatureRef.current = incomingSignature;
      setDayInput(reconcileDayCoreFundSystem(snapshot.dayInput));
      setRecords(snapshot.records);
      setCustomTemplates(snapshot.customTemplates);
      setBankDecisions(snapshot.bankDecisions);
      setFuelInputState(snapshot.fuelInputState);
      setFuelHistoryState(snapshot.fuelHistoryState);
      setDailyLiveSyncedAt(snapshot.savedAtIso);
    });
  }, [dailyLiveOriginId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(dayInput));
  }, [dayInput, hydrated]);

  useEffect(() => {
    input.onDayInputChange?.(dayInput);
  }, [dayInput, input.onDayInputChange]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(recordsStorageKey, JSON.stringify(records));
    setDayInput(previous => deriveDayInputFromRecords(previous, records));
  }, [records, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(customTemplatesStorageKey, JSON.stringify(customTemplates));
  }, [customTemplates, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(bankDecisionsStorageKey, JSON.stringify(bankDecisions));
  }, [bankDecisions, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(EDITABLE_FUEL_INPUTS_STORAGE_KEY, JSON.stringify(createEditableFuelInputStoredState(fuelInputState)));
  }, [fuelInputState, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FUEL_ODOMETER_HISTORY_STORAGE_KEY, JSON.stringify(fuelHistoryState));
  }, [fuelHistoryState, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const snapshotDraft = {
      dayInput,
      records,
      customTemplates,
      bankDecisions,
      fuelInputState,
      fuelHistoryState
    };
    const nextSignature = createDailyLiveStateSignature(snapshotDraft);

    if (nextSignature === lastDailyLiveSignatureRef.current) return;

    const nextSnapshot = createDailyLiveStateSnapshot({
      ...snapshotDraft,
      originTabId: dailyLiveOriginId,
      source: 'local_input'
    });

    if (writeDailyLiveStateSnapshot(nextSnapshot)) {
      lastDailyLiveSignatureRef.current = nextSignature;
      setDailyLiveSyncedAt(nextSnapshot.savedAtIso);
    }
  }, [bankDecisions, customTemplates, dailyLiveOriginId, dayInput, fuelHistoryState, fuelInputState, hydrated, records]);

  return {
    dailyLiveOriginId,
    hydrated,
    dayInput,
    setDayInput,
    historyState,
    setHistoryState,
    records,
    setRecords,
    customTemplates,
    setCustomTemplates,
    bankDecisions,
    setBankDecisions,
    fuelInputState,
    setFuelInputState,
    fuelHistoryState,
    setFuelHistoryState,
    dailyLiveSyncedAt,
    activeDaySession,
    setActiveDaySession,
    latestRolloverEntry,
    setLatestRolloverEntry,
    rolloverStatus,
    setRolloverStatus
  };
}
