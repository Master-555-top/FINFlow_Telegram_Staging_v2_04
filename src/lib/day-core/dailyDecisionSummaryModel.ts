import type { FuelNetIntegrationReport } from '@/lib/day-core/fuelNetIntegrationModel';
import type { CarRepairAllocationAdvisor } from '@/lib/day-core/carRepairAllocationModel';
import type { DailyAllocationResult } from '@/lib/day-core/dailyAllocationModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import type { OilServiceStatus } from '@/lib/car/carMaintenanceModel';

export const DAILY_DECISION_SUMMARY_VERSION = 'daily_decision_summary_v1_78' as const;

export type DailyDecisionMode = 'normal' | 'recovery' | 'emergency';

export type DailyDecisionSignal = {
  id: string;
  level: 'good' | 'watch' | 'warning' | 'critical';
  title: string;
  message: string;
};

export type DailyDecisionSummary = {
  version: typeof DAILY_DECISION_SUMMARY_VERSION;
  mode: DailyDecisionMode;
  headline: string;
  primaryAction: string;
  workDecision: string;
  fuelDecision: string;
  carDecision: string;
  allocationDecision: string;
  spendingDecision: string;
  signals: DailyDecisionSignal[];
};

export function buildDailyDecisionSummary(input: {
  net: NetCalculationResult;
  allocation: DailyAllocationResult;
  fuelNet: FuelNetIntegrationReport;
  carRepair: CarRepairAllocationAdvisor;
  oil: OilServiceStatus;
}): DailyDecisionSummary {
  const signals = buildSignals(input);
  const mode = resolveMode(input, signals);

  return {
    version: DAILY_DECISION_SUMMARY_VERSION,
    mode,
    headline: buildHeadline(mode),
    primaryAction: buildPrimaryAction(mode, input),
    workDecision: buildWorkDecision(input.net, input.fuelNet),
    fuelDecision: buildFuelDecision(input.fuelNet),
    carDecision: buildCarDecision(input.carRepair, input.oil),
    allocationDecision: buildAllocationDecision(input.allocation, input.carRepair),
    spendingDecision: buildSpendingDecision(input.net, input.fuelNet, input.carRepair),
    signals
  };
}

function buildSignals(input: {
  net: NetCalculationResult;
  allocation: DailyAllocationResult;
  fuelNet: FuelNetIntegrationReport;
  carRepair: CarRepairAllocationAdvisor;
  oil: OilServiceStatus;
}): DailyDecisionSignal[] {
  const signals: DailyDecisionSignal[] = [];

  if (input.net.mode === 'emergency') {
    signals.push({
      id: 'net_emergency',
      level: 'critical',
      title: 'День в режиме Emergency',
      message: 'Чистая цель сильно под риском. Сначала добрать оборот и закрыть рабочие расходы.'
    });
  } else if (input.net.mode === 'recovery') {
    signals.push({
      id: 'net_recovery',
      level: 'watch',
      title: 'День в режиме Recovery',
      message: 'Цель ещё можно подтянуть, но гибкие траты лучше отложить.'
    });
  }

  if (input.fuelNet.fuelDeltaVsPlanRub > 500) {
    signals.push({
      id: 'fuel_above_plan',
      level: 'warning',
      title: 'Бензин выше плана',
      message: `По одометру топливо выше плана на ${formatRub(input.fuelNet.fuelDeltaVsPlanRub)}.`
    });
  }

  if (input.fuelNet.shiftCleanUsingOdometerFuelRub < input.net.targetNet) {
    signals.push({
      id: 'clean_risk_by_fuel',
      level: 'warning',
      title: 'Чистые с одометром ниже цели',
      message: `С учётом одометра чистые: ${formatRub(input.fuelNet.shiftCleanUsingOdometerFuelRub)}.`
    });
  }

  if (input.carRepair.status === 'missing_fund') {
    signals.push({
      id: 'repair_fund_missing',
      level: 'warning',
      title: 'Ремонтный фонд отсутствует',
      message: 'Машина — рабочий актив такси. Фонд ремонта нужно восстановить.'
    });
  } else if (input.carRepair.dailyProtectionGapRub > 0) {
    signals.push({
      id: 'repair_underfunded',
      level: 'watch',
      title: 'Ремонтный фонд недополучает',
      message: `Сегодня не хватает ${formatRub(input.carRepair.dailyProtectionGapRub)} до защитного плана ремонта.`
    });
  }

  if (input.oil.status === 'reminder_due' || input.oil.status === 'change_due') {
    signals.push({
      id: 'oil_service_due',
      level: input.oil.status === 'change_due' ? 'critical' : 'warning',
      title: 'Масло требует внимания',
      message: input.oil.recommendation
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: 'day_controlled',
      level: 'good',
      title: 'День под контролем',
      message: 'Критичных конфликтов между работой, бензином, машиной и распределением не видно.'
    });
  }

  return signals.slice(0, 6);
}

function resolveMode(
  input: {
    net: NetCalculationResult;
    allocation: DailyAllocationResult;
    fuelNet: FuelNetIntegrationReport;
    carRepair: CarRepairAllocationAdvisor;
    oil: OilServiceStatus;
  },
  signals: DailyDecisionSignal[]
): DailyDecisionMode {
  if (
    input.net.mode === 'emergency'
    || input.allocation.mode === 'emergency'
    || input.oil.status === 'change_due'
    || signals.some(signal => signal.level === 'critical')
  ) return 'emergency';

  if (
    input.net.mode === 'recovery'
    || input.allocation.mode === 'recovery'
    || input.fuelNet.mode === 'warning'
    || input.carRepair.status === 'underfunded'
    || input.carRepair.status === 'missing_fund'
    || input.oil.status === 'watch'
    || input.oil.status === 'reminder_due'
  ) return 'recovery';

  return 'normal';
}

function buildHeadline(mode: DailyDecisionMode) {
  if (mode === 'emergency') return 'Итог дня: защита денег и машины важнее гибких трат';
  if (mode === 'recovery') return 'Итог дня: можно выровнять план, но нужен контроль';
  return 'Итог дня: план выглядит управляемым';
}

function buildPrimaryAction(
  mode: DailyDecisionMode,
  input: {
    net: NetCalculationResult;
    fuelNet: FuelNetIntegrationReport;
    carRepair: CarRepairAllocationAdvisor;
  }
) {
  if (mode === 'emergency') {
    return `Сначала добрать рабочие чистые. Ориентир по грязным для чистой цели с одометром: ${formatRub(input.fuelNet.grossNeededForTargetNetUsingOdometerFuelRub)}.`;
  }
  if (mode === 'recovery') {
    return `Обнови бензин по одометру, защити ремонтный фонд и добери недостающее до чистой цели: ${formatRub(input.net.remainingNetToTarget)}.`;
  }
  if (input.carRepair.dailyProtectionGapRub > 0) {
    return `Перед гибкими тратами добавь в ремонт машины ещё около ${formatRub(input.carRepair.dailyProtectionGapRub)}.`;
  }
  return 'Можно продолжать день по плану: работа → бензин → машина → обязательства → только потом гибкие траты.';
}

function buildWorkDecision(net: NetCalculationResult, fuelNet: FuelNetIntegrationReport) {
  if (fuelNet.shiftCleanUsingOdometerFuelRub < net.targetNet) {
    return `Работа: чистые с одометром ниже цели. Нужно ориентироваться на ${formatRub(fuelNet.grossNeededForTargetNetUsingOdometerFuelRub)} грязными для цели.`;
  }
  return `Работа: прогноз чистыми с одометром ${formatRub(fuelNet.shiftCleanUsingOdometerFuelRub)} при цели ${formatRub(net.targetNet)}.`;
}

function buildFuelDecision(fuelNet: FuelNetIntegrationReport) {
  if (fuelNet.fuelDeltaVsPlanRub > 500) {
    return `Бензин: по пробегу выше плана на ${formatRub(fuelNet.fuelDeltaVsPlanRub)}. Лучше применить одометр в план дня.`;
  }
  if (fuelNet.fuelDeltaVsPlanRub < -300) {
    return `Бензин: по пробегу ниже плана на ${formatRub(Math.abs(fuelNet.fuelDeltaVsPlanRub))}, но запас лучше не тратить до конца смены.`;
  }
  return `Бензин: план и одометр примерно совпадают. Учитывай ${formatRub(fuelNet.odometerFuelRub)} как рабочую издержку.`;
}

function buildCarDecision(carRepair: CarRepairAllocationAdvisor, oil: OilServiceStatus) {
  if (oil.status === 'change_due' || oil.status === 'reminder_due') {
    return `Машина: ${oil.recommendation} Ремонтный фонд: осталось ${formatRub(carRepair.remainingRub)}.`;
  }
  if (carRepair.dailyProtectionGapRub > 0) {
    return `Машина: ремонтный фонд недополучает ${formatRub(carRepair.dailyProtectionGapRub)}. Не выводи всё в гибкие цели.`;
  }
  return `Машина: ремонтный фонд защищён на сегодня. ${oil.recommendation}`;
}

function buildAllocationDecision(allocation: DailyAllocationResult, carRepair: CarRepairAllocationAdvisor) {
  if (allocation.mode === 'emergency') {
    return `Распределение: Emergency. Дефицит ${formatRub(allocation.shortage)} — только обязательства, работа и машина.`;
  }
  if (carRepair.dailyProtectionGapRub > 0) {
    return `Распределение: перед гибкими целями закрыть ремонтный gap ${formatRub(carRepair.dailyProtectionGapRub)}.`;
  }
  return `Распределение: доступно ${formatRub(allocation.availableToAllocate)}, распределено ${formatRub(allocation.totalAllocated)}.`;
}

function buildSpendingDecision(
  net: NetCalculationResult,
  fuelNet: FuelNetIntegrationReport,
  carRepair: CarRepairAllocationAdvisor
) {
  if (fuelNet.freeMoneyUsingOdometerFuelRub <= 0) {
    return 'Траты: сейчас нельзя. После бензина по одометру свободных денег нет.';
  }
  if (net.mode !== 'normal' || carRepair.dailyProtectionGapRub > 0) {
    return 'Траты: только обязательное. Гибкие покупки — после чистой цели и защиты машины.';
  }
  return `Траты: осторожно можно только после распределения. Свободно с одометром: ${formatRub(fuelNet.freeMoneyUsingOdometerFuelRub)}.`;
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
