import type { DayCoreInputModel, DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import type { WakeDecisionOption } from '@/lib/sleep/sleepModel';

export type MorningTaskFit = {
  task: DayCoreTaskInput;
  fits: boolean;
};

export type MorningWorkPlan = {
  optionId: WakeDecisionOption['id'];
  label: string;
  sleepStatus: string;
  safety: 'safe' | 'caution' | 'soft' | 'blocked';
  safetyLabel: string;
  startTime: string;
  activeDayHours: number;
  recommendedWorkHours: number;
  potentialGross: number;
  estimatedDrivee: number;
  estimatedFuel: number;
  estimatedNetBeforePersonalTasks: number;
  plannedTaskCost: number;
  taskMinutes: number;
  canFitTasks: MorningTaskFit[];
  headline: string;
  recommendation: string;
};

export type MorningPlannerSummary = {
  primary: MorningWorkPlan;
  options: MorningWorkPlan[];
  activeTasks: DayCoreTaskInput[];
  urgentTasks: DayCoreTaskInput[];
  note: string;
};

const PRIORITY_WEIGHT: Record<DayCoreTaskInput['priority'], number> = {
  critical: 0,
  high: 1,
  normal: 2,
  flexible: 3
};

export function buildMorningPlanner(input: {
  dayInput: DayCoreInputModel;
  options: WakeDecisionOption[];
}): MorningPlannerSummary | null {
  if (!input.options.length) return null;
  const activeTasks = input.dayInput.tasks
    .filter(task => task.plannedToday)
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || b.timeCostMinutes - a.timeCostMinutes);
  const options = input.options.map(option => buildMorningWorkPlan(input.dayInput, option, activeTasks));
  const primary = options[0];
  const urgentTasks = activeTasks.filter(task => task.priority === 'critical' || task.priority === 'high');
  return {
    primary,
    options,
    activeTasks,
    urgentTasks,
    note: 'Это не жёсткий прогноз, а утренний ориентир: сон → время → работа → деньги → дела.'
  };
}

function buildMorningWorkPlan(dayInput: DayCoreInputModel, option: WakeDecisionOption, activeTasks: DayCoreTaskInput[]): MorningWorkPlan {
  const statusId = option.status.id;
  const safety = getSafety(statusId);
  const safetyLabel = getSafetyLabel(safety);
  const baseWorkHours = clamp(option.workHoursEstimate, 0, 10);
  const recommendedWorkHours = round1(Math.min(baseWorkHours, getStatusWorkLimit(statusId)));
  const grossPerHour = estimateGrossPerHour(dayInput);
  const remainingGrossToTarget = Math.max(0, dayInput.taxi.targetGrossToday - dayInput.taxi.grossDone);
  const potentialGross = Math.round(Math.min(remainingGrossToTarget || dayInput.taxi.targetGrossToday, recommendedWorkHours * grossPerHour));
  const estimatedDrivee = Math.round(potentialGross * dayInput.taxi.driveeRate);
  const plannedFuelBase = Math.max(0, dayInput.taxi.fuelPlanned - dayInput.taxi.fuelAlreadyPaid);
  const estimatedFuel = Math.round(Math.min(plannedFuelBase, Math.max(0, plannedFuelBase * (recommendedWorkHours / 8))));
  const plannedTaskCost = activeTasks.reduce((sum, task) => sum + task.moneyCost, 0);
  const estimatedNetBeforePersonalTasks = Math.max(0, potentialGross - estimatedDrivee - estimatedFuel);
  const taskMinutesAvailable = Math.max(0, Math.round(option.activeDayHours * 60 - recommendedWorkHours * 60 - 75));
  const canFitTasks = fitTasks(activeTasks, taskMinutesAvailable);
  const taskMinutes = canFitTasks.filter(item => item.fits).reduce((sum, item) => sum + item.task.timeCostMinutes, 0);

  return {
    optionId: option.id,
    label: option.label,
    sleepStatus: option.status.shortLabel,
    safety,
    safetyLabel,
    startTime: option.projectedStartTime,
    activeDayHours: round1(option.activeDayHours),
    recommendedWorkHours,
    potentialGross,
    estimatedDrivee,
    estimatedFuel,
    estimatedNetBeforePersonalTasks,
    plannedTaskCost,
    taskMinutes,
    canFitTasks,
    headline: buildHeadline(option, potentialGross, recommendedWorkHours),
    recommendation: buildRecommendation(statusId, recommendedWorkHours, canFitTasks)
  };
}

function estimateGrossPerHour(dayInput: DayCoreInputModel) {
  const currentRate = dayInput.taxi.activeHours > 0 ? dayInput.taxi.grossDone / dayInput.taxi.activeHours : 0;
  const targetRate = dayInput.taxi.targetGrossToday > 0 ? dayInput.taxi.targetGrossToday / 10 : 0;
  const expectedRate = dayInput.taxi.expectedGrossByEvening > 0 ? dayInput.taxi.expectedGrossByEvening / 8 : 0;
  return Math.max(900, Math.min(1900, currentRate || expectedRate || targetRate || 1200));
}

function fitTasks(tasks: DayCoreTaskInput[], availableMinutes: number): MorningTaskFit[] {
  let left = availableMinutes;
  return tasks.map(task => {
    const fits = task.timeCostMinutes <= left || task.priority === 'critical';
    if (fits) left = Math.max(0, left - task.timeCostMinutes);
    return { task, fits };
  });
}

function getSafety(statusId: string): MorningWorkPlan['safety'] {
  if (statusId === 'overslept') return 'soft';
  if (statusId === 'critical_short') return 'blocked';
  if (statusId === 'low' || statusId === 'long') return 'caution';
  return 'safe';
}

function getSafetyLabel(safety: MorningWorkPlan['safety']) {
  if (safety === 'blocked') return 'безопасность';
  if (safety === 'soft') return 'мягкий день';
  if (safety === 'caution') return 'осторожно';
  return 'можно работать';
}

function getStatusWorkLimit(statusId: string) {
  if (statusId === 'critical_short') return 2.5;
  if (statusId === 'low') return 4.5;
  if (statusId === 'overslept') return 4;
  if (statusId === 'recovery') return 6.5;
  if (statusId === 'long') return 5;
  return 8.5;
}

function buildHeadline(option: WakeDecisionOption, potentialGross: number, recommendedWorkHours: number) {
  if (option.status.id === 'overslept') return 'Дальше спать нельзя — день уже съедается.';
  if (option.status.id === 'critical_short') return 'Сначала безопасность: сильную смену не ставить.';
  return `Если выбрать ${option.label}, ориентир ${formatRub(potentialGross)} грязными за ${recommendedWorkHours.toFixed(1)}ч.`;
}

function buildRecommendation(statusId: string, recommendedWorkHours: number, taskFits: MorningTaskFit[]) {
  const missed = taskFits.filter(item => !item.fits).map(item => item.task.title);
  if (statusId === 'overslept') return 'Фокус: встать, еда/душ, короткий рабочий блок и ранний следующий сон.';
  if (statusId === 'critical_short') return 'Фокус: не перегружаться за рулём. Лучше добрать сон или сделать короткий безопасный блок.';
  if (missed.length) return `Работа возможна, но дела поджимают: под вопросом ${missed.slice(0, 2).join(', ')}.`;
  if (recommendedWorkHours >= 6) return 'План выглядит рабочим: есть окно и на смену, и на базовые дела.';
  return 'План компактный: лучше выбрать 1–2 главных дела и не распыляться.';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
