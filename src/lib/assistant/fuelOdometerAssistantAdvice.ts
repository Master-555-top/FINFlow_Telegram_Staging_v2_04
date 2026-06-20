import type { FuelTrendReport } from '@/lib/car/fuelOdometerTrendModel';
import type { FuelNetIntegrationReport } from '@/lib/day-core/fuelNetIntegrationModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';

export const FUEL_ODOMETER_ASSISTANT_ADVICE_VERSION = 'fuel_odometer_assistant_advice_v1_72' as const;

export type FuelOdometerAssistantSignal = {
  id: string;
  priority: 'critical' | 'warning' | 'info' | 'good';
  title: string;
  message: string;
};

export type FuelOdometerAssistantAdvice = {
  version: typeof FUEL_ODOMETER_ASSISTANT_ADVICE_VERSION;
  mode: 'fuel_ok' | 'fuel_watch' | 'fuel_warning' | 'fuel_no_history';
  headline: string;
  nextAction: string;
  signals: FuelOdometerAssistantSignal[];
};

export function buildFuelOdometerAssistantAdvice(input: {
  net: NetCalculationResult;
  fuelNet: FuelNetIntegrationReport;
  trend: FuelTrendReport;
}): FuelOdometerAssistantAdvice {
  const signals: FuelOdometerAssistantSignal[] = [];

  if (!input.trend.ready) {
    signals.push({
      id: 'save_first_fuel_history',
      priority: 'info',
      title: 'Нужно накопить историю бензина',
      message: 'Сохрани хотя бы 2–3 записи пробега/бензина, чтобы помощник точнее видел расход и стоимость километра.'
    });
  }

  if (input.fuelNet.fuelDeltaVsPlanRub > 500) {
    signals.push({
      id: 'fuel_above_plan',
      priority: 'warning',
      title: 'Бензин выше плана',
      message: `По пробегу бензин выше плана на ${formatRub(input.fuelNet.fuelDeltaVsPlanRub)}. Лучше применить бензин по пробегу в план дня до распределения денег.`
    });
  }

  if (input.fuelNet.shiftCleanUsingOdometerFuelRub < input.net.targetNet) {
    signals.push({
      id: 'clean_target_at_risk_by_fuel',
      priority: 'critical',
      title: 'Чистая цель под риском из-за бензина',
      message: `С учётом одометра чистые: ${formatRub(input.fuelNet.shiftCleanUsingOdometerFuelRub)} при цели ${formatRub(input.net.targetNet)}.`
    });
  }

  if (input.trend.latestCostPerKmRub >= 11) {
    signals.push({
      id: 'expensive_km_ai',
      priority: 'warning',
      title: 'Дорогой километр',
      message: `Последняя стоимость километра ${input.trend.latestCostPerKmRub.toFixed(1)} ₽/км. Проверь, не слишком ли много холостого пробега, пробок или дешёвых заказов.`
    });
  }

  if (input.fuelNet.freeMoneyUsingOdometerFuelRub <= 0 && input.net.grossExpected > 0) {
    signals.push({
      id: 'no_free_money_after_fuel',
      priority: 'critical',
      title: 'Свободных денег почти нет',
      message: 'После бензина по пробегу и плана дня свободные деньги исчезают. Гибкие траты лучше не делать.'
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: 'fuel_ai_ok',
      priority: 'good',
      title: 'Бензин под контролем',
      message: 'По текущему расчёту бензин не ломает дневной план. Всё равно вычитай его до свободных денег.'
    });
  }

  const hasCritical = signals.some(signal => signal.priority === 'critical');
  const hasWarning = signals.some(signal => signal.priority === 'warning');
  const mode: FuelOdometerAssistantAdvice['mode'] = !input.trend.ready
    ? 'fuel_no_history'
    : hasCritical
      ? 'fuel_warning'
      : hasWarning
        ? 'fuel_watch'
        : 'fuel_ok';

  return {
    version: FUEL_ODOMETER_ASSISTANT_ADVICE_VERSION,
    mode,
    headline: buildHeadline(mode),
    nextAction: buildNextAction(mode, input),
    signals: signals.slice(0, 5)
  };
}

function buildHeadline(mode: FuelOdometerAssistantAdvice['mode']) {
  if (mode === 'fuel_warning') return 'ИИ видит риск: бензин ухудшает чистые деньги дня';
  if (mode === 'fuel_watch') return 'ИИ советует проверить топливный план перед тратами';
  if (mode === 'fuel_no_history') return 'ИИ ждёт историю пробега для точных выводов';
  return 'ИИ: топливо сейчас не ломает план дня';
}

function buildNextAction(mode: FuelOdometerAssistantAdvice['mode'], input: { fuelNet: FuelNetIntegrationReport }) {
  if (mode === 'fuel_warning') return 'Сначала применить бензин по пробегу в план дня, затем пересчитать чистые и только потом распределять деньги.';
  if (mode === 'fuel_watch') return 'Сравни план топлива с одометром. Если разница большая — обнови план топлива.';
  if (mode === 'fuel_no_history') return 'После смены сохрани пробег/бензин в историю, чтобы помощник видел реальный расход.';
  if (input.fuelNet.fuelDeltaVsPlanRub < -300) return 'Можно оставить запас в плане топлива, но не трать разницу раньше конца смены.';
  return 'Продолжай считать бензин как рабочую издержку до свободных денег.';
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
