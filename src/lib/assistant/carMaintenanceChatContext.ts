import {
  currentKnownOdometer,
  latestKnownCarService,
  type OilServiceStatus
} from '@/lib/car/carMaintenanceModel';
import { finflowCarReality } from '@/lib/project/finflowRealityContext';

export const CAR_MAINTENANCE_CHAT_CONTEXT_VERSION = 'car_maintenance_chat_context_v1_74' as const;

export type CarMaintenanceChatContext = {
  version: typeof CAR_MAINTENANCE_CHAT_CONTEXT_VERSION;
  oil: OilServiceStatus;
  car: string;
  lastServiceDate: string;
  lastServiceOdometerKm: number;
  currentOdometerDate: string;
  currentOdometerKm: number;
  repairFundTargetRub: number;
  knownRepairNeeds: readonly string[];
};

export function buildCarMaintenanceChatContext(input: {
  oil: OilServiceStatus;
}): CarMaintenanceChatContext {
  return {
    version: CAR_MAINTENANCE_CHAT_CONTEXT_VERSION,
    oil: input.oil,
    car: finflowCarReality.car,
    lastServiceDate: latestKnownCarService.date,
    lastServiceOdometerKm: latestKnownCarService.odometerKm,
    currentOdometerDate: currentKnownOdometer.date,
    currentOdometerKm: currentKnownOdometer.odometerKm,
    repairFundTargetRub: finflowCarReality.repairFundTargetRub,
    knownRepairNeeds: finflowCarReality.knownRepairNeeds
  };
}

export function answerCarMaintenanceQuestionLocally(question: string, context: CarMaintenanceChatContext): string | null {
  const normalized = question.trim().toLowerCase();
  const asksCar = normalized.includes('машин')
    || normalized.includes('масл')
    || normalized.includes('ремонт')
    || normalized.includes('пробег')
    || normalized.includes('то')
    || normalized.includes('свеч')
    || normalized.includes('фильтр')
    || normalized.includes('подвес')
    || normalized.includes('стойк')
    || normalized.includes('колод')
    || normalized.includes('шар')
    || normalized.includes('износ');

  if (!asksCar) return null;

  if (normalized.includes('масл') || normalized.includes('то') || normalized.includes('замен')) {
    return [
      `По машине: ${context.oil.recommendation}`,
      `После замены ${context.lastServiceDate} пройдено ${Math.round(context.oil.kmSinceService).toLocaleString('ru-RU')} км.`,
      `Напоминание о масле: ${context.oil.reminderOdometerKm.toLocaleString('ru-RU')} км.`,
      `Плановая замена: ${context.oil.nextChangeOdometerKm.toLocaleString('ru-RU')} км.`,
      `До замены осталось ${Math.max(0, Math.round(context.oil.kmUntilChange)).toLocaleString('ru-RU')} км.`
    ].join(' ');
  }

  if (normalized.includes('ремонт') || normalized.includes('подвес') || normalized.includes('стойк') || normalized.includes('колод') || normalized.includes('шар')) {
    return [
      `По ремонту: держи цель ремонтного фонда около ${context.repairFundTargetRub.toLocaleString('ru-RU')} ₽.`,
      `Из известных рисков: ${context.knownRepairNeeds.join(', ')}.`,
      'Не распределяй все свободные деньги в гибкие цели, пока машина остаётся рабочим активом такси.'
    ].join(' ');
  }

  if (normalized.includes('пробег') || normalized.includes('износ')) {
    return [
      `Текущий известный пробег: ${context.currentOdometerKm.toLocaleString('ru-RU')} км на ${context.currentOdometerDate}.`,
      `Средний свежий темп после обслуживания: ${Math.round(context.oil.averageKmPerDaySinceService).toLocaleString('ru-RU')} км/день.`,
      'Большой пробег в такси означает не только бензин, но и масло, подвеску, колодки, резину и усталость.'
    ].join(' ');
  }

  return [
    `По машине: ${context.car}.`,
    `Последнее обслуживание: ${context.lastServiceDate} на ${context.lastServiceOdometerKm.toLocaleString('ru-RU')} км.`,
    context.oil.recommendation
  ].join(' ');
}
