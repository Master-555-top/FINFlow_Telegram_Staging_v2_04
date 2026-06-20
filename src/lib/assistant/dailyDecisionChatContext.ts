import type { DailyDecisionSummary } from '@/lib/day-core/dailyDecisionSummaryModel';

export const DAILY_DECISION_CHAT_CONTEXT_VERSION = 'daily_decision_chat_context_v1_82' as const;

export type DailyDecisionChatContext = {
  version: typeof DAILY_DECISION_CHAT_CONTEXT_VERSION;
  summary: DailyDecisionSummary;
};

export function buildDailyDecisionChatContext(input: {
  summary: DailyDecisionSummary;
}): DailyDecisionChatContext {
  return {
    version: DAILY_DECISION_CHAT_CONTEXT_VERSION,
    summary: input.summary
  };
}

export function answerDailyDecisionQuestionLocally(question: string, context: DailyDecisionChatContext): string | null {
  const normalized = question.trim().toLowerCase();

  const asksGlobal =
    normalized.includes('что делать')
    || normalized.includes('итог')
    || normalized.includes('план')
    || normalized.includes('сейчас')
    || normalized.includes('день')
    || normalized.includes('общ')
    || normalized.includes('глобаль')
    || normalized.includes('решение');

  const asksWork =
    normalized.includes('работ')
    || normalized.includes('сколько')
    || normalized.includes('добрать')
    || normalized.includes('заказ')
    || normalized.includes('чист');

  const asksFuel =
    normalized.includes('бенз')
    || normalized.includes('топлив')
    || normalized.includes('одометр')
    || normalized.includes('пробег');

  const asksCar =
    normalized.includes('машин')
    || normalized.includes('ремонт')
    || normalized.includes('масл')
    || normalized.includes('подвес')
    || normalized.includes('износ');

  const asksSpending =
    normalized.includes('тратить')
    || normalized.includes('потратить')
    || normalized.includes('купить')
    || normalized.includes('можно')
    || normalized.includes('распредел')
    || normalized.includes('куда');

  if (!asksGlobal && !asksWork && !asksFuel && !asksCar && !asksSpending) return null;

  const summary = context.summary;

  if (asksGlobal || normalized.includes('что делать')) {
    return [
      summary.headline,
      summary.primaryAction,
      `Работа: ${summary.workDecision}`,
      `Бензин: ${summary.fuelDecision}`,
      `Машина: ${summary.carDecision}`,
      `Траты: ${summary.spendingDecision}`
    ].join(' ');
  }

  if (asksSpending) {
    return [
      summary.spendingDecision,
      summary.allocationDecision,
      summary.primaryAction
    ].join(' ');
  }

  if (asksWork) {
    return [
      summary.workDecision,
      summary.primaryAction,
      `Режим дня: ${summary.mode}.`
    ].join(' ');
  }

  if (asksFuel) {
    return [
      summary.fuelDecision,
      summary.workDecision,
      summary.spendingDecision
    ].join(' ');
  }

  if (asksCar) {
    return [
      summary.carDecision,
      summary.allocationDecision,
      summary.spendingDecision
    ].join(' ');
  }

  return null;
}
