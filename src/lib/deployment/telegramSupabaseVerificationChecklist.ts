export const TELEGRAM_SUPABASE_VERIFICATION_CHECKLIST_VERSION = 'telegram_supabase_verification_checklist_v1_81' as const;

export type VerificationStageId =
  | 'repo_privacy'
  | 'supabase_project'
  | 'supabase_migration'
  | 'telegram_bot'
  | 'https_deployment'
  | 'env_variables'
  | 'readiness_routes'
  | 'phone_launch'
  | 'profile_create'
  | 'cloud_save'
  | 'cloud_load_preview'
  | 'cloud_apply'
  | 'conflict_test'
  | 'rls_review'
  | 'backup_restore';

export type VerificationStage = {
  id: VerificationStageId;
  title: string;
  status: 'done' | 'manual_required' | 'blocked' | 'planned';
  area: 'privacy' | 'supabase' | 'telegram' | 'deployment' | 'sync' | 'security';
  description: string;
  evidence: string;
};

export type ProjectReadinessEstimate = {
  localFoundation: number;
  dailyLocalUse: number;
  cloudFoundation: number;
  productionEcosystem: number;
  explanation: string[];
};

export type TelegramSupabaseVerificationChecklist = {
  version: typeof TELEGRAM_SUPABASE_VERIFICATION_CHECKLIST_VERSION;
  stages: VerificationStage[];
  readiness: ProjectReadinessEstimate;
  nextCriticalPath: string[];
};

export function buildTelegramSupabaseVerificationChecklist(): TelegramSupabaseVerificationChecklist {
  const stages: VerificationStage[] = [
    {
      id: 'repo_privacy',
      title: 'Private repo / safe package',
      status: 'done',
      area: 'privacy',
      description: 'Архивы собираются без node_modules, .next, .npm-cache, .env.local, private_raw_data и секретов.',
      evidence: 'Проверяется упаковкой и security docs.'
    },
    {
      id: 'supabase_project',
      title: 'Private Supabase project',
      status: 'manual_required',
      area: 'supabase',
      description: 'Нужно создать приватный Supabase project для личной базы FINFlow.',
      evidence: 'Вне кода: Supabase dashboard.'
    },
    {
      id: 'supabase_migration',
      title: 'Apply cloud day migration',
      status: 'manual_required',
      area: 'supabase',
      description: 'Нужно применить supabase/migration_v1_73_telegram_cloud_day.sql.',
      evidence: 'Таблицы finflow_profiles и finflow_day_documents доступны на сервере.'
    },
    {
      id: 'telegram_bot',
      title: 'Telegram bot + Mini App',
      status: 'manual_required',
      area: 'telegram',
      description: 'Нужно создать бота и Mini App URL через BotFather.',
      evidence: 'Telegram WebApp initData появляется на телефоне.'
    },
    {
      id: 'https_deployment',
      title: 'HTTPS deployment',
      status: 'manual_required',
      area: 'deployment',
      description: 'Нужен приватный deployment на Vercel/сервере с HTTPS.',
      evidence: 'Публичный HTTPS URL открывает FINFlow.'
    },
    {
      id: 'env_variables',
      title: 'Server env variables',
      status: 'manual_required',
      area: 'deployment',
      description: 'Добавить TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY и flags в hosting env.',
      evidence: '/api/deployment/readiness показывает cloud_ready.'
    },
    {
      id: 'readiness_routes',
      title: 'Readiness routes',
      status: 'planned',
      area: 'deployment',
      description: 'Проверить /api/deployment/readiness, /api/supabase/readiness, /api/telegram/verify.',
      evidence: 'HTTP 200 и безопасные статусы без раскрытия секретов.'
    },
    {
      id: 'phone_launch',
      title: 'Real phone launch',
      status: 'blocked',
      area: 'telegram',
      description: 'Запустить Mini App с телефона через Telegram.',
      evidence: 'Cloud sync panel видит Telegram initData.'
    },
    {
      id: 'profile_create',
      title: 'Profile resolve/create',
      status: 'blocked',
      area: 'sync',
      description: 'Проверить создание/получение профиля через server-only Supabase bridge.',
      evidence: '/api/telegram/verify возвращает profileReady=true.'
    },
    {
      id: 'cloud_save',
      title: 'Save day to cloud',
      status: 'blocked',
      area: 'sync',
      description: 'Сохранить текущий день в Supabase через /api/sync/day PUT.',
      evidence: 'Ответ ok=true, revision > 0.'
    },
    {
      id: 'cloud_load_preview',
      title: 'Load cloud day preview',
      status: 'blocked',
      area: 'sync',
      description: 'Загрузить день из облака без автоприменения.',
      evidence: 'Появляется pending document и кнопка применить.'
    },
    {
      id: 'cloud_apply',
      title: 'Apply loaded cloud day',
      status: 'blocked',
      area: 'sync',
      description: 'Вручную применить загруженный облачный день к локальному состоянию.',
      evidence: 'Day Core, records, fuel and bank decisions обновились только после подтверждения.'
    },
    {
      id: 'conflict_test',
      title: 'Two-session conflict test',
      status: 'blocked',
      area: 'sync',
      description: 'Проверить optimistic concurrency: две сессии, конфликт revision, HTTP 409.',
      evidence: 'Приложение не перезаписывает облако молча.'
    },
    {
      id: 'rls_review',
      title: 'RLS/security review',
      status: 'manual_required',
      area: 'security',
      description: 'Перед реальными банковскими данными проверить RLS, отсутствие прямого client-write и изоляцию пользователя.',
      evidence: 'Отдельный security review report.'
    },
    {
      id: 'backup_restore',
      title: 'Backup/restore plan',
      status: 'planned',
      area: 'security',
      description: 'Добавить ручной export/backup/restore для облачного и локального состояния.',
      evidence: 'Пакет будущей версии.'
    }
  ];

  return {
    version: TELEGRAM_SUPABASE_VERIFICATION_CHECKLIST_VERSION,
    stages,
    readiness: {
      localFoundation: 82,
      dailyLocalUse: 70,
      cloudFoundation: 62,
      productionEcosystem: 42,
      explanation: [
        'Локальная архитектура, Day Core, расчёты, записи, история, машина, топливо и AI-помощник уже собраны как foundation.',
        'Cloud sync foundation есть, но реальные Telegram/Supabase проверки пока требуют внешней инфраструктуры.',
        'Production ecosystem требует deployment, env, migration, phone tests, conflict tests, RLS/security review, backup/restore и mobile UX polishing.'
      ]
    },
    nextCriticalPath: [
      'Создать приватный Supabase project.',
      'Применить migration v1.73.',
      'Развернуть HTTPS deployment.',
      'Добавить env variables в hosting, не в код.',
      'Запустить Telegram Mini App на телефоне.',
      'Проверить save/load/preview/apply/conflict.',
      'Только затем подключать реальные банковские данные и external AI.'
    ]
  };
}
