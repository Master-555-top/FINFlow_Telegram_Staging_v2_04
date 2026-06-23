import { isDateInHistoryScope, type FinflowHistoryPeriod } from '@/lib/data/finflowHistoryEngine';
import type {
  HistoricalLedgerRecord,
  HistoricalLedgerSection,
  HistoricalLedgerState
} from '@/lib/data/privateImportBundle';

export type HistoricalLedgerAnalyticsScope = {
  section: HistoricalLedgerSection;
  period: FinflowHistoryPeriod;
  anchorDateIso: string;
};

export type HistoricalLedgerAnalytics = {
  section: HistoricalLedgerSection;
  approvedCount: number;
  reviewCount: number;
  rejectedCount: number;
  income: number;
  expense: number;
  net: number;
  ordersCount: number;
  shiftsCount: number;
  averageOrder: number;
  averageShift: number;
  fundContributions: number;
  obligations: number;
  latestDate: string | null;
  categories: Array<{ category: string; amount: number; count: number }>;
};

export function buildHistoricalLedgerAnalytics(
  ledgers: Record<HistoricalLedgerSection, HistoricalLedgerState>,
  scope: HistoricalLedgerAnalyticsScope
): HistoricalLedgerAnalytics {
  const inScope = ledgers[scope.section].records.filter(record => isDateInHistoryScope(record.localDate, scope));
  const approved = inScope.filter(record => record.status === 'approved');
  const income = scope.section === 'work' ? calculateWorkGross(approved) : sumByKinds(approved, ['income', 'taxi_order']);
  const expense = sumByKinds(approved, ['expense']);
  const orders = approved.filter(record => record.entityKind === 'taxi_order');
  const shifts = approved.filter(record => record.entityKind === 'taxi_shift');
  const fundContributions = sumByKinds(approved, ['fund']);
  const obligations = sumByKinds(approved, ['obligation']);
  const categoryMap = new Map<string, { category: string; amount: number; count: number }>();

  for (const record of approved) {
    if (record.entityKind === 'taxi_shift' && orders.some(order => order.localDate === record.localDate)) continue;
    const current = categoryMap.get(record.category) ?? { category: record.category || 'other', amount: 0, count: 0 };
    current.amount += record.amount;
    current.count += 1;
    categoryMap.set(current.category, current);
  }

  return {
    section: scope.section,
    approvedCount: approved.length,
    reviewCount: inScope.filter(record => record.status === 'needs_review').length,
    rejectedCount: inScope.filter(record => record.status === 'rejected').length,
    income,
    expense,
    net: income - expense,
    ordersCount: orders.length,
    shiftsCount: shifts.length,
    averageOrder: orders.length ? sumAmounts(orders) / orders.length : 0,
    averageShift: shifts.length ? income / new Set(shifts.map(record => record.localDate)).size : 0,
    fundContributions,
    obligations,
    latestDate: approved.map(record => record.localDate).sort().at(-1) ?? null,
    categories: [...categoryMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 8)
  };
}

function calculateWorkGross(records: HistoricalLedgerRecord[]) {
  const dates = new Map<string, { orders: number; shifts: number; otherIncome: number }>();
  for (const record of records) {
    const day = dates.get(record.localDate) ?? { orders: 0, shifts: 0, otherIncome: 0 };
    if (record.entityKind === 'taxi_order') day.orders += record.amount;
    else if (record.entityKind === 'taxi_shift') day.shifts += record.amount;
    else if (record.entityKind === 'income') day.otherIncome += record.amount;
    dates.set(record.localDate, day);
  }
  return [...dates.values()].reduce((sum, day) => sum + (day.orders > 0 ? day.orders : day.shifts) + day.otherIncome, 0);
}

function sumByKinds(records: HistoricalLedgerRecord[], kinds: HistoricalLedgerRecord['entityKind'][]) {
  return records.reduce((sum, record) => sum + (kinds.includes(record.entityKind) ? record.amount : 0), 0);
}

function sumAmounts(records: HistoricalLedgerRecord[]) {
  return records.reduce((sum, record) => sum + record.amount, 0);
}
