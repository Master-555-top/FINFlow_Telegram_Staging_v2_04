import { formatLocalIsoDate } from '@/lib/time/localDate';
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
export const FINFLOW_SLEEP_STORAGE_LEGACY_KEYS = ['finflow_sleep_records_v2_16'] as const;

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
  // Duration is derived from the clock times only. A single human sleep is always
  // under 24h, so if wake-time is not after sleep-time we roll to the next day.
  // The from/to dates are night LABELS (the owner logs early-morning sleep as
  // "с <prev> на <curr>" while both clock times land on the same calendar day),
  // so they must NOT inflate the duration. Using both dates previously added ~24h
  // and made every night read as 30h+ / "Проспал". fromDate/toDate are kept in the
  // signature for compatibility and labelling.
  void fromDate;
  void toDate;
  const [sh, sm] = sleptAt.split(':').map(Number);
  const [wh, wm] = wokeAt.split(':').map(Number);
  if (![sh, sm, wh, wm].every(Number.isFinite)) return 0;
  let diff = wh * 60 + wm - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function createSleepRecord(input: {
  fromDate: string;
  toDate: string;
  sleptAt: string;
  wokeAt: string;
  shiftEndedAt?: string;
  shiftWasClosed?: boolean;
  note?: string;
}, existing?: SleepRecord | null): SleepRecord {
  const now = new Date().toISOString();
  const id = existing?.id ?? makeSleepRecordId(input.fromDate, input.toDate, input.sleptAt);
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
    createdAtIso: existing?.createdAtIso ?? now,
    updatedAtIso: now
  };
}

export function makeSleepRecordId(fromDate: string, toDate: string, sleptAt: string) {
  const safeTime = sleptAt.replace(':', '');
  return `sleep-${fromDate}-${toDate}-${safeTime}`;
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
  return formatLocalIsoDate();
}

export function getYesterdayDateInput() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatLocalIsoDate(date);
}

// v2.18.1 — Live Sleep Session / Wake Decision Flow.
// Storage keys intentionally stay v2_17 to preserve local history after the sync.
export const FINFLOW_SLEEP_LIVE_SESSION_KEY = 'finflow_sleep_live_session_v2_17';
export const FINFLOW_SLEEP_STORAGE_KEY_V2_17 = 'finflow_sleep_records_v2_17';
export const FINFLOW_SLEEP_CURRENT_STORAGE_KEY = FINFLOW_SLEEP_STORAGE_KEY_V2_17;

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

export type WakeDecisionOption = {
  id: 'now' | 'plus30' | 'plus60' | 'plus90';
  label: string;
  extraMinutes: number;
  projectedMinutes: number;
  status: SleepStatus;
  canChoose: boolean;
  headline: string;
  sleepAdvice: string;
  workAdvice: string;
  dayWindowAdvice: string;
  workHoursEstimate: number;
  activeDayHours: number;
  projectedStartTime: string;
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
  options: WakeDecisionOption[];
};

export function getLocalDateInput(date = new Date()) {
  return formatLocalIsoDate(date);
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
    id: `sleep-${session.sleptAtIso}`,
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
  const recoveryAllowed = isRecoveryWindowAllowed(input.records);
  const status = getSleepStatus(minutesAsleep, recoveryAllowed);

  const lowerNormal = 360;
  const upperNormal = 480;
  const hardLimit = 600;
  const targetMinutes = minutesAsleep < lowerNormal ? lowerNormal : recoveryAllowed ? Math.min(540, hardLimit) : upperNormal;
  const targetMoreMinutes = Math.max(0, targetMinutes - minutesAsleep);
  const maxMoreMinutes = Math.max(0, hardLimit - minutesAsleep);
  const canSleepMore = minutesAsleep < hardLimit && (minutesAsleep < lowerNormal || (recoveryAllowed && minutesAsleep < 540));
  const options = buildWakeDecisionOptions({
    minutesAsleep,
    records: input.records,
    now,
    taxiShiftHours: input.taxiShiftHours,
    taxiActiveHours: input.taxiActiveHours
  });
  const primary = options[0];

  return {
    minutesAsleep,
    status,
    canSleepMore,
    maxMoreMinutes,
    targetMoreMinutes,
    wakeHeadline: primary.headline,
    sleepAdvice: primary.sleepAdvice,
    workAdvice: primary.workAdvice,
    dayWindowAdvice: primary.dayWindowAdvice,
    options
  };
}

export function buildWakeDecisionOptions(input: {
  minutesAsleep: number;
  records: SleepRecord[];
  now?: Date;
  taxiShiftHours?: number;
  taxiActiveHours?: number;
}): WakeDecisionOption[] {
  const now = input.now ?? new Date();
  const recoveryAllowed = isRecoveryWindowAllowed(input.records);
  return [
    buildWakeDecisionOption({ id: 'now', label: 'Сейчас', extraMinutes: 0, minutesAsleep: input.minutesAsleep, recoveryAllowed, now, taxiShiftHours: input.taxiShiftHours, taxiActiveHours: input.taxiActiveHours }),
    buildWakeDecisionOption({ id: 'plus30', label: '+30м', extraMinutes: 30, minutesAsleep: input.minutesAsleep, recoveryAllowed, now, taxiShiftHours: input.taxiShiftHours, taxiActiveHours: input.taxiActiveHours }),
    buildWakeDecisionOption({ id: 'plus60', label: '+60м', extraMinutes: 60, minutesAsleep: input.minutesAsleep, recoveryAllowed, now, taxiShiftHours: input.taxiShiftHours, taxiActiveHours: input.taxiActiveHours }),
    buildWakeDecisionOption({ id: 'plus90', label: '+90м', extraMinutes: 90, minutesAsleep: input.minutesAsleep, recoveryAllowed, now, taxiShiftHours: input.taxiShiftHours, taxiActiveHours: input.taxiActiveHours })
  ];
}

function buildWakeDecisionOption(input: {
  id: WakeDecisionOption['id'];
  label: string;
  extraMinutes: number;
  minutesAsleep: number;
  recoveryAllowed: boolean;
  now: Date;
  taxiShiftHours?: number;
  taxiActiveHours?: number;
}): WakeDecisionOption {
  const projectedMinutes = input.minutesAsleep + input.extraMinutes;
  const status = getSleepStatus(projectedMinutes, input.recoveryAllowed);
  const wakeTime = addMinutesToClock(getLocalTimeInput(input.now), input.extraMinutes);
  const startTime = addMinutesToClock(wakeTime, 60);
  const activeDayHours = getRemainingDayHours(input.now, input.extraMinutes + 60);
  const workHoursEstimate = Math.max(0, Math.min(10, activeDayHours - 2));
  const canChoose = projectedMinutes <= 600 && !(projectedMinutes > 480 && !input.recoveryAllowed && input.extraMinutes > 0);

  let headline = 'Можно рассмотреть';
  if (input.extraMinutes === 0) headline = 'Встать сейчас';
  if (status.id === 'normal') headline = input.extraMinutes === 0 ? 'Норма — вставать' : 'Ещё будет норма';
  if (status.id === 'recovery') headline = 'Восстановление допустимо';
  if (status.id === 'long') headline = 'Риск длинного сна';
  if (status.id === 'overslept') headline = 'Нельзя: пересып';
  if (status.id === 'critical_short') headline = 'Недосып критичный';
  if (status.id === 'low') headline = 'Можно досыпать';

  const sleepAdvice = buildSleepOptionAdvice(projectedMinutes, input.recoveryAllowed, input.extraMinutes);
  const workAdvice = buildWorkAdvice(status, workHoursEstimate);
  const shiftPrefix = input.taxiShiftHours ? `Смена уже ${input.taxiShiftHours.toFixed(1)}ч. ` : '';
  const dayWindowAdvice = `${shiftPrefix}Если встать в ${wakeTime} и начать около ${startTime}, останется примерно ${activeDayHours.toFixed(1)}ч активного дня; под работу реалистично около ${workHoursEstimate.toFixed(1)}ч с едой/сборами/делами.`;

  return {
    id: input.id,
    label: input.label,
    extraMinutes: input.extraMinutes,
    projectedMinutes,
    status,
    canChoose,
    headline,
    sleepAdvice,
    workAdvice,
    dayWindowAdvice,
    workHoursEstimate,
    activeDayHours,
    projectedStartTime: startTime
  };
}

function buildSleepOptionAdvice(projectedMinutes: number, recoveryAllowed: boolean, extraMinutes: number) {
  if (projectedMinutes > 600) return 'Будет больше 10 часов — это пересып и сбой режима. Вставать.';
  if (projectedMinutes < 240) return 'Меньше 4 часов — опасный недосып. Досып допустим, если нет срочных обязательств.';
  if (projectedMinutes < 360) return 'До нормы ещё не дотягивает. Можно добрать сон, но не уходить в бесконтрольное “ещё чуть-чуть”.';
  if (projectedMinutes <= 480) return extraMinutes === 0 ? 'Ты уже в зелёной зоне 6–8 часов. Лучший момент закрепить подъём.' : 'После этого сон останется в норме 6–8 часов.';
  if (projectedMinutes <= 600 && recoveryAllowed) return 'Это восстановление после недосыпа. Допустимо, но максимум до 10 часов.';
  return 'Без накопленного недосыпа это уже длинный сон. Лучше вставать и стабилизировать режим.';
}

function buildWorkAdvice(status: SleepStatus, workHoursEstimate: number) {
  if (status.id === 'overslept') return 'День сбит: мягкая цель, еда, душ, короткая смена и контроль следующего сна.';
  if (status.id === 'critical_short') return 'Сильную смену не ставить. Лучше безопасность, восстановление и короткий блок.';
  if (status.id === 'low') return 'Рабочий день лучше лёгкий/средний, без ночного добивания.';
  if (status.id === 'recovery') return 'Можно средний день, но не максимальный перегруз сразу после восстановления.';
  if (status.id === 'normal' && workHoursEstimate >= 6) return 'Можно обычный рабочий день и нормальный план дохода.';
  if (status.id === 'normal') return 'Сон нормальный, но времени в дне мало — ставь компактный план.';
  return 'Лучше мягкий план и контроль режима, без максимальной цели.';
}

export function isRecoveryWindowAllowed(records: SleepRecord[]) {
  const sorted = sortSleepRecords(records);
  const last3 = sorted.slice(-3);
  const debtDays = last3.filter(record => record.minutes < 300).length;
  const debtStreak = countDebtStreak(sorted);
  const averagePrevious3 = last3.length > 0
    ? Math.round(last3.reduce((sum, item) => sum + item.minutes, 0) / last3.length)
    : 0;
  return debtDays >= 2 || debtStreak >= 2 || (last3.length >= 3 && averagePrevious3 < 330);
}

function getRemainingDayHours(now: Date, afterMinutes: number) {
  const current = now.getHours() * 60 + now.getMinutes() + afterMinutes;
  return Math.max(0, (24 * 60 - current) / 60);
}

