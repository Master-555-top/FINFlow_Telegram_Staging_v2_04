import type { DayCoreFundInput, DayCoreInputModel, DayCoreObligationInput } from '@/lib/day-core/dayCoreInputModel';

export const FUND_PLANNING_VERSION = 'fund_planning_v2_53' as const;

export const CANONICAL_FUND_BLUEPRINTS: DayCoreFundInput[] = [
  { id: 'working-fund', title: '🔰 Рабочий', targetAmount: 2500, currentAmount: 0, priority: 'critical', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 10, note: 'Бензин, комиссия и оборотка. Поддерживать стабильный остаток.' },
  { id: 'meetings', title: '❤️ Встречи', targetAmount: 3000, currentAmount: 0, priority: 'high', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 30, note: 'Досуг и совместные траты. Поддерживать остаток, а не накапливать бесконечно.' },
  { id: 'personal', title: '👤 Личное', targetAmount: 0, currentAmount: 0, priority: 'high', canReceiveToday: true, fundType: 'flexible', group: 'required', sortOrder: 40, note: 'Еда, одежда и бытовые расходы. Цель задаётся по ситуации.' },
  { id: 'base-business', title: '🎂 База', targetAmount: 10000, currentAmount: 0, priority: 'normal', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 50, note: 'Торты, коробки и расходники. Поддерживать стабильный остаток.' },
  { id: 'car-repair', title: '🚗 Ремонт машины / рабочий актив', targetAmount: 50000, currentAmount: 0, priority: 'high', canReceiveToday: true, fundType: 'savings', group: 'required', sortOrder: 25, note: 'Существующий ремонтный резерв сохранён отдельно от ежемесячного платежа за машину.' },
  { id: 'ulyana-birthday', title: '🎁 ДР Ульяны', targetAmount: 50000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 70, note: 'Накопительная цель.' },
  { id: 'flight-move', title: '✈️ Полёт / переезд', targetAmount: 300000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 80, note: 'Накопительная цель.' },
  { id: 'safety-cushion', title: '🛟 Подушка', targetAmount: 50000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 90, note: 'Резерв безопасности.' },
  { id: 'ulyana-gift', title: '🎁 Подарок Ульяне', targetAmount: 0, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'flexible', group: 'savings', sortOrder: 100, note: 'Сумма и срок задаются вручную.' }
];

export type FundPlanningRow = {
  id: string;
  source: 'fund' | 'obligation';
  title: string;
  group: 'required' | 'savings';
  targetAmount: number;
  currentAmount: number;
  missingAmount: number;
  deadline: string | null;
  remainingDays: number | null;
  dailyNorm: number | null;
  priority: DayCoreFundInput['priority'];
  sortOrder: number;
  formula: string;
};

export function reconcileDayCoreFundSystem(input: DayCoreInputModel): DayCoreInputModel {
  const blueprints = new Map(CANONICAL_FUND_BLUEPRINTS.map(fund => [fund.id, fund]));
  const existingIds = new Set(input.funds.map(fund => fund.id));
  const funds = input.funds.map(fund => {
    const blueprint = blueprints.get(fund.id);
    if (!blueprint) return fund;
    const oldWorkingSeed = fund.id === 'working-fund' && fund.title === 'Рабочий фонд завтра' && fund.targetAmount === 3000;
    const oldMeetingsSeed = fund.id === 'meetings' && fund.title === 'Встречи с девушкой';
    const oldCushionSeed = fund.id === 'safety-cushion' && fund.title === 'Подушка безопасности' && fund.targetAmount === 300000;
    return {
      ...blueprint,
      ...fund,
      title: oldWorkingSeed || oldMeetingsSeed || oldCushionSeed ? blueprint.title : fund.title,
      targetAmount: oldWorkingSeed || oldCushionSeed ? blueprint.targetAmount : fund.targetAmount,
      fundType: fund.fundType ?? blueprint.fundType,
      group: fund.group ?? blueprint.group,
      sortOrder: fund.sortOrder ?? blueprint.sortOrder,
      note: fund.note ?? blueprint.note
    };
  });
  for (const blueprint of CANONICAL_FUND_BLUEPRINTS) {
    if (!existingIds.has(blueprint.id)) funds.push({ ...blueprint });
  }
  return { ...input, funds: funds.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)) };
}

export function buildFundPlanningSummary(input: DayCoreInputModel) {
  const fundRows = input.funds.map(fund => buildFundRow(fund, input.localDate));
  const obligationRows = input.obligations.map(obligation => buildObligationRow(obligation, input.localDate));
  const rows = [...fundRows, ...obligationRows].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  return {
    version: FUND_PLANNING_VERSION,
    rows,
    required: rows.filter(row => row.group === 'required'),
    savings: rows.filter(row => row.group === 'savings'),
    targetTotal: rows.reduce((sum, row) => sum + row.targetAmount, 0),
    currentTotal: rows.reduce((sum, row) => sum + row.currentAmount, 0),
    missingTotal: rows.reduce((sum, row) => sum + row.missingAmount, 0),
    dailyNormTotal: rows.reduce((sum, row) => sum + (row.dailyNorm ?? 0), 0)
  };
}

export function getFundPlanningRow(input: DayCoreInputModel, source: 'fund' | 'obligation', id: string) {
  return buildFundPlanningSummary(input).rows.find(row => row.source === source && row.id === id) ?? null;
}

function buildFundRow(fund: DayCoreFundInput, localDate: string): FundPlanningRow {
  const missingAmount = Math.max(0, fund.targetAmount - fund.currentAmount);
  const remainingDays = fund.deadline ? inclusiveDays(localDate, fund.deadline) : null;
  const dailyNorm = missingAmount <= 0
    ? 0
    : remainingDays !== null
      ? Math.ceil(missingAmount / remainingDays)
      : fund.fundType === 'revolving'
        ? missingAmount
        : null;
  return {
    id: fund.id,
    source: 'fund',
    title: fund.title,
    group: fund.group ?? 'required',
    targetAmount: fund.targetAmount,
    currentAmount: fund.currentAmount,
    missingAmount,
    deadline: fund.deadline ?? null,
    remainingDays,
    dailyNorm,
    priority: fund.priority,
    sortOrder: fund.sortOrder ?? 999,
    formula: buildFormula(missingAmount, remainingDays, dailyNorm, fund.fundType)
  };
}

function buildObligationRow(obligation: DayCoreObligationInput, localDate: string): FundPlanningRow {
  const deadline = deadlineForDayOfMonth(localDate, obligation.dueDayOfMonth);
  const missingAmount = Math.max(0, obligation.amountDue - obligation.currentSaved);
  const remainingDays = inclusiveDays(localDate, deadline);
  const dailyNorm = missingAmount > 0 ? Math.ceil(missingAmount / remainingDays) : 0;
  return {
    id: obligation.id,
    source: 'obligation',
    title: obligation.title,
    group: 'required',
    targetAmount: obligation.amountDue,
    currentAmount: obligation.currentSaved,
    missingAmount,
    deadline,
    remainingDays,
    dailyNorm,
    priority: obligation.priority,
    sortOrder: obligation.id === 'car-payment' ? 20 : obligation.id === 'bankruptcy' ? 21 : 35,
    formula: buildFormula(missingAmount, remainingDays, dailyNorm, 'savings')
  };
}

function deadlineForDayOfMonth(localDate: string, dueDay: number) {
  const current = parseLocalDate(localDate) ?? new Date();
  const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const safeDay = Math.max(1, Math.min(lastDay, Math.round(dueDay)));
  return formatLocalDate(new Date(current.getFullYear(), current.getMonth(), safeDay));
}

function inclusiveDays(fromIso: string, toIso: string) {
  const from = parseLocalDate(fromIso);
  const to = parseLocalDate(toIso);
  if (!from || !to) return 1;
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

function buildFormula(missing: number, days: number | null, norm: number | null, fundType: DayCoreFundInput['fundType']) {
  if (missing <= 0) return 'Цель закрыта; пополнение сегодня не требуется.';
  if (days !== null && norm !== null) return `${missing.toLocaleString('ru-RU')} ₽ ÷ ${days} дн. = ${norm.toLocaleString('ru-RU')} ₽/день`;
  if (fundType === 'revolving') return `До стабильного остатка не хватает ${missing.toLocaleString('ru-RU')} ₽.`;
  return `Не хватает ${missing.toLocaleString('ru-RU')} ₽; задайте срок для дневной нормы.`;
}

function parseLocalDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
