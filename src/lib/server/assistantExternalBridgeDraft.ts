import {
  buildExternalAssistantSystemPrompt,
  buildExternalAssistantUserPrompt,
  type FinflowExternalAssistantPayload
} from '@/lib/assistant/finflowAssistantPrompt';

export const ASSISTANT_EXTERNAL_BRIDGE_DRAFT_VERSION = 'assistant_external_bridge_draft_v1_57' as const;

export type AssistantExternalBridgeStatus = {
  enabled: boolean;
  provider: 'none' | 'openai' | 'n8n';
  reason?: string;
  secretsReturned: false;
};

export function getAssistantExternalBridgeStatus(): AssistantExternalBridgeStatus {
  const provider = process.env.FINFLOW_AI_PROVIDER;

  if (!provider) {
    return {
      enabled: false,
      provider: 'none',
      reason: 'FINFLOW_AI_PROVIDER_not_configured',
      secretsReturned: false
    };
  }

  if (provider === 'openai') {
    return {
      enabled: Boolean(process.env.OPENAI_API_KEY && process.env.FINFLOW_ENABLE_EXTERNAL_AI === 'true'),
      provider: 'openai',
      reason: process.env.FINFLOW_ENABLE_EXTERNAL_AI === 'true' ? undefined : 'FINFLOW_ENABLE_EXTERNAL_AI_not_true',
      secretsReturned: false
    };
  }

  if (provider === 'n8n') {
    return {
      enabled: Boolean(process.env.FINFLOW_N8N_WEBHOOK_URL && process.env.FINFLOW_ENABLE_EXTERNAL_AI === 'true'),
      provider: 'n8n',
      reason: process.env.FINFLOW_ENABLE_EXTERNAL_AI === 'true' ? undefined : 'FINFLOW_ENABLE_EXTERNAL_AI_not_true',
      secretsReturned: false
    };
  }

  return {
    enabled: false,
    provider: 'none',
    reason: 'unsupported_FINFLOW_AI_PROVIDER',
    secretsReturned: false
  };
}

export function buildAssistantExternalBridgeDryRun(payload: FinflowExternalAssistantPayload) {
  const status = getAssistantExternalBridgeStatus();

  return {
    ok: true,
    dryRun: true,
    wouldCallExternalAi: false,
    status,
    systemPromptPreview: buildExternalAssistantSystemPrompt(),
    userPayloadPreview: buildExternalAssistantUserPrompt(payload),
    safety: {
      minimizedPayload: true,
      rawBankRowsIncluded: false,
      privateRawDataIncluded: false,
      secretsIncluded: false,
      serverSideOnly: true
    }
  };
}
