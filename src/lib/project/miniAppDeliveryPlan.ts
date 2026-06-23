export const MINI_APP_DELIVERY_PLAN_VERSION = 'mini_app_delivery_plan_v2_58' as const;

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
    percent: 98,
    previousPercent: 97,
    status: 'usable_local',
    weight: 10,
    summary: 'Основная оболочка и навигация уже есть; v2.51 добавил разрешённый пользователем global redesign contract; v2.52 синхронизировал senior audit bugfixes; v2.55 привёл package metadata и readiness labels к единой актуальной версии; v2.56 сделал полный редизайн, а v2.57 убрал лишний технический текст из основных экранов, а v2.58 добил видимый мусор в System/Cloud/Backup/Automation/RC без изменения логики данных.',
    done: ['7 главных вкладок', 'Telegram viewport hook', 'текущий dark/glass визуал', 'Sleep 3-tab MVP', 'Real Daily Use card v2.44', 'Daily Save QA v2.45', 'Telegram/Supabase Preflight v2.46', '7-day Real Data Week Test v2.47', 'Real Usage Gaps pass v2.48', 'Final Local MVP Smoke v2.49', 'visual baseline lock v2.49', 'Release Candidate gate v2.50', 'screenshot bug log v2.50', 'Global redesign contract v2.51', 'Global redesign acceptance panel v2.51', 'Senior audit date/backup/API hardening sync v2.52', 'metadata freshness pass v2.55', 'Full system redesign v2.56', 'Clean UX copy pass v2.57', 'Deep declutter pass v2.58'],
    remaining: ['реальный Telegram screenshot acceptance уже после полного редизайна', 'точечные багфиксы по скриншотам без переписывания логики']
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
    percent: 95,
    previousPercent: 94,
    status: 'usable_local',
    weight: 14,
    summary: 'Импорт понимает ручной журнал заказов, generic text, CSV/TSV/semicolon CSV и JSON array, затем ведёт данные через preview → review → confirm → Daily Records → rollback.',
    done: ['Import review queue', 'dry-run идея', 'draft parser v2.32', 'rollback requirement', 'dedupe hints', 'money/work candidate mapping', 'manual taxi order log parser v2.37', 'order-level preview candidates', 'confirm/apply/rollback foundation v2.38', 'Local Apply UI v2.42', 'CSV/JSON mapper preview v2.43', 'auto column roles: date/time/amount/title/category/section', 'Import Review Queue draft from tabular rows', 'дедупликация табличных строк', 'staging gap check: import/apply не должен висеть вне Daily Records v2.48'],
    remaining: ['ручная правка column mapping в UI', 'импорт больших файлов через upload', 'массовый full UI confirm для больших файлов']
  },
  {
    id: 'money_engine',
    title: 'Деньги: доходы, расходы, обязательства',
    percent: 94,
    previousPercent: 93,
    status: 'usable_local',
    weight: 14,
    summary: 'Деньги читают записи, категории, источники, обязательства и теперь участвуют в daily loop-check: деньги сейчас → расходы → apply → сохранение дня.',
    done: ['income/expense records', 'net calculation', 'funds/obligations in Day Core', 'Money Engine snapshot', 'категории пользователя', 'источники денег', 'обязательства в Деньгах', 'template suggestions', 'template apply path v2.38', 'Local Apply records publish v2.42', 'daily loop money checks v2.44', 'period history summary v2.45', 'daily phone preflight candidate v2.46', '7-day money period test v2.47', 'money baseline gap detection v2.48', 'Final smoke money/history gate v2.49', 'RC daily save/history gate v2.50'],
    remaining: ['повторяющиеся платежи как реальные записи', 'финальный money history UI polish', 'графики и финальный UX-polish']
  },
  {
    id: 'work_taxi_engine',
    title: 'Работа/такси',
    percent: 95,
    previousPercent: 94,
    status: 'usable_local',
    weight: 14,
    summary: 'Работа получила lifecycle смены и daily loop-check: заказы, оборот, рабочие издержки и close preview стали частью ежедневной готовности.',
    done: ['gross/net model', 'fuel inputs', 'shift hours fields', 'Sleep → Day → Work bridge', 'Work Taxi Engine snapshot', 'active/shift ₽ per hour', 'fuel/Drivee work costs', 'Work → Money bridge', 'manual order log parser', 'order-level import candidates', 'work shift lifecycle v2.38', 'Local Apply publication to records v2.42', 'daily loop work checks v2.44', 'work period history summary v2.45', 'daily phone preflight candidate v2.46', '7-day work period test v2.47', 'work-cost separation gap detection v2.48', 'Final smoke Work → Period History gate v2.49', 'RC phone/data flow v2.50'],
    remaining: ['зоны/точки как отдельные сущности', 'интерактивная история смен по периодам с фильтрами зон', 'полный interactive close UI', 'финальный UX-polish']
  },
  {
    id: 'templates_engine',
    title: 'Шаблоны и быстрый ввод',
    percent: 96,
    previousPercent: 96,
    status: 'usable_local',
    weight: 8,
    summary: 'Templates Engine теперь не только показывает registry, но и умеет давать ready draft-записи в Local Apply Center для подтверждения и rollback.',
    done: ['daily record templates', 'custom record template model', 'section template registry', 'user-locked template seeds', 'money/work/funds/day template grouping', 'System → Data → Шаблоны panel', 'template apply preview v2.38', 'recurring occurrence preview v2.38', 'Local Apply confirm UI v2.42', 'template/apply hanging gap detection v2.48'],
    remaining: ['enable/disable UI', 'template history', 'template import/export from old docs', 'реальный scheduled apply']
  },
  {
    id: 'supabase_sync',
    title: 'Supabase sync',
    percent: 77,
    previousPercent: 76,
    status: 'in_progress',
    weight: 12,
    summary: 'Supabase имеет staging foundation и теперь локальную Cloud Sync Queue + Conflict Review UI: save/load/apply/rollback/conflict видны как безопасный поток, но реальные writes ещё нельзя включать без проекта и тестов.',
    done: ['Supabase client dependency', 'server guards', 'cloud writes safe-off', 'schema draft v2.32', 'staging readiness model v2.39', 'RLS/security checklist v2.39', 'readiness endpoint without secrets v2.39', 'staging migration draft v2.39', 'Cloud Sync Queue local model v2.40', 'Conflict Review cards v2.40', 'queue action migration draft v2.40', 'Telegram/Supabase readonly preflight panel v2.46', 'Real Data Week readonly staging gate v2.47', 'cloud writes safe-off and conflict review blockers v2.48', 'Final smoke cloud safe-off/conflict gate v2.49', 'RC safe-off cloud gate v2.50', 'invalid localDate rejection and migration readiness path fix v2.52', 'cloud labels synced to current v2.55 state'],
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
    percent: 98,
    previousPercent: 96,
    status: 'usable_local',
    weight: 10,
    summary: 'Private/deploy-safe дисциплина сильная; v2.55 очистил активный MASTER от long-path legacy мусора, nested archives и дубликатов private_raw_data, сохранив legacy как холодный индекс вне deploy-safe.',
    done: ['MASTER vs deploy-safe split', 'local backup/restore', 'reset undo', 'forbidden scan', 'n8n no-secrets dry-run contract', 'Codex audited API/packaging safety sync v2.45', 'preflight hard-stops for Telegram/Supabase v2.46', '7-day real-data backup gate v2.47', 'backup hard-stop in Real Usage Gaps v2.48', 'Final smoke deploy-safe/private hard-stops v2.49', 'RC deploy-safe only gate v2.50', 'redesign did not enable cloud/n8n writes v2.51', 'backup rollback honesty and Telegram request-size guard v2.52', 'deploy-safe symlink hardening v2.52', 'clean MASTER packaging rules v2.55', 'cold legacy archive index v2.55'],
    remaining: ['RLS policies test', 'Vercel env review', 'real n8n credentials vaulting', 'external backup routine', 'payload redaction/consent screen']
  },
  {
    id: 'qa_release',
    title: 'QA и release readiness',
    percent: 99,
    previousPercent: 98,
    status: 'in_progress',
    weight: 6,
    summary: 'Build checks проходят; v2.58 дополнительно убрал видимый сервисный мусор из System/Cloud/Backup/Automation/RC, но настоящий релиз всё ещё требует Telegram phone acceptance и данных за несколько дней.',
    done: ['lint/build/audit scripts', 'Telegram checks panel', 'deployment checklists', 'cloud queue/conflict smoke path v2.40', 'n8n dry-run API smoke path v2.41', 'Local Apply confirm/rollback smoke path v2.42', 'CSV/JSON mapper smoke path v2.43', 'Real Daily Use hardening smoke surface v2.44', 'Daily Save QA v2.45', 'security regression tests from audited Codex sync', 'Telegram/Supabase preflight runbook v2.46', 'Real Data Week Test panel v2.47', 'Real Usage Gaps QA panel v2.48', 'Final Local MVP Smoke panel v2.49', '2 final-smoke regression tests v2.49', 'Release Candidate panel v2.50', 'RC regression tests v2.50', 'Global redesign acceptance panel v2.51', 'global redesign regression tests v2.51', 'senior audit regression tests v2.52', '22 Node tests v2.52', 'metadata freshness regression test v2.55', 'full redesign shell regression test v2.56'],
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
    realisticBuildsLeft: 'примерно 1 реальный phone acceptance pass до сильного local-first MVP: runtime очищен, metadata синхронизированы, полный редизайн встроен, технический текст и видимый мусор убраны, осталось проверить на Telegram/Vercel и закрыть фактические проблемы по скриншотам',
    nextBuild: 'v2.59 — Real Telegram Screenshot Acceptance: загрузить deploy-safe v2.58 в private GitHub/Vercel staging, пройти Проверка Telegram → Неделя → Проблемы → Финал → Дизайн → Копия и закрыть только реальные UI/UX bugs',
    areas,
    criticalPath: [
      'загрузить deploy-safe v2.58 в private GitHub/Vercel staging и пройти Telegram phone acceptance',
      'проверить CSV/JSON mapper на реальных исторических данных и добавить ручную правку mapping где нужно',
      'проверить историю Деньги/Работа по периодам, Daily Save QA и backup на реальных днях',
      'довести Supabase staging до real readonly/load/conflict теста из Telegram, writes включать только после backup/RLS/conflict',
      'прогнать n8n dry-run на реальных локальных агрегатах и не включать внешние calls до private staging',
      'закрывать только реальные screenshot/UI bugs, не ломая locked baseline, v2.56 full redesign и v2.58 deep-declutter pass'
    ],
    nonGoalsNow: [
      'не добавлять новые большие функции после cleanup-текста до real Telegram screenshot acceptance',
      'не включать cloud writes без RLS/backup',
      'не загружать MASTER/private/secrets в GitHub/Vercel',
      'не включать external n8n calls без auth/redaction/private staging'
    ]
  };
}
