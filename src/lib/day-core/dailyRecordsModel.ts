import type { DayCoreInputModel, DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';

export const DAILY_RECORDS_VERSION = 'daily_records_v1_47' as const;

export type DailyRecordType = 'taxi_order' | 'fuel' | 'drivee_topup' | 'expense' | 'income';


export type DailyRecordCategoryTemplate = {
  id: string;
  label: string;
  type: DailyRecordType;
  category: string;
  defaultTitle: string;
  defaultAmount: number;
  priority: 'critical' | 'high' | 'normal' | 'flexible';
};

export const DAILY_RECORD_TEMPLATES: DailyRecordCategoryTemplate[] = [
  { id: 'taxi-300', label: 'Заказ 300', type: 'taxi_order', category: 'taxi', defaultTitle: 'Заказ такси', defaultAmount: 300, priority: 'normal' },
  { id: 'taxi-500', label: 'Заказ 500', type: 'taxi_order', category: 'taxi', defaultTitle: 'Заказ такси', defaultAmount: 500, priority: 'normal' },
  { id: 'taxi-700', label: 'Заказ 700', type: 'taxi_order', category: 'taxi', defaultTitle: 'Заказ такси', defaultAmount: 700, priority: 'normal' },
  { id: 'taxi-1000', label: 'Заказ 1000', type: 'taxi_order', category: 'taxi', defaultTitle: 'Заказ такси', defaultAmount: 1000, priority: 'normal' },
  { id: 'fuel-500', label: 'Заправка 500', type: 'fuel', category: 'fuel', defaultTitle: 'Заправка', defaultAmount: 500, priority: 'critical' },
  { id: 'fuel-1500', label: 'Заправка 1500', type: 'fuel', category: 'fuel', defaultTitle: 'Заправка', defaultAmount: 1500, priority: 'critical' },
  { id: 'food-500', label: 'Еда 500', type: 'expense', category: 'food', defaultTitle: 'Еда', defaultAmount: 500, priority: 'high' },
  { id: 'products-1000', label: 'Продукты 1000', type: 'expense', category: 'products', defaultTitle: 'Продукты', defaultAmount: 1000, priority: 'normal' },
  { id: 'meeting-1500', label: 'Встреча 1500', type: 'expense', category: 'meeting', defaultTitle: 'Встреча', defaultAmount: 1500, priority: 'high' },
  { id: 'car-1000', label: 'Машина 1000', type: 'expense', category: 'car', defaultTitle: 'Машина', defaultAmount: 1000, priority: 'high' },
  { id: 'drivee-350', label: 'Drivee 350', type: 'drivee_topup', category: 'drivee_topup', defaultTitle: 'Пополнение Drivee', defaultAmount: 350, priority: 'critical' },
  { id: 'other-500', label: 'Прочее 500', type: 'expense', category: 'other', defaultTitle: 'Прочее', defaultAmount: 500, priority: 'flexible' },
  { id: 'income-1000', label: 'Доход 1000', type: 'income', category: 'other_income', defaultTitle: 'Доп. доход', defaultAmount: 1000, priority: 'normal' }
];

export const DAILY_RECORD_FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'taxi_order', label: 'Заказы' },
  { id: 'fuel', label: 'Бензин' },
  { id: 'drivee_topup', label: 'Drivee' },
  { id: 'expense', label: 'Расходы' },
  { id: 'income', label: 'Доходы' },
  { id: 'disabled', label: 'Отключённые' }
] as const;

export type DailyRecordFilterId = typeof DAILY_RECORD_FILTERS[number]['id'];

export function filterDailyRecords(records: DailyRecord[], filter: DailyRecordFilterId): DailyRecord[] {
  if (filter === 'all') return records;
  if (filter === 'disabled') return records.filter(record => !record.enabled);
  return records.filter(record => record.type === filter);
}

export function createRecordFromTemplate(template: DailyRecordCategoryTemplate): DailyRecord {
  return createDailyRecord({
    type: template.type,
    title: template.defaultTitle,
    amount: template.defaultAmount,
    category: template.category,
    note: `Шаблон: ${template.label}`,
    source: 'quick_button'
  });
}

export function getRecordCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    taxi: 'Такси',
    fuel: 'Бензин',
    food: 'Еда',
    products: 'Продукты',
    meeting: 'Встреча',
    car: 'Машина',
    drivee_topup: 'Drivee',
    other: 'Прочее',
    other_income: 'Доход'
  };
  return labels[category] ?? category;
}



export type CustomDailyRecordTemplate = DailyRecordCategoryTemplate & {
  isCustom: true;
  createdAt: string;
};

export function createCustomTemplate(input: {
  label: string;
  type: DailyRecordType;
  category: string;
  defaultTitle: string;
  defaultAmount: number;
  priority: DailyRecordCategoryTemplate['priority'];
}): CustomDailyRecordTemplate {
  return {
    id: `custom-template-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    label: input.label || input.defaultTitle || 'Шаблон',
    type: input.type,
    category: input.category || defaultCategory(input.type),
    defaultTitle: input.defaultTitle || input.label || 'Запись',
    defaultAmount: safeMoney(input.defaultAmount),
    priority: input.priority,
    isCustom: true,
    createdAt: new Date().toISOString()
  };
}

export function updateCustomTemplate(
  templates: CustomDailyRecordTemplate[],
  templateId: string,
  patch: Partial<CustomDailyRecordTemplate>
): CustomDailyRecordTemplate[] {
  return templates.map(template => template.id === templateId
    ? {
        ...template,
        ...patch,
        defaultAmount: patch.defaultAmount !== undefined ? safeMoney(patch.defaultAmount) : template.defaultAmount
      }
    : template
  );
}

export function deleteCustomTemplate(templates: CustomDailyRecordTemplate[], templateId: string): CustomDailyRecordTemplate[] {
  return templates.filter(template => template.id !== templateId);
}


export type DailyRecord = {
  id: string;
  schemaVersion: typeof DAILY_RECORDS_VERSION;
  type: DailyRecordType;
  title: string;
  amount: number;
  category: string;
  note: string;
  enabled: boolean;
  createdAt: string;
  source: 'quick_button' | 'manual_record' | 'derived_from_demo' | 'import_review_queue';
  sensitiveDataIncluded: false;
};

export type DailyRecordsSummary = {
  ordersCount: number;
  taxiGross: number;
  fuelPaid: number;
  driveeTopupPaid: number;
  expensesTotal: number;
  otherIncomeTotal: number;
  enabledTotal: number;
  disabledCount: number;
};

export function createDailyRecord(input: {
  type: DailyRecordType;
  title: string;
  amount: number;
  category?: string;
  note?: string;
  source?: DailyRecord['source'];
  now?: string;
}): DailyRecord {
  const now = input.now ?? new Date().toISOString();
  return {
    id: `record-${input.type}-${Date.now()}-${Math.abs(Math.round(input.amount))}-${Math.random().toString(16).slice(2, 8)}`,
    schemaVersion: DAILY_RECORDS_VERSION,
    type: input.type,
    title: input.title,
    amount: safeMoney(input.amount),
    category: input.category ?? defaultCategory(input.type),
    note: input.note ?? '',
    enabled: true,
    createdAt: now,
    source: input.source ?? 'manual_record',
    sensitiveDataIncluded: false
  };
}

export function createInitialDailyRecordsFromInput(input: DayCoreInputModel): DailyRecord[] {
  const records: DailyRecord[] = [];

  if (input.taxi.grossDone > 0 || input.taxi.ordersDone > 0) {
    records.push({
      id: 'demo-record-taxi-aggregate',
      schemaVersion: DAILY_RECORDS_VERSION,
      type: 'taxi_order',
      title: `Заказы агрегатом (${input.taxi.ordersDone})`,
      amount: safeMoney(input.taxi.grossDone),
      category: 'taxi',
      note: 'Демо-агрегат из Day Core. В реальном режиме лучше добавлять каждый заказ отдельной записью.',
      enabled: true,
      createdAt: new Date().toISOString(),
      source: 'derived_from_demo',
      sensitiveDataIncluded: false
    });
  }

  if (input.taxi.fuelAlreadyPaid > 0) {
    records.push({
      id: 'demo-record-fuel-paid',
      schemaVersion: DAILY_RECORDS_VERSION,
      type: 'fuel',
      title: 'Бензин оплачен',
      amount: safeMoney(input.taxi.fuelAlreadyPaid),
      category: 'fuel',
      note: 'Демо-запись из Day Core.',
      enabled: true,
      createdAt: new Date().toISOString(),
      source: 'derived_from_demo',
      sensitiveDataIncluded: false
    });
  }

  input.tasks
    .filter(task => task.moneyCost > 0 && task.id !== 'fuel')
    .forEach(task => {
      records.push({
        id: `demo-record-task-${task.id}`,
        schemaVersion: DAILY_RECORDS_VERSION,
        type: 'expense',
        title: task.title,
        amount: safeMoney(task.moneyCost),
        category: task.type,
        note: `Демо-запись из задачи ${task.id}.`,
        enabled: task.plannedToday,
        createdAt: new Date().toISOString(),
        source: 'derived_from_demo',
        sensitiveDataIncluded: false
      });
    });

  return records;
}

export function summarizeDailyRecords(records: DailyRecord[]): DailyRecordsSummary {
  const enabled = records.filter(record => record.enabled);
  const taxiOrders = enabled.filter(record => record.type === 'taxi_order');
  const taxiGross = taxiOrders.reduce((sum, record) => sum + safeMoney(record.amount), 0);
  const fuelPaid = enabled
    .filter(record => record.type === 'fuel')
    .reduce((sum, record) => sum + safeMoney(record.amount), 0);
  const driveeTopupPaid = enabled
    .filter(record => record.type === 'drivee_topup')
    .reduce((sum, record) => sum + safeMoney(record.amount), 0);
  const expensesTotal = enabled
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + safeMoney(record.amount), 0);
  const otherIncomeTotal = enabled
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + safeMoney(record.amount), 0);

  return {
    ordersCount: taxiOrders.length,
    taxiGross,
    fuelPaid,
    driveeTopupPaid,
    expensesTotal,
    otherIncomeTotal,
    enabledTotal: enabled.reduce((sum, record) => sum + safeMoney(record.amount), 0),
    disabledCount: records.length - enabled.length
  };
}

export function deriveDayInputFromRecords(input: DayCoreInputModel, records: DailyRecord[]): DayCoreInputModel {
  const summary = summarizeDailyRecords(records);
  const recordTasks: DayCoreTaskInput[] = records
    .filter(record => record.enabled && (record.type === 'expense' || record.type === 'drivee_topup'))
    .map(record => ({
      id: `record-task-${record.id}`,
      title: record.title,
      type: mapRecordCategoryToTaskType(record.category),
      plannedToday: true,
      timeCostMinutes: 0,
      moneyCost: safeMoney(record.amount),
      priority: 'normal'
    }));

  const nonRecordTasks = input.tasks.filter(task => !task.id.startsWith('record-task-') && task.id !== 'fuel');

  return {
    ...input,
    taxi: {
      ...input.taxi,
      ordersDone: summary.ordersCount,
      grossDone: summary.taxiGross,
      expectedGrossByEvening: Math.max(input.taxi.expectedGrossByEvening, summary.taxiGross),
      fuelAlreadyPaid: summary.fuelPaid
    },
    tasks: [...nonRecordTasks, ...recordTasks],
    source: 'manual',
    status: 'review_needed',
    reviewNotes: [
      'Суммы дня пересчитаны из редактируемых записей v1.41.',
      ...input.reviewNotes.filter(note => note !== 'Суммы дня пересчитаны из редактируемых записей v1.41.')
    ].slice(0, 12)
  };
}

export function updateDailyRecord(records: DailyRecord[], recordId: string, patch: Partial<DailyRecord>): DailyRecord[] {
  return records.map(record => record.id === recordId ? { ...record, ...patch, amount: patch.amount !== undefined ? safeMoney(patch.amount) : record.amount } : record);
}

export function deleteDailyRecord(records: DailyRecord[], recordId: string): DailyRecord[] {
  return records.filter(record => record.id !== recordId);
}

function defaultCategory(type: DailyRecordType) {
  if (type === 'taxi_order') return 'taxi';
  if (type === 'fuel') return 'fuel';
  if (type === 'drivee_topup') return 'drivee_topup';
  if (type === 'income') return 'other_income';
  return 'other';
}

function mapRecordCategoryToTaskType(category: string): DayCoreTaskInput['type'] {
  if (category === 'food') return 'food';
  if (category === 'meeting') return 'meeting';
  if (category === 'car' || category === 'fuel') return 'car';
  if (category === 'drivee_topup') return 'work';
  if (category === 'project') return 'project';
  if (category === 'rest') return 'rest';
  if (category === 'work') return 'work';
  return 'admin';
}

function safeMoney(value: number | undefined) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.round(value));
}
