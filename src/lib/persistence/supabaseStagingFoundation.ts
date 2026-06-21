export const SUPABASE_STAGING_FOUNDATION_VERSION = 'supabase_staging_foundation_v2_40' as const;

export type SupabaseStagingGateStatus = 'pass' | 'watch' | 'blocked';

export type SupabaseStagingGate = {
  id: string;
  title: string;
  status: SupabaseStagingGateStatus;
  summary: string;
  owner: 'local' | 'server' | 'supabase' | 'telegram' | 'qa';
  requiredBeforeWrites: boolean;
};

export type SupabaseStagingMigration = {
  id: string;
  file: string;
  purpose: string;
  applyMode: 'already_present' | 'draft_ready' | 'manual_review_required';
};

export type SupabaseStagingReadinessInput = {
  serverReady?: boolean;
  writesEnabled?: boolean;
  cloudSyncEnabled?: boolean;
  hasUrl?: boolean;
  hasAnonKey?: boolean;
  hasServiceRoleKey?: boolean;
  hasTelegramInitData?: boolean;
  backupCount?: number;
  hasRollbackSnapshot?: boolean;
  rlsManuallyTested?: boolean;
  conflictTested?: boolean;
};

export type SupabaseStagingReadiness = {
  version: typeof SUPABASE_STAGING_FOUNDATION_VERSION;
  mode: 'local_first_safe_off' | 'staging_ready_readonly' | 'staging_write_candidate';
  readinessPercent: number;
  canEnableWrites: boolean;
  headline: string;
  gates: SupabaseStagingGate[];
  migrations: SupabaseStagingMigration[];
  rlsChecklist: string[];
  safeOffRules: string[];
  nextActions: string[];
};

const migrations: SupabaseStagingMigration[] = [
  {
    id: 'v1_73_cloud_day_documents',
    file: 'supabase/migrations/20260620_finflow_v1_73_cloud_day_documents.sql',
    purpose: 'Telegram profile bridge, cloud day document storage, sync audit, service-role only table access.',
    applyMode: 'already_present'
  },
  {
    id: 'v2_32_data_backbone_draft',
    file: 'supabase/migrations/202606220232_finflow_v3_data_backbone_draft.sql',
    purpose: 'Canonical tables draft for day sessions, money, work shifts, taxi orders, sleep and funds.',
    applyMode: 'draft_ready'
  },
  {
    id: 'v2_39_staging_foundation',
    file: 'supabase/migrations/202606220239_finflow_v3_staging_foundation.sql',
    purpose: 'Staging sync queue, import batches, template instances and conflict review tables for safe preview/apply flows.',
    applyMode: 'manual_review_required'
  },
  {
    id: 'v2_40_cloud_queue_conflict_review',
    file: 'supabase/migrations/202606220240_finflow_v3_cloud_queue_conflict_review.sql',
    purpose: 'Aligns staging sync_queue action vocabulary with save/load/apply/rollback/conflict review queue UI.',
    applyMode: 'manual_review_required'
  }
];

const rlsChecklist = [
  'Service-role key exists only in server runtime, never in browser bundle.',
  'Anon/authenticated roles cannot read/write private FINFlow tables unless a tested user isolation policy is explicitly added.',
  'Telegram identity is verified server-side before resolving profile_id.',
  'Every cloud write requires profile_id, local_date/revision where relevant, and audit metadata.',
  'Cross-user read/write test must fail before production writes are enabled.',
  'Backup snapshot and rollback path must exist before save/apply actions.'
];

const safeOffRules = [
  'Cloud writes stay blocked unless FINFLOW_ENABLE_SUPABASE_WRITES=true and FINFLOW_ENABLE_CLOUD_SYNC=true are both intentionally set server-side.',
  'Staging readiness may show environment status, but must never return secret values.',
  'Local-first data remains the source of continuity until restore/save/conflict tests pass.',
  'Historical import, template apply and cloud sync continue through preview → confirm → rollback/conflict review, not blind writes.'
];

function statusScore(status: SupabaseStagingGateStatus) {
  if (status === 'pass') return 1;
  if (status === 'watch') return 0.5;
  return 0;
}

export function buildSupabaseStagingReadiness(input: SupabaseStagingReadinessInput = {}): SupabaseStagingReadiness {
  const hasBackup = (input.backupCount ?? 0) > 0;
  const hasServerEnv = Boolean(input.hasUrl && input.hasServiceRoleKey);
  const writesFlagReady = Boolean(input.writesEnabled && input.cloudSyncEnabled);
  const gates: SupabaseStagingGate[] = [
    {
      id: 'local_first_backbone',
      title: 'Local-first backbone',
      status: 'pass',
      summary: 'Данные, шаблоны, импорт и смена уже имеют локальный preview/apply/rollback слой.',
      owner: 'local',
      requiredBeforeWrites: true
    },
    {
      id: 'server_env',
      title: 'Server Supabase env',
      status: hasServerEnv ? 'pass' : 'blocked',
      summary: hasServerEnv ? 'URL и service-role доступны только серверу.' : 'Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в server env, не в клиенте.',
      owner: 'server',
      requiredBeforeWrites: true
    },
    {
      id: 'anon_key_public_scope',
      title: 'Public anon key scope',
      status: input.hasAnonKey ? 'watch' : 'blocked',
      summary: input.hasAnonKey ? 'Anon key может быть публичным, но не должен давать доступ к личным таблицам без RLS.' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY не найден; для клиентских safe-readiness проверок это допустимо, для будущего auth-flow потребуется.',
      owner: 'supabase',
      requiredBeforeWrites: false
    },
    {
      id: 'telegram_identity',
      title: 'Telegram identity gate',
      status: input.hasTelegramInitData ? 'watch' : 'blocked',
      summary: input.hasTelegramInitData ? 'initData найден; подпись всё равно проверяется только сервером.' : 'В обычном браузере initData нет; staging write тест должен идти из Telegram Mini App.',
      owner: 'telegram',
      requiredBeforeWrites: true
    },
    {
      id: 'rls_test',
      title: 'RLS isolation test',
      status: input.rlsManuallyTested ? 'pass' : 'blocked',
      summary: input.rlsManuallyTested ? 'Ручной RLS/cross-user тест отмечен как пройденный.' : 'Нужно доказать, что чужие записи нельзя читать/писать.',
      owner: 'qa',
      requiredBeforeWrites: true
    },
    {
      id: 'backup_gate',
      title: 'Backup before cloud write',
      status: hasBackup || input.hasRollbackSnapshot ? 'pass' : 'blocked',
      summary: hasBackup ? `Локальных бэкапов: ${input.backupCount}.` : input.hasRollbackSnapshot ? 'Есть rollback snapshot для последнего apply.' : 'Перед cloud save нужен локальный backup или rollback snapshot.',
      owner: 'local',
      requiredBeforeWrites: true
    },
    {
      id: 'conflict_test',
      title: 'Revision conflict test',
      status: input.conflictTested ? 'pass' : 'blocked',
      summary: input.conflictTested ? 'Conflict path протестирован.' : 'Нужно проверить expectedRevision/currentRevision, чтобы не перетирать облако.',
      owner: 'qa',
      requiredBeforeWrites: true
    },
    {
      id: 'write_flags',
      title: 'Write flags safe-off',
      status: writesFlagReady ? 'watch' : 'pass',
      summary: writesFlagReady ? 'Флаги записи включены: это допустимо только после backup/RLS/conflict теста.' : 'Cloud writes безопасно выключены.',
      owner: 'server',
      requiredBeforeWrites: false
    }
  ];

  const readinessPercent = Math.round(gates.reduce((sum, gate) => sum + statusScore(gate.status), 0) / gates.length * 100);
  const canEnableWrites = gates.filter(gate => gate.requiredBeforeWrites).every(gate => gate.status === 'pass') && writesFlagReady;
  const mode: SupabaseStagingReadiness['mode'] = canEnableWrites ? 'staging_write_candidate' : hasServerEnv ? 'staging_ready_readonly' : 'local_first_safe_off';

  return {
    version: SUPABASE_STAGING_FOUNDATION_VERSION,
    mode,
    readinessPercent,
    canEnableWrites,
    headline: canEnableWrites ? 'Staging write candidate' : hasServerEnv ? 'Readiness only: writes still gated' : 'Local-first safe-off',
    gates,
    migrations,
    rlsChecklist,
    safeOffRules,
    nextActions: [
      'Создать/проверить private Supabase project и применить миграции только после ручного review.',
      'В Vercel/локально добавить env только server-side: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FINFLOW_ENABLE_* flags.',
      'Запустить readiness endpoint и убедиться, что секреты не возвращаются в ответе.',
      'Сделать локальный backup, затем Telegram staging smoke test.',
      'Проверить Cloud Sync Queue, conflict cards, RLS/cross-user isolation и revision conflict перед включением реальных writes.'
    ]
  };
}
