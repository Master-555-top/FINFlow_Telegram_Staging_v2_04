import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseFinflowExternalAssistantPayload } from '../src/lib/assistant/finflowAssistantPrompt.ts';
import { buildN8nAutomationContractSnapshot } from '../src/lib/automation/n8nAutomationContract.ts';
import { validateTelegramInitData } from '../src/lib/telegram/telegramInitData.ts';

function validAssistantPayload() {
  return {
    schemaVersion: 'finflow_assistant_prompt_v1_57',
    purpose: 'daily_finflow_decision_support',
    language: 'ru',
    privacyMode: 'minimized_no_raw_private_data',
    localAdvice: {
      mode: 'stable',
      headline: 'День под контролем',
      nextAction: 'Сохранить итог дня.',
      signals: [],
      disclaimer: 'Локальный dry-run.'
    },
    metrics: {
      grossDone: 1,
      grossExpected: 2,
      targetNet: 3,
      shiftCleanExpected: 4,
      realFreeExpectedAfterDayPlan: 5,
      remainingNetToTarget: 6,
      driveeExpected: 7,
      driveeTopupCashflow: 8,
      fuelStillNeeded: 9,
      allocationShortage: 10,
      ordersCount: 11,
      recordsGross: 12,
      recordsFuel: 13,
      recordsDriveeTopup: 14,
      recordsExpenses: 15
    },
    rules: ['Не выдумывать данные.']
  };
}

test('assistant payload parser accepts the canonical minimized schema', () => {
  const payload = validAssistantPayload();
  assert.equal(parseFinflowExternalAssistantPayload(payload), payload);
});

test('assistant payload parser rejects extra fields and secret-shaped values', () => {
  const withExtra = { ...validAssistantPayload(), rawPrivateData: 'must-not-pass' };
  assert.equal(parseFinflowExternalAssistantPayload(withExtra), null);

  const withToken = validAssistantPayload();
  withToken.localAdvice.headline = `token ${['123456789', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN'].join(':')}`;
  assert.equal(parseFinflowExternalAssistantPayload(withToken), null);
});

test('n8n external calls remain blocked until every safety gate is true', () => {
  const incomplete = buildN8nAutomationContractSnapshot({
    hasPrivateN8nUrl: true,
    cloudSafe: true
  });
  assert.equal(incomplete.canCallExternalN8n, false);
  assert.notEqual(incomplete.mode, 'ready_for_private_n8n');

  const complete = buildN8nAutomationContractSnapshot({
    hasPrivateN8nUrl: true,
    cloudSafe: true,
    authReady: true,
    redactionReady: true,
    backupReady: true,
    externalCallsEnabled: true
  });
  assert.equal(complete.canCallExternalN8n, true);
  assert.equal(complete.mode, 'ready_for_private_n8n');
});

test('Telegram initData validation accepts a valid signature and rejects malformed hashes', () => {
  const botToken = ['123456789', 'test_bot_token_for_signature_validation'].join(':');
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: 'test-query',
    user: JSON.stringify({ id: 123, first_name: 'Test' })
  });
  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  params.set('hash', crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex'));

  assert.equal(validateTelegramInitData(params.toString(), botToken, 3_600).ok, true);
  params.set('hash', 'not-hex');
  assert.equal(validateTelegramInitData(params.toString(), botToken, 3_600).ok, false);
});

test('package lock contains no private registry URLs', () => {
  const lock = readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8');
  assert.equal(lock.includes('packages.applied-caas-gateway1.internal'), false);
});
