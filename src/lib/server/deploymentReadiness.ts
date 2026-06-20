export const DEPLOYMENT_READINESS_VERSION = 'deployment_readiness_v2_03' as const;

export type DeploymentSecretKey =
  | 'TELEGRAM_BOT_TOKEN'
  | 'SUPABASE_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'FINFLOW_ENABLE_CLOUD_SYNC'
  | 'FINFLOW_ENABLE_SUPABASE_WRITES'
  | 'OPENAI_API_KEY'
  | 'FINFLOW_ENABLE_EXTERNAL_AI'
  | 'FINFLOW_N8N_WEBHOOK_URL';

export type DeploymentSecretStatus = {
  key: DeploymentSecretKey;
  requiredFor: string;
  configured: boolean;
  browserSafe: boolean;
  serverOnly: boolean;
};

export type DeploymentReadinessReport = {
  version: typeof DEPLOYMENT_READINESS_VERSION;
  mode: 'local_only' | 'cloud_blocked' | 'cloud_ready' | 'ai_ready' | 'deployment_ready';
  cloudReady: boolean;
  telegramReady: boolean;
  supabaseReady: boolean;
  aiReady: boolean;
  flags: {
    cloudSyncEnabled: boolean;
    supabaseWritesEnabled: boolean;
    externalAiEnabled: boolean;
  };
  secrets: DeploymentSecretStatus[];
  warnings: string[];
  nextActions: string[];
};

export function buildDeploymentReadinessReport(): DeploymentReadinessReport {
  const flags = {
    cloudSyncEnabled: process.env.FINFLOW_ENABLE_CLOUD_SYNC === 'true',
    supabaseWritesEnabled: process.env.FINFLOW_ENABLE_SUPABASE_WRITES === 'true',
    externalAiEnabled: process.env.FINFLOW_ENABLE_EXTERNAL_AI === 'true'
  };

  const hasTelegram = hasSecret('TELEGRAM_BOT_TOKEN');
  const hasSupabaseUrl = hasSecret('SUPABASE_URL') || hasSecret('NEXT_PUBLIC_SUPABASE_URL');
  const hasServiceRole = hasSecret('SUPABASE_SERVICE_ROLE_KEY');
  const hasAnon = hasSecret('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const hasOpenAi = hasSecret('OPENAI_API_KEY');
  const hasN8n = hasSecret('FINFLOW_N8N_WEBHOOK_URL');

  const telegramReady = hasTelegram;
  const supabaseReady = hasSupabaseUrl && hasServiceRole;
  const cloudReady = flags.cloudSyncEnabled && flags.supabaseWritesEnabled && telegramReady && supabaseReady;
  const aiReady = flags.externalAiEnabled && (hasOpenAi || hasN8n);

  const warnings: string[] = [];
  if (!hasTelegram) warnings.push('TELEGRAM_BOT_TOKEN is missing in server environment.');
  if (!hasSupabaseUrl) warnings.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing.');
  if (!hasServiceRole) warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing in server environment.');
  if (!hasAnon) warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing; it is optional for the current server-only cloud bridge.');
  if (!flags.cloudSyncEnabled) warnings.push('FINFLOW_ENABLE_CLOUD_SYNC is not true, so cloud sync remains disabled.');
  if (!flags.supabaseWritesEnabled) warnings.push('FINFLOW_ENABLE_SUPABASE_WRITES is not true, so cloud writes remain disabled.');
  if (flags.externalAiEnabled && !aiReady) warnings.push('External AI is enabled but no OPENAI_API_KEY or FINFLOW_N8N_WEBHOOK_URL is configured.');
  warnings.push('Never put TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY in source code, client bundle, GitHub or chat.');

  const mode: DeploymentReadinessReport['mode'] = cloudReady && aiReady
    ? 'deployment_ready'
    : cloudReady
      ? 'cloud_ready'
      : flags.cloudSyncEnabled || flags.supabaseWritesEnabled
        ? 'cloud_blocked'
        : aiReady
          ? 'ai_ready'
          : 'local_only';

  return {
    version: DEPLOYMENT_READINESS_VERSION,
    mode,
    cloudReady,
    telegramReady,
    supabaseReady,
    aiReady,
    flags,
    secrets: [
      secretStatus('TELEGRAM_BOT_TOKEN', 'Telegram Mini App auth', false, true, hasTelegram),
      secretStatus('SUPABASE_URL', 'Server Supabase endpoint', false, true, hasSupabaseUrl),
      secretStatus('SUPABASE_SERVICE_ROLE_KEY', 'Server-only Supabase writes', false, true, hasServiceRole),
      secretStatus('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Browser-safe Supabase anon metadata', true, false, hasAnon),
      secretStatus('FINFLOW_ENABLE_CLOUD_SYNC', 'Feature flag for cloud sync', false, true, flags.cloudSyncEnabled),
      secretStatus('FINFLOW_ENABLE_SUPABASE_WRITES', 'Feature flag for server writes', false, true, flags.supabaseWritesEnabled),
      secretStatus('OPENAI_API_KEY', 'Server-side OpenAI bridge', false, true, hasOpenAi),
      secretStatus('FINFLOW_ENABLE_EXTERNAL_AI', 'Feature flag for external AI', false, true, flags.externalAiEnabled),
      secretStatus('FINFLOW_N8N_WEBHOOK_URL', 'Optional server-side n8n bridge', false, true, hasN8n)
    ],
    warnings,
    nextActions: buildNextActions({ cloudReady, telegramReady, supabaseReady, aiReady, flags })
  };
}

function hasSecret(key: string) {
  return Boolean(process.env[key] && process.env[key]?.trim());
}

function secretStatus(
  key: DeploymentSecretKey,
  requiredFor: string,
  browserSafe: boolean,
  serverOnly: boolean,
  configured: boolean
): DeploymentSecretStatus {
  return { key, requiredFor, configured, browserSafe, serverOnly };
}

function buildNextActions(input: {
  cloudReady: boolean;
  telegramReady: boolean;
  supabaseReady: boolean;
  aiReady: boolean;
  flags: DeploymentReadinessReport['flags'];
}) {
  const actions: string[] = [];
  if (!input.telegramReady) actions.push('Deploy v2.03 deploy-safe package, create Telegram bot/Mini App, then set TELEGRAM_BOT_TOKEN in hosting environment variables.');
  if (!input.supabaseReady) actions.push('Create private Supabase project, apply migration, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  if (!input.flags.cloudSyncEnabled) actions.push('Enable FINFLOW_ENABLE_CLOUD_SYNC only after Telegram/Supabase are configured.');
  if (!input.flags.supabaseWritesEnabled) actions.push('Enable FINFLOW_ENABLE_SUPABASE_WRITES only after RLS/security review.');
  if (!input.aiReady) actions.push('Keep local assistant by default; add server-side OPENAI_API_KEY or n8n only after cloud baseline works.');
  if (actions.length === 0) actions.push('Run real Telegram phone test from BotFather Mini App URL: initData verify, profile create, save day, load preview, apply, conflict test.');
  return actions;
}
