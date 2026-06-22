import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { summarizeDailyRecords } from '@/lib/day-core/dailyRecordsModel';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';
import { buildMoneyEngineSnapshot } from '@/lib/money/moneyEngine';
import { buildWorkTaxiShiftSnapshot } from '@/lib/work/workTaxiEngine';

export const REAL_DAILY_USE_HARDENING_VERSION = 'real_daily_use_hardening_v2_45' as const;

export type RealDailyUseStepStatus = 'done' | 'next' | 'warning' | 'blocked';
export type RealDailyUseStepSection = 'day' | 'money' | 'work' | 'apply' | 'history' | 'backup';

export type RealDailyUseStep = {
  id: string;
  section: RealDailyUseStepSection;
  title: string;
  status: RealDailyUseStepStatus;
  detail: string;
  nextAction: string;
};

export type RealDailyUseSnapshot = {
  version: typeof REAL_DAILY_USE_HARDENING_VERSION;
  generatedAtIso: string;
  localDate: string;
  percent: number;
  mode: 'green' | 'amber' | 'red';
  headline: string;
  nextAction: string;
  counters: {
    records: number;
    orders: number;
    grossDone: number;
    safeToSpend: number;
    workNet: number;
    missingCritical: number;
  };
  steps: RealDailyUseStep[];
  syncNotes: string[];
};

export function buildRealDailyUseSnapshot(input: DayCoreInputModel, records: DailyRecord[], nowIso = new Date().toISOString()): RealDailyUseSnapshot {
  const enabledRecords = records.filter(record => record.enabled);
  const recordsSummary = summarizeDailyRecords(records);
  const net = calculateDayNet(input);
  const money = buildMoneyEngineSnapshot(input, records, nowIso);
  const work = buildWorkTaxiShiftSnapshot(input, records, nowIso);

  const hasMoneyNow = input.money.cash + input.money.card + input.money.driveeBalance > 0;
  const hasWorkProgress = recordsSummary.ordersCount > 0 || input.taxi.ordersDone > 0 || input.taxi.grossDone > 0;
  const hasFuelOrWorkCost = recordsSummary.fuelPaid > 0 || recordsSummary.driveeTopupPaid > 0 || input.taxi.fuelAlreadyPaid > 0;
  const hasDailyOutflow = recordsSummary.expensesTotal > 0 || input.tasks.some(task => task.plannedToday && task.moneyCost > 0);
  const hasAppliedRecords = enabledRecords.some(record => record.source === 'import_review_queue');
  const hasEditableRecords = enabledRecords.some(record => record.source !== 'derived_from_demo');
  const needsSave = input.status !== 'confirmed' || input.reviewNotes.length > 0;
  const targetProgress = input.taxi.targetGrossToday > 0 ? work.shift.grossDone / input.taxi.targetGrossToday : 0;

  const steps: RealDailyUseStep[] = [
    {
      id: 'today-money-baseline',
      section: 'money',
      title: 'Деньги сейчас введены',
      status: hasMoneyNow ? 'done' : 'next',
      detail: hasMoneyNow
        ? `Наличные/карта/Drivee дают ${money.totals.liquidNow.toLocaleString('ru-RU')} ₽ live-базы.`
        : 'Нет live-базы по деньгам, расчёты свободных денег будут условными.',
      nextAction: hasMoneyNow ? 'Продолжай вести записи расходов/доходов.' : 'Введи наличные, карту и Drivee перед сменой.'
    },
    {
      id: 'work-orders-flow',
      section: 'work',
      title: 'Заказы и оборот идут в записи',
      status: hasWorkProgress ? 'done' : 'next',
      detail: hasWorkProgress
        ? `${work.shift.ordersCount} заказов / ${work.shift.grossDone.toLocaleString('ru-RU')} ₽ грязными, осталось ${work.shift.remainingGrossToTarget.toLocaleString('ru-RU')} ₽.`
        : 'Смена пока без заказов: Work/Money не получат реальный оборот.',
      nextAction: hasWorkProgress ? 'Добирай оборот или закрывай смену через close preview.' : 'Добавь первый заказ или импортируй журнал заказов.'
    },
    {
      id: 'work-costs-separated',
      section: 'work',
      title: 'Рабочие издержки отделены',
      status: hasFuelOrWorkCost ? 'done' : hasWorkProgress ? 'warning' : 'next',
      detail: hasFuelOrWorkCost
        ? `Учтено рабочих издержек: ${work.costs.workCostsNow.toLocaleString('ru-RU')} ₽.`
        : 'Бензин/Drivee пока не учтены, чистые деньги будут завышены.',
      nextAction: hasFuelOrWorkCost ? 'Проверь, что бензин не попал в личные траты.' : 'Добавь бензин или Drivee как рабочую издержку.'
    },
    {
      id: 'daily-outflow-check',
      section: 'money',
      title: 'Личные расходы видны',
      status: hasDailyOutflow ? 'done' : 'warning',
      detail: hasDailyOutflow
        ? `Личные расходы/задачи учтены: ${recordsSummary.expensesTotal.toLocaleString('ru-RU')} ₽ записей + задачи дня.`
        : 'Еда/встречи/прочее не внесены: свободные деньги могут выглядеть лучше реальности.',
      nextAction: hasDailyOutflow ? 'В конце дня проверь категории и отключённые записи.' : 'Добавь еду, встречу или прочее, если расход был.'
    },
    {
      id: 'apply-cycle',
      section: 'apply',
      title: 'Apply/импорт не висят в воздухе',
      status: hasAppliedRecords ? 'done' : hasEditableRecords ? 'warning' : 'next',
      detail: hasAppliedRecords
        ? 'Есть записи, пришедшие через Import Review / Local Apply.'
        : hasEditableRecords
          ? 'Есть ручные записи, но импорт/шаблоны ещё не применялись в live-день.'
          : 'Пока только demo-агрегаты: для реального дня нужны ручные или apply-записи.',
      nextAction: hasAppliedRecords ? 'Сохрани снимок дня после проверки.' : 'Через System → Данные → Apply подтверди готовые draft-записи.'
    },
    {
      id: 'history-save',
      section: 'history',
      title: 'День готов к сохранению истории',
      status: needsSave ? 'warning' : 'done',
      detail: needsSave
        ? 'День ещё в review/draft: перед переносом в историю нужно проверить записи.'
        : 'День подтверждён и готов к истории/backup.',
      nextAction: needsSave ? 'Вечером проверь записи и сохрани snapshot дня.' : 'Можно делать backup или cloud preview.'
    }
  ];

  const missingCritical = steps.filter(step => step.status === 'next' || step.status === 'blocked').length;
  const score = steps.reduce((sum, step) => {
    if (step.status === 'done') return sum + 1;
    if (step.status === 'warning') return sum + 0.5;
    return sum;
  }, 0);
  const percent = Math.round((score / steps.length) * 100);
  const mode: RealDailyUseSnapshot['mode'] = percent >= 78 && missingCritical === 0 ? 'green' : percent >= 48 ? 'amber' : 'red';

  const nextStep = steps.find(step => step.status === 'next') ?? steps.find(step => step.status === 'warning') ?? steps[steps.length - 1];

  return {
    version: REAL_DAILY_USE_HARDENING_VERSION,
    generatedAtIso: nowIso,
    localDate: input.localDate,
    percent,
    mode,
    headline: buildHeadline(mode, percent, targetProgress),
    nextAction: nextStep?.nextAction ?? 'Продолжай вести день: записи → проверка → история → backup.',
    counters: {
      records: enabledRecords.length,
      orders: work.shift.ordersCount,
      grossDone: work.shift.grossDone || net.grossDone,
      safeToSpend: money.totals.safeToSpendToday,
      workNet: work.costs.netAfterWorkCosts,
      missingCritical
    },
    steps,
    syncNotes: [
      'v2.45 не меняет визуальный baseline: Sleep History, 7-day Sleep chart и System grid остаются эталоном.',
      'Daily Use Hardening связывает Деньги/Работу/Apply/Историю и Daily Save QA как локальный daily loop без cloud writes.',
      'История остаётся section-scoped; глобальная вкладка История не добавляется.'
    ]
  };
}

function buildHeadline(mode: RealDailyUseSnapshot['mode'], percent: number, targetProgress: number) {
  if (mode === 'green') return `День почти готов к сохранению · ${percent}%`;
  if (mode === 'red') return `День ещё сырой · ${percent}%`;
  if (targetProgress >= 0.5) return `День в работе · ${percent}% готовности`;
  return `Нужно добрать основу дня · ${percent}%`;
}
