export const MINI_APP_DELIVERY_PLAN_VERSION = 'mini_app_delivery_plan_v2_42' as const;

export type MiniAppDeliveryStatus = 'ready' | 'usable_local' | 'in_progress' | 'blocked' | 'planned';

export type MiniAppDeliveryArea = {
  id: string;
  title: string;
  percent: number;
  status: MiniAppDeliveryStatus;
  weight: number;
  summary: string;
  done: string[];
  remaining: string[];
};

export type MiniAppDeliveryPlan = {
  version: typeof MINI_APP_DELIVERY_PLAN_VERSION;
  overallStrongMiniAppPercent: number;
  remainingPercent: number;
  realisticBuildsLeft: string;
  nextBuild: string;
  areas: MiniAppDeliveryArea[];
  criticalPath: string[];
  nonGoalsNow: string[];
};

const areas: MiniAppDeliveryArea[] = [
  {
    id: 'local_shell_ui',
    title: 'Локальная оболочка и Telegram UI',
    percent: 72,
    status: 'usable_local',
    weight: 10,
    summary: 'Основная оболочка и навигация уже есть, но финальный UI-polish переносится после данных и синхронизации.',
    done: ['7 главных вкладок', 'Telegram viewport hook', 'текущий dark/glass визуал', 'Sleep 3-tab MVP'],
    remaining: ['финальная полировка экранов', 'реальный Telegram device QA', 'нижнее меню/safe-area pass']
  },
  {
    id: 'global_data_backbone',
    title: 'Global Data Backbone',
    percent: 92,
    status: 'usable_local',
    weight: 16,
    summary: 'Backbone связывает Деньги, Работу, импорт, шаблоны, apply preview, lifecycle смены и Local Apply Center в общий local-first поток.',
    done: ['section-scoped History Engine', 'storage/reset/export', 'legacy key registry', 'canonical section map v2.32', 'money/work write adapter preview v2.33', 'Money Engine consumer v2.34', 'template apply preview v2.38', 'work shift lifecycle v2.38', 'Local Apply Center v2.42'],
    remaining: ['адаптеры записи для funds/tasks', 'проверка миграций на реальных данных']
  },
  {
    id: 'historical_import',
    title: 'Исторические данные и импорт',
    percent: 84,
    status: 'usable_local',
    weight: 14,
    summary: 'Импорт понимает ручной журнал заказов и получил практический локальный путь: preview → выбор → запись в Daily Records → rollback batch.',
    done: ['Import review queue', 'dry-run идея', 'draft parser v2.32', 'rollback requirement', 'dedupe hints', 'money/work candidate mapping', 'manual taxi order log parser v2.37', 'order-level preview candidates', 'confirm/apply/rollback foundation v2.38', 'Local Apply UI v2.42'],
    remaining: ['табличный импорт CSV/JSON', 'ручное сопоставление полей', 'массовый full UI confirm для больших файлов']
  },
  {
    id: 'money_engine',
    title: 'Деньги: доходы, расходы, обязательства',
    percent: 80,
    status: 'usable_local',
    weight: 14,
    summary: 'Деньги читают записи, категории, источники, обязательства и теперь получают реальные локальные записи от шаблонов/импорта через confirm/rollback.',
    done: ['income/expense records', 'net calculation', 'funds/obligations in Day Core', 'Money Engine snapshot', 'категории пользователя', 'источники денег', 'обязательства в Деньгах', 'template suggestions', 'template apply path v2.38', 'Local Apply records publish v2.42'],
    remaining: ['повторяющиеся платежи как реальные записи', 'money history UI по периодам', 'графики и финальный UX-polish']
  },
  {
    id: 'work_taxi_engine',
    title: 'Работа/такси',
    percent: 86,
    status: 'usable_local',
    weight: 14,
    summary: 'Работа получила lifecycle смены: открыть → добавить заказы/издержки → закрыть → связать с Деньгами и Сном.',
    done: ['gross/net model', 'fuel inputs', 'shift hours fields', 'Sleep → Day → Work bridge', 'Work Taxi Engine snapshot', 'active/shift ₽ per hour', 'fuel/Drivee work costs', 'Work → Money bridge', 'manual order log parser', 'order-level import candidates', 'work shift lifecycle v2.38', 'Local Apply publication to records v2.42'],
    remaining: ['зоны/точки как отдельные сущности', 'история смен по периодам', 'полный interactive close UI', 'финальный UX-polish']
  },
  {
    id: 'templates_engine',
    title: 'Шаблоны и быстрый ввод',
    percent: 94,
    status: 'usable_local',
    weight: 8,
    summary: 'Templates Engine теперь не только показывает registry, но и умеет давать ready draft-записи в Local Apply Center для подтверждения и rollback.',
    done: ['daily record templates', 'custom record template model', 'section template registry', 'user-locked template seeds', 'money/work/funds/day template grouping', 'System → Data → Шаблоны panel', 'template apply preview v2.38', 'recurring occurrence preview v2.38', 'Local Apply confirm UI v2.42'],
    remaining: ['enable/disable UI', 'template history', 'template import/export from old docs', 'реальный scheduled apply']
  },
  {
    id: 'supabase_sync',
    title: 'Supabase sync',
    percent: 54,
    status: 'in_progress',
    weight: 12,
    summary: 'Supabase имеет staging foundation и теперь локальную Cloud Sync Queue + Conflict Review UI: save/load/apply/rollback/conflict видны как безопасный поток, но реальные writes ещё нельзя включать без проекта и тестов.',
    done: ['Supabase client dependency', 'server guards', 'cloud writes safe-off', 'schema draft v2.32', 'staging readiness model v2.39', 'RLS/security checklist v2.39', 'readiness endpoint without secrets v2.39', 'staging migration draft v2.39', 'Cloud Sync Queue local model v2.40', 'Conflict Review cards v2.40', 'queue action migration draft v2.40'],
    remaining: ['реальный Supabase project', 'migrations apply в private staging', 'manual RLS/cross-user test', 'real save/load/conflict test from Telegram', 'backup before write на реальном телефоне']
  },
  {
    id: 'n8n_automation',
    title: 'n8n automation layer',
    percent: 40,
    status: 'in_progress',
    weight: 6,
    summary: 'n8n теперь имеет безопасный contract/dry-run слой: workflow registry, webhook payloads, credentials policy и запрет внешних вызовов до private staging.',
    done: ['automation scope defined', 'security rules defined', 'webhook contract v2.41', 'daily report dry-run v2.41', 'backup/import/cloud workflow drafts', 'credentials policy', 'dry-run API without secrets'],
    remaining: ['private n8n instance', 'webhook auth/callback verification', 'redaction/consent screen', '7-day dry-run on real data', 'production workflow audit']
  },
  {
    id: 'security_backup_ip',
    title: 'Security / Backup / IP protection',
    percent: 77,
    status: 'usable_local',
    weight: 10,
    summary: 'Private/deploy-safe дисциплина сильная; v2.41 добавил n8n credentials policy и dry-run запрет на утечку env/private/secrets.',
    done: ['MASTER vs deploy-safe split', 'local backup/restore', 'reset undo', 'forbidden scan', 'n8n no-secrets dry-run contract'],
    remaining: ['RLS policies test', 'Vercel env review', 'real n8n credentials vaulting', 'external backup routine', 'payload redaction/consent screen']
  },
  {
    id: 'qa_release',
    title: 'QA и release readiness',
    percent: 52,
    status: 'in_progress',
    weight: 6,
    summary: 'Build checks проходят, появились smoke-сценарии cloud/n8n и Local Apply; настоящий релиз всё ещё требует телефона и данных за несколько дней.',
    done: ['lint/build/audit scripts', 'Telegram checks panel', 'deployment checklists', 'cloud queue/conflict smoke path v2.40', 'n8n dry-run API smoke path v2.41', 'Local Apply confirm/rollback smoke path v2.42'],
    remaining: ['7-day real usage test', 'bug log', 'Telegram staging smoke test', 'production checklist']
  }
];

function weightedOverall(input: MiniAppDeliveryArea[]) {
  const totalWeight = input.reduce((sum, item) => sum + item.weight, 0);
  const score = input.reduce((sum, item) => sum + item.percent * item.weight, 0) / totalWeight;
  return Math.round(score);
}

export function buildMiniAppDeliveryPlan(): MiniAppDeliveryPlan {
  const overallStrongMiniAppPercent = weightedOverall(areas);
  return {
    version: MINI_APP_DELIVERY_PLAN_VERSION,
    overallStrongMiniAppPercent,
    remainingPercent: 100 - overallStrongMiniAppPercent,
    realisticBuildsLeft: 'примерно 2–4 крупных build-пакета, не считая финального UI-polish',
    nextBuild: 'v2.43 — Historical CSV/JSON Import Mapper: добавить табличный импорт, сопоставление колонок и массовый preview без автозаписи',
    areas,
    criticalPath: [
      'проверить Local Apply на реальных данных и закрыть missing UI gaps',
      'довести historical import preview/dedupe/confirm/rollback до полного UI',
      'довести Деньги и Работа до реального ежедневного ввода',
      'довести Supabase staging до реального save/load/conflict теста из Telegram',
      'прогнать n8n dry-run на реальных локальных агрегатах и не включать внешние calls до private staging',
      'после этого финально полировать UI по скриншотам'
    ],
    nonGoalsNow: [
      'не делать глобальный визуальный редизайн',
      'не включать cloud writes без RLS/backup',
      'не загружать MASTER/private/secrets в GitHub/Vercel',
      'не включать external n8n calls без auth/redaction/private staging'
    ]
  };
}
