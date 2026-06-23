export type DayCoreInputSource = 'manual' | 'import_review_queue' | 'bank_statement' | 'taxi_log' | 'ai_suggestion' | 'system_default';

export type DayCoreInputStatus = 'draft' | 'review_needed' | 'confirmed' | 'rejected' | 'archived';

export type DayCoreMoneyInput = {
  cash: number;
  card: number;
  driveeBalance: number;
  reservedNotFree: number;
  note: string;
};

export type DayCoreTaxiInput = {
  ordersDone: number;
  grossDone: number;
  activeHours: number;
  fullShiftHours: number;
  expectedGrossByEvening: number;
  targetGrossToday: number;
  targetNetToday: number;
  driveeRate: number;
  fuelPlanned: number;
  fuelAlreadyPaid: number;
  distanceKmPlannedMin: number;
  distanceKmPlannedMax: number;
};

export type DayCoreObligationInput = {
  id: string;
  title: string;
  amountDue: number;
  dueDayOfMonth: number;
  currentSaved: number;
  priority: 'critical' | 'high' | 'normal' | 'flexible';
  source: DayCoreInputSource;
};

export type DayCoreFundInput = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  priority: 'critical' | 'high' | 'normal' | 'flexible';
  canReceiveToday: boolean;
  fundType?: 'revolving' | 'savings' | 'flexible';
  group?: 'required' | 'savings';
  sortOrder?: number;
  note?: string;
};

export type DayCoreTaskInput = {
  id: string;
  title: string;
  type: 'work' | 'food' | 'sleep' | 'meeting' | 'car' | 'admin' | 'project' | 'rest';
  plannedToday: boolean;
  timeCostMinutes: number;
  moneyCost: number;
  priority: 'critical' | 'high' | 'normal' | 'flexible';
};

export type DayCoreInputModel = {
  schemaVersion: 'day_core_input_v1_24';
  dayId: string;
  localDate: string;
  localTime: string;
  source: DayCoreInputSource;
  status: DayCoreInputStatus;
  money: DayCoreMoneyInput;
  taxi: DayCoreTaxiInput;
  obligations: DayCoreObligationInput[];
  funds: DayCoreFundInput[];
  tasks: DayCoreTaskInput[];
  reviewNotes: string[];
};

export type DayCoreInputSummary = {
  freeMoneyNow: number;
  remainingGrossToTarget: number;
  estimatedDriveeFullDay: number;
  estimatedNetBeforePersonalCosts: number;
  criticalObligationsDue: number;
  plannedTaskCosts: number;
  reviewRequired: boolean;
};

export const dayCoreInputMock: DayCoreInputModel = {
  schemaVersion: 'day_core_input_v1_24',
  dayId: 'demo-2026-06-17',
  localDate: '2026-06-17',
  localTime: '18:00',
  source: 'manual',
  status: 'review_needed',
  money: {
    cash: 500,
    card: 1600,
    driveeBalance: 300,
    reservedNotFree: 0,
    note: 'Демо-ввод для проверки Day Core: реальные суммы пользователь должен вводить вручную или подтверждать из очереди импорта.'
  },
  taxi: {
    ordersDone: 7,
    grossDone: 4000,
    activeHours: 4.1,
    fullShiftHours: 6.3,
    expectedGrossByEvening: 12000,
    targetGrossToday: 14400,
    targetNetToday: 8500,
    driveeRate: 0.13,
    fuelPlanned: 2000,
    fuelAlreadyPaid: 0,
    distanceKmPlannedMin: 80,
    distanceKmPlannedMax: 150
  },
  obligations: [
    { id: 'car-payment', title: 'Платёж за машину', amountDue: 45000, dueDayOfMonth: 6, currentSaved: 0, priority: 'critical', source: 'system_default' },
    { id: 'bankruptcy', title: 'Банкротство / банк', amountDue: 15000, dueDayOfMonth: 15, currentSaved: 0, priority: 'critical', source: 'system_default' }
  ],
  funds: [
    { id: 'working-fund', title: '🔰 Рабочий', targetAmount: 2500, currentAmount: 0, priority: 'critical', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 10, note: 'Бензин, комиссия и оборотка. Поддерживать стабильный остаток.' },
    { id: 'car-repair', title: '🚗 Ремонт машины / рабочий актив', targetAmount: 50000, currentAmount: 0, priority: 'high', canReceiveToday: true, fundType: 'savings', group: 'required', sortOrder: 25 },
    { id: 'meetings', title: '❤️ Встречи', targetAmount: 3000, currentAmount: 800, priority: 'high', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 30 },
    { id: 'personal', title: '👤 Личное', targetAmount: 0, currentAmount: 0, priority: 'high', canReceiveToday: true, fundType: 'flexible', group: 'required', sortOrder: 40 },
    { id: 'base-business', title: '🎂 База', targetAmount: 10000, currentAmount: 0, priority: 'normal', canReceiveToday: true, fundType: 'revolving', group: 'required', sortOrder: 50 },
    { id: 'ulyana-birthday', title: '🎁 ДР Ульяны', targetAmount: 50000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 70 },
    { id: 'flight-move', title: '✈️ Полёт / переезд', targetAmount: 300000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 80 },
    { id: 'safety-cushion', title: '🛟 Подушка', targetAmount: 50000, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'savings', group: 'savings', sortOrder: 90 },
    { id: 'ulyana-gift', title: '🎁 Подарок Ульяне', targetAmount: 0, currentAmount: 0, priority: 'flexible', canReceiveToday: false, fundType: 'flexible', group: 'savings', sortOrder: 100 }
  ],
  tasks: [
    { id: 'fuel', title: 'Заправка', type: 'work', plannedToday: true, timeCostMinutes: 20, moneyCost: 2000, priority: 'critical' },
    { id: 'food', title: 'Еда без просадки энергии', type: 'food', plannedToday: true, timeCostMinutes: 30, moneyCost: 500, priority: 'high' },
    { id: 'meeting', title: 'Встреча', type: 'meeting', plannedToday: true, timeCostMinutes: 150, moneyCost: 1500, priority: 'high' }
  ],
  reviewNotes: [
    'Все импортированные значения сначала попадают в review_needed.',
    'Day Core не должен принимать банковские операции как истину без подтверждения категории и назначения.'
  ]
};

export function summarizeDayCoreInput(input: DayCoreInputModel): DayCoreInputSummary {
  const freeMoneyNow = Math.max(0, input.money.cash + input.money.card - input.money.reservedNotFree);
  const remainingGrossToTarget = Math.max(0, input.taxi.targetGrossToday - input.taxi.grossDone);
  const estimatedDriveeFullDay = Math.round(input.taxi.expectedGrossByEvening * input.taxi.driveeRate);
  const estimatedNetBeforePersonalCosts = Math.max(0, input.taxi.expectedGrossByEvening - estimatedDriveeFullDay - input.taxi.fuelPlanned);
  const criticalObligationsDue = input.obligations
    .filter(item => item.priority === 'critical')
    .reduce((sum, item) => sum + Math.max(0, item.amountDue - item.currentSaved), 0);
  const plannedTaskCosts = input.tasks
    .filter(task => task.plannedToday)
    .reduce((sum, task) => sum + task.moneyCost, 0);

  return {
    freeMoneyNow,
    remainingGrossToTarget,
    estimatedDriveeFullDay,
    estimatedNetBeforePersonalCosts,
    criticalObligationsDue,
    plannedTaskCosts,
    reviewRequired: input.status !== 'confirmed' || input.reviewNotes.length > 0
  };
}
