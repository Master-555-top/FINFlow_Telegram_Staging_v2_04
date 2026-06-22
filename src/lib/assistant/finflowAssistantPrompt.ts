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

const externalAssistantMetricKeys = [
  'grossDone',
  'grossExpected',
  'targetNet',
  'shiftCleanExpected',
  'realFreeExpectedAfterDayPlan',
  'remainingNetToTarget',
  'driveeExpected',
  'driveeTopupCashflow',
  'fuelStillNeeded',
  'allocationShortage',
  'ordersCount',
  'recordsGross',
  'recordsFuel',
  'recordsDriveeTopup',
  'recordsExpenses'
] as const;

export function parseFinflowExternalAssistantPayload(value: unknown): FinflowExternalAssistantPayload | null {
  if (!isObject(value) || !hasOnlyKeys(value, ['schemaVersion', 'purpose', 'language', 'privacyMode', 'localAdvice', 'metrics', 'rules'])) return null;
  if (value.schemaVersion !== FINFLOW_ASSISTANT_PROMPT_VERSION) return null;
  if (value.purpose !== 'daily_finflow_decision_support' || value.language !== 'ru') return null;
  if (value.privacyMode !== 'minimized_no_raw_private_data') return null;
  if (!isAssistantAdvice(value.localAdvice) || !isObject(value.metrics)) return null;
  if (!hasOnlyKeys(value.metrics, [...externalAssistantMetricKeys])) return null;

  for (const key of externalAssistantMetricKeys) {
    const metric = value.metrics[key];
    if (typeof metric !== 'number' || !Number.isFinite(metric) || Math.abs(metric) > 1_000_000_000_000) return null;
  }
  if (typeof value.metrics.ordersCount !== 'number' || !Number.isSafeInteger(value.metrics.ordersCount) || value.metrics.ordersCount < 0) return null;

  if (!Array.isArray(value.rules) || value.rules.length > 24) return null;
  if (!value.rules.every(rule => isSafeText(rule, 600))) return null;

  return value as FinflowExternalAssistantPayload;
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

function isAssistantAdvice(value: unknown): value is FinflowAssistantAdvice {
  if (!isObject(value) || !hasOnlyKeys(value, ['mode', 'headline', 'nextAction', 'signals', 'disclaimer'])) return false;
  if (!['emergency', 'recovery', 'work_focus', 'allocation_focus', 'stable'].includes(String(value.mode))) return false;
  if (!isSafeText(value.headline, 500) || !isSafeText(value.nextAction, 1_000) || !isSafeText(value.disclaimer, 1_000)) return false;
  if (!Array.isArray(value.signals) || value.signals.length > 24) return false;

  return value.signals.every(signal => {
    if (!isObject(signal) || !hasOnlyKeys(signal, ['id', 'priority', 'title', 'message'])) return false;
    return isSafeText(signal.id, 120)
      && ['critical', 'high', 'normal', 'info'].includes(String(signal.priority))
      && isSafeText(signal.title, 500)
      && isSafeText(signal.message, 1_500);
  });
}

function isSafeText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength && !containsSecretShapedValue(value);
}

function containsSecretShapedValue(value: string) {
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(value)
    || /\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/.test(value)
    || /\bsk-[A-Za-z0-9_-]{20,}\b/.test(value)
    || /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/.test(value)
    || /\b(?:TELEGRAM_BOT_TOKEN|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY)\s*=\s*\S+/i.test(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every(key => allowedKeys.has(key));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
