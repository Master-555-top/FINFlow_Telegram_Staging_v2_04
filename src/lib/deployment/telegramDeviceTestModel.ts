export const TELEGRAM_DEVICE_TEST_VERSION = 'telegram_device_test_v2_29' as const;

export type TelegramDeviceTestCheckStatus = 'ready' | 'manual_required' | 'test_required' | 'blocked' | 'passed' | 'failed' | 'expected_safe_fail';

export type TelegramDeviceTestCheck = {
  id: string;
  title: string;
  status: TelegramDeviceTestCheckStatus;
  detail: string;
  successCriteria: string;
};

export type TelegramDeviceTestRunbook = {
  version: typeof TELEGRAM_DEVICE_TEST_VERSION;
  packageVersion: 'v2.29';
  readinessBefore: number;
  readinessAfter: number;
  goal: string;
  safeModeRules: string[];
  deviceChecks: TelegramDeviceTestCheck[];
  apiChecks: TelegramDeviceTestCheck[];
  cloudDryRunChecks: TelegramDeviceTestCheck[];
  rollbackPlan: string[];
  nextStepAfterDeviceTest: string;
};

export function buildTelegramDeviceTestRunbook(): TelegramDeviceTestRunbook {
  return {
    version: TELEGRAM_DEVICE_TEST_VERSION,
    packageVersion: 'v2.29',
    readinessBefore: 92,
    readinessAfter: 94,
    goal: 'Провести первый реальный Telegram Mini App device-test сценарий: initData, viewport, readiness API и cloud dry-run без опасных записей в Supabase.',
    safeModeRules: [
      'Сначала открывать FINFlow через реальный Telegram Mini App button, а не обычный браузер.',
      'Cloud write не включать до local backup и ручного checklist: FINFLOW_ENABLE_SUPABASE_WRITES=false для первого dry-run.',
      'TELEGRAM_BOT_TOKEN и SUPABASE_SERVICE_ROLE_KEY хранить только в Vercel/hosting environment variables.',
      'Не загружать MASTER PRIVATE FULL, private_vault, private_raw_data и реальные .env файлы в GitHub/Vercel root.',
      'Для первого cloud dry-run использовать только GET/readiness checks; PUT/save запускать позже через guarded cloud wizard.'
    ],
    deviceChecks: [
      {
        id: 'telegram_bridge_detected',
        title: 'Telegram WebApp bridge обнаружен',
        status: 'test_required',
        detail: 'В Telegram должен быть доступен window.Telegram.WebApp и непустой initData.',
        successCriteria: 'Панель показывает inside Telegram + initData present; в обычном браузере это безопасно browser/local mode.'
      },
      {
        id: 'viewport_real_device',
        title: 'Viewport телефона читается корректно',
        status: 'test_required',
        detail: 'Проверить platform, colorScheme, viewportHeight, viewportStableHeight, expand/ready и отсутствие критичных mobile layout breakage.',
        successCriteria: 'Высота viewport не нулевая, нижняя навигация видна, День/Деньги/Работа/Фонды/AI/Система переключаются.'
      },
      {
        id: 'telegram_profile_context',
        title: 'Профиль Telegram доступен безопасно',
        status: 'test_required',
        detail: 'initDataUnsafe можно показывать только как безопасные диагностические признаки; полный initData и hash не выводить в UI.',
        successCriteria: 'В UI нет raw initData/hash, но видно user id/username presence и verify result.'
      }
    ],
    apiChecks: [
      {
        id: 'verify_api',
        title: '/api/telegram/verify',
        status: 'test_required',
        detail: 'POST initData на server route. Без TELEGRAM_BOT_TOKEN безопасный fail; с токеном — verified/local_fallback или supabase_server.',
        successCriteria: 'API не принимает поддельный initData, не возвращает секреты и даёт понятный mode.'
      },
      {
        id: 'deployment_readiness_api',
        title: '/api/deployment/readiness',
        status: 'ready',
        detail: 'Проверяет server-side env readiness без возврата значений секретов.',
        successCriteria: 'Ответ доступен, secretsReturned=false или отсутствуют любые raw secret values.'
      },
      {
        id: 'supabase_readiness_api',
        title: '/api/supabase/readiness',
        status: 'ready',
        detail: 'Показывает готовность Supabase server wrapper и feature flags.',
        successCriteria: 'Ответ показывает ready/writes/cloudSync status без service role key.'
      }
    ],
    cloudDryRunChecks: [
      {
        id: 'cloud_read_dry_run',
        title: 'Cloud read dry-run через GET /api/sync/day',
        status: 'test_required',
        detail: 'Только GET с x-telegram-init-data и localDate. Это не пишет данные и безопасно для первого Telegram теста.',
        successCriteria: 'При cloud disabled ожидается safe fail FINFLOW_ENABLE_CLOUD_SYNC_not_true; при cloud enabled — ok или пустой record=null без записи.'
      },
      {
        id: 'no_cloud_write_yet',
        title: 'Cloud write пока не выполняется',
        status: 'blocked',
        detail: 'PUT/save откладывается до backup, RLS/security review и guarded conflict wizard.',
        successCriteria: 'v2.04 panel не запускает PUT /api/sync/day.'
      }
    ],
    rollbackPlan: [
      'Если Telegram Mini App не открывается — убрать staging URL в BotFather или вернуть предыдущий Vercel deployment.',
      'Если verify падает — проверить только TELEGRAM_BOT_TOKEN в hosting env; не вставлять токен в код.',
      'Если viewport ломается — продолжить локально из browser mode и чинить CSS без затрагивания cloud/backend.',
      'Если cloud readiness показывает неожиданный writes=true — отключить FINFLOW_ENABLE_SUPABASE_WRITES до ручной проверки.'
    ],
    nextStepAfterDeviceTest: 'v2.14 — System color/spacing calibration, then Day cockpit'
  };
}
