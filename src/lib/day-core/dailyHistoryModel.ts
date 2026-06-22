import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';

export const DAILY_HISTORY_VERSION = 'daily_history_v1_33' as const;

export type DailyHistorySnapshot = {
  id: string;
  schemaVersion: typeof DAILY_HISTORY_VERSION;
  savedAt: string;
  dayId: string;
  localDate: string;
  source: 'quick_daily_input' | 'manual_save' | 'import_review_queue';
  dayInput: DayCoreInputModel;
  net: NetCalculationResult;
  summary: {
    grossDone: number;
    ordersDone: number;
    shiftClean: number;
    freeAfterPlan: number;
    drivee: number;
    fuelPaid: number;
    fuelStillNeeded: number;
    mode: NetCalculationResult['mode'];
  };
  locked: boolean;
  sensitiveDataIncluded: false;
};

export type DailyHistoryState = {
  schemaVersion: typeof DAILY_HISTORY_VERSION;
  snapshots: DailyHistorySnapshot[];
  updatedAt: string;
  storageMode: 'browser_local' | 'unavailable' | 'supabase_ready';
};

export type DailyHistoryStorageAdapter = {
  read(): DailyHistoryState | null;
  write(state: DailyHistoryState): void;
  clear(): void;
  isAvailable(): boolean;
};

const storageKey = 'finflow.dailyHistory.v1_33';

export const browserLocalDailyHistoryAdapter: DailyHistoryStorageAdapter = {
  read() {
    if (!this.isAvailable()) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as DailyHistoryState;
      if (parsed.schemaVersion !== DAILY_HISTORY_VERSION) return null;
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

export function createInitialDailyHistoryState(now: string = new Date().toISOString()): DailyHistoryState {
  return {
    schemaVersion: DAILY_HISTORY_VERSION,
    snapshots: [],
    updatedAt: now,
    storageMode: browserLocalDailyHistoryAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function createDailyHistorySnapshot(
  dayInput: DayCoreInputModel,
  net: NetCalculationResult,
  now: string = new Date().toISOString()
): DailyHistorySnapshot {
  return {
    id: `day-snapshot-${dayInput.dayId}-${Math.abs(hashString(dayInput.dayId + now))}`,
    schemaVersion: DAILY_HISTORY_VERSION,
    savedAt: now,
    dayId: dayInput.dayId,
    localDate: dayInput.localDate,
    source: 'quick_daily_input',
    dayInput,
    net,
    summary: {
      grossDone: net.grossDone,
      ordersDone: dayInput.taxi.ordersDone,
      shiftClean: net.shiftCleanExpected,
      freeAfterPlan: net.realFreeExpectedAfterDayPlan,
      drivee: net.driveeDone,
      fuelPaid: dayInput.taxi.fuelAlreadyPaid,
      fuelStillNeeded: net.fuelStillNeeded,
      mode: net.mode
    },
    locked: false,
    sensitiveDataIncluded: false
  };
}

export function addDailyHistorySnapshot(
  previous: DailyHistoryState,
  snapshot: DailyHistorySnapshot,
  now: string = new Date().toISOString()
): DailyHistoryState {
  return {
    ...previous,
    snapshots: [snapshot, ...previous.snapshots].slice(0, 120),
    updatedAt: now,
    storageMode: browserLocalDailyHistoryAdapter.isAvailable() ? 'browser_local' : 'unavailable'
  };
}

export function deleteDailyHistorySnapshot(previous: DailyHistoryState, snapshotId: string, now: string = new Date().toISOString()): DailyHistoryState {
  return {
    ...previous,
    snapshots: previous.snapshots.filter(snapshot => snapshot.id !== snapshotId),
    updatedAt: now
  };
}

export function toggleDailyHistorySnapshotLock(previous: DailyHistoryState, snapshotId: string, now: string = new Date().toISOString()): DailyHistoryState {
  return {
    ...previous,
    snapshots: previous.snapshots.map(snapshot => snapshot.id === snapshotId ? { ...snapshot, locked: !snapshot.locked } : snapshot),
    updatedAt: now
  };
}

export function summarizeDailyHistory(state: DailyHistoryState) {
  const totalGross = state.snapshots.reduce((sum, snapshot) => sum + snapshot.summary.grossDone, 0);
  const totalClean = state.snapshots.reduce((sum, snapshot) => sum + snapshot.summary.shiftClean, 0);
  const totalFree = state.snapshots.reduce((sum, snapshot) => sum + snapshot.summary.freeAfterPlan, 0);
  const totalOrders = state.snapshots.reduce((sum, snapshot) => sum + snapshot.summary.ordersDone, 0);

  return {
    daysSaved: state.snapshots.length,
    totalGross,
    totalClean,
    totalFree,
    totalOrders,
    averageClean: state.snapshots.length > 0 ? Math.round(totalClean / state.snapshots.length) : 0
  };
}


export function getDailyHistorySnapshotById(state: DailyHistoryState, snapshotId: string) {
  return state.snapshots.find(snapshot => snapshot.id === snapshotId) ?? null;
}

export function buildDailyHistoryComparison(currentNet: NetCalculationResult, snapshot: DailyHistorySnapshot) {
  return {
    grossDelta: currentNet.grossDone - snapshot.summary.grossDone,
    cleanDelta: currentNet.shiftCleanExpected - snapshot.summary.shiftClean,
    freeDelta: currentNet.realFreeExpectedAfterDayPlan - snapshot.summary.freeAfterPlan,
    ordersDelta: currentNet.grossDone > 0 ? currentNet.grossDone - snapshot.summary.grossDone : 0,
    modeChanged: currentNet.mode !== snapshot.summary.mode
  };
}

export function restoreSnapshotToDayInput(snapshot: DailyHistorySnapshot): DayCoreInputModel {
  return {
    ...snapshot.dayInput,
    status: 'review_needed',
    reviewNotes: [
      `Восстановлено из снимка истории ${snapshot.localDate}.`,
      ...snapshot.dayInput.reviewNotes.filter(note => !note.startsWith('Восстановлено из снимка истории'))
    ].slice(0, 12)
  };
}


export type DailyHistoryAnalytics = {
  daysSaved: number;
  totalGross: number;
  totalClean: number;
  totalFree: number;
  totalOrders: number;
  averageGross: number;
  averageClean: number;
  averageFree: number;
  averageOrders: number;
  bestCleanSnapshot: DailyHistorySnapshot | null;
  worstCleanSnapshot: DailyHistorySnapshot | null;
  targetNet: number;
  targetHitDays: number;
  targetHitRate: number;
  recoveryDays: number;
  emergencyDays: number;
  lastSnapshot: DailyHistorySnapshot | null;
  previousSnapshot: DailyHistorySnapshot | null;
  cleanTrendDelta: number;
  recommendation: string;
};

export function analyzeDailyHistory(state: DailyHistoryState, targetNet: number = 8500): DailyHistoryAnalytics {
  const snapshots = [...state.snapshots].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  const daysSaved = snapshots.length;
  const totalGross = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.grossDone, 0);
  const totalClean = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.shiftClean, 0);
  const totalFree = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.freeAfterPlan, 0);
  const totalOrders = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.ordersDone, 0);
  const bestCleanSnapshot = snapshots.reduce<DailyHistorySnapshot | null>((best, snapshot) => !best || snapshot.summary.shiftClean > best.summary.shiftClean ? snapshot : best, null);
  const worstCleanSnapshot = snapshots.reduce<DailyHistorySnapshot | null>((worst, snapshot) => !worst || snapshot.summary.shiftClean < worst.summary.shiftClean ? snapshot : worst, null);
  const targetHitDays = snapshots.filter(snapshot => snapshot.summary.shiftClean >= targetNet).length;
  const recoveryDays = snapshots.filter(snapshot => snapshot.summary.mode === 'recovery').length;
  const emergencyDays = snapshots.filter(snapshot => snapshot.summary.mode === 'emergency').length;
  const lastSnapshot = snapshots.at(-1) ?? null;
  const previousSnapshot = snapshots.at(-2) ?? null;
  const cleanTrendDelta = lastSnapshot && previousSnapshot ? lastSnapshot.summary.shiftClean - previousSnapshot.summary.shiftClean : 0;
  const averageClean = daysSaved > 0 ? Math.round(totalClean / daysSaved) : 0;

  return {
    daysSaved,
    totalGross,
    totalClean,
    totalFree,
    totalOrders,
    averageGross: daysSaved > 0 ? Math.round(totalGross / daysSaved) : 0,
    averageClean,
    averageFree: daysSaved > 0 ? Math.round(totalFree / daysSaved) : 0,
    averageOrders: daysSaved > 0 ? Math.round(totalOrders / daysSaved) : 0,
    bestCleanSnapshot,
    worstCleanSnapshot,
    targetNet,
    targetHitDays,
    targetHitRate: daysSaved > 0 ? Math.round((targetHitDays / daysSaved) * 100) : 0,
    recoveryDays,
    emergencyDays,
    lastSnapshot,
    previousSnapshot,
    cleanTrendDelta,
    recommendation: buildDailyHistoryRecommendation(daysSaved, averageClean, targetNet, cleanTrendDelta, emergencyDays)
  };
}

function buildDailyHistoryRecommendation(daysSaved: number, averageClean: number, targetNet: number, cleanTrendDelta: number, emergencyDays: number) {
  if (daysSaved === 0) return 'Сначала сохрани хотя бы один день, чтобы появилась реальная аналитика.';
  if (daysSaved < 3) return 'Истории пока мало: сохрани 3–5 дней, чтобы FinFlow начал видеть нормальную динамику.';
  if (averageClean >= targetNet && cleanTrendDelta >= 0) return 'Средние чистые держатся на цели или выше. Следующий шаг — распределение по фондам и стабильность.';
  if (averageClean >= targetNet) return 'Средние чистые в норме, но последний день слабее предыдущего. Проверь старт смены, бензин и простои.';
  if (emergencyDays > 0) return 'Есть Emergency-дни. Нужно защищать ранний старт, бензин и минимальную дневную цель, иначе фонды будут срываться.';
  return 'Средние чистые ниже цели. Нужен режим Recovery: меньше гибких трат и больше контроля по заказам/часам.';
}

export function getDailyHistoryStorageLabel(state: DailyHistoryState) {
  if (state.storageMode === 'browser_local') return 'история дней сохранена локально';
  if (state.storageMode === 'supabase_ready') return 'история готова к Supabase';
  return 'история недоступна';
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}

export type DailyHistoryPeriodId = 'day' | 'week' | 'month' | 'year' | 'all';

export type DailyHistoryPeriodSummary = {
  period: DailyHistoryPeriodId;
  label: string;
  anchorDate: string;
  savedDays: number;
  totalGross: number;
  totalClean: number;
  totalFree: number;
  totalOrders: number;
  averageClean: number;
  targetNet: number;
  targetHitDays: number;
  targetHitRate: number;
  bestDay: DailyHistorySnapshot | null;
  worstDay: DailyHistorySnapshot | null;
  snapshots: DailyHistorySnapshot[];
};

export type DailySaveQaStatus = 'ready' | 'review' | 'blocked';

export type DailySaveQaCheck = {
  id: string;
  title: string;
  status: 'done' | 'warning' | 'blocked';
  detail: string;
};

export type DailySaveQaSnapshot = {
  version: 'daily_save_qa_v2_45';
  status: DailySaveQaStatus;
  percent: number;
  headline: string;
  nextAction: string;
  duplicateSameDateSnapshots: number;
  currentDayAlreadySaved: boolean;
  checks: DailySaveQaCheck[];
};

export function buildDailyHistoryPeriodSummary(
  state: DailyHistoryState,
  period: DailyHistoryPeriodId,
  anchorDate: string,
  targetNet: number = 8500
): DailyHistoryPeriodSummary {
  const snapshots = filterSnapshotsByPeriod(state.snapshots, period, anchorDate)
    .sort((a, b) => a.localDate.localeCompare(b.localDate) || a.savedAt.localeCompare(b.savedAt));
  const totalGross = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.grossDone, 0);
  const totalClean = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.shiftClean, 0);
  const totalFree = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.freeAfterPlan, 0);
  const totalOrders = snapshots.reduce((sum, snapshot) => sum + snapshot.summary.ordersDone, 0);
  const bestDay = snapshots.reduce<DailyHistorySnapshot | null>((best, snapshot) => !best || snapshot.summary.shiftClean > best.summary.shiftClean ? snapshot : best, null);
  const worstDay = snapshots.reduce<DailyHistorySnapshot | null>((worst, snapshot) => !worst || snapshot.summary.shiftClean < worst.summary.shiftClean ? snapshot : worst, null);
  const targetHitDays = snapshots.filter(snapshot => snapshot.summary.shiftClean >= targetNet).length;

  return {
    period,
    label: buildPeriodLabel(period, anchorDate),
    anchorDate,
    savedDays: snapshots.length,
    totalGross,
    totalClean,
    totalFree,
    totalOrders,
    averageClean: snapshots.length > 0 ? Math.round(totalClean / snapshots.length) : 0,
    targetNet,
    targetHitDays,
    targetHitRate: snapshots.length > 0 ? Math.round((targetHitDays / snapshots.length) * 100) : 0,
    bestDay,
    worstDay,
    snapshots
  };
}

export function buildDailySaveQaSnapshot(input: {
  dayInput: DayCoreInputModel;
  net: NetCalculationResult;
  recordsCount: number;
  ordersCount: number;
  workCosts: number;
  personalExpenses: number;
  historyState: DailyHistoryState;
}): DailySaveQaSnapshot {
  const sameDateSnapshots = input.historyState.snapshots.filter(snapshot => snapshot.localDate === input.dayInput.localDate);
  const currentDayAlreadySaved = sameDateSnapshots.length > 0;
  const hasRealRecords = input.recordsCount > 0;
  const hasWorkProgress = input.ordersCount > 0 || input.net.grossDone > 0;
  const hasWorkCosts = input.workCosts > 0 || input.dayInput.taxi.fuelAlreadyPaid > 0;
  const hasMoneyBaseline = input.dayInput.money.cash + input.dayInput.money.card + input.dayInput.money.driveeBalance > 0;
  const reviewNotes = input.dayInput.reviewNotes.length;

  const checks: DailySaveQaCheck[] = [
    {
      id: 'records-source',
      title: 'Есть источник записей',
      status: hasRealRecords ? 'done' : 'blocked',
      detail: hasRealRecords ? `${input.recordsCount} записей готовы к снимку дня.` : 'Нет записей дня: snapshot будет почти пустым.'
    },
    {
      id: 'work-progress',
      title: 'Работа/заказы попали в день',
      status: hasWorkProgress ? 'done' : 'warning',
      detail: hasWorkProgress ? `${input.ordersCount} заказов / ${input.net.grossDone.toLocaleString('ru-RU')} ₽ грязными.` : 'Заказы или оборот пока не внесены.'
    },
    {
      id: 'work-costs',
      title: 'Рабочие издержки отделены',
      status: hasWorkCosts ? 'done' : hasWorkProgress ? 'warning' : 'blocked',
      detail: hasWorkCosts ? `Бензин/Drivee учтены: ${input.workCosts.toLocaleString('ru-RU')} ₽.` : 'Без бензина/Drivee чистые могут быть завышены.'
    },
    {
      id: 'money-baseline',
      title: 'Деньги сейчас введены',
      status: hasMoneyBaseline ? 'done' : 'warning',
      detail: hasMoneyBaseline ? 'Наличные/карта/Drivee дают базу для свободных денег.' : 'Нет текущего баланса: свободные деньги условные.'
    },
    {
      id: 'personal-expenses',
      title: 'Личные расходы проверены',
      status: input.personalExpenses > 0 ? 'done' : 'warning',
      detail: input.personalExpenses > 0 ? `Личные расходы: ${input.personalExpenses.toLocaleString('ru-RU')} ₽.` : 'Еда/встречи/прочее не внесены или их не было.'
    },
    {
      id: 'duplicate-save',
      title: 'Нет случайного дубля дня',
      status: currentDayAlreadySaved ? 'warning' : 'done',
      detail: currentDayAlreadySaved ? `На эту дату уже есть ${sameDateSnapshots.length} снимок/снимка. Перед сохранением проверь, нужен ли новый.` : 'На эту дату ещё нет сохранённого снимка.'
    },
    {
      id: 'review-notes',
      title: 'Review notes понятны',
      status: reviewNotes > 8 ? 'warning' : 'done',
      detail: reviewNotes > 8 ? `Много заметок review: ${reviewNotes}. Перед backup лучше проверить.` : 'Review notes не выглядят перегруженными.'
    }
  ];

  const score = checks.reduce((sum, check) => {
    if (check.status === 'done') return sum + 1;
    if (check.status === 'warning') return sum + 0.5;
    return sum;
  }, 0);
  const percent = Math.round((score / checks.length) * 100);
  const blockedCount = checks.filter(check => check.status === 'blocked').length;
  const status: DailySaveQaStatus = blockedCount > 0 ? 'blocked' : percent >= 78 ? 'ready' : 'review';

  return {
    version: 'daily_save_qa_v2_45',
    status,
    percent,
    headline: status === 'ready'
      ? `День можно сохранять · ${percent}%`
      : status === 'blocked'
        ? `Сохранение рискованно · ${percent}%`
        : `Нужна проверка перед snapshot · ${percent}%`,
    nextAction: buildDailySaveNextAction(status, checks),
    duplicateSameDateSnapshots: sameDateSnapshots.length,
    currentDayAlreadySaved,
    checks
  };
}

function buildDailySaveNextAction(status: DailySaveQaStatus, checks: DailySaveQaCheck[]) {
  const firstBlocked = checks.find(check => check.status === 'blocked');
  const firstWarning = checks.find(check => check.status === 'warning');
  if (firstBlocked) return `Сначала исправь: ${firstBlocked.title}.`;
  if (status === 'ready') return 'Можно сохранить snapshot дня, затем сделать backup перед cloud/Supabase.';
  if (firstWarning) return `Проверь перед сохранением: ${firstWarning.title}.`;
  return 'Проверь записи и сохрани день.';
}

function filterSnapshotsByPeriod(snapshots: DailyHistorySnapshot[], period: DailyHistoryPeriodId, anchorDate: string) {
  if (period === 'all') return snapshots;
  const anchor = parseLocalDate(anchorDate);
  if (!anchor) return snapshots;
  return snapshots.filter(snapshot => {
    const date = parseLocalDate(snapshot.localDate);
    if (!date) return false;
    if (period === 'day') return snapshot.localDate === anchorDate;
    if (period === 'week') {
      const [start, end] = getWeekRange(anchor);
      return date >= start && date <= end;
    }
    if (period === 'month') return date.getFullYear() === anchor.getFullYear() && date.getMonth() === anchor.getMonth();
    if (period === 'year') return date.getFullYear() === anchor.getFullYear();
    return true;
  });
}

function buildPeriodLabel(period: DailyHistoryPeriodId, anchorDate: string) {
  const anchor = parseLocalDate(anchorDate);
  if (!anchor || period === 'all') return 'Вся история';
  if (period === 'day') return formatRuDate(anchor);
  if (period === 'week') {
    const [start, end] = getWeekRange(anchor);
    return `${formatRuDate(start)} — ${formatRuDate(end)}`;
  }
  if (period === 'month') return anchor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  return String(anchor.getFullYear());
}

function getWeekRange(date: Date): [Date, Date] {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

function parseLocalDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatRuDate(date: Date) {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}
