import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyAllocationResult } from '@/lib/day-core/dailyAllocationModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import { finflowCarReality } from '@/lib/project/finflowRealityContext';

export const CAR_REPAIR_ALLOCATION_VERSION = 'car_repair_allocation_v1_75' as const;

export type CarRepairAllocationStatus = 'protected' | 'underfunded' | 'missing_fund' | 'no_free_money';

export type CarRepairAllocationAdvisor = {
  version: typeof CAR_REPAIR_ALLOCATION_VERSION;
  status: CarRepairAllocationStatus;
  fundExists: boolean;
  repairFundId: string | null;
  targetRub: number;
  currentRub: number;
  remainingRub: number;
  allocatedTodayRub: number;
  suggestedTodayRub: number;
  dailyProtectionGapRub: number;
  knownRepairNeeds: readonly string[];
  recommendation: string;
  warnings: string[];
};

export function buildCarRepairAllocationAdvisor(input: {
  day: DayCoreInputModel;
  allocation: DailyAllocationResult;
  net: NetCalculationResult;
}): CarRepairAllocationAdvisor {
  const repairFund = findCarRepairFund(input.day);
  const targetRub = repairFund?.targetAmount ?? finflowCarReality.repairFundTargetRub;
  const currentRub = repairFund?.currentAmount ?? 0;
  const remainingRub = Math.max(0, targetRub - currentRub);
  const repairBucket = input.allocation.buckets.find(bucket =>
    bucket.id === `fund-${repairFund?.id}` || isRepairText(bucket.title)
  );
  const allocatedTodayRub = repairBucket?.allocatedAmount ?? 0;
  const suggestedTodayRub = suggestRepairAllocationToday(input.allocation.availableToAllocate, remainingRub, input.allocation.mode);
  const dailyProtectionGapRub = Math.max(0, suggestedTodayRub - allocatedTodayRub);

  const warnings: string[] = [];
  if (!repairFund) warnings.push('Ремонтный фонд машины отсутствует в фондах дня.');
  if (input.allocation.availableToAllocate <= 0) warnings.push('Нет свободных денег для ремонта: сначала добрать чистые со смены.');
  if (dailyProtectionGapRub > 0 && input.allocation.availableToAllocate > 0) warnings.push(`Ремонтный фонд недополучает сегодня ${formatRub(dailyProtectionGapRub)}.`);
  if (remainingRub > 0) warnings.push(`До ремонтной цели машины осталось ${formatRub(remainingRub)}.`);
  if (finflowCarReality.knownRepairNeeds.length > 0) warnings.push(`Известные риски: ${finflowCarReality.knownRepairNeeds.join(', ')}.`);

  const status: CarRepairAllocationStatus = !repairFund
    ? 'missing_fund'
    : input.allocation.availableToAllocate <= 0
      ? 'no_free_money'
      : dailyProtectionGapRub > 0
        ? 'underfunded'
        : 'protected';

  return {
    version: CAR_REPAIR_ALLOCATION_VERSION,
    status,
    fundExists: Boolean(repairFund),
    repairFundId: repairFund?.id ?? null,
    targetRub,
    currentRub,
    remainingRub,
    allocatedTodayRub,
    suggestedTodayRub,
    dailyProtectionGapRub,
    knownRepairNeeds: finflowCarReality.knownRepairNeeds,
    recommendation: buildRecommendation(status, suggestedTodayRub, allocatedTodayRub),
    warnings
  };
}

export function findCarRepairFund(input: DayCoreInputModel) {
  return input.funds.find(fund => fund.id === 'car-repair')
    ?? input.funds.find(fund => isRepairText(fund.title));
}

function isRepairText(value: string) {
  const text = value.toLowerCase();
  return text.includes('ремонт')
    || text.includes('ходов')
    || text.includes('подвес')
    || text.includes('машин')
    || text.includes('стойк')
    || text.includes('колод');
}

function suggestRepairAllocationToday(availableToAllocate: number, remainingRub: number, mode: DailyAllocationResult['mode']) {
  if (remainingRub <= 0 || availableToAllocate <= 0) return 0;
  if (mode === 'emergency') return Math.min(remainingRub, Math.min(500, availableToAllocate));
  if (mode === 'recovery') return Math.min(remainingRub, Math.max(500, Math.round(availableToAllocate * 0.15)));
  return Math.min(remainingRub, Math.max(1000, Math.round(availableToAllocate * 0.25), Math.min(3000, availableToAllocate)));
}

function buildRecommendation(status: CarRepairAllocationStatus, suggested: number, allocated: number) {
  if (status === 'missing_fund') return 'Создай или восстанови ремонтный фонд машины: машина — рабочий актив такси.';
  if (status === 'no_free_money') return 'Сегодня сначала добери чистые. Ремонтный фонд не трогать, но и не забывать.';
  if (status === 'underfunded') return `Лучше направить в ремонт машины около ${formatRub(suggested)} сегодня. Сейчас заложено ${formatRub(allocated)}.`;
  return 'Ремонтный фонд защищён на сегодня. Гибкие траты можно рассматривать только после обязательств и рабочего фонда.';
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
