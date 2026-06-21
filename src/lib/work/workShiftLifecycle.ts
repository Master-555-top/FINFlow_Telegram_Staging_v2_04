import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';

export const WORK_SHIFT_LIFECYCLE_VERSION = 'work_shift_lifecycle_v2_38' as const;

export type WorkShiftLifecycleStatus = 'empty' | 'open' | 'needs_orders' | 'ready_to_close' | 'closed_preview';
export type WorkShiftCheckpointLevel = 'green' | 'amber' | 'red';

export type WorkShiftCheckpoint = {
  id: string;
  level: WorkShiftCheckpointLevel;
  title: string;
  message: string;
};

export type WorkShiftLifecycleSnapshot = {
  version: typeof WORK_SHIFT_LIFECYCLE_VERSION;
  generatedAtIso: string;
  localDate: string;
  status: WorkShiftLifecycleStatus;
  headline: string;
  nextAction: string;
  progressPercent: number;
  canOpenShift: boolean;
  canAddOrder: boolean;
  canCloseShift: boolean;
  shift: {
    ordersCount: number;
    gross: number;
    targetGross: number;
    remainingGross: number;
    activeHours: number;
    fullShiftHours: number;
    idleHours: number;
    activeRubPerHour: number;
    shiftRubPerHour: number;
  };
  closePreview: {
    workCosts: number;
    fuelPaid: number;
    driveeEstimated: number;
    netAfterWorkCosts: number;
    summary: string;
  };
  checkpoints: WorkShiftCheckpoint[];
  syncNotes: string[];
};

export function buildWorkShiftLifecycleSnapshot(
  input: DayCoreInputModel,
  records: DailyRecord[],
  nowIso = new Date().toISOString()
): WorkShiftLifecycleSnapshot {
  const enabled = records.filter(record => record.enabled);
  const orders = enabled.filter(record => record.type === 'taxi_order');
  const fuel = enabled.filter(record => record.type === 'fuel');
  const drivee = enabled.filter(record => record.type === 'drivee_topup');

  const grossFromOrders = sum(orders);
  const gross = grossFromOrders > 0 ? grossFromOrders : safeMoney(input.taxi.grossDone);
  const ordersCount = orders.length > 0 ? orders.length : Math.max(0, Math.round(input.taxi.ordersDone));
  const targetGross = safeMoney(input.taxi.targetGrossToday);
  const remainingGross = Math.max(0, targetGross - gross);
  const activeHours = safeHours(input.taxi.activeHours);
  const fullShiftHours = Math.max(activeHours, safeHours(input.taxi.fullShiftHours));
  const idleHours = Math.max(0, roundOne(fullShiftHours - activeHours));
  const activeRubPerHour = activeHours > 0 ? Math.round(gross / activeHours) : 0;
  const shiftRubPerHour = fullShiftHours > 0 ? Math.round(gross / fullShiftHours) : 0;
  const fuelPaid = sum(fuel) || safeMoney(input.taxi.fuelAlreadyPaid);
  const driveeEstimated = Math.max(sum(drivee), Math.round(gross * safeRate(input.taxi.driveeRate)));
  const workCosts = fuelPaid + driveeEstimated;
  const netAfterWorkCosts = Math.max(0, gross - workCosts);
  const progressPercent = targetGross > 0 ? Math.min(100, Math.round((gross / targetGross) * 100)) : 0;
  const status = inferLifecycleStatus({ ordersCount, gross, activeHours, fullShiftHours, remainingGross });
  const closePreview = {
    workCosts,
    fuelPaid,
    driveeEstimated,
    netAfterWorkCosts,
    summary: `Закрытие смены даст ${gross.toLocaleString('ru-RU')} ₽ грязными, примерно ${netAfterWorkCosts.toLocaleString('ru-RU')} ₽ после рабочих издержек.`
  };

  return {
    version: WORK_SHIFT_LIFECYCLE_VERSION,
    generatedAtIso: nowIso,
    localDate: input.localDate,
    status,
    headline: buildHeadline(status, progressPercent),
    nextAction: buildNextAction({ status, remainingGross, activeRubPerHour, netAfterWorkCosts }),
    progressPercent,
    canOpenShift: status === 'empty',
    canAddOrder: status === 'open' || status === 'needs_orders' || status === 'ready_to_close',
    canCloseShift: status === 'ready_to_close' || status === 'closed_preview',
    shift: {
      ordersCount,
      gross,
      targetGross,
      remainingGross,
      activeHours,
      fullShiftHours,
      idleHours,
      activeRubPerHour,
      shiftRubPerHour
    },
    closePreview,
    checkpoints: buildCheckpoints({ ordersCount, gross, remainingGross, activeRubPerHour, shiftRubPerHour, idleHours, fuelPaid, netAfterWorkCosts }),
    syncNotes: [
      'v2.38 делает смену lifecycle-сущностью: открыть → добавить заказы/издержки → закрыть → связать с Деньгами.',
      'Пока это local-first preview: Supabase write остаётся safe-off до RLS/backup/conflict test.',
      'История смен остаётся внутри раздела Работа, без глобальной вкладки История.'
    ]
  };
}

function inferLifecycleStatus(input: { ordersCount: number; gross: number; activeHours: number; fullShiftHours: number; remainingGross: number }): WorkShiftLifecycleStatus {
  if (input.ordersCount <= 0 && input.gross <= 0 && input.activeHours <= 0) return 'empty';
  if (input.ordersCount <= 0 && input.activeHours > 0) return 'needs_orders';
  if (input.remainingGross <= 0 || input.fullShiftHours >= 8 || input.ordersCount >= 8) return 'ready_to_close';
  return 'open';
}

function buildHeadline(status: WorkShiftLifecycleStatus, progressPercent: number) {
  if (status === 'empty') return 'Смена ещё не открыта';
  if (status === 'needs_orders') return 'Смена есть, заказов мало';
  if (status === 'ready_to_close') return 'Смену можно закрывать';
  if (status === 'closed_preview') return 'Закрытие готово к подтверждению';
  return `Смена открыта · ${progressPercent}% цели`;
}

function buildNextAction(input: { status: WorkShiftLifecycleStatus; remainingGross: number; activeRubPerHour: number; netAfterWorkCosts: number }) {
  if (input.status === 'empty') return 'Открой смену или импортируй журнал заказов, затем добавляй заказы отдельными записями.';
  if (input.status === 'needs_orders') return 'Добавь реальные заказы, иначе темп и чистые деньги будут считаться неточно.';
  if (input.status === 'ready_to_close') return `Проверь бензин/Drivee и закрой смену. После издержек сейчас около ${input.netAfterWorkCosts.toLocaleString('ru-RU')} ₽.`;
  if (input.remainingGross > 0 && input.activeRubPerHour > 0) return `До цели осталось ${input.remainingGross.toLocaleString('ru-RU')} ₽. Добирай сильные заказы, затем закрывай смену.`;
  return 'Продолжай смену и фиксируй каждый заказ/издержку через быстрый ввод или импорт.';
}

function buildCheckpoints(input: {
  ordersCount: number;
  gross: number;
  remainingGross: number;
  activeRubPerHour: number;
  shiftRubPerHour: number;
  idleHours: number;
  fuelPaid: number;
  netAfterWorkCosts: number;
}): WorkShiftCheckpoint[] {
  return [
    {
      id: 'orders',
      level: input.ordersCount >= 8 ? 'green' : input.ordersCount >= 4 ? 'amber' : 'red',
      title: 'Заказы',
      message: input.ordersCount > 0 ? `${input.ordersCount} заказ(ов), ${input.gross.toLocaleString('ru-RU')} ₽ грязными.` : 'Нет отдельных заказов: нужна запись или импорт.'
    },
    {
      id: 'pace',
      level: input.activeRubPerHour >= 1400 ? 'green' : input.activeRubPerHour >= 900 ? 'amber' : 'red',
      title: 'Темп',
      message: input.activeRubPerHour > 0 ? `${input.activeRubPerHour.toLocaleString('ru-RU')} ₽/ч активно · ${input.shiftRubPerHour.toLocaleString('ru-RU')} ₽/ч смена.` : 'Темп появится после активного времени и заказов.'
    },
    {
      id: 'costs',
      level: input.fuelPaid > 0 ? 'green' : 'amber',
      title: 'Издержки',
      message: input.fuelPaid > 0 ? `Бензин учтён: ${input.fuelPaid.toLocaleString('ru-RU')} ₽.` : 'Проверь бензин/Drivee перед закрытием смены.'
    },
    {
      id: 'close',
      level: input.remainingGross <= 0 ? 'green' : input.netAfterWorkCosts >= 5000 ? 'amber' : 'red',
      title: 'Закрытие',
      message: input.remainingGross <= 0 ? 'Грязная цель закрыта.' : `До цели ещё ${input.remainingGross.toLocaleString('ru-RU')} ₽.`
    }
  ];
}

function sum(records: DailyRecord[]) {
  return records.reduce((total, record) => total + safeMoney(record.amount), 0);
}

function safeMoney(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function safeHours(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 10) / 10) : 0;
}

function safeRate(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0.13;
  if (value > 1) return value / 100;
  return value;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
