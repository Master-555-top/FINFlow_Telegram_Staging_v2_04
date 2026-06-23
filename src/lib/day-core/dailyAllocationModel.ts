import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import { buildFundPlanningSummary } from '@/lib/day-core/fundPlanningModel';

export const DAILY_ALLOCATION_VERSION = 'daily_allocation_v1_37' as const;

export type AllocationPriority = 'critical' | 'high' | 'normal' | 'flexible' | 'postpone';

export type DailyAllocationBucket = {
  id: string;
  title: string;
  targetAmount: number;
  allocatedAmount: number;
  remainingNeed: number;
  priority: AllocationPriority;
  editableSource: 'obligation' | 'fund' | 'task' | 'system';
  reason: string;
};

export type DailyAllocationResult = {
  schemaVersion: typeof DAILY_ALLOCATION_VERSION;
  dayId: string;
  sourceCleanMoney: number;
  freeAfterPlan: number;
  availableToAllocate: number;
  totalAllocated: number;
  unallocated: number;
  shortage: number;
  mode: 'normal' | 'recovery' | 'emergency';
  strategy: 'critical_first' | 'balanced' | 'shortage_protection';
  buckets: DailyAllocationBucket[];
  recommendation: string;
};

export function buildDailyAllocation(input: DayCoreInputModel, net: NetCalculationResult): DailyAllocationResult {
  const sourceCleanMoney = net.shiftCleanExpected;
  const freeAfterPlan = net.realFreeExpectedAfterDayPlan;
  const availableToAllocate = Math.max(0, freeAfterPlan);

  const desiredBuckets = buildDesiredBuckets(input);
  const sorted = [...desiredBuckets].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));

  let remaining = availableToAllocate;
  const buckets = sorted.map(bucket => {
    const allocatedAmount = Math.min(bucket.targetAmount, remaining);
    remaining = Math.max(0, remaining - allocatedAmount);
    return {
      ...bucket,
      allocatedAmount,
      remainingNeed: Math.max(0, bucket.targetAmount - allocatedAmount)
    };
  });

  const totalAllocated = buckets.reduce((sum, bucket) => sum + bucket.allocatedAmount, 0);
  const shortage = buckets.reduce((sum, bucket) => sum + bucket.remainingNeed, 0);
  const criticalShortage = buckets
    .filter(bucket => bucket.priority === 'critical' || bucket.priority === 'high')
    .reduce((sum, bucket) => sum + bucket.remainingNeed, 0);

  const mode = criticalShortage > 0
    ? 'emergency'
    : shortage > 0
      ? 'recovery'
      : 'normal';

  const strategy = mode === 'normal'
    ? 'balanced'
    : mode === 'recovery'
      ? 'critical_first'
      : 'shortage_protection';

  return {
    schemaVersion: DAILY_ALLOCATION_VERSION,
    dayId: input.dayId,
    sourceCleanMoney,
    freeAfterPlan,
    availableToAllocate,
    totalAllocated,
    unallocated: Math.max(0, availableToAllocate - totalAllocated),
    shortage,
    mode,
    strategy,
    buckets,
    recommendation: buildAllocationRecommendation(mode, availableToAllocate, totalAllocated, shortage, criticalShortage)
  };
}

function buildDesiredBuckets(input: DayCoreInputModel): Omit<DailyAllocationBucket, 'allocatedAmount' | 'remainingNeed'>[] {
  const planning = buildFundPlanningSummary(input);
  const planningBySourceId = new Map(planning.rows.map(row => [`${row.source}:${row.id}`, row]));
  const obligationBuckets = input.obligations.map(obligation => {
    const plan = planningBySourceId.get(`obligation:${obligation.id}`);
    return ({
    id: `obligation-${obligation.id}`,
    title: obligation.title,
    targetAmount: Math.max(0, plan?.dailyNorm ?? obligation.amountDue - obligation.currentSaved),
    priority: mapInputPriority(obligation.priority),
    editableSource: 'obligation' as const,
    reason: plan?.formula ?? `Обязательство: нужно закрыть ${obligation.amountDue} ₽, накоплено ${obligation.currentSaved} ₽.`
  });
  });

  const fundBuckets = input.funds
    .filter(fund => fund.canReceiveToday)
    .map(fund => {
      const plan = planningBySourceId.get(`fund:${fund.id}`);
      return ({
      id: `fund-${fund.id}`,
      title: fund.title,
      targetAmount: Math.max(0, Math.min(
        fund.targetAmount - fund.currentAmount,
        plan?.dailyNorm ?? suggestedDailyFundAmount(fund.targetAmount, fund.priority)
      )),
      priority: mapInputPriority(fund.priority),
      editableSource: 'fund' as const,
      reason: plan?.formula ?? `Фонд: цель ${fund.targetAmount} ₽, сейчас ${fund.currentAmount} ₽.`
    });
    });

  const taskBuckets = input.tasks
    .filter(task => task.plannedToday && task.moneyCost > 0 && task.priority === 'critical')
    .map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      targetAmount: Math.max(0, task.moneyCost),
      priority: mapInputPriority(task.priority),
      editableSource: 'task' as const,
      reason: 'Критичная задача дня, которую нельзя игнорировать.'
    }));

  const systemBuckets: Omit<DailyAllocationBucket, 'allocatedAmount' | 'remainingNeed'>[] = [
    ...(input.funds.some(fund => fund.id === 'working-fund') ? [] : [{
      id: 'system-tomorrow-work',
      title: 'Рабочий остаток на завтра',
      targetAmount: 1000,
      priority: 'high' as const,
      editableSource: 'system' as const,
      reason: 'Чтобы завтра не начинать с нуля и не ломать рабочий день.'
    }]),
    {
      id: 'system-flexible-mini-goal',
      title: 'Гибкая мини-цель',
      targetAmount: 500,
      priority: 'flexible',
      editableSource: 'system',
      reason: 'Можно направить на мелкую покупку, встречу или продукты только если критичное закрыто.'
    }
  ];

  return [...taskBuckets, ...obligationBuckets, ...fundBuckets, ...systemBuckets]
    .filter(bucket => bucket.targetAmount > 0);
}

function suggestedDailyFundAmount(targetAmount: number, priority: string) {
  if (priority === 'critical') return Math.min(targetAmount, 3000);
  if (priority === 'high') return Math.min(targetAmount, 2000);
  if (priority === 'normal') return Math.min(targetAmount, 1000);
  return Math.min(targetAmount, 500);
}

function mapInputPriority(priority: string): AllocationPriority {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'normal') return 'normal';
  if (priority === 'flexible') return 'flexible';
  return 'postpone';
}

function priorityWeight(priority: AllocationPriority) {
  const weights: Record<AllocationPriority, number> = {
    critical: 1,
    high: 2,
    normal: 3,
    flexible: 4,
    postpone: 5
  };
  return weights[priority];
}

function buildAllocationRecommendation(mode: DailyAllocationResult['mode'], available: number, allocated: number, shortage: number, criticalShortage: number) {
  if (available <= 0) return 'Сегодня нечего распределять: сначала нужно добрать чистые со смены и защитить рабочие расходы.';
  if (mode === 'normal') return 'Критичные направления закрываются. Остаток можно направить в подушку, машину или мини-цели.';
  if (mode === 'recovery') return `Режим Recovery: распределено ${allocated} ₽, но не хватает ${shortage} ₽. Гибкие цели лучше перенести.`;
  return `Режим Emergency: критичный дефицит ${criticalShortage} ₽. Деньги направлять только в обязательства, работу завтра и самые важные расходы.`;
}
