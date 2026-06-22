export const TELEGRAM_SUPABASE_PREFLIGHT_VERSION = 'telegram_supabase_preflight_v2_46' as const;

export type PreflightStatus = 'pass' | 'watch' | 'blocked' | 'manual';
export type PreflightArea = 'telegram' | 'viewport' | 'api' | 'supabase' | 'backup' | 'cloud' | 'privacy';

export type TelegramSupabasePreflightInput = {
  insideTelegram?: boolean;
  initDataPresent?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  userDetected?: boolean;
  deploymentReady?: boolean;
  deploymentSecretsSafe?: boolean;
  supabaseReady?: boolean;
  supabaseWritesEnabled?: boolean;
  cloudSyncEnabled?: boolean;
  cloudReadDryRunSafe?: boolean;
  backupCount?: number;
  hasRollbackSnapshot?: boolean;
  rlsManuallyTested?: boolean;
  conflictTested?: boolean;
};

export type TelegramSupabasePreflightCheck = {
  id: string;
  area: PreflightArea;
  title: string;
  status: PreflightStatus;
  summary: string;
  requiredBeforeCloudWrite: boolean;
};

export type TelegramSupabasePreflightReport = {
  version: typeof TELEGRAM_SUPABASE_PREFLIGHT_VERSION;
  readinessPercent: number;
  writeCandidate: boolean;
  mode: 'browser_local_safe' | 'telegram_readonly_preflight' | 'cloud_write_candidate';
  headline: string;
  checks: TelegramSupabasePreflightCheck[];
  runbook: string[];
  hardStops: string[];
};

function score(status: PreflightStatus) {
  if (status === 'pass') return 1;
  if (status === 'watch') return 0.6;
  if (status === 'manual') return 0.35;
  return 0;
}

function boolStatus(value: boolean | undefined, pass: PreflightStatus = 'pass', fail: PreflightStatus = 'blocked') {
  return value ? pass : fail;
}

export function buildTelegramSupabasePreflightReport(input: TelegramSupabasePreflightInput = {}): TelegramSupabasePreflightReport {
  const hasBackup = (input.backupCount ?? 0) > 0 || Boolean(input.hasRollbackSnapshot);
  const writesFlagsOn = Boolean(input.supabaseWritesEnabled && input.cloudSyncEnabled);

  const checks: TelegramSupabasePreflightCheck[] = [
    {
      id: 'telegram_launch_context',
      area: 'telegram',
      title: 'Запуск из Telegram',
      status: boolStatus(input.insideTelegram, 'pass', 'watch'),
      summary: input.insideTelegram ? 'Mini App открыт через Telegram WebApp bridge.' : 'Обычный browser/local mode допустим для локальной проверки, но не для cloud write.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'init_data_present',
      area: 'telegram',
      title: 'initData есть, но не раскрывается',
      status: boolStatus(input.initDataPresent, 'pass', 'watch'),
      summary: input.initDataPresent ? 'initData найден; подпись проверяется server route, raw hash не показываем.' : 'Без initData verify/cloud dry-run будет skipped или safe-fail.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'viewport_safe_area',
      area: 'viewport',
      title: 'Viewport / safe-area',
      status: input.viewportHeight && input.viewportHeight > 480 ? 'pass' : input.viewportHeight ? 'watch' : 'manual',
      summary: input.viewportHeight ? `viewport=${input.viewportHeight}px, stable=${input.viewportStableHeight ?? '—'}px.` : 'Нужно открыть на телефоне и проверить нижнее меню/клавиатуру.',
      requiredBeforeCloudWrite: false
    },
    {
      id: 'deployment_endpoint',
      area: 'api',
      title: 'Deployment readiness API',
      status: boolStatus(input.deploymentReady),
      summary: input.deploymentReady ? 'Readiness endpoint отвечает без raw secret values.' : 'Нужно проверить /api/deployment/readiness на staging.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'no_secret_echo',
      area: 'privacy',
      title: 'Секреты не возвращаются',
      status: boolStatus(input.deploymentSecretsSafe, 'pass', 'blocked'),
      summary: input.deploymentSecretsSafe ? 'Проверка не увидела token/JWT/service-role паттернов в ответах.' : 'Любой secret-shaped ответ — stop ship.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'supabase_readiness',
      area: 'supabase',
      title: 'Supabase server readiness',
      status: input.supabaseReady ? 'pass' : 'watch',
      summary: input.supabaseReady ? 'Server env выглядит готовым для readonly/preflight.' : 'Можно продолжать local-first; для cloud нужен private Supabase env.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'backup_gate',
      area: 'backup',
      title: 'Backup / rollback перед cloud',
      status: hasBackup ? 'pass' : 'blocked',
      summary: hasBackup ? `backup/rollback найден: ${input.backupCount ?? 0} локальных бэкапов.` : 'Перед любым cloud save нужен локальный backup или rollback snapshot.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'cloud_read_dry_run',
      area: 'cloud',
      title: 'Cloud read dry-run',
      status: input.cloudReadDryRunSafe ? 'pass' : 'manual',
      summary: input.cloudReadDryRunSafe ? 'GET cloud dry-run прошёл или безопасно упал без записи.' : 'Нужно запустить GET /api/sync/day из Telegram; PUT/save пока не нужен.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'rls_user_isolation',
      area: 'supabase',
      title: 'RLS / user isolation',
      status: input.rlsManuallyTested ? 'pass' : 'blocked',
      summary: input.rlsManuallyTested ? 'Ручной RLS/cross-user test отмечен как пройденный.' : 'До writes нужно доказать, что чужие данные недоступны.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'conflict_revision_path',
      area: 'cloud',
      title: 'Conflict / revision path',
      status: input.conflictTested ? 'pass' : 'blocked',
      summary: input.conflictTested ? 'Conflict path отмечен как пройденный.' : 'Нужно проверить expectedRevision/currentRevision и conflict card.',
      requiredBeforeCloudWrite: true
    },
    {
      id: 'write_flags_safe_off',
      area: 'cloud',
      title: 'Write flags safe-off',
      status: writesFlagsOn ? 'watch' : 'pass',
      summary: writesFlagsOn ? 'Write flags включены: допустимо только после всех hard gates.' : 'Cloud writes выключены — безопасное состояние для v2.46 preflight.',
      requiredBeforeCloudWrite: false
    }
  ];

  const readinessPercent = Math.round(checks.reduce((sum, check) => sum + score(check.status), 0) / checks.length * 100);
  const writeCandidate = checks.filter(check => check.requiredBeforeCloudWrite).every(check => check.status === 'pass') && writesFlagsOn;
  const mode: TelegramSupabasePreflightReport['mode'] = writeCandidate
    ? 'cloud_write_candidate'
    : input.insideTelegram
      ? 'telegram_readonly_preflight'
      : 'browser_local_safe';

  return {
    version: TELEGRAM_SUPABASE_PREFLIGHT_VERSION,
    readinessPercent,
    writeCandidate,
    mode,
    headline: writeCandidate ? 'Cloud write candidate после ручной проверки' : input.insideTelegram ? 'Telegram readonly preflight готовится' : 'Local/browser safe preflight',
    checks,
    runbook: [
      'Открыть Deploy-safe v2.46 в private Telegram staging, не MASTER.',
      'Запустить Telegram Device QA: bridge, viewport, verify, deployment readiness, Supabase readiness.',
      'Создать локальный backup перед любым cloud save.',
      'Запустить только GET cloud read dry-run; PUT/save не включать до RLS + conflict test.',
      'Проверить День → записи → apply/import → Daily Save QA → period history на телефоне.',
      'После успешного прогона сохранить скриншоты как visual regression baseline.'
    ],
    hardStops: [
      'raw initData/hash/token/JWT/service-role key виден в UI или API response',
      'deploy-safe содержит private_vault/private_raw_data/MASTER_PRIVATE_DOCS/docs/.env/node_modules',
      'cloud write flags включены без backup, RLS и conflict test',
      'Telegram viewport ломает нижнее меню, график сна или Daily Save QA flow',
      'Period History показывает дубли или потерю Money/Work records'
    ]
  };
}
