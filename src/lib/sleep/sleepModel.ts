export type SleepStatusId = 'critical_short' | 'low' | 'normal' | 'recovery' | 'long' | 'overslept';
export type SleepWorkMode = 'safe_rest' | 'light_shift' | 'normal_shift' | 'medium_shift' | 'soft_reset';

export type SleepRecord = {
  id: string;
  fromDate: string;
  toDate: string;
  sleptAt: string;
  wokeAt: string;
  minutes: number;
  shiftEndedAt?: string;
  shiftWasClosed?: boolean;
  note?: string;
  createdAtIso: string;
  updatedAtIso: string;
};

export type SleepStatus = {
  id: SleepStatusId;
  label: string;
  shortLabel: string;
  tone: 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'yellow';
  workMode: SleepWorkMode;
  workLabel: string;
  recommendation: string;
};

export type SleepRecordAnalysis = {
  record: SleepRecord;
  status: SleepStatus;
  debtDaysBefore: number;
  debtStreakBefore: number;
  isRecoveryAllowed: boolean;
  shiftAdaptiveNote: string;
  suggestedNextSleepAt?: string;
  suggestedWakeAt?: string;
};

export type SleepStats = {
  days: number;
  averageMinutes: number;
  maxMinutes: number;
  lastMinutes: number;
  normalDays: number;
  debtDays: number;
  oversleptDays: number;
  recoveryDays: number;
  lastAnalysis: SleepRecordAnalysis | null;
  recommendation: string;
};

export const FINFLOW_SLEEP_STORAGE_KEY = 'finflow_sleep_records_v2_16';

export const seedSleepRecords: SleepRecord[] = [
  makeSeed('2026-06-13', '2026-06-12', '2026-06-13', '05:10', '16:00'),
  makeSeed('2026-06-14', '2026-06-13', '2026-06-14', '11:00', '15:00'),
  makeSeed('2026-06-15', '2026-06-14', '2026-06-15', '04:30', '07:45'),
  makeSeed('2026-06-16', '2026-06-15', '2026-06-16', '04:30', '14:00'),
  makeSeed('2026-06-17', '2026-06-16', '2026-06-17', '05:00', '13:00'),
  makeSeed('2026-06-18', '2026-06-17', '2026-06-18', '04:30', '08:30'),
  makeSeed('2026-06-19', '2026-06-18', '2026-06-19', '05:00', '10:00'),
  makeSeed('2026-06-20', '2026-06-19', '2026-06-20', '04:20', '14:20')
];

function makeSeed(id: string, fromDate: string, toDate: string, sleptAt: string, wokeAt: string): SleepRecord {
  const now = '2026-06-21T00:00:00.000Z';
  return {
    id,
    fromDate,
    toDate,
    sleptAt,
    wokeAt,
    minutes: calculateSleepMinutes(fromDate, sleptAt, toDate, wokeAt),
    createdAtIso: now,
    updatedAtIso: now
  };
}

export function calculateSleepMinutes(fromDate: string, sleptAt: string, toDate: string, wokeAt: string) {
  const start = new Date(`${fromDate}T${sleptAt}:00`);
  let end = new Date(`${toDate}T${wokeAt}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

export function createSleepRecord(input: {
  fromDate: string;
  toDate: string;
  sleptAt: string;
  wokeAt: string;
  shiftEndedAt?: string;
  shiftWasClosed?: boolean;
  note?: string;
}): SleepRecord {
  const now = new Date().toISOString();
  const id = input.toDate || now.slice(0, 10);
  return {
    id,
    fromDate: input.fromDate,
    toDate: input.toDate,
    sleptAt: input.sleptAt,
    wokeAt: input.wokeAt,
    minutes: calculateSleepMinutes(input.fromDate, input.sleptAt, input.toDate, input.wokeAt),
    shiftEndedAt: input.shiftEndedAt || undefined,
    shiftWasClosed: input.shiftWasClosed ?? false,
    note: input.note?.trim() || undefined,
    createdAtIso: now,
    updatedAtIso: now
  };
}

export function analyzeSleepRecords(records: SleepRecord[]) {
  const sorted = sortSleepRecords(records);
  return sorted.map((record, index) => analyzeSleepRecord(record, sorted.slice(0, index)));
}

export function analyzeSleepRecord(record: SleepRecord, previousRecords: SleepRecord[]): SleepRecordAnalysis {
  const previous3 = previousRecords.slice(-3);
  const debtDaysBefore = previous3.filter(item => item.minutes < 300).length;
  const debtStreakBefore = countDebtStreak(previousRecords);
  const averagePrevious3 = previous3.length > 0
    ? Math.round(previous3.reduce((sum, item) => sum + item.minutes, 0) / previous3.length)
    : 0;
  const isRecoveryAllowed = debtDaysBefore >= 2 || debtStreakBefore >= 2 || (previous3.length >= 3 && averagePrevious3 < 330);
  const status = getSleepStatus(record.minutes, isRecoveryAllowed);
  const shiftAdaptive = buildShiftAdaptivePlan(record, status, isRecoveryAllowed);
  return {
    record,
    status,
    debtDaysBefore,
    debtStreakBefore,
    isRecoveryAllowed,
    shiftAdaptiveNote: shiftAdaptive.note,
    suggestedNextSleepAt: shiftAdaptive.sleepAt,
    suggestedWakeAt: shiftAdaptive.wakeAt
  };
}

export function buildSleepStats(records: SleepRecord[]): SleepStats {
  const analyses = analyzeSleepRecords(records);
  const sorted = analyses.map(item => item.record);
  const days = sorted.length;
  const total = sorted.reduce((sum, record) => sum + record.minutes, 0);
  const lastAnalysis = analyses[analyses.length - 1] ?? null;
  const normalDays = analyses.filter(item => item.status.id === 'normal').length;
  const debtDays = sorted.filter(item => item.minutes < 300).length;
  const oversleptDays = analyses.filter(item => item.status.id === 'overslept').length;
  const recoveryDays = analyses.filter(item => item.status.id === 'recovery').length;
  return {
    days,
    averageMinutes: days ? Math.round(total / days) : 0,
    maxMinutes: sorted.length ? Math.max(...sorted.map(record => record.minutes)) : 0,
    lastMinutes: sorted[sorted.length - 1]?.minutes ?? 0,
    normalDays,
    debtDays,
    oversleptDays,
    recoveryDays,
    lastAnalysis,
    recommendation: buildOverallSleepRecommendation(lastAnalysis, normalDays, days, debtDays, oversleptDays)
  };
}

export function getSleepStatus(minutes: number, recoveryAllowed: boolean): SleepStatus {
  if (minutes > 600) {
    return {
      id: 'overslept',
      label: 'Проспал / сбой режима',
      shortLabel: 'Проспал',
      tone: 'red',
      workMode: 'soft_reset',
      workLabel: 'Мягкий день',
      recommendation: 'Сон дольше 10 часов считаем критичным: день может быть сбит. Лучше не ставить максимальный рабочий план и закрепить следующий сон раньше.'
    };
  }
  if (minutes < 240) {
    return {
      id: 'critical_short',
      label: 'Критический недосып',
      shortLabel: 'Критично',
      tone: 'red',
      workMode: 'safe_rest',
      workLabel: 'Без перегруза',
      recommendation: 'Меньше 4 часов — опасная зона для длинной смены. Лучше короткий безопасный блок, еда, отдых и восстановление.'
    };
  }
  if (minutes < 360) {
    return {
      id: 'low',
      label: 'Мало сна',
      shortLabel: 'Мало',
      tone: 'orange',
      workMode: 'light_shift',
      workLabel: 'Лёгкая смена',
      recommendation: 'Сон 4–6 часов: не ставь жёсткий план. Лучше короткая смена или средний блок без ночного добивания.'
    };
  }
  if (minutes <= 480) {
    return {
      id: 'normal',
      label: 'Норма',
      shortLabel: 'Норма',
      tone: 'green',
      workMode: 'normal_shift',
      workLabel: 'Обычный день',
      recommendation: '6–8 часов — базовая норма. Можно планировать обычный рабочий день, если нет сильной усталости и задач по машине.'
    };
  }
  if (minutes <= 600 && recoveryAllowed) {
    return {
      id: 'recovery',
      label: 'Восстановление',
      shortLabel: 'Восст.',
      tone: 'cyan',
      workMode: 'medium_shift',
      workLabel: 'Средний день',
      recommendation: '8–10 часов допустимы как восстановление после серии недосыпов. Не превращай это в максимальный рабочий день сразу.'
    };
  }
  return {
    id: 'long',
    label: 'Длинный сон',
    shortLabel: 'Длинный',
    tone: 'yellow',
    workMode: 'soft_reset',
    workLabel: 'Контроль режима',
    recommendation: '8–10 часов без накопленного недосыпа — не критично, но режим может смещаться. Держи мягкий план и следующий сон раньше.'
  };
}

function buildShiftAdaptivePlan(record: SleepRecord, status: SleepStatus, recoveryAllowed: boolean) {
  const baseNote = status.recommendation;
  if (!record.shiftWasClosed || !record.shiftEndedAt) {
    return { note: baseNote };
  }

  const sleepDelayMinutes = status.id === 'critical_short' || status.id === 'low' ? 45 : 75;
  const suggestedSleepAt = addMinutesToClock(record.shiftEndedAt, sleepDelayMinutes);
  const targetSleepMinutes = status.id === 'critical_short' || status.id === 'low'
    ? 480
    : status.id === 'overslept'
      ? 420
      : recoveryAllowed
        ? 540
        : 450;
  const suggestedWakeAt = addMinutesToClock(suggestedSleepAt, targetSleepMinutes);
  return {
    sleepAt: suggestedSleepAt,
    wakeAt: suggestedWakeAt,
    note: `Смена закрыта в ${record.shiftEndedAt}. FINFlow предлагает лечь около ${suggestedSleepAt} и встать около ${suggestedWakeAt}. ${baseNote}`
  };
}

function buildOverallSleepRecommendation(last: SleepRecordAnalysis | null, normalDays: number, days: number, debtDays: number, oversleptDays: number) {
  if (!last) return 'Добавь первый сон — FINFlow начнёт строить режим и рекомендации.';
  if (last.status.id === 'overslept') return 'Последний сон >10 часов: считаем это просыпанием/сбоем. Сегодня мягкий план, без максимальной цели.';
  if (last.status.id === 'critical_short') return 'Последний сон критически короткий. Смена только безопасным блоком, лучше восстановиться.';
  if (last.status.id === 'low') return 'Последний сон короткий. План работы лучше сделать легче и не добивать ночь.';
  if (last.status.id === 'recovery') return 'Сон похож на восстановление после недосыпов. День можно вести средним темпом.';
  if (oversleptDays >= 2) return 'Есть повторяющиеся пересыпы. Нужен контроль времени подъёма и более ранний следующий сон.';
  if (days >= 5 && normalDays / days >= 0.55 && debtDays <= 1) return 'Режим держится близко к норме. Можно связывать сон с обычным рабочим планом.';
  return last.status.recommendation;
}

function countDebtStreak(records: SleepRecord[]) {
  let count = 0;
  for (let i = records.length - 1; i >= 0; i -= 1) {
    if (records[i].minutes < 300) count += 1;
    else break;
  }
  return count;
}

export function sortSleepRecords(records: SleepRecord[]) {
  return [...records].sort((a, b) => `${a.toDate}T${a.wokeAt}`.localeCompare(`${b.toDate}T${b.wokeAt}`));
}

export function formatSleepMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}ч ${mins}м` : `${hours}ч`;
}

export function makeSleepNightLabel(record: SleepRecord) {
  return `${formatDateShort(record.fromDate)}→${formatDateShort(record.toDate)}`;
}

export function formatDateShort(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }).replace('.', '');
}

export function addMinutesToClock(clock: string, minutes: number) {
  const [hRaw, mRaw] = clock.split(':');
  const hours = Number(hRaw);
  const mins = Number(mRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return clock;
  const total = (hours * 60 + mins + minutes) % (24 * 60);
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getTodayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

export function getYesterdayDateInput() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

// v2.17 — Live Sleep Session / Wake Decision Flow
export const FINFLOW_SLEEP_LIVE_SESSION_KEY = 'finflow_sleep_live_session_v2_17';
export const FINFLOW_SLEEP_STORAGE_KEY_V2_17 = 'finflow_sleep_records_v2_17';

export type LiveSleepSession = {
  id: string;
  status: 'sleeping';
  fromDate: string;
  sleptAt: string;
  sleptAtIso: string;
  shiftWasClosed?: boolean;
  shiftEndedAt?: string;
  note?: string;
  createdAtIso: string;
  updatedAtIso: string;
};

export type WakeDecision = {
  minutesAsleep: number;
  status: SleepStatus;
  canSleepMore: boolean;
  maxMoreMinutes: number;
  targetMoreMinutes: number;
  wakeHeadline: string;
  sleepAdvice: string;
  workAdvice: string;
  dayWindowAdvice: string;
};

export function getLocalDateInput(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLocalTimeInput(date = new Date()) {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
}

export function createLiveSleepSession(input?: { shiftWasClosed?: boolean; shiftEndedAt?: string; note?: string }, now = new Date()): LiveSleepSession {
  const iso = now.toISOString();
  return {
    id: `sleep-live-${iso}`,
    status: 'sleeping',
    fromDate: getLocalDateInput(now),
    sleptAt: getLocalTimeInput(now),
    sleptAtIso: iso,
    shiftWasClosed: input?.shiftWasClosed ?? false,
    shiftEndedAt: input?.shiftEndedAt || undefined,
    note: input?.note?.trim() || undefined,
    createdAtIso: iso,
    updatedAtIso: iso
  };
}

export function getLiveSleepMinutes(session: LiveSleepSession | null, now = new Date()) {
  if (!session) return 0;
  const start = new Date(session.sleptAtIso);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, Math.round((now.getTime() - start.getTime()) / 60_000));
}

export function finishLiveSleepSession(session: LiveSleepSession, now = new Date()): SleepRecord {
  const toDate = getLocalDateInput(now);
  const wokeAt = getLocalTimeInput(now);
  const minutes = getLiveSleepMinutes(session, now);
  const iso = now.toISOString();
  return {
    id: toDate || iso,
    fromDate: session.fromDate,
    toDate,
    sleptAt: session.sleptAt,
    wokeAt,
    minutes,
    shiftEndedAt: session.shiftEndedAt,
    shiftWasClosed: session.shiftWasClosed ?? false,
    note: session.note,
    createdAtIso: session.createdAtIso,
    updatedAtIso: iso
  };
}

export function buildWakeDecision(input: {
  session: LiveSleepSession | null;
  records: SleepRecord[];
  now?: Date;
  taxiShiftHours?: number;
  taxiActiveHours?: number;
}): WakeDecision | null {
  if (!input.session) return null;
  const now = input.now ?? new Date();
  const minutesAsleep = getLiveSleepMinutes(input.session, now);
  const analyses = analyzeSleepRecords(input.records);
  const last3 = sortSleepRecords(input.records).slice(-3);
  const debtDays = last3.filter(record => record.minutes < 300).length;
  const debtStreak = countDebtStreak(sortSleepRecords(input.records));
  const recoveryAllowed = debtDays >= 2 || debtStreak >= 2;
  const status = getSleepStatus(minutesAsleep, recoveryAllowed);

  const lowerNormal = 360;
  const upperNormal = 480;
  const recoveryLimit = recoveryAllowed ? 600 : 480;
  const hardLimit = 600;
  const targetMinutes = minutesAsleep < lowerNormal ? lowerNormal : Math.min(upperNormal, recoveryLimit);
  const targetMoreMinutes = Math.max(0, targetMinutes - minutesAsleep);
  const maxMoreMinutes = Math.max(0, hardLimit - minutesAsleep);
  const canSleepMore = minutesAsleep < hardLimit && (minutesAsleep < lowerNormal || (recoveryAllowed && minutesAsleep < 540));

  const remainingTodayAfterOneHour = getRemainingDayHours(now, 60);
  const workHoursEstimate = Math.max(0, Math.min(10, remainingTodayAfterOneHour - 2));
  const startTime = addMinutesToClock(getLocalTimeInput(now), 60);

  let wakeHeadline = 'Проверь режим';
  let sleepAdvice = 'Смотри по состоянию, но не уходи за 10 часов.';
  if (minutesAsleep >= hardLimit) {
    wakeHeadline = 'Вставать сейчас';
    sleepAdvice = 'Ты уже за 10 часов. Это пересып и сбой режима, дальше спать нельзя.';
  } else if (minutesAsleep >= lowerNormal && minutesAsleep <= upperNormal) {
    wakeHeadline = 'Норма — лучше вставать';
    sleepAdvice = 'Сон уже в зелёной зоне 6–8 часов. Если нет сильной разбитости, лучше вставать.';
  } else if (minutesAsleep < lowerNormal) {
    wakeHeadline = 'Можно досыпать до нормы';
    sleepAdvice = `До нижней нормы осталось примерно ${formatSleepMinutes(targetMoreMinutes)}.`;
  } else if (recoveryAllowed && minutesAsleep < hardLimit) {
    wakeHeadline = 'Восстановление допустимо';
    sleepAdvice = `После недосыпа можно ещё до ${formatSleepMinutes(maxMoreMinutes)}, но не заходи за 10 часов.`;
  } else {
    wakeHeadline = 'Лучше вставать';
    sleepAdvice = 'Сон уже длинный. Без серии недосыпов дальше спать рискованно для режима.';
  }

  let workAdvice = status.recommendation;
  if (status.id === 'normal') workAdvice = 'Можно ставить обычный рабочий день. Начни спокойно, без хаоса.';
  if (status.id === 'critical_short' || status.id === 'low') workAdvice = 'Сильную смену не ставь. Лучше короткий безопасный блок и восстановление.';
  if (status.id === 'overslept') workAdvice = 'День сбит. Цель лучше сделать мягкой: еда, душ, короткая смена, режим на ночь.';
  if (status.id === 'recovery') workAdvice = 'Это восстановление. Можно средний день, но не максимальный перегруз.';

  const workPrefix = input.taxiShiftHours ? `Уже в смене ${input.taxiShiftHours.toFixed(1)}ч. ` : '';
  const dayWindowAdvice = `${workPrefix}Если встать сейчас и начать около ${startTime}, останется примерно ${remainingTodayAfterOneHour.toFixed(1)}ч активного дня; реалистично под работу около ${workHoursEstimate.toFixed(1)}ч с едой/сборами/делами.`;

  return {
    minutesAsleep,
    status,
    canSleepMore,
    maxMoreMinutes,
    targetMoreMinutes,
    wakeHeadline,
    sleepAdvice,
    workAdvice,
    dayWindowAdvice
  };
}

function getRemainingDayHours(now: Date, afterMinutes: number) {
  const current = now.getHours() * 60 + now.getMinutes() + afterMinutes;
  return Math.max(0, (24 * 60 - current) / 60);
}
