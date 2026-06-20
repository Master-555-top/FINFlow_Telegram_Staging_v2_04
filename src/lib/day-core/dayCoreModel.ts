export type FinFlowMode = 'normal' | 'recovery' | 'emergency';

export type MoneyBucket = {
  id: string;
  title: string;
  amount: number;
  priority: 'critical' | 'important' | 'flexible' | 'postpone';
  note: string;
};

export type DayCoreSnapshot = {
  version: string;
  statusLabel: string;
  mode: FinFlowMode;
  goals: {
    targetGrossToday: number;
    baselineDailyGross: number;
    baselineDailyNet: number;
    realisticRemainingGrossMin: number;
    realisticRemainingGrossMax: number;
  };
  currentMoney: {
    cash: number;
    card: number;
    driveeBalance: number;
    freeNow: number;
  };
  shift: {
    ordersDone: number;
    grossDone: number;
    activeHours: number;
    fullShiftHours: number;
    remainingGross: number;
    expectedGrossByEvening: number;
    driveeRate: number;
    driveeEstimatedFullDay: number;
    driveeAlreadyUsed: number;
  };
  requiredToday: {
    fuel: number;
    food: number;
    bankruptcy: number;
    meeting: number;
    products: number;
    workReserveTomorrow: number;
  };
  meetings: {
    averagePerWeek: number;
    fundCurrent: number;
    fundTarget: number;
    todayPlanned: boolean;
    recommendation: number;
  };
  recommendation: {
    title: string;
    message: string;
    buckets: MoneyBucket[];
  };
};

const driveeRate = 0.13;
const targetGrossToday = 14_400;
const grossDone = 4_000;
const expectedGrossByEvening = 12_000;

const driveeEstimatedFullDay = Math.round(expectedGrossByEvening * driveeRate);
const availableAfterDrivee = expectedGrossByEvening - driveeEstimatedFullDay;

export const dayCoreMock: DayCoreSnapshot = {
  version: 'v3.0 Foundation v2.02',
  statusLabel: 'Day Core mock • живой план дня',
  mode: 'recovery',
  goals: {
    targetGrossToday,
    baselineDailyGross: 11_000,
    baselineDailyNet: 8_500,
    realisticRemainingGrossMin: 6_000,
    realisticRemainingGrossMax: 9_000
  },
  currentMoney: {
    cash: 500,
    card: 1_600,
    driveeBalance: 300,
    freeNow: 2_100
  },
  shift: {
    ordersDone: 7,
    grossDone,
    activeHours: 4.1,
    fullShiftHours: 6.3,
    remainingGross: targetGrossToday - grossDone,
    expectedGrossByEvening,
    driveeRate,
    driveeEstimatedFullDay,
    driveeAlreadyUsed: Math.round(grossDone * driveeRate)
  },
  requiredToday: {
    fuel: 2_000,
    food: 500,
    bankruptcy: 6_000,
    meeting: 2_000,
    products: 2_000,
    workReserveTomorrow: 1_000
  },
  meetings: {
    averagePerWeek: 5,
    fundCurrent: 800,
    fundTarget: 3_000,
    todayPlanned: true,
    recommendation: 1_500
  },
  recommendation: {
    title: 'ИИ-распределение сейчас',
    message: `Если к вечеру выйти примерно на ${formatRub(expectedGrossByEvening)} грязными, после Drivee останется около ${formatRub(availableAfterDrivee)}. Полный план ${formatRub(targetGrossToday)} уже под риском, поэтому режим Recovery: сначала работа завтра и обязательства, потом встреча, продукты переносим.`,
    buckets: [
      { id: 'drivee', title: 'Drivee ~13%', amount: driveeEstimatedFullDay, priority: 'critical', note: 'Комиссия считается от грязных, не как фиксированная сумма.' },
      { id: 'fuel', title: 'Бензин', amount: 2_000, priority: 'critical', note: 'Сохраняет возможность доработать сегодня и выйти завтра.' },
      { id: 'food', title: 'Еда', amount: 500, priority: 'important', note: 'Минимум на день без просадки по энергии.' },
      { id: 'bankruptcy', title: 'Банкротство', amount: 6_000, priority: 'critical', note: 'Обязательство 15 числа, максимальный приоритет.' },
      { id: 'meeting', title: 'Встреча', amount: 1_500, priority: 'important', note: 'Частота 5 раз/неделю, но сегодня бюджет режем до безопасного.' },
      { id: 'tomorrow', title: 'Рабочий остаток', amount: 440, priority: 'important', note: 'Остаток после критичного распределения.' },
      { id: 'products', title: 'Продукты девушке', amount: 0, priority: 'postpone', note: 'Перенести или закрыть отдельной мини-целью.' },
      { id: 'cushion', title: 'Подушка / переезд', amount: 0, priority: 'postpone', note: 'Сегодня не трогать из-за Recovery Mode.' }
    ]
  }
};

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' ₽';
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getModeLabel(mode: FinFlowMode) {
  if (mode === 'emergency') return 'Emergency';
  if (mode === 'recovery') return 'Recovery';
  return 'Normal';
}

export function getModeExplanation(mode: FinFlowMode) {
  if (mode === 'emergency') return 'День почти не вытягивается: режем всё гибкое, защищаем работу и обязательства.';
  if (mode === 'recovery') return 'План под риском: пересобираем день по приоритетам и не ломаем завтра.';
  return 'План реалистичен: можно распределять деньги по фондам и целям.';
}
