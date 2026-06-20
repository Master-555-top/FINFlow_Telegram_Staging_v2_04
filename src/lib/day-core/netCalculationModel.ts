import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';

export const NET_CALCULATION_VERSION = 'net_calculation_v1_47' as const;

export type NetCalculationMode = 'normal' | 'recovery' | 'emergency';

export type NetCalculationLine = {
  id: string;
  title: string;
  amount: number;
  kind: 'gross' | 'platform_cost' | 'work_cost' | 'personal_cost' | 'obligation' | 'reserve' | 'goal';
  required: boolean;
  note: string;
};

export type NetCalculationResult = {
  schemaVersion: typeof NET_CALCULATION_VERSION;
  dayId: string;
  grossDone: number;
  grossExpected: number;
  targetGross: number;
  targetNet: number;
  driveeRate: number;
  driveeDone: number;
  driveeExpected: number;
  fuelPlanned: number;
  fuelAlreadyPaid: number;
  fuelStillNeeded: number;
  plannedTaskCosts: number;
  criticalTodayCosts: number;
  driveeTopupCashflow: number;
  netDoneAfterDrivee: number;
  netDoneAfterWorkCosts: number;
  netExpectedAfterDrivee: number;
  netExpectedAfterWorkCosts: number;
  shiftCleanExpected: number;
  realFreeExpectedAfterDayPlan: number;
  cleanMoneyDefinition: string;
  freeMoneyDefinition: string;
  remainingGrossToTarget: number;
  remainingNetToTarget: number;
  grossNeededForTargetNet: number;
  grossNeededFromNowForTargetNet: number;
  mode: NetCalculationMode;
  lines: NetCalculationLine[];
  warnings: string[];
  recommendation: string;
};

export function calculateDayNet(input: DayCoreInputModel): NetCalculationResult {
  const grossDone = safeMoney(input.taxi.grossDone);
  const grossExpected = Math.max(grossDone, safeMoney(input.taxi.expectedGrossByEvening));
  const targetGross = safeMoney(input.taxi.targetGrossToday);
  const targetNet = safeMoney(input.taxi.targetNetToday);
  const driveeRate = clamp(input.taxi.driveeRate, 0, 0.5);

  const driveeDone = Math.round(grossDone * driveeRate);
  const driveeExpected = Math.round(grossExpected * driveeRate);
  const fuelPlanned = safeMoney(input.taxi.fuelPlanned);
  const fuelAlreadyPaid = safeMoney(input.taxi.fuelAlreadyPaid);
  const fuelStillNeeded = Math.max(0, fuelPlanned - fuelAlreadyPaid);

  const plannedTaskCosts = input.tasks
    .filter(task => task.plannedToday)
    .reduce((sum, task) => sum + safeMoney(task.moneyCost), 0);

  const plannedNonFuelTaskCosts = input.tasks
    .filter(task => task.plannedToday && task.id !== 'fuel')
    .reduce((sum, task) => sum + safeMoney(task.moneyCost), 0);

  const driveeTopupCashflow = input.tasks
    .filter(task => task.plannedToday && task.type === 'work' && task.title.toLowerCase().includes('drivee'))
    .reduce((sum, task) => sum + safeMoney(task.moneyCost), 0);

  const criticalTodayCosts = input.tasks
    .filter(task => task.plannedToday && (task.priority === 'critical' || task.priority === 'high'))
    .reduce((sum, task) => sum + safeMoney(task.moneyCost), 0);

  const netDoneAfterDrivee = Math.max(0, grossDone - driveeDone);
  const netDoneAfterWorkCosts = Math.max(0, netDoneAfterDrivee - fuelAlreadyPaid);
  const netExpectedAfterDrivee = Math.max(0, grossExpected - driveeExpected);
  const netExpectedAfterWorkCosts = Math.max(0, netExpectedAfterDrivee - fuelStillNeeded);
  const shiftCleanExpected = netExpectedAfterWorkCosts;
  const realFreeExpectedAfterDayPlan = Math.max(0, shiftCleanExpected - plannedNonFuelTaskCosts);

  const remainingGrossToTarget = Math.max(0, targetGross - grossDone);
  const remainingNetToTarget = Math.max(0, targetNet - netExpectedAfterWorkCosts);
  const grossNeededForTargetNet = calculateGrossNeededForNet(targetNet, driveeRate, fuelPlanned);
  const grossNeededFromNowForTargetNet = Math.max(0, grossNeededForTargetNet - grossDone);

  const warnings: string[] = [];
  if (netExpectedAfterWorkCosts < targetNet) warnings.push('Прогноз чистыми ниже дневной цели.');
  if (grossNeededForTargetNet > targetGross) warnings.push('Цель грязными ниже, чем нужно для чистой цели с текущими расходами.');
  if (fuelAlreadyPaid < fuelPlanned) warnings.push('Бензин ещё не закрыт полностью.');
  if (plannedTaskCosts > netExpectedAfterWorkCosts) warnings.push('Плановые расходы дня съедают почти весь чистый результат.');

  const mode: NetCalculationMode = netExpectedAfterWorkCosts >= targetNet
    ? 'normal'
    : netExpectedAfterWorkCosts >= targetNet * 0.7
      ? 'recovery'
      : 'emergency';

  const lines: NetCalculationLine[] = [
    { id: 'gross-expected', title: 'Прогноз оборота грязными', amount: grossExpected, kind: 'gross', required: true, note: 'Все заказы до вычета Drivee и расходов.' },
    { id: 'drivee-expected', title: 'Drivee / комиссия', amount: driveeExpected, kind: 'platform_cost', required: true, note: `Считается как ${Math.round(driveeRate * 100)}% от грязных.` },
    { id: 'drivee-topup', title: 'Пополнение Drivee / cashflow', amount: driveeTopupCashflow, kind: 'work_cost', required: false, note: 'Это пополнение баланса/движение денег, не то же самое, что расчётная комиссия Drivee от заказов.' },
    { id: 'fuel-needed', title: 'Бензин ещё нужен', amount: fuelStillNeeded, kind: 'work_cost', required: true, note: 'Рабочий расход, без него нельзя нормально продолжать смену.' },
    { id: 'shift-clean', title: 'Чистые со смены', amount: shiftCleanExpected, kind: 'gross', required: true, note: 'Это твой правильный рабочий расчёт: грязными минус комиссия и бензин.' },
    { id: 'planned-tasks', title: 'Плановые расходы/задачи', amount: plannedNonFuelTaskCosts, kind: 'personal_cost', required: false, note: 'Еда, встреча, админ-задачи и прочее.' },
    { id: 'real-free-after-day-plan', title: 'Реально свободно после плана', amount: realFreeExpectedAfterDayPlan, kind: 'reserve', required: true, note: 'Сколько останется после рабочих и дневных расходов.' }
  ];

  return {
    schemaVersion: NET_CALCULATION_VERSION,
    dayId: input.dayId,
    grossDone,
    grossExpected,
    targetGross,
    targetNet,
    driveeRate,
    driveeDone,
    driveeExpected,
    fuelPlanned,
    fuelAlreadyPaid,
    fuelStillNeeded,
    plannedTaskCosts,
    criticalTodayCosts,
    driveeTopupCashflow,
    netDoneAfterDrivee,
    netDoneAfterWorkCosts,
    netExpectedAfterDrivee,
    netExpectedAfterWorkCosts,
    shiftCleanExpected,
    realFreeExpectedAfterDayPlan,
    cleanMoneyDefinition: 'Чистые со смены = грязный оборот - Drivee/комиссия - бензин.',
    freeMoneyDefinition: 'Свободные после плана = чистые со смены - еда - встреча - обязательства - дневные задачи.',
    remainingGrossToTarget,
    remainingNetToTarget,
    grossNeededForTargetNet,
    grossNeededFromNowForTargetNet,
    mode,
    lines,
    warnings,
    recommendation: buildNetRecommendation(mode, remainingNetToTarget, grossNeededFromNowForTargetNet, fuelStillNeeded)
  };
}

export function calculateGrossNeededForNet(targetNet: number, driveeRate: number, workCosts: number) {
  const safeRate = clamp(driveeRate, 0, 0.5);
  return Math.ceil((safeMoney(targetNet) + safeMoney(workCosts)) / Math.max(0.01, 1 - safeRate));
}

function buildNetRecommendation(mode: NetCalculationMode, remainingNet: number, grossNeededFromNow: number, fuelStillNeeded: number) {
  if (mode === 'normal') {
    return 'Чистые со смены выглядят достижимыми. После этого уже можно распределять свободные деньги по фондам, но сначала закрыть рабочий фонд и обязательства.';
  }
  if (mode === 'recovery') {
    return `Режим Recovery: до рабочих чистых не хватает примерно ${formatRubPlain(remainingNet)}. Нужно добрать около ${formatRubPlain(grossNeededFromNow)} грязными с учётом комиссии и бензина.`;
  }
  return `Режим Emergency: рабочие чистые сильно под риском. Сначала закрыть бензин (${formatRubPlain(fuelStillNeeded)}), рабочий остаток и обязательства; гибкие траты перенести.`;
}

function safeMoney(value: number | undefined) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatRubPlain(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' ₽';
}
