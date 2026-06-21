import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { parseManualTaxiOrderLog, type ParsedTaxiOrderLogShift } from '@/lib/work/taxiOrderLogParser';

export const WORK_TAXI_ENGINE_VERSION = 'work_taxi_engine_v2_38' as const;

export type WorkTaxiMode = 'green' | 'amber' | 'red';

export type WorkTaxiTemplate = {
  id: string;
  label: string;
  amount: number;
  kind: 'order' | 'fuel' | 'commission' | 'shift';
  reason: string;
};

export type WorkTaxiSignal = {
  id: string;
  level: WorkTaxiMode;
  title: string;
  message: string;
};

export type WorkTaxiShiftSnapshot = {
  version: typeof WORK_TAXI_ENGINE_VERSION;
  generatedAtIso: string;
  localDate: string;
  mode: WorkTaxiMode;
  headline: string;
  nextAction: string;
  shift: {
    ordersCount: number;
    grossDone: number;
    targetGrossToday: number;
    remainingGrossToTarget: number;
    expectedGrossByEvening: number;
    activeHours: number;
    fullShiftHours: number;
    idleHours: number;
    activeRubPerHour: number;
    shiftRubPerHour: number;
    targetActiveRubPerHour: number;
    targetShiftRubPerHour: number;
    neededActiveHoursAtCurrentPace: number;
    neededShiftHoursAtCurrentPace: number;
    expectedTargetGap: number;
  };
  costs: {
    driveeRatePercent: number;
    estimatedDriveeCommission: number;
    fuelPaid: number;
    fuelPlanned: number;
    fuelRemaining: number;
    workCostsNow: number;
    netAfterWorkCosts: number;
    distanceKmPlannedMin: number;
    distanceKmPlannedMax: number;
    expectedFuelCostPerKmMin: number;
    expectedFuelCostPerKmMax: number;
  };
  records: {
    taxiRecordIds: string[];
    fuelRecordIds: string[];
    commissionRecordIds: string[];
    latestTaxiAmounts: number[];
  };
  bridge: {
    moneyImpact: string;
    dayImpact: string;
    sleepImpact: string;
  };
  templates: WorkTaxiTemplate[];
  signals: WorkTaxiSignal[];
  syncNotes: string[];
};


export type WorkTaxiManualLogImportPreview = {
  version: typeof WORK_TAXI_ENGINE_VERSION;
  parserVersion: ParsedTaxiOrderLogShift['version'];
  canBuildOrderRecords: boolean;
  canBuildShiftAggregate: boolean;
  dateIso: string | null;
  ordersCount: number;
  grossFromOrders: number;
  grossDeclared: number | null;
  activeHours: number;
  fullShiftHours: number | null;
  idleHours: number | null;
  activeRubPerHour: number;
  shiftRubPerHour: number | null;
  netNeedsCalculation: boolean;
  nextAction: string;
  reviewReasons: string[];
};

export function buildWorkTaxiManualLogImportPreview(text: string): WorkTaxiManualLogImportPreview | null {
  const parsed = parseManualTaxiOrderLog(text);
  if (!parsed) return null;
  return {
    version: WORK_TAXI_ENGINE_VERSION,
    parserVersion: parsed.version,
    canBuildOrderRecords: parsed.ordersCountParsed > 0 && Boolean(parsed.dateIso),
    canBuildShiftAggregate: parsed.ordersCountParsed > 0,
    dateIso: parsed.dateIso,
    ordersCount: parsed.ordersCountParsed,
    grossFromOrders: parsed.grossFromOrders,
    grossDeclared: parsed.grossDeclared,
    activeHours: roundOne(parsed.activeMinutes / 60),
    fullShiftHours: parsed.fullShiftMinutes === null ? null : roundOne(parsed.fullShiftMinutes / 60),
    idleHours: parsed.idleMinutes === null ? null : roundOne(parsed.idleMinutes / 60),
    activeRubPerHour: parsed.activeRubPerHour,
    shiftRubPerHour: parsed.shiftRubPerHour,
    netNeedsCalculation: parsed.netNeedsCalculation,
    nextAction: parsed.dateIso
      ? 'Сначала показать preview: отдельные заказы можно записать как taxi_order, агрегат смены оставить только для проверки без дублирования дохода.'
      : 'Сначала подтвердить дату смены, затем создавать preview заказов.',
    reviewReasons: parsed.reviewReasons
  };
}

export const WORK_TAXI_TEMPLATES: WorkTaxiTemplate[] = [
  { id: 'work-order-300', label: 'Заказ 300', amount: 300, kind: 'order', reason: 'минимальный заказ, быстро фиксировать поток' },
  { id: 'work-order-500', label: 'Заказ 500', amount: 500, kind: 'order', reason: 'частый заказ среднего дня' },
  { id: 'work-order-700', label: 'Заказ 700', amount: 700, kind: 'order', reason: 'хороший заказ, влияет на ₽/час' },
  { id: 'work-order-1000', label: 'Заказ 1000', amount: 1000, kind: 'order', reason: 'сильный заказ для добора цели' },
  { id: 'work-fuel-1800', label: 'Бензин 1800', amount: 1800, kind: 'fuel', reason: 'базовая рабочая издержка дня' },
  { id: 'work-commission-1000', label: 'Комиссия 1000', amount: 1000, kind: 'commission', reason: 'отделить Drivee/комиссию от личных трат' }
];

export function buildWorkTaxiShiftSnapshot(input: DayCoreInputModel, records: DailyRecord[], nowIso = new Date().toISOString()): WorkTaxiShiftSnapshot {
  const enabled = records.filter(record => record.enabled);
  const taxiRecords = enabled.filter(record => record.type === 'taxi_order');
  const fuelRecords = enabled.filter(record => record.type === 'fuel');
  const commissionRecords = enabled.filter(record => record.type === 'drivee_topup');

  const grossFromRecords = sumRecords(taxiRecords);
  const grossDone = grossFromRecords > 0 ? grossFromRecords : safeMoney(input.taxi.grossDone);
  const ordersCount = taxiRecords.length > 0 ? taxiRecords.length : Math.max(0, Math.round(input.taxi.ordersDone));
  const targetGrossToday = safeMoney(input.taxi.targetGrossToday);
  const remainingGrossToTarget = Math.max(0, targetGrossToday - grossDone);
  const expectedGrossByEvening = Math.max(safeMoney(input.taxi.expectedGrossByEvening), grossDone);
  const activeHours = safeHours(input.taxi.activeHours);
  const fullShiftHours = Math.max(activeHours, safeHours(input.taxi.fullShiftHours));
  const idleHours = Math.max(0, roundOne(fullShiftHours - activeHours));
  const activeRubPerHour = activeHours > 0 ? Math.round(grossDone / activeHours) : 0;
  const shiftRubPerHour = fullShiftHours > 0 ? Math.round(grossDone / fullShiftHours) : 0;
  const targetActiveRubPerHour = 1400;
  const targetShiftRubPerHour = 1100;
  const neededActiveHoursAtCurrentPace = activeRubPerHour > 0 ? roundOne(remainingGrossToTarget / activeRubPerHour) : 0;
  const neededShiftHoursAtCurrentPace = shiftRubPerHour > 0 ? roundOne(remainingGrossToTarget / shiftRubPerHour) : 0;
  const expectedTargetGap = Math.max(0, targetGrossToday - expectedGrossByEvening);

  const fuelPaidFromRecords = sumRecords(fuelRecords);
  const fuelPaid = fuelPaidFromRecords > 0 ? fuelPaidFromRecords : safeMoney(input.taxi.fuelAlreadyPaid);
  const commissionPaid = sumRecords(commissionRecords);
  const driveeRatePercent = Math.round(safeRate(input.taxi.driveeRate) * 1000) / 10;
  const estimatedDriveeCommission = Math.round(grossDone * safeRate(input.taxi.driveeRate));
  const fuelPlanned = safeMoney(input.taxi.fuelPlanned);
  const fuelRemaining = Math.max(0, fuelPlanned - fuelPaid);
  const workCostsNow = Math.max(estimatedDriveeCommission, commissionPaid) + fuelPaid;
  const netAfterWorkCosts = Math.max(0, grossDone - workCostsNow);
  const distanceKmPlannedMin = Math.max(0, Math.round(input.taxi.distanceKmPlannedMin));
  const distanceKmPlannedMax = Math.max(distanceKmPlannedMin, Math.round(input.taxi.distanceKmPlannedMax));
  const expectedFuelCostPerKmMin = distanceKmPlannedMax > 0 ? Math.round(fuelPlanned / distanceKmPlannedMax) : 0;
  const expectedFuelCostPerKmMax = distanceKmPlannedMin > 0 ? Math.round(fuelPlanned / distanceKmPlannedMin) : 0;

  const mode = inferWorkMode({ grossDone, targetGrossToday, activeRubPerHour, shiftRubPerHour, expectedTargetGap, fullShiftHours });
  const signals = buildWorkSignals({ activeRubPerHour, remainingGrossToTarget, expectedTargetGap, fuelRemaining, idleHours, ordersCount });

  return {
    version: WORK_TAXI_ENGINE_VERSION,
    generatedAtIso: nowIso,
    localDate: input.localDate,
    mode,
    headline: buildHeadline(mode, grossDone, targetGrossToday),
    nextAction: buildNextAction({ mode, remainingGrossToTarget, activeRubPerHour, neededActiveHoursAtCurrentPace, expectedTargetGap, fuelRemaining }),
    shift: {
      ordersCount,
      grossDone,
      targetGrossToday,
      remainingGrossToTarget,
      expectedGrossByEvening,
      activeHours,
      fullShiftHours,
      idleHours,
      activeRubPerHour,
      shiftRubPerHour,
      targetActiveRubPerHour,
      targetShiftRubPerHour,
      neededActiveHoursAtCurrentPace,
      neededShiftHoursAtCurrentPace,
      expectedTargetGap
    },
    costs: {
      driveeRatePercent,
      estimatedDriveeCommission,
      fuelPaid,
      fuelPlanned,
      fuelRemaining,
      workCostsNow,
      netAfterWorkCosts,
      distanceKmPlannedMin,
      distanceKmPlannedMax,
      expectedFuelCostPerKmMin,
      expectedFuelCostPerKmMax
    },
    records: {
      taxiRecordIds: taxiRecords.map(record => record.id),
      fuelRecordIds: fuelRecords.map(record => record.id),
      commissionRecordIds: commissionRecords.map(record => record.id),
      latestTaxiAmounts: taxiRecords.slice(-6).map(record => safeMoney(record.amount))
    },
    bridge: {
      moneyImpact: `Работа передаёт в Деньги ${grossDone.toLocaleString('ru-RU')} ₽ грязными и ${workCostsNow.toLocaleString('ru-RU')} ₽ рабочих издержек.`,
      dayImpact: remainingGrossToTarget > 0 ? `До дневной цели осталось ${remainingGrossToTarget.toLocaleString('ru-RU')} ₽ грязными.` : 'Дневная грязная цель закрыта или превышена.',
      sleepImpact: fullShiftHours >= 10 ? 'Длинная смена: вечером Сон должен учитывать риск сбоя режима.' : 'Смена пока не выглядит перегруженной по длительности.'
    },
    templates: WORK_TAXI_TEMPLATES,
    signals,
    syncNotes: [
      'Work Taxi Engine v2.38 читает Daily Records, Day Core и lifecycle preview, не меняя storage keys сна.',
      'Рабочая история остаётся внутри раздела Работа; глобальная вкладка История не добавляется.',
      'Связка Работа → Деньги строится через taxi_order/fuel/drivee_topup records, включая ручной журнал заказов и lifecycle смены v2.38.'
    ]
  };
}

function inferWorkMode(input: {
  grossDone: number;
  targetGrossToday: number;
  activeRubPerHour: number;
  shiftRubPerHour: number;
  expectedTargetGap: number;
  fullShiftHours: number;
}): WorkTaxiMode {
  const progress = input.targetGrossToday > 0 ? input.grossDone / input.targetGrossToday : 0;
  if (progress >= 0.85 || (input.activeRubPerHour >= 1200 && input.shiftRubPerHour >= 950 && input.expectedTargetGap === 0)) return 'green';
  if (input.fullShiftHours >= 11 || input.activeRubPerHour < 650 || input.expectedTargetGap > 4500) return 'red';
  return 'amber';
}

function buildHeadline(mode: WorkTaxiMode, grossDone: number, targetGrossToday: number) {
  if (grossDone <= 0) return 'Смена ещё не набрана';
  if (mode === 'green') return 'Работа идёт сильно';
  if (mode === 'red') return 'Нужен рабочий разворот';
  const progress = targetGrossToday > 0 ? Math.round((grossDone / targetGrossToday) * 100) : 0;
  return `Работа в процессе · ${progress}% цели`;
}

function buildNextAction(input: {
  mode: WorkTaxiMode;
  remainingGrossToTarget: number;
  activeRubPerHour: number;
  neededActiveHoursAtCurrentPace: number;
  expectedTargetGap: number;
  fuelRemaining: number;
}) {
  if (input.remainingGrossToTarget <= 0) return 'Цель по грязному обороту закрыта: дальше контролируй бензин, комиссию и не распыляй чистые деньги.';
  if (input.fuelRemaining > 0) return `Сначала учти рабочую издержку: до плана бензина ещё ${input.fuelRemaining.toLocaleString('ru-RU')} ₽, потом добирай оборот.`;
  if (input.activeRubPerHour <= 0) return 'Добавь первые заказы или агрегат смены, чтобы FINFlow посчитал темп, ₽/час и реалистичность дня.';
  if (input.mode === 'red') return `Не дави хаотично: при текущем темпе нужно ещё около ${input.neededActiveHoursAtCurrentPace} активных часов. Лучше выбрать сильные зоны/часы или снизить план.`;
  if (input.expectedTargetGap > 0) return `Прогноз не дотягивает до цели на ${input.expectedTargetGap.toLocaleString('ru-RU')} ₽. Нужны сильные заказы или продление смены.`;
  return `Добери ${input.remainingGrossToTarget.toLocaleString('ru-RU')} ₽ грязными и затем зафиксируй итог смены.`;
}

function buildWorkSignals(input: {
  activeRubPerHour: number;
  remainingGrossToTarget: number;
  expectedTargetGap: number;
  fuelRemaining: number;
  idleHours: number;
  ordersCount: number;
}): WorkTaxiSignal[] {
  const signals: WorkTaxiSignal[] = [];
  signals.push({
    id: 'pace',
    level: input.activeRubPerHour >= 1200 ? 'green' : input.activeRubPerHour >= 800 ? 'amber' : 'red',
    title: 'Темп активной работы',
    message: input.activeRubPerHour > 0 ? `${input.activeRubPerHour.toLocaleString('ru-RU')} ₽/ч активного времени.` : 'Пока нет темпа: добавь заказ или агрегат смены.'
  });
  signals.push({
    id: 'shift-density',
    level: input.idleHours <= 2 ? 'green' : input.idleHours <= 4 ? 'amber' : 'red',
    title: 'Плотность смены',
    message: input.idleHours > 0 ? `Простой/неактивное время около ${input.idleHours}ч.` : 'Активное и полное время смены совпадают.'
  });
  if (input.remainingGrossToTarget > 0) {
    signals.push({
      id: 'target-gap',
      level: input.expectedTargetGap > 3000 ? 'red' : 'amber',
      title: 'До цели',
      message: `Осталось ${input.remainingGrossToTarget.toLocaleString('ru-RU')} ₽ грязными.`
    });
  } else {
    signals.push({ id: 'target-closed', level: 'green', title: 'Цель', message: 'Грязная цель дня закрыта.' });
  }
  if (input.fuelRemaining > 0) {
    signals.push({ id: 'fuel', level: 'amber', title: 'Бензин', message: `По плану ещё ${input.fuelRemaining.toLocaleString('ru-RU')} ₽ рабочей издержки.` });
  }
  if (input.ordersCount === 0) {
    signals.push({ id: 'orders-empty', level: 'red', title: 'Заказы', message: 'Нет отдельных заказов: история и аналитика зон пока слабые.' });
  }
  return signals.slice(0, 5);
}

function sumRecords(records: DailyRecord[]) {
  return records.reduce((sum, record) => sum + safeMoney(record.amount), 0);
}

function safeMoney(value: number | undefined | null) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value));
}

function safeHours(value: number | undefined | null) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value * 10) / 10);
}

function safeRate(value: number | undefined | null) {
  if (!value || Number.isNaN(value)) return 0;
  if (value > 1) return value / 100;
  return Math.max(0, value);
}

function roundOne(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 10) / 10);
}
