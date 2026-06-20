import type { CarRepairAllocationAdvisor } from '@/lib/day-core/carRepairAllocationModel';

export const CAR_REPAIR_ALLOCATION_CHAT_CONTEXT_VERSION = 'car_repair_allocation_chat_context_v1_76' as const;

export type CarRepairAllocationChatContext = {
  version: typeof CAR_REPAIR_ALLOCATION_CHAT_CONTEXT_VERSION;
  repair: CarRepairAllocationAdvisor;
};

export function buildCarRepairAllocationChatContext(input: {
  repair: CarRepairAllocationAdvisor;
}): CarRepairAllocationChatContext {
  return {
    version: CAR_REPAIR_ALLOCATION_CHAT_CONTEXT_VERSION,
    repair: input.repair
  };
}

export function answerCarRepairAllocationQuestionLocally(question: string, context: CarRepairAllocationChatContext): string | null {
  const normalized = question.trim().toLowerCase();
  const asksRepairMoney = normalized.includes('ремонт')
    || normalized.includes('ходов')
    || normalized.includes('подвес')
    || normalized.includes('машин')
    || normalized.includes('фонд')
    || normalized.includes('распредел')
    || normalized.includes('тратить')
    || normalized.includes('потратить')
    || normalized.includes('можно')
    || normalized.includes('куда')
    || normalized.includes('отлож')
    || normalized.includes('оставить');

  if (!asksRepairMoney) return null;

  const repair = context.repair;

  if (normalized.includes('тратить') || normalized.includes('потратить') || normalized.includes('можно') || normalized.includes('купить')) {
    if (repair.status === 'missing_fund') {
      return `Сначала восстанови ремонтный фонд машины. Цель ремонта около ${formatRub(repair.targetRub)}, потому что машина — рабочий актив такси. Гибкие траты пока рискованные.`;
    }

    if (repair.status === 'no_free_money') {
      return `Сейчас лучше не тратить: свободных денег для ремонта нет. Сначала добери чистые со смены, затем защити рабочий фонд и машину.`;
    }

    if (repair.dailyProtectionGapRub > 0) {
      return `Тратить рано: ремонтный фонд недополучает сегодня ${formatRub(repair.dailyProtectionGapRub)}. Лучше отложить около ${formatRub(repair.suggestedTodayRub)} на машину, а не в гибкие покупки.`;
    }

    return `Осторожные траты можно рассматривать только после обязательств, рабочего фонда и ремонта. Сегодня ремонтный фонд выглядит защищённым: ${formatRub(repair.allocatedTodayRub)} в плане.`;
  }

  if (normalized.includes('куда') || normalized.includes('распредел') || normalized.includes('отлож') || normalized.includes('оставить')) {
    return [
      `По распределению на машину: сегодня лучше заложить около ${formatRub(repair.suggestedTodayRub)}.`,
      `Сейчас в плане ремонта: ${formatRub(repair.allocatedTodayRub)}.`,
      `До цели ремонта осталось ${formatRub(repair.remainingRub)}.`,
      repair.recommendation
    ].join(' ');
  }

  return [
    `Ремонтный фонд: цель ${formatRub(repair.targetRub)}, накоплено ${formatRub(repair.currentRub)}, осталось ${formatRub(repair.remainingRub)}.`,
    `Сегодня лучше: ${formatRub(repair.suggestedTodayRub)}, сейчас заложено ${formatRub(repair.allocatedTodayRub)}.`,
    repair.recommendation,
    repair.knownRepairNeeds.length > 0 ? `Риски: ${repair.knownRepairNeeds.join(', ')}.` : ''
  ].filter(Boolean).join(' ');
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
