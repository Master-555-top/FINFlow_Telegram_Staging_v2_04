import type { FuelOdometerAssistantAdvice } from '@/lib/assistant/fuelOdometerAssistantAdvice';
import type { FuelNetIntegrationReport } from '@/lib/day-core/fuelNetIntegrationModel';
import type { FuelTrendReport } from '@/lib/car/fuelOdometerTrendModel';

export const FUEL_ODOMETER_CHAT_CONTEXT_VERSION = 'fuel_odometer_chat_context_v1_73' as const;

export type FuelOdometerChatContext = {
  version: typeof FUEL_ODOMETER_CHAT_CONTEXT_VERSION;
  advice: FuelOdometerAssistantAdvice;
  fuelNet: FuelNetIntegrationReport;
  trend: FuelTrendReport;
};

export function answerFuelOdometerQuestionLocally(question: string, context: FuelOdometerChatContext): string | null {
  const normalized = question.trim().toLowerCase();
  const asksFuel = normalized.includes('бенз')
    || normalized.includes('топлив')
    || normalized.includes('одометр')
    || normalized.includes('пробег')
    || normalized.includes('км')
    || normalized.includes('километр');

  const asksSpend = normalized.includes('тра')
    || normalized.includes('купить')
    || normalized.includes('можно')
    || normalized.includes('свободн');

  const asksWork = normalized.includes('работ')
    || normalized.includes('сколько')
    || normalized.includes('добрать')
    || normalized.includes('чист');

  if (!asksFuel && !asksSpend && !asksWork) return null;

  if (asksFuel) {
    return [
      context.advice.headline,
      context.advice.nextAction,
      `По одометру бензин: ${formatRub(context.fuelNet.odometerFuelRub)}.`,
      `План топлива сейчас: ${formatRub(context.fuelNet.plannedFuelRub)}.`,
      `Разница с планом: ${formatDeltaRub(context.fuelNet.fuelDeltaVsPlanRub)}.`,
      `Последняя цена км: ${context.trend.latestCostPerKmRub.toFixed(1)} ₽/км.`
    ].join(' ');
  }

  if (asksSpend) {
    if (context.fuelNet.freeMoneyUsingOdometerFuelRub <= 0) {
      return `Сейчас лучше не тратить. С учётом бензина по пробегу свободно: ${formatRub(context.fuelNet.freeMoneyUsingOdometerFuelRub)}. ${context.advice.nextAction}`;
    }

    if (context.fuelNet.fuelDeltaVsPlanRub > 500) {
      return `Перед тратами сначала обнови бензин: по пробегу он выше плана на ${formatRub(context.fuelNet.fuelDeltaVsPlanRub)}. После одометра свободно: ${formatRub(context.fuelNet.freeMoneyUsingOdometerFuelRub)}.`;
    }

    return `Тратить можно осторожно только после распределения. С учётом бензина по одометру свободно: ${formatRub(context.fuelNet.freeMoneyUsingOdometerFuelRub)}.`;
  }

  if (asksWork) {
    if (context.fuelNet.shiftCleanUsingOdometerFuelRub < context.fuelNet.plannedFuelRub) {
      return `Смена выглядит рискованно: чистые с учётом одометра ${formatRub(context.fuelNet.shiftCleanUsingOdometerFuelRub)}. Сначала проверь бензин и Drivee.`;
    }

    return `С учётом бензина по пробегу чистые: ${formatRub(context.fuelNet.shiftCleanUsingOdometerFuelRub)}. Для чистой цели ориентируйся на грязными: ${formatRub(context.fuelNet.grossNeededForTargetNetUsingOdometerFuelRub)}.`;
  }

  return null;
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function formatDeltaRub(value: number) {
  if (value > 0) return `+${formatRub(value)}`;
  if (value < 0) return `−${formatRub(Math.abs(value))}`;
  return '0 ₽';
}
