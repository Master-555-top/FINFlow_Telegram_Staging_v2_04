import {
  FINFLOW_SLEEP_CURRENT_STORAGE_KEY,
  FINFLOW_SLEEP_LIVE_SESSION_KEY,
  FINFLOW_SLEEP_STORAGE_KEY,
  FINFLOW_SLEEP_STORAGE_KEY_V2_17,
  seedSleepRecords,
  sortSleepRecords,
  type LiveSleepSession,
  type SleepRecord
} from '@/lib/sleep/sleepModel';

const SLEEP_READ_KEYS = [
  FINFLOW_SLEEP_CURRENT_STORAGE_KEY,
  FINFLOW_SLEEP_STORAGE_KEY_V2_17,
  FINFLOW_SLEEP_STORAGE_KEY
];

export function readSleepRecordsFromLocalStorage(): SleepRecord[] {
  if (typeof window === 'undefined') return seedSleepRecords;

  for (const key of SLEEP_READ_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as SleepRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) return sortSleepRecords(parsed);
    } catch {
      continue;
    }
  }

  return seedSleepRecords;
}

export function writeSleepRecordsToLocalStorage(records: SleepRecord[]) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(sortSleepRecords(records));
  window.localStorage.setItem(FINFLOW_SLEEP_CURRENT_STORAGE_KEY, payload);
  window.localStorage.setItem(FINFLOW_SLEEP_STORAGE_KEY_V2_17, payload);
}

export function readLiveSleepSessionFromLocalStorage(): LiveSleepSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FINFLOW_SLEEP_LIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveSleepSession;
    return parsed?.status === 'sleeping' && parsed.sleptAtIso ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLiveSleepSessionFromLocalStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(FINFLOW_SLEEP_LIVE_SESSION_KEY);
}
