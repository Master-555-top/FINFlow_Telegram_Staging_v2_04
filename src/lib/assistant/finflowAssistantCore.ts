import type { DailyAllocationResult } from '@/lib/day-core/dailyAllocationModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import type { DailyRecordsSummary } from '@/lib/day-core/dailyRecordsModel';

export const FINFLOW_ASSISTANT_CORE_VERSION = 'finflow_assistant_core_v1_56' as const;

export type FinflowAssistantPriority = 'critical' | 'high' | 'normal' | 'info';

export type FinflowAssistantSignal = {
  id: string;
  priority: FinflowAssistantPriority;
  title: string;
  message: string;
};

export type FinflowAssistantAdvice = {
  mode: 'emergency' | 'recovery' | 'work_focus' | 'allocation_focus' | 'stable';
  headline: string;
  nextAction: string;
  signals: FinflowAssistantSignal[];
  disclaimer: string;
};

export type BuildFinflowAssistantAdviceInput = {
  net: NetCalculationResult;
  allocation: DailyAllocationResult;
  recordsSummary: DailyRecordsSummary;
  currentHour?: number;
};

export function buildFinflowAssistantAdvice(input: BuildFinflowAssistantAdviceInput): FinflowAssistantAdvice {
  const { net, allocation, recordsSummary } = input;
  const signals: FinflowAssistantSignal[] = [];

  if (net.shiftCleanExpected < net.targetNet * 0.55) {
    signals.push({
      id: 'clean_target_far',
      priority: 'critical',
      title: 'Ты далеко от чистой цели',
      message: `Ожидаемые чистые со смены сейчас ${formatRubLocal(net.shiftCleanExpected)}, цель ${formatRubLocal(net.targetNet)}.`
    });
  }

  if (getCriticalShortage(allocation) > 0) {
    signals.push({
      id: 'critical_shortage',
      priority: 'critical',
      title: 'Не закрываются критичные направления',
      message: `Критичный дефицит распределения: ${formatRubLocal(getCriticalShortage(allocation))}.`
    });
  }

  if (net.realFreeExpectedAfterDayPlan < 0) {
    signals.push({
      id: 'negative_free_money',
      priority: 'critical',
      title: 'Свободные деньги уходят в минус',
      message: `После плана остаётся ${formatRubLocal(net.realFreeExpectedAfterDayPlan)}. Нужно урезать гибкие траты или добрать оборот.`
    });
  }

  if (recordsSummary.ordersCount === 0 && net.grossDone === 0) {
    signals.push({
      id: 'no_orders',
      priority: 'high',
      title: 'Заказы ещё не внесены',
      message: 'Без заказов помощник видит день как пустой. Внеси первые заказы или план смены.'
    });
  }

  if (recordsSummary.driveeTopupPaid > 0 && net.driveeExpected > 0) {
    signals.push({
      id: 'drivee_separated',
      priority: 'info',
      title: 'Drivee разделён правильно',
      message: 'Комиссия считается от грязных заказов, а пополнение Drivee хранится отдельной записью.'
    });
  }

  if (recordsSummary.fuelPaid < Math.min(net.fuelStillNeeded, 500)) {
    signals.push({
      id: 'fuel_watch',
      priority: 'normal',
      title: 'Проверь бензин',
      message: `Внесено бензина ${formatRubLocal(recordsSummary.fuelPaid)}, план/потребность ${formatRubLocal(net.fuelStillNeeded)}.`
    });
  }

  const mode = selectMode(net, allocation);
  return {
    mode,
    headline: buildHeadline(mode),
    nextAction: buildNextAction(mode, net, allocation),
    signals,
    disclaimer: 'Локальный помощник v1.56 работает по правилам FINFlow. Внешний AI/OpenAI/n8n ещё не подключён и должен подключаться только server-side.'
  };
}

function selectMode(net: NetCalculationResult, allocation: DailyAllocationResult): FinflowAssistantAdvice['mode'] {
  if (net.realFreeExpectedAfterDayPlan < 0 || getCriticalShortage(allocation) > 0) return 'emergency';
  if (net.shiftCleanExpected < net.targetNet * 0.75) return 'recovery';
  if (net.remainingNetToTarget > 0) return 'work_focus';
  if (allocation.shortage > 0) return 'allocation_focus';
  return 'stable';
}

function buildHeadline(mode: FinflowAssistantAdvice['mode']) {
  if (mode === 'emergency') return 'Режим: защита дня';
  if (mode === 'recovery') return 'Режим: догоняем план';
  if (mode === 'work_focus') return 'Режим: фокус на смене';
  if (mode === 'allocation_focus') return 'Режим: распределяем деньги';
  return 'Режим: день под контролем';
}

function buildNextAction(mode: FinflowAssistantAdvice['mode'], net: NetCalculationResult, allocation: DailyAllocationResult) {
  if (mode === 'emergency') {
    return `Сначала закрой критичное: добери минимум ${formatRubLocal(Math.max(net.remainingNetToTarget, getCriticalShortage(allocation)))} или перенеси гибкие траты.`;
  }
  if (mode === 'recovery') {
    return `Рабочий фокус: добери чистыми примерно ${formatRubLocal(net.remainingNetToTarget)}. Не распыляй деньги по необязательным целям.`;
  }
  if (mode === 'work_focus') {
    return `Продолжай смену до чистой цели: осталось ${formatRubLocal(net.remainingNetToTarget)}.`;
  }
  if (mode === 'allocation_focus') {
    return `Чистые уже ближе к плану, но распределению не хватает ${formatRubLocal(allocation.shortage)}. Сначала обязательства/машина/подушка.`;
  }
  return 'Можно фиксировать результат дня, распределять остаток и не ломать режим.';
}

function getCriticalShortage(allocation: DailyAllocationResult) {
  return allocation.buckets
    .filter(bucket => bucket.priority === 'critical')
    .reduce((sum, bucket) => sum + Math.max(0, bucket.remainingNeed), 0);
}

function formatRubLocal(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
