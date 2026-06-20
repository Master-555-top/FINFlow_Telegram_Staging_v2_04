import type { FinflowAssistantAdvice } from '@/lib/assistant/finflowAssistantCore';
import type { FinflowExternalAssistantPayload } from '@/lib/assistant/finflowAssistantPrompt';
import { answerFuelOdometerQuestionLocally, type FuelOdometerChatContext } from '@/lib/assistant/fuelOdometerChatContext';
import { answerCarMaintenanceQuestionLocally, type CarMaintenanceChatContext } from '@/lib/assistant/carMaintenanceChatContext';
import { answerCarRepairAllocationQuestionLocally, type CarRepairAllocationChatContext } from '@/lib/assistant/carRepairAllocationChatContext';
import { answerDailyDecisionQuestionLocally, type DailyDecisionChatContext } from '@/lib/assistant/dailyDecisionChatContext';

export const FINFLOW_ASSISTANT_CHAT_VERSION = 'finflow_assistant_chat_v1_82' as const;

export type FinflowAssistantChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
  source: 'local_rule_based' | 'external_dry_run' | 'manual';
};

export function createAssistantChatMessage(input: Omit<FinflowAssistantChatMessage, 'id' | 'createdAt'>): FinflowAssistantChatMessage {
  return {
    id: `assistant_msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    ...input
  };
}

export function answerAssistantQuestionLocally(question: string, advice: FinflowAssistantAdvice, payload: FinflowExternalAssistantPayload, fuelContext?: FuelOdometerChatContext, carContext?: CarMaintenanceChatContext, repairContext?: CarRepairAllocationChatContext, dailyDecisionContext?: DailyDecisionChatContext) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return 'Напиши вопрос по дню: сколько ещё работать, что закрывать первым, можно ли тратить, что с бензином или Drivee.';
  }

  if (dailyDecisionContext) {
    const dailyDecisionAnswer = answerDailyDecisionQuestionLocally(question, dailyDecisionContext);
    if (dailyDecisionAnswer) return dailyDecisionAnswer;
  }

  if (repairContext) {
    const repairAnswer = answerCarRepairAllocationQuestionLocally(question, repairContext);
    if (repairAnswer) return repairAnswer;
  }

  if (carContext) {
    const carAnswer = answerCarMaintenanceQuestionLocally(question, carContext);
    if (carAnswer) return carAnswer;
  }

  if (fuelContext) {
    const fuelAnswer = answerFuelOdometerQuestionLocally(question, fuelContext);
    if (fuelAnswer) return fuelAnswer;
  }

  if (normalized.includes('сколько') || normalized.includes('работ')) {
    return `${advice.headline}. ${advice.nextAction} По расчёту осталось до чистой цели: ${Math.round(payload.metrics.remainingNetToTarget).toLocaleString('ru-RU')} ₽.`;
  }

  if (normalized.includes('тра') || normalized.includes('можно купить') || normalized.includes('потратить')) {
    if (payload.metrics.realFreeExpectedAfterDayPlan <= 0) {
      return `Сейчас лучше не тратить: после плана остаётся ${Math.round(payload.metrics.realFreeExpectedAfterDayPlan).toLocaleString('ru-RU')} ₽. Сначала закрой обязательное и добери смену.`;
    }
    return `Тратить можно осторожно, но сначала распределение. Свободно после плана: ${Math.round(payload.metrics.realFreeExpectedAfterDayPlan).toLocaleString('ru-RU')} ₽.`;
  }

  if (normalized.includes('бенз')) {
    return `По бензину: ещё нужно/учесть примерно ${Math.round(payload.metrics.fuelStillNeeded).toLocaleString('ru-RU')} ₽. Если не внёс заправку — добавь запись бензина.`;
  }

  if (normalized.includes('drivee') || normalized.includes('драйви') || normalized.includes('комисс')) {
    return `Drivee разделяем: комиссия по заказам сейчас ${Math.round(payload.metrics.driveeExpected).toLocaleString('ru-RU')} ₽, пополнение баланса Drivee отдельной записью ${Math.round(payload.metrics.driveeTopupCashflow).toLocaleString('ru-RU')} ₽.`;
  }

  if (normalized.includes('фонд') || normalized.includes('обяз')) {
    return `По распределению: дефицит ${Math.round(payload.metrics.allocationShortage).toLocaleString('ru-RU')} ₽. Приоритет: обязательства, машина/работа, бензин, подушка, потом гибкие цели.`;
  }

  return `${advice.headline}. ${advice.nextAction}`;
}

export function buildInitialAssistantChat(advice: FinflowAssistantAdvice): FinflowAssistantChatMessage[] {
  return [
    createAssistantChatMessage({
      role: 'assistant',
      text: `${advice.headline}. ${advice.nextAction}`,
      source: 'local_rule_based'
    })
  ];
}
