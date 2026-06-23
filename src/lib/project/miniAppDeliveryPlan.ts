export const MINI_APP_DELIVERY_PLAN_VERSION = 'mini_app_delivery_plan_v2_55' as const;

export type MiniAppDeliveryStatus = 'ready' | 'usable_local' | 'in_progress' | 'blocked' | 'planned';

export type MiniAppDeliveryArea = {
  id: string;
  title: string;
  percent: number;
  previousPercent?: number;
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
    percent: 94,
    previousPercent: 93,
    status: 'usable_local',
    weight: 10,
    summary: 'Основная оболочка и навигация уже есть; v2.51 добавил разрешённый пользователем global redesign contract; v2.52 синхронизировал senior audit bugfixes поверх redesign без отката визуала.',
    done: ['7 главных вкладок', 'Telegram viewport hook', 'текущий dark/glass визуал', 'Sleep 3-tab MVP', 'Real Daily Use card v2.44', 'Daily Save QA v2.45', 'Telegram/Supabase Preflight v2.46', '7-day Real Data Week Test v2.47', 'Real Usage Gaps pass v2.48', 'Final Local MVP Smoke v2.49', 'visual baseline lock v2.49', 'Release Candidate gate v2.50', 'screenshot bug log v2.50', 'Global redesign contract v2.51', 'Global redesign acceptance panel v2.51', 'Senior audit date/backup/API hardening sync v2.52'],
    remaining: ['финальный телефонный screenshot acceptance', 'точечные багфиксы после реального Telegram-прогона']
  },
  {
    id: 'global_data_backbone',
    title: 'Global Data Backbone',
    percent: 98,
    previousPercent: 98,
    status: 'usable_local',
    weight: 16,
    summary: 'Backbone связывает Деньги, Работу, импорт, шаблоны, apply preview, lifecycle смены, Local Apply Center и ежедневный loop-check в общий local-first поток.',
    done: ['section-scoped History Engine', 'storage/reset/export', 'legacy key registry', 'canonical section map v2.32', 'money/work write adapter preview v2.33', 'Money Engine consumer v2.34', 'template apply preview v2.38', 'work shift lifecycle v2.38', 'Local Apply Center v2.42', 'Real Daily Use hardening v2.44', 'Period History + Daily Save QA v2.45', 'device/preflight gates v2.46', 'Final Local MVP smoke chain v2.49', 'timezone-safe date helper synced in v2.52'],
    remaining: ['адаптеры записи для funds/tasks', 'проверка миграций на реальных данных']
  },
  {
    id: 'historical_import',
    title: 'Исторические данные и импорт',
    percent: 99,
    previousPercent: 98,
    status: 'usable_local',
    weight: 14,
    summary: 'v2.55 закрыл разрыв между историческим импортом и шаблонами: банковские/Telegram-записи можно приводить к системе одной кнопкой, а новые исторические записи создаются по шаблонам фондов, работы и денег без ручного набора текста.',
    done: ['Import review queue', 'dry-run идея', 'draft parser v2.32', 'rollback requirement', 'dedupe hints', 'money/work candidate mapping', 'manual taxi order log parser v2.37', 'order-level preview candidates', 'confirm/apply/rollback foundation v2.38', 'Local Apply UI v2.42', 'CSV/JSON mapper preview v2.43', 'auto column roles: date/time/amount/title/category/section', 'Import Review Queue draft from tabular rows', 'дедупликация табличных строк', 'staging gap check: import/apply не должен висеть вне Daily Records v2.48', 'private bundle upload и schema validation v2.53', '3 section-scoped historical ledgers v2.53', 'редактор даты/суммы/категории/статуса v2.53', 'bank/Telegram duplicate hints v2.53', 'compact_rows storage v2.54', 'backup restore v2.54', 'ручное добавление истории v2.54', 'explicit editor save v2.54', 'live historical analytics v2.54', 'historical template catalog v2.55', 'template-first historical entry v2.55', 'template apply to imported bank/Telegram records v2.55'],
    remaining: ['ручная правка произвольного column mapping в UI', 'IndexedDB fallback для устройств с очень маленькой localStorage-квотой', 'phone acceptance полного bundle']
  },
  {
    id: 'money_engine',
    title: 'Деньги: доходы, расходы, обязательства',
    percent: 96,
    previousPercent: 94,
    status: 'usable_local',
    weight: 14,
    summary: 'Деньги читают live-записи и отдельный подтверждённый исторический ledger; банковские переводы остаются review, а уверенные расходы не смешиваются с активным днём.',
    done: ['income/expense records', 'net calculation', 'funds/obligations in Day Core', 'Money Engine snapshot', 'категории пользователя', 'источники денег', 'обязательства в Деньгах', 'template suggestions', 'template apply path v2.38', 'Local Apply records publish v2.42', 'daily loop money checks v2.44', 'period history summary v2.45', 'daily phone preflight candidate v2.46', '7-day money period test v2.47', 'money baseline gap detection v2.48', 'Final smoke money/history gate v2.49', 'RC daily save/history gate v2.50', 'bank + Telegram historical ledger v2.53'],
    remaining: ['повторяющиеся платежи как реальные записи', 'графики и финальный UX-polish']
  },
  {
    id: 'work_taxi_engine',
    title: 'Работа/такси',
    percent: 97,
    previousPercent: 95,
    status: 'usable_local',
    weight: 14,
    summary: 'Работа получила lifecycle смены и daily loop-check: заказы, оборот, рабочие издержки и close preview стали частью ежедневной готовности.',
    done: ['gross/net model', 'fuel inputs', 'shift hours fields', 'Sleep → Day → Work bridge', 'Work Taxi Engine snapshot', 'active/shift ₽ per hour', 'fuel/Drivee work costs', 'Work → Money bridge', 'manual order log parser', 'order-level import candidates', 'work shift lifecycle v2.38', 'Local Apply publication to records v2.42', 'daily loop work checks v2.44', 'work period history summary v2.45', 'daily phone preflight candidate v2.46', '7-day work period test v2.47', 'work-cost separation gap detection v2.48', 'Final smoke Work → Period History gate v2.49', 'RC phone/data flow v2.50'],
    remaining: ['зоны/точки как отдельные сущности', 'фильтры зон в истории смен', 'полный interactive close UI', 'финальный UX-polish']
  },
  {
    id: 'templates_engine',
    title: 'Шаблоны и быстрый ввод',
    percent: 98,
    previousPercent: 96,
    status: 'usable_local',
    weight: 8,
    summary: 'Templates Engine теперь не только показывает registry, но и реально помогает вводить историю: шаблоны МФН, работа/такси, деньги и шаблоны из повторяющихся исторических записей доступны прямо в Private Import Center.',
    done: ['daily record templates', 'custom record template model', 'section template registry', 'user-locked template seeds', 'money/work/funds/day template grouping', 'System → Data → Шаблоны panel', 'template apply preview v2.38', 'recurring occurrence preview v2.38', 'Local Apply confirm UI v2.42', 'template/apply hanging gap detection v2.48', 'МФН fund templates v2.55', 'history-derived templates v2.55', 'template chips inside historical editor v2.55'],
    remaining: ['enable/disable UI', 'template history/export', 'реальный scheduled apply']
  },
  {
    id: 'supabase_sync',
    title: 'Supabase sync',
    percent: 76,
    previousPercent: 74,
    status: 'in_progress',
    weight: 12,
    summary: 'Supabase имеет staging foundation и теперь локальную Cloud Sync Queue + Conflict Review UI: save/load/apply/rollback/conflict видны как безопасный поток, но реальные writes ещё нельзя включать без проекта и тестов.',
    done: ['Supabase client dependency', 'server guards', 'cloud writes safe-off', 'schema draft v2.32', 'staging readiness model v2.39', 'RLS/security checklist v2.39', 'readiness endpoint without secrets v2.39', 'staging migration draft v2.39', 'Cloud Sync Queue local model v2.40', 'Conflict Review cards v2.40', 'queue action migration draft v2.40', 'Telegram/Supabase readonly preflight panel v2.46', 'Real Data Week readonly staging gate v2.47', 'cloud writes safe-off and conflict review blockers v2.48', 'Final smoke cloud safe-off/conflict gate v2.49', 'RC safe-off cloud gate v2.50', 'invalid localDate rejection and migration readiness path fix v2.52'],
    remaining: ['migrations apply в private staging', 'manual RLS/cross-user test', 'real save/load/conflict test from Telegram', 'backup before write на реальном телефоне']
  },
  {
    id: 'n8n_automation',
    title: 'n8n automation layer',
    percent: 45,
    previousPercent: 44,
    status: 'in_progress',
    weight: 6,
    summary: 'n8n теперь имеет безопасный contract/dry-run слой: workflow registry, webhook payloads, credentials policy и запрет внешних вызовов до private staging.',
    done: ['automation scope defined', 'security rules defined', 'webhook contract v2.41', 'daily report dry-run v2.41', 'backup/import/cloud workflow drafts', 'credentials policy', 'dry-run API without secrets', 'external n8n off check in staging gaps v2.48', 'server dry-run localDate fixed for Asia/Kamchatka v2.52'],
    remaining: ['private n8n instance', 'webhook auth/callback verification', 'redaction/consent screen', '7-day dry-run on real data', 'production workflow audit']
  },
  {
    id: 'security_backup_ip',
    title: 'Security / Backup / IP protection',
    percent: 97,
    previousPercent: 96,
    status: 'usable_local',
    weight: 10,
    summary: 'Private/deploy-safe дисциплина сильная; исторический слой теперь имеет собственный проверяемый export → restore, атомарный rollback и компактное localStorage-хранение.',
    done: ['MASTER vs deploy-safe split', 'local backup/restore', 'reset undo', 'forbidden scan', 'n8n no-secrets dry-run contract', 'Codex audited API/packaging safety sync v2.45', 'preflight hard-stops for Telegram/Supabase v2.46', '7-day real-data backup gate v2.47', 'backup hard-stop in Real Usage Gaps v2.48', 'Final smoke deploy-safe/private hard-stops v2.49', 'RC deploy-safe only gate v2.50', 'redesign did not enable cloud/n8n writes v2.51', 'backup rollback honesty and Telegram request-size guard v2.52', 'deploy-safe symlink hardening v2.52', 'historical export/restore roundtrip v2.54', 'compact local storage v2.54'],
    remaining: ['RLS policies test', 'Vercel env review', 'real n8n credentials vaulting', 'external backup routine', 'payload redaction/consent screen']
  },
  {
    id: 'qa_release',
    title: 'QA и release readiness',
    percent: 97,
    previousPercent: 96,
    status: 'in_progress',
    weight: 6,
    summary: 'Build checks проходят; v2.44 добавил practical daily-loop smoke surface для Money/Work/Apply/history, но настоящий релиз всё ещё требует телефона и данных за несколько дней.',
    done: ['lint/build/audit scripts', 'Telegram checks panel', 'deployment checklists', 'cloud queue/conflict smoke path v2.40', 'n8n dry-run API smoke path v2.41', 'Local Apply confirm/rollback smoke path v2.42', 'CSV/JSON mapper smoke path v2.43', 'Real Daily Use hardening smoke surface v2.44', 'Daily Save QA v2.45', 'security regression tests from audited Codex sync', 'Telegram/Supabase preflight runbook v2.46', 'Real Data Week Test panel v2.47', 'Real Usage Gaps QA panel v2.48', 'Final Local MVP Smoke panel v2.49', '2 final-smoke regression tests v2.49', 'Release Candidate panel v2.50', 'RC regression tests v2.50', 'Global redesign acceptance panel v2.51', 'global redesign regression tests v2.51', 'senior audit regression tests v2.52', '22 Node tests v2.52'],
    remaining: ['реальный phone staging smoke test', 'bug log по скриншотам', 'финальный production checklist']
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
    realisticBuildsLeft: 'примерно 1 реальный phone acceptance pass до сильного local-first MVP: исторический импорт, шаблонный ввод и live-статистика уже встроены, осталось проверить на Telegram/Vercel и закрыть фактический bug log',
    nextBuild: 'v2.56 — Real Telegram Device Acceptance: загрузить deploy-safe v2.55 на реальный телефон, импортировать private bundle и закрыть фактические screenshot/storage bugs',
    areas,
    criticalPath: [
      'прогнать QA → RC/Дизайн на телефоне и закрыть blocker/major screenshot bugs',
      'импортировать private bundle v2.53 в app v2.55 на реальном телефоне и проверить Money/Work/Funds history, editors, template-first input, backup restore и localStorage quota',
      'проверить историю Деньги/Работа по периодам, Daily Save QA и backup на реальных днях',
      'довести Supabase staging до real readonly/load/conflict теста из Telegram, writes включать только после backup/RLS/conflict',
      'прогнать n8n dry-run на реальных локальных агрегатах и не включать внешние calls до private staging',
      'полировать UI только по скриншотам, не ломая locked baseline и v2.51 redesign contract'
    ],
    nonGoalsNow: [
      'не делать самовольный редизайн без прямой команды пользователя',
      'не включать cloud writes без RLS/backup',
      'не загружать MASTER/private/secrets в GitHub/Vercel',
      'не включать external n8n calls без auth/redaction/private staging'
    ]
  };
}
