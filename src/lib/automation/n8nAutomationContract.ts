import type { MiniAppDeliveryPlan } from '@/lib/project/miniAppDeliveryPlan';

export const N8N_AUTOMATION_CONTRACT_VERSION = 'n8n_automation_contract_v2_41' as const;

export type N8nAutomationWorkflowId =
  | 'daily_morning_brief'
  | 'daily_evening_report'
  | 'backup_snapshot'
  | 'historical_import_review'
  | 'cloud_sync_watch'
  | 'weekly_money_work_review';

export type N8nWorkflowRisk = 'safe' | 'watch' | 'blocked';
export type N8nWorkflowStatus = 'contract_ready' | 'dry_run_ready' | 'blocked_until_cloud' | 'planned';

export type N8nWebhookContract = {
  version: typeof N8N_AUTOMATION_CONTRACT_VERSION;
  id: N8nAutomationWorkflowId;
  title: string;
  status: N8nWorkflowStatus;
  risk: N8nWorkflowRisk;
  trigger: 'manual' | 'daily' | 'weekly' | 'cloud_event' | 'import_event';
  endpointDraft: string;
  allowedPayloadKeys: string[];
  forbiddenPayloadKeys: string[];
  output: string;
  safetyGate: string;
  nextStep: string;
};

export type N8nAutomationContractSnapshot = {
  version: typeof N8N_AUTOMATION_CONTRACT_VERSION;
  generatedAt: string;
  mode: 'contract_only' | 'dry_run_ready' | 'blocked_by_cloud' | 'ready_for_private_n8n';
  readinessPercent: number;
  canCallExternalN8n: boolean;
  gates: N8nAutomationSafetyGates;
  workflows: N8nWebhookContract[];
  dryRunPayloadExample: N8nDryRunPayload;
  credentialsPolicy: string[];
  safetyRules: string[];
  remainingToProduction: string[];
};

export type N8nAutomationSafetyGates = {
  privateWebhookConfigured: boolean;
  cloudSafe: boolean;
  authReady: boolean;
  redactionReady: boolean;
  backupReady: boolean;
  externalCallsEnabled: boolean;
};

export type N8nAutomationReadinessInput = {
  hasPrivateN8nUrl?: boolean;
  cloudSafe?: boolean;
  authReady?: boolean;
  redactionReady?: boolean;
  backupReady?: boolean;
  externalCallsEnabled?: boolean;
  delivery?: MiniAppDeliveryPlan;
};

export type N8nDryRunPayload = {
  schema: typeof N8N_AUTOMATION_CONTRACT_VERSION;
  event: N8nAutomationWorkflowId;
  generatedAt: string;
  userScope: 'telegram_user_private';
  localDate: string;
  source: 'finflow_mini_app';
  mode: 'dry_run';
  payload: {
    day?: {
      localDate: string;
      planStatus: 'draft' | 'active' | 'closed';
      sleepLinked: boolean;
      workLinked: boolean;
      moneyLinked: boolean;
    };
    money?: {
      grossIncome: number;
      workCosts: number;
      personalExpenses: number;
      obligationsDue: number;
      freeCashEstimate: number;
    };
    work?: {
      orders: number;
      gross: number;
      activeMinutes: number;
      shiftMinutes: number;
      netAfterWorkCosts: number;
    };
    import?: {
      reviewItems: number;
      duplicates: number;
      requiresManualConfirm: boolean;
    };
    cloud?: {
      queueItems: number;
      conflicts: number;
      writesEnabled: boolean;
    };
  };
  redaction: {
    containsSecrets: false;
    containsRawPrivateVault: false;
    containsEnvValues: false;
    containsTelegramInitDataHash: false;
  };
};

export const n8nWebhookContracts: N8nWebhookContract[] = [
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'daily_morning_brief',
    title: 'Утренний план дня',
    status: 'dry_run_ready',
    risk: 'safe',
    trigger: 'daily',
    endpointDraft: '/api/automation/n8n/dry-run?event=daily_morning_brief',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.day', 'payload.money', 'payload.work', 'redaction'],
    forbiddenPayloadKeys: ['TELEGRAM_BOT_TOKEN', 'SUPABASE_SERVICE_ROLE_KEY', 'process.env', 'private_vault', 'private_raw_data', 'initData', 'hash'],
    output: 'Короткий план: когда стартовать, сколько осталось денег/работы, что не забыть.',
    safetyGate: 'Только dry-run до включения private n8n endpoint и user auth.',
    nextStep: 'Подключить к реальным Day/Money/Work snapshots после полного local write flow.'
  },
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'daily_evening_report',
    title: 'Вечерний отчёт',
    status: 'dry_run_ready',
    risk: 'safe',
    trigger: 'daily',
    endpointDraft: '/api/automation/n8n/dry-run?event=daily_evening_report',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.day', 'payload.money', 'payload.work', 'payload.import', 'redaction'],
    forbiddenPayloadKeys: ['raw order addresses without confirmation', 'private_raw_data', 'env', 'tokens', 'service role'],
    output: 'Итог дня: грязными/чистыми, активное время, расходы, отклонения, следующий шаг.',
    safetyGate: 'Не отправлять наружу полный сырой журнал без отдельного подтверждения.',
    nextStep: 'Добавить redact/compact режим для taxi order log.'
  },
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'backup_snapshot',
    title: 'Backup snapshot',
    status: 'contract_ready',
    risk: 'watch',
    trigger: 'manual',
    endpointDraft: '/api/automation/n8n/dry-run?event=backup_snapshot',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.cloud', 'redaction'],
    forbiddenPayloadKeys: ['MASTER_PRIVATE_FULL', 'private_vault', 'private_raw_data', '.env', 'tokens', 'node_modules', '.next'],
    output: 'Сигнал, что перед cloud apply/save нужно создать backup.',
    safetyGate: 'Сам backup остаётся локальным/приватным до отдельного backup storage design.',
    nextStep: 'Связать с LocalBackupRestorePanel и cloud preflight.'
  },
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'historical_import_review',
    title: 'Historical import review',
    status: 'contract_ready',
    risk: 'watch',
    trigger: 'import_event',
    endpointDraft: '/api/automation/n8n/dry-run?event=historical_import_review',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.import', 'redaction'],
    forbiddenPayloadKeys: ['unreviewed raw dump', 'private_raw_data', 'full screenshots', 'bank secrets'],
    output: 'Сводка: сколько записей распознано, где дубли, что требует ручного решения.',
    safetyGate: 'Automation не применяет импорт сама: только preview/review.',
    nextStep: 'Подключить к v2.37 taxi parser и import queue UI.'
  },
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'cloud_sync_watch',
    title: 'Cloud sync watch',
    status: 'blocked_until_cloud',
    risk: 'blocked',
    trigger: 'cloud_event',
    endpointDraft: '/api/automation/n8n/dry-run?event=cloud_sync_watch',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.cloud', 'redaction'],
    forbiddenPayloadKeys: ['service role', 'anon key', 'JWT', 'initData', 'hash', 'raw env'],
    output: 'Сигнал о конфликте/очереди, но без автоматического overwrite.',
    safetyGate: 'Заблокировано до реального Supabase staging, RLS test и backup gate.',
    nextStep: 'После v2.40 conflict review провести Telegram staging smoke test.'
  },
  {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    id: 'weekly_money_work_review',
    title: 'Недельный разбор денег и работы',
    status: 'planned',
    risk: 'safe',
    trigger: 'weekly',
    endpointDraft: '/api/automation/n8n/dry-run?event=weekly_money_work_review',
    allowedPayloadKeys: ['schema', 'event', 'generatedAt', 'userScope', 'localDate', 'source', 'mode', 'payload.money', 'payload.work', 'redaction'],
    forbiddenPayloadKeys: ['private notes', 'full address routes', 'raw vault', 'secrets'],
    output: 'Неделя: заработок, издержки, темп, перегруз, что улучшить.',
    safetyGate: 'Только агрегаты до отдельного consent/redaction экрана.',
    nextStep: 'Запустить после 7-day real usage test.'
  }
];

export function buildN8nDryRunPayload(event: N8nAutomationWorkflowId = 'daily_evening_report', localDate = todayIsoDate()): N8nDryRunPayload {
  return {
    schema: N8N_AUTOMATION_CONTRACT_VERSION,
    event,
    generatedAt: new Date().toISOString(),
    userScope: 'telegram_user_private',
    localDate,
    source: 'finflow_mini_app',
    mode: 'dry_run',
    payload: {
      day: {
        localDate,
        planStatus: 'active',
        sleepLinked: true,
        workLinked: true,
        moneyLinked: true
      },
      money: {
        grossIncome: 11000,
        workCosts: 2800,
        personalExpenses: 1500,
        obligationsDue: 0,
        freeCashEstimate: 6700
      },
      work: {
        orders: 12,
        gross: 11000,
        activeMinutes: 420,
        shiftMinutes: 660,
        netAfterWorkCosts: 8200
      },
      import: {
        reviewItems: 8,
        duplicates: 0,
        requiresManualConfirm: true
      },
      cloud: {
        queueItems: 0,
        conflicts: 0,
        writesEnabled: false
      }
    },
    redaction: {
      containsSecrets: false,
      containsRawPrivateVault: false,
      containsEnvValues: false,
      containsTelegramInitDataHash: false
    }
  };
}

export function buildN8nAutomationContractSnapshot(input?: N8nAutomationReadinessInput): N8nAutomationContractSnapshot {
  const gates: N8nAutomationSafetyGates = {
    privateWebhookConfigured: Boolean(input?.hasPrivateN8nUrl),
    cloudSafe: Boolean(input?.cloudSafe),
    authReady: Boolean(input?.authReady),
    redactionReady: Boolean(input?.redactionReady),
    backupReady: Boolean(input?.backupReady),
    externalCallsEnabled: Boolean(input?.externalCallsEnabled)
  };
  const canCallExternalN8n = Object.values(gates).every(Boolean);
  const blocked = n8nWebhookContracts.filter(item => item.status === 'blocked_until_cloud').length;
  const dryRunReady = n8nWebhookContracts.filter(item => item.status === 'dry_run_ready').length;
  const contractReady = n8nWebhookContracts.filter(item => item.status === 'contract_ready').length;
  const passedGates = Object.values(gates).filter(Boolean).length;
  const readinessPercent = Math.min(100, Math.round((dryRunReady * 15) + (contractReady * 10) + (passedGates / Object.keys(gates).length) * 50));
  const mode: N8nAutomationContractSnapshot['mode'] = canCallExternalN8n
    ? 'ready_for_private_n8n'
    : blocked > 0 && !gates.cloudSafe
      ? 'blocked_by_cloud'
      : dryRunReady > 0
        ? 'dry_run_ready'
        : 'contract_only';

  return {
    version: N8N_AUTOMATION_CONTRACT_VERSION,
    generatedAt: new Date().toISOString(),
    mode,
    readinessPercent,
    canCallExternalN8n,
    gates,
    workflows: n8nWebhookContracts,
    dryRunPayloadExample: buildN8nDryRunPayload(),
    credentialsPolicy: [
      'n8n webhook URL хранить только server-side env, не в клиенте и не в NEXT_PUBLIC_.',
      'FINFlow не отправляет токены, service role, .env, private_vault, private_raw_data и Telegram initData hash.',
      'До private staging все automation endpoints работают только как dry-run/contract.',
      'Полные маршруты/адреса/сырые банковские данные отправлять наружу только после отдельного redaction/consent слоя.',
      'Automation не имеет права сама применять import/cloud changes без preview → confirm → rollback.'
    ],
    safetyRules: [
      'Никаких blind writes из n8n в FINFlow.',
      'Любой import/cloud event сначала создаёт review card.',
      'Daily/weekly reports используют агрегаты и краткие summaries.',
      'Webhook payload должен быть версионирован и дедуплицируем.',
      'External automation включается только после Telegram staging smoke test.'
    ],
    remainingToProduction: [
      'Создать private n8n instance / webhook endpoint и env-переменную только на сервере.',
      'Сделать real API auth для webhook callbacks.',
      'Добавить redaction/consent экран для sensitive payloads.',
      'Прогнать 7-day dry-run с реальными локальными данными.',
      'Связать backup workflow с cloud preflight и rollback snapshot.'
    ]
  };
}

export function isN8nWorkflowId(value: string | null): value is N8nAutomationWorkflowId {
  return Boolean(value) && n8nWebhookContracts.some(contract => contract.id === value);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
