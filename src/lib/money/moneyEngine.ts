import type { DayCoreInputModel, DayCoreObligationInput } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord, DailyRecordType } from '@/lib/day-core/dailyRecordsModel';

export const MONEY_ENGINE_VERSION = 'money_engine_v2_34' as const;

export type MoneyDirection = 'income' | 'work_cost' | 'personal_expense' | 'obligation' | 'neutral';
export type MoneySafetyMode = 'green' | 'amber' | 'red';

export type MoneyCategoryRule = {
  id: string;
  label: string;
  direction: MoneyDirection;
  recordTypes: DailyRecordType[];
  categories: string[];
  userLocked?: boolean;
};

export type MoneyCategorySummary = {
  id: string;
  label: string;
  direction: MoneyDirection;
  amount: number;
  count: number;
  shareOfOutflowPercent: number;
  recordIds: string[];
};

export type MoneySourceSummary = {
  id: string;
  label: string;
  amount: number;
  count: number;
  kind: 'taxi' | 'income' | 'cash' | 'card' | 'drivee' | 'work_cost' | 'expense';
};

export type MoneyObligationSummary = {
  id: string;
  title: string;
  amountDue: number;
  currentSaved: number;
  remaining: number;
  dueDayOfMonth: number;
  urgency: 'due_soon' | 'future' | 'covered' | 'unknown';
  note: string;
};

export type MoneyTemplateSuggestion = {
  id: string;
  label: string;
  direction: MoneyDirection;
  defaultAmount: number;
  category: string;
  reason: string;
};

export type MoneyEngineSnapshot = {
  version: typeof MONEY_ENGINE_VERSION;
  generatedAtIso: string;
  localDate: string;
  mode: MoneySafetyMode;
  headline: string;
  nextAction: string;
  totals: {
    cash: number;
    card: number;
    driveeBalance: number;
    liquidNow: number;
    reservedNotFree: number;
    availableNow: number;
    taxiGross: number;
    otherIncome: number;
    totalIncome: number;
    workCosts: number;
    personalExpenses: number;
    trackedOutflow: number;
    netAfterTrackedOutflow: number;
    obligationsRemaining: number;
    safeToSpendToday: number;
  };
  categorySummaries: MoneyCategorySummary[];
  sourceSummaries: MoneySourceSummary[];
  obligations: MoneyObligationSummary[];
  templateSuggestions: MoneyTemplateSuggestion[];
  signals: { id: string; level: MoneySafetyMode; title: string; message: string }[];
  syncNotes: string[];
};

export const MONEY_CATEGORY_RULES: MoneyCategoryRule[] = [
  {
    id: 'income_taxi',
    label: 'Такси / работа',
    direction: 'income',
    recordTypes: ['taxi_order'],
    categories: ['taxi'],
    userLocked: true
  },
  {
    id: 'income_other',
    label: 'Доп. доходы',
    direction: 'income',
    recordTypes: ['income'],
    categories: ['other_income', 'freelance', 'translation'],
    userLocked: true
  },
  {
    id: 'work_fuel',
    label: 'Работа: заправка',
    direction: 'work_cost',
    recordTypes: ['fuel'],
    categories: ['fuel'],
    userLocked: true
  },
  {
    id: 'work_commission',
    label: 'Работа: комиссия',
    direction: 'work_cost',
    recordTypes: ['drivee_topup'],
    categories: ['drivee_topup', 'commission'],
    userLocked: true
  },
  {
    id: 'food_products',
    label: 'Продукты / еда',
    direction: 'personal_expense',
    recordTypes: ['expense'],
    categories: ['food', 'products'],
    userLocked: true
  },
  {
    id: 'car',
    label: 'Машина',
    direction: 'personal_expense',
    recordTypes: ['expense'],
    categories: ['car'],
    userLocked: true
  },
  {
    id: 'meeting_life',
    label: 'Встречи / личное',
    direction: 'personal_expense',
    recordTypes: ['expense'],
    categories: ['meeting', 'life'],
    userLocked: true
  },
  {
    id: 'other_expense',
    label: 'Прочее',
    direction: 'personal_expense',
    recordTypes: ['expense'],
    categories: ['other', 'admin', 'uncategorized'],
    userLocked: true
  }
];

export const MONEY_TEMPLATE_SUGGESTIONS: MoneyTemplateSuggestion[] = [
  { id: 'tpl-income-taxi-shift', label: 'Смена такси', direction: 'income', defaultAmount: 8500, category: 'taxi', reason: 'быстрый ввод грязного/чистого рабочего дня' },
  { id: 'tpl-work-fuel', label: 'Заправка', direction: 'work_cost', defaultAmount: 1800, category: 'fuel', reason: 'главная рабочая издержка' },
  { id: 'tpl-work-commission', label: 'Комиссия / Drivee', direction: 'work_cost', defaultAmount: 1000, category: 'drivee_topup', reason: 'отделяем комиссию от личных расходов' },
  { id: 'tpl-food', label: 'Продукты / еда', direction: 'personal_expense', defaultAmount: 700, category: 'products', reason: 'ежедневный контролируемый расход' },
  { id: 'tpl-car', label: 'Машина / ремонт', direction: 'personal_expense', defaultAmount: 1000, category: 'car', reason: 'машина влияет на работу и доход' },
  { id: 'tpl-other', label: 'Прочее', direction: 'personal_expense', defaultAmount: 500, category: 'other', reason: 'быстро фиксировать мелкие траты' }
];

export function buildMoneyEngineSnapshot(input: DayCoreInputModel, records: DailyRecord[], nowIso = new Date().toISOString()): MoneyEngineSnapshot {
  const enabledRecords = records.filter(record => record.enabled);
  const categorySummaries = MONEY_CATEGORY_RULES.map(rule => summarizeRule(rule, enabledRecords));
  const taxiGross = sumRecords(enabledRecords.filter(record => record.type === 'taxi_order')) || safeMoney(input.taxi.grossDone);
  const otherIncome = sumRecords(enabledRecords.filter(record => record.type === 'income'));
  const workCosts = sumRecords(enabledRecords.filter(record => record.type === 'fuel' || record.type === 'drivee_topup')) || safeMoney(input.taxi.fuelAlreadyPaid);
  const personalExpenses = sumRecords(enabledRecords.filter(record => record.type === 'expense'));
  const totalIncome = taxiGross + otherIncome;
  const trackedOutflow = workCosts + personalExpenses;
  const netAfterTrackedOutflow = Math.max(0, totalIncome - trackedOutflow);
  const liquidNow = safeMoney(input.money.cash) + safeMoney(input.money.card) + safeMoney(input.money.driveeBalance);
  const availableNow = Math.max(0, liquidNow - safeMoney(input.money.reservedNotFree));
  const obligations = input.obligations.map(obligation => summarizeObligation(obligation, nowIso));
  const obligationsRemaining = obligations.reduce((sum, obligation) => sum + obligation.remaining, 0);
  const plannedTaskCosts = input.tasks.filter(task => task.plannedToday && task.moneyCost > 0).reduce((sum, task) => sum + safeMoney(task.moneyCost), 0);
  const safeToSpendToday = Math.max(0, availableNow + netAfterTrackedOutflow - plannedTaskCosts - dailyObligationReserve(obligationsRemaining));
  const mode = inferSafetyMode({ netAfterTrackedOutflow, safeToSpendToday, totalIncome, trackedOutflow, obligationsRemaining });
  const signals = buildMoneySignals({ mode, netAfterTrackedOutflow, safeToSpendToday, totalIncome, trackedOutflow, obligationsRemaining, categorySummaries });

  return {
    version: MONEY_ENGINE_VERSION,
    generatedAtIso: nowIso,
    localDate: input.localDate,
    mode,
    headline: mode === 'green' ? 'Деньги под контролем' : mode === 'amber' ? 'Нужен мягкий контроль трат' : 'Сначала закрыть обязательное',
    nextAction: buildNextAction(mode, totalIncome, trackedOutflow, safeToSpendToday),
    totals: {
      cash: safeMoney(input.money.cash),
      card: safeMoney(input.money.card),
      driveeBalance: safeMoney(input.money.driveeBalance),
      liquidNow,
      reservedNotFree: safeMoney(input.money.reservedNotFree),
      availableNow,
      taxiGross,
      otherIncome,
      totalIncome,
      workCosts,
      personalExpenses,
      trackedOutflow,
      netAfterTrackedOutflow,
      obligationsRemaining,
      safeToSpendToday
    },
    categorySummaries,
    sourceSummaries: buildMoneySources(input, enabledRecords, taxiGross, otherIncome, workCosts, personalExpenses),
    obligations,
    templateSuggestions: MONEY_TEMPLATE_SUGGESTIONS,
    signals,
    syncNotes: [
      'Money Engine v2.34 читает Daily Records и Day Core, но не меняет locked sleep keys.',
      'Доходы/расходы остаются section-scoped: история денег внутри раздела Деньги.',
      'Cloud writes остаются safe-off до Supabase RLS, backup и conflict test.'
    ]
  };
}

function summarizeRule(rule: MoneyCategoryRule, records: DailyRecord[]): MoneyCategorySummary {
  const matched = records.filter(record => rule.recordTypes.includes(record.type) && rule.categories.includes(record.category));
  const amount = sumRecords(matched);
  const outflowBase = sumRecords(records.filter(record => record.type === 'expense' || record.type === 'fuel' || record.type === 'drivee_topup'));
  return {
    id: rule.id,
    label: rule.label,
    direction: rule.direction,
    amount,
    count: matched.length,
    shareOfOutflowPercent: outflowBase > 0 && rule.direction !== 'income' ? Math.round((amount / outflowBase) * 100) : 0,
    recordIds: matched.map(record => record.id)
  };
}

function buildMoneySources(input: DayCoreInputModel, records: DailyRecord[], taxiGross: number, otherIncome: number, workCosts: number, personalExpenses: number): MoneySourceSummary[] {
  return [
    { id: 'source-taxi', label: 'Такси', amount: taxiGross, count: records.filter(record => record.type === 'taxi_order').length || input.taxi.ordersDone, kind: 'taxi' },
    { id: 'source-other-income', label: 'Доп. доход', amount: otherIncome, count: records.filter(record => record.type === 'income').length, kind: 'income' },
    { id: 'source-cash', label: 'Наличные', amount: safeMoney(input.money.cash), count: 1, kind: 'cash' },
    { id: 'source-card', label: 'Карта', amount: safeMoney(input.money.card), count: 1, kind: 'card' },
    { id: 'source-drivee', label: 'Drivee', amount: safeMoney(input.money.driveeBalance), count: 1, kind: 'drivee' },
    { id: 'source-work-cost', label: 'Рабочие издержки', amount: workCosts, count: records.filter(record => record.type === 'fuel' || record.type === 'drivee_topup').length, kind: 'work_cost' },
    { id: 'source-expense', label: 'Личные траты', amount: personalExpenses, count: records.filter(record => record.type === 'expense').length, kind: 'expense' }
  ];
}

function summarizeObligation(obligation: DayCoreObligationInput, nowIso: string): MoneyObligationSummary {
  const now = new Date(nowIso);
  const day = Number.isFinite(now.getDate()) ? now.getDate() : 1;
  const remaining = Math.max(0, safeMoney(obligation.amountDue) - safeMoney(obligation.currentSaved));
  const daysToDue = obligation.dueDayOfMonth >= day ? obligation.dueDayOfMonth - day : obligation.dueDayOfMonth + 31 - day;
  const urgency = remaining <= 0 ? 'covered' : daysToDue <= 5 ? 'due_soon' : 'future';
  return {
    id: obligation.id,
    title: obligation.title,
    amountDue: safeMoney(obligation.amountDue),
    currentSaved: safeMoney(obligation.currentSaved),
    remaining,
    dueDayOfMonth: obligation.dueDayOfMonth,
    urgency,
    note: remaining <= 0 ? 'закрыто' : daysToDue <= 5 ? `до ${obligation.dueDayOfMonth} числа мало времени` : `до ${obligation.dueDayOfMonth} числа держать резерв`
  };
}

function buildMoneySignals(input: {
  mode: MoneySafetyMode;
  netAfterTrackedOutflow: number;
  safeToSpendToday: number;
  totalIncome: number;
  trackedOutflow: number;
  obligationsRemaining: number;
  categorySummaries: MoneyCategorySummary[];
}) {
  const signals: MoneyEngineSnapshot['signals'] = [];
  signals.push({
    id: 'money-net',
    level: input.netAfterTrackedOutflow >= 8500 ? 'green' : input.netAfterTrackedOutflow >= 4500 ? 'amber' : 'red',
    title: 'Чистый результат',
    message: input.netAfterTrackedOutflow >= 8500 ? 'дневная денежная база близка к целевой' : 'до сильного дня нужно больше дохода или меньше трат'
  });
  signals.push({
    id: 'money-safe-spend',
    level: input.safeToSpendToday > 1500 ? 'green' : input.safeToSpendToday > 0 ? 'amber' : 'red',
    title: 'Свободно сегодня',
    message: input.safeToSpendToday > 0 ? 'можно тратить только в рамках этого лимита' : 'свободных денег по модели нет, лучше не добавлять лишнее'
  });
  const largestOutflow = input.categorySummaries
    .filter(item => item.direction !== 'income')
    .sort((a, b) => b.amount - a.amount)[0];
  if (largestOutflow && largestOutflow.amount > 0) {
    signals.push({
      id: 'money-largest-outflow',
      level: largestOutflow.direction === 'work_cost' ? 'amber' : 'red',
      title: `Главный расход: ${largestOutflow.label}`,
      message: `${largestOutflow.amount.toLocaleString('ru-RU')} ₽ · ${largestOutflow.shareOfOutflowPercent}% исходящих`
    });
  }
  if (input.obligationsRemaining > 0) {
    signals.push({
      id: 'money-obligations',
      level: 'amber',
      title: 'Обязательства не закрыты',
      message: `оставшийся план: ${input.obligationsRemaining.toLocaleString('ru-RU')} ₽`
    });
  }
  return signals;
}

function inferSafetyMode(input: { netAfterTrackedOutflow: number; safeToSpendToday: number; totalIncome: number; trackedOutflow: number; obligationsRemaining: number }): MoneySafetyMode {
  if (input.safeToSpendToday <= 0 || input.netAfterTrackedOutflow < 3000) return 'red';
  if (input.trackedOutflow > input.totalIncome * 0.45 || input.obligationsRemaining > 0) return 'amber';
  return 'green';
}

function buildNextAction(mode: MoneySafetyMode, totalIncome: number, trackedOutflow: number, safeToSpendToday: number) {
  if (mode === 'green') return `Можно продолжать план: доход ${totalIncome.toLocaleString('ru-RU')} ₽, исходящие ${trackedOutflow.toLocaleString('ru-RU')} ₽.`;
  if (mode === 'amber') return `Ограничь необязательные траты. Безопасный лимит сейчас около ${safeToSpendToday.toLocaleString('ru-RU')} ₽.`;
  return 'Не добавляй лишние расходы: сначала доход/смена, топливо и обязательные платежи.';
}

function dailyObligationReserve(obligationsRemaining: number) {
  return Math.min(3000, Math.round(obligationsRemaining / 20));
}

function sumRecords(records: DailyRecord[]) {
  return records.reduce((sum, record) => sum + safeMoney(record.amount), 0);
}

function safeMoney(value: number | undefined | null) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value));
}
