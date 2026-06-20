import type { FinflowAssistantAdvice } from '@/lib/assistant/finflowAssistantCore';
import type { DailyAllocationResult } from '@/lib/day-core/dailyAllocationModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';
import type { DailyRecordsSummary } from '@/lib/day-core/dailyRecordsModel';

export const FINFLOW_ASSISTANT_PROMPT_VERSION = 'finflow_assistant_prompt_v1_57' as const;

export type FinflowExternalAssistantPayload = {
  schemaVersion: typeof FINFLOW_ASSISTANT_PROMPT_VERSION;
  purpose: 'daily_finflow_decision_support';
  language: 'ru';
  privacyMode: 'minimized_no_raw_private_data';
  localAdvice: FinflowAssistantAdvice;
  metrics: {
    grossDone: number;
    grossExpected: number;
    targetNet: number;
    shiftCleanExpected: number;
    realFreeExpectedAfterDayPlan: number;
    remainingNetToTarget: number;
    driveeExpected: number;
    driveeTopupCashflow: number;
    fuelStillNeeded: number;
    allocationShortage: number;
    ordersCount: number;
    recordsGross: number;
    recordsFuel: number;
    recordsDriveeTopup: number;
    recordsExpenses: number;
  };
  rules: string[];
};

export function buildExternalAssistantPayload(input: {
  net: NetCalculationResult;
  allocation: DailyAllocationResult;
  recordsSummary: DailyRecordsSummary;
  localAdvice: FinflowAssistantAdvice;
}): FinflowExternalAssistantPayload {
  const { net, allocation, recordsSummary, localAdvice } = input;

  return {
    schemaVersion: FINFLOW_ASSISTANT_PROMPT_VERSION,
    purpose: 'daily_finflow_decision_support',
    language: 'ru',
    privacyMode: 'minimized_no_raw_private_data',
    localAdvice,
    metrics: {
      grossDone: net.grossDone,
      grossExpected: net.grossExpected,
      targetNet: net.targetNet,
      shiftCleanExpected: net.shiftCleanExpected,
      realFreeExpectedAfterDayPlan: net.realFreeExpectedAfterDayPlan,
      remainingNetToTarget: net.remainingNetToTarget,
      driveeExpected: net.driveeExpected,
      driveeTopupCashflow: net.driveeTopupCashflow,
      fuelStillNeeded: net.fuelStillNeeded,
      allocationShortage: allocation.shortage,
      ordersCount: recordsSummary.ordersCount,
      recordsGross: recordsSummary.taxiGross,
      recordsFuel: recordsSummary.fuelPaid,
      recordsDriveeTopup: recordsSummary.driveeTopupPaid,
      recordsExpenses: recordsSummary.expensesTotal
    },
    rules: [
      'Answer in Russian.',
      'Do not invent missing balances, debts, deadlines or personal facts.',
      'Use only provided metrics and local advice.',
      'Prioritize obligations, car/work fund, fuel, Drivee clarity and safety cushion.',
      'If the plan is unrealistic, say so directly and suggest a recovery mode.',
      'Do not request or expose raw bank rows, tokens, .env, private_raw_data or secrets.',
      'Keep advice practical: next action, why, and what to avoid.'
    ]
  };
}

export function buildExternalAssistantSystemPrompt() {
  return [
    'Ты встроенный помощник FINFlow.',
    'Ты не общий чатбот, а финансово-рабочий диспетчер дня для такси и личных целей.',
    'Твоя задача: дать короткое практическое решение, что делать дальше сегодня.',
    'Ты должен учитывать чистые со смены, свободные деньги после плана, бензин, Drivee, фонды, обязательства и риски.',
    'Не выдумывай данные. Если данных не хватает — скажи, что нужно внести.',
    'Не раскрывай и не проси секреты, токены, raw bank data, private_raw_data.',
    'Ответ должен быть конкретным: режим дня, следующий шаг, почему, риск, что ввести в FINFlow.'
  ].join('\n');
}

export function buildExternalAssistantUserPrompt(payload: FinflowExternalAssistantPayload) {
  return JSON.stringify(payload, null, 2);
}
