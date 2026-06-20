export const ECOSYSTEM_READINESS_AUDIT_VERSION = 'ecosystem_readiness_audit_v2_08' as const;

export type EcosystemReadinessArea = {
  id: string;
  title: string;
  previousPercent: number;
  percent: number;
  status: 'done' | 'usable' | 'needs_real_test' | 'in_progress' | 'not_started';
  summary: string;
  done: string[];
  remaining: string[];
};

export type EcosystemReadinessAudit = {
  version: typeof ECOSYSTEM_READINESS_AUDIT_VERSION;
  previousOverallProductionPercent: number;
  overallProductionPercent: number;
  previousLocalDailyUsePercent: number;
  localDailyUsePercent: number;
  previousSafeLaunchPercent: number;
  safeLaunchPercent: number;
  areas: EcosystemReadinessArea[];
  topRisks: string[];
  nextActions: string[];
};

export function buildEcosystemReadinessAudit(): EcosystemReadinessAudit {
  const areas: EcosystemReadinessArea[] = [
    {
      id: 'local_day_core',
      title: 'Локальная mini app / Day Core',
      previousPercent: 95,
      percent: 95,
      status: 'usable',
      summary: 'Основной локальный дневной контур уже пригоден для реального ручного использования.',
      done: [
        'быстрый ввод денег, заказов, расходов и задач',
        'грязный/чистый доход',
        'фонды, обязательства, ремонт машины',
        'топливо/одометр/масло',
        'локальный AI-помощник и daily decision summary',
        'история, records, templates, bank review decisions'
      ],
      remaining: [
        'несколько дней реального ручного теста на телефоне',
        'mobile touch polish for Telegram viewport',
        'real device test for New Day rollover and restore',
        'first staging deploy smoke test'
      ]
    },
    {
      id: 'telegram_mini_app',
      title: 'Telegram Mini App слой',
      previousPercent: 94,
      percent: 94,
      status: 'needs_real_test',
      summary: 'Клиентский Telegram bridge, server verify и device-test панель готовы; v2.05 вынесла Telegram-тест в отдельный быстрый раздел System, чтобы его не искать в длинной ленте.',
      done: [
        'Telegram WebApp SDK подключён',
        'Telegram session pill добавлен',
        'server-side initData verification есть',
        'Telegram/Supabase verification checklist есть'
      ],
      remaining: [
        'настроить BotFather Mini App URL',
        'запустить на реальном телефоне через Telegram',
        'проверить initData/profileReady/cloud readiness',
        'пройти runtime checks в System → Telegram → TelegramDeviceTestPanel',
        'deploy-safe package v2.05 собирается без private_vault и с .npmrc для Vercel install'
      ]
    },
    {
      id: 'supabase_cloud_sync',
      title: 'Supabase cloud sync foundation',
      previousPercent: 82,
      percent: 82,
      status: 'needs_real_test',
      summary: 'Cloud sync архитектура и safety-слои готовы, но production требует реальной Supabase/Vercel проверки.',
      done: [
        'GET/PUT /api/sync/day',
        'safe cloud read dry-run checklist без PUT/write',
        'Telegram initData auth',
        'feature flags для cloud writes',
        'revision/conflict guard',
        'cloud preview diff',
        'cloud apply rollback',
        'cloud save preflight gate'
      ],
      remaining: [
        'создать/проверить приватный Supabase project',
        'применить migration',
        'пройти real save/load/conflict test',
        'проверить RLS/security вручную'
      ]
    },
    {
      id: 'security_backup',
      title: 'Безопасность, backup, rollback',
      previousPercent: 87,
      percent: 87,
      status: 'usable',
      summary: 'Safety-архитектура сильная для личного проекта; до production нужен внешний ручной security review.',
      done: [
        'MASTER PRIVATE FULL разделяет finflow_app и private_vault',
        'локальный backup/restore',
        'restore diff preview',
        'cloud apply rollback',
        'cloud save preflight gate',
        'секреты не нужны в client bundle'
      ],
      remaining: [
        'финальный manual RLS test',
        'отдельный deploy-safe package без private_vault',
        'device-test panel не выводит raw initData/hash',
        'password manager / env storage discipline'
      ]
    },
    {
      id: 'ux_daily_use',
      title: 'Удобство ежедневного использования',
      previousPercent: 88,
      percent: 90,
      status: 'in_progress',
      summary: 'FINFlow получил цельную cosmic/glass дизайн-систему: единый фон, карточки, навигация, command headers и более премиальный mobile-first стиль.',
      done: [
        'всё ключевое доступно в одном dashboard',
        'есть быстрые кнопки и расчёты',
        'есть подсказки и safety-панели'
      ],
      remaining: [
        'режим “Сегодня” с минимумом блоков',
        'единая дизайн-система для всех вкладок, не только System',
        'мобильная визуальная полировка',
        'дальше пройти реальный Telegram viewport/device test внутри нового раздела Telegram'
      ]
    },
    {
      id: 'ecosystem_memory',
      title: 'Память проекта и протоколы',
      previousPercent: 93,
      percent: 94,
      status: 'done',
      summary: 'Проектная память и протоколы хорошо сохранены внутри MASTER PRIVATE FULL.',
      done: [
        'MASTER_PRIVATE_DOCS',
        'private_vault',
        'context ledgers',
        'operation ledgers',
        'changelog',
        'security scans',
        'build reports',
        'regression checks'
      ],
      remaining: [
        'периодически сжимать старые отчёты в summary, чтобы app root не разрастался'
      ]
    }
  ];

  return {
    version: ECOSYSTEM_READINESS_AUDIT_VERSION,
    previousOverallProductionPercent: 83,
    overallProductionPercent: 84,
    previousLocalDailyUsePercent: 95,
    localDailyUsePercent: 96,
    previousSafeLaunchPercent: 91,
    safeLaunchPercent: 91,
    areas,
    topRisks: [
      'Интерфейс стал цельнее, но реальные дневные сценарии всё ещё нужно прогнать на телефоне несколько дней.',
      'Cloud/Supabase writes должны оставаться выключенными до backup + RLS/security review.',
      'MASTER PRIVATE FULL нельзя путать с deploy-safe архивом.',
      'BotFather URL и real Telegram device test всё ещё нужно пройти руками.'
    ],
    nextActions: [
      'Загрузить deploy-safe package v2.08 в приватный GitHub/Vercel staging или обновить текущий staging repo.',
      'Настроить BotFather Mini App URL на staging-домен.',
      'В Telegram открыть System → Telegram и пройти Real Telegram Device Test: initData, viewport, readiness API, cloud GET dry-run.',
      'Применить Supabase migration и пройти save/load/conflict/RLS checklist.'
    ]
  };
}
