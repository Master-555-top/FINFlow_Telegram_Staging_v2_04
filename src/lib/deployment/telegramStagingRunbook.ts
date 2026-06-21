export const TELEGRAM_STAGING_RUNBOOK_VERSION = 'telegram_staging_runbook_v2_03' as const;

export type TelegramStagingChecklistItem = {
  id: string;
  title: string;
  status: 'ready' | 'manual_required' | 'blocked_until_env' | 'test_required';
  detail: string;
};

export type TelegramStagingRunbook = {
  version: typeof TELEGRAM_STAGING_RUNBOOK_VERSION;
  packageVersion: string;
  readinessBefore: number;
  readinessAfter: number;
  goal: string;
  deploySafePackageName: string;
  allowedUploadRoot: string;
  forbiddenUploadRoots: string[];
  requiredEnvironment: TelegramStagingChecklistItem[];
  botFatherSteps: TelegramStagingChecklistItem[];
  stagingTests: TelegramStagingChecklistItem[];
  rollbackPlan: string[];
  nextStepAfterStaging: string;
};

export function buildTelegramStagingRunbook(): TelegramStagingRunbook {
  return {
    version: TELEGRAM_STAGING_RUNBOOK_VERSION,
    packageVersion: 'v2.22',
    readinessBefore: 81,
    readinessAfter: 84,
    goal: 'Подготовить FINFlow к первому безопасному запуску как Telegram Mini App на staging-домене без загрузки MASTER PRIVATE FULL/private_vault в публичную инфраструктуру.',
    deploySafePackageName: 'FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_v2_03.zip',
    allowedUploadRoot: 'finflow_app или сгенерированный deploy-safe package v2.22',
    forbiddenUploadRoots: [
      'MASTER PRIVATE FULL целиком',
      'private_vault',
      'private_raw_data',
      '.env / реальные токены',
      'node_modules / .next / .npm-cache'
    ],
    requiredEnvironment: [
      {
        id: 'telegram_bot_token',
        title: 'TELEGRAM_BOT_TOKEN',
        status: 'blocked_until_env',
        detail: 'Нужен только в Vercel/hosting environment variables. Не добавлять в client bundle, .env в репозиторий или скриншоты.'
      },
      {
        id: 'supabase_url',
        title: 'SUPABASE_URL',
        status: 'manual_required',
        detail: 'Можно хранить server-side; для cloud sync нужен вместе с service role key.'
      },
      {
        id: 'supabase_service_role',
        title: 'SUPABASE_SERVICE_ROLE_KEY',
        status: 'blocked_until_env',
        detail: 'Строго server-only. Никогда не использовать с NEXT_PUBLIC_ и не передавать в браузер.'
      },
      {
        id: 'feature_flags',
        title: 'FINFLOW_ENABLE_CLOUD_SYNC / FINFLOW_ENABLE_SUPABASE_WRITES',
        status: 'manual_required',
        detail: 'Для первого dry-run можно держать writes=false. Для реального save/load включать только после backup и checklist.'
      }
    ],
    botFatherSteps: [
      {
        id: 'botfather_webapp_url',
        title: 'Указать staging URL в BotFather',
        status: 'manual_required',
        detail: 'После Vercel deploy вставить HTTPS URL Mini App в BotFather. Локальный localhost для телефона не подходит.'
      },
      {
        id: 'telegram_menu_button',
        title: 'Настроить Menu Button / Mini App button',
        status: 'manual_required',
        detail: 'Кнопка должна открывать staging-домен FINFlow, чтобы Telegram передал initData.'
      },
      {
        id: 'open_on_phone',
        title: 'Открыть через реальный Telegram на телефоне',
        status: 'test_required',
        detail: 'Проверить, что TelegramSessionPill показывает verified/local fallback, а не browser-only режим.'
      }
    ],
    stagingTests: [
      {
        id: 'static_shell',
        title: 'Static shell load',
        status: 'ready',
        detail: 'Главная страница должна открываться без server secret access; API остаются server-side/dynamic.'
      },
      {
        id: 'verify_api',
        title: '/api/telegram/verify',
        status: 'test_required',
        detail: 'Проверить подпись initData. Без TELEGRAM_BOT_TOKEN verify обязан безопасно падать, а не принимать пользователя.'
      },
      {
        id: 'cloud_readiness',
        title: '/api/deployment/readiness и /api/supabase/readiness',
        status: 'test_required',
        detail: 'Проверить, что readiness показывает реальные env-флаги и не возвращает секреты.'
      },
      {
        id: 'day_flow',
        title: 'Daily flow на телефоне',
        status: 'test_required',
        detail: 'Проверить утренний план, quick-flow, вечерний итог, live-state и new day rollover в Telegram viewport.'
      }
    ],
    rollbackPlan: [
      'Оставить v2.22 master private zip локально как точку восстановления.',
      'Если staging сломан — откатить Vercel deployment на предыдущий build или отключить BotFather URL.',
      'Cloud writes держать выключенными до успешного ручного save/load/conflict теста.',
      'Перед любым cloud apply использовать local backup/rollback snapshot.'
    ],
    nextStepAfterStaging: 'v2.19 — Sleep → Day → Work motivation bridge'
  };
}
