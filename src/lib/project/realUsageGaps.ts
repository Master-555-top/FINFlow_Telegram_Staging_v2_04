import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { summarizeDailyRecords } from '@/lib/day-core/dailyRecordsModel';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';
import { buildDailyHistoryPeriodSummary, buildDailySaveQaSnapshot, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';

export const REAL_USAGE_GAPS_VERSION = 'real_usage_gaps_v2_48' as const;

export type RealUsageGapArea = 'day' | 'money' | 'work' | 'import' | 'history' | 'backup' | 'telegram' | 'cloud' | 'n8n' | 'qa';
export type RealUsageGapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RealUsageGapStatus = 'fixed' | 'open' | 'watch' | 'blocked';

export type RealUsageGap = {
  id: string;
  area: RealUsageGapArea;
  severity: RealUsageGapSeverity;
  status: RealUsageGapStatus;
  title: string;
  detail: string;
  nextAction: string;
  releaseBlocker: boolean;
};

export type RealUsageGapStorageSignals = {
  backupCount?: number;
  importCandidates?: number;
  localApplyBatches?: number;
  localApplyRecords?: number;
  cloudConflicts?: number;
  insideTelegram?: boolean;
  deploymentReady?: boolean;
  supabaseReadonlyReady?: boolean;
  supabaseWritesEnabled?: boolean;
  n8nExternalEnabled?: boolean;
};

export type RealUsageGapsSnapshot = {
  version: typeof REAL_USAGE_GAPS_VERSION;
  generatedAtIso: string;
  localDate: string;
  percent: number;
  mode: 'staging_ready_local' | 'needs_real_usage_pass' | 'blocked';
  headline: string;
  nextAction: string;
  counters: {
    totalGaps: number;
    blockers: number;
    critical: number;
    open: number;
    watch: number;
    fixed: number;
    realRecords: number;
    weekSavedDays: number;
    backupCount: number;
  };
  gaps: RealUsageGap[];
  stagingChecklist: string[];
  hardStops: string[];
};

export function buildRealUsageGapsSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  historyState: DailyHistoryState;
  storage?: RealUsageGapStorageSignals;
  nowIso?: string;
}): RealUsageGapsSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const recordsSummary = summarizeDailyRecords(input.records);
  const net = calculateDayNet(input.dayInput);
  const weekSummary = buildDailyHistoryPeriodSummary(input.historyState, 'week', input.dayInput.localDate, input.dayInput.taxi.targetNetToday || 8500);
  const saveQa = buildDailySaveQaSnapshot({
    dayInput: input.dayInput,
    net,
    recordsCount: input.records.filter(record => record.enabled).length,
    ordersCount: recordsSummary.ordersCount || input.dayInput.taxi.ordersDone,
    workCosts: recordsSummary.fuelPaid + recordsSummary.driveeTopupPaid,
    personalExpenses: recordsSummary.expensesTotal,
    historyState: input.historyState
  });

  const storage = input.storage ?? {};
  const enabledRecords = input.records.filter(record => record.enabled);
  const realRecords = enabledRecords.filter(record => record.source !== 'derived_from_demo').length;
  const hasOrdersOrGross = recordsSummary.ordersCount > 0 || input.dayInput.taxi.ordersDone > 0 || net.grossDone > 0;
  const hasWorkCosts = recordsSummary.fuelPaid + recordsSummary.driveeTopupPaid + input.dayInput.taxi.fuelAlreadyPaid > 0;
  const hasMoneyBaseline = input.dayInput.money.cash + input.dayInput.money.card + input.dayInput.money.driveeBalance > 0;
  const backupCount = storage.backupCount ?? 0;
  const importCandidates = storage.importCandidates ?? 0;
  const localApplyBatches = storage.localApplyBatches ?? 0;
  const cloudConflicts = storage.cloudConflicts ?? 0;

  const gaps: RealUsageGap[] = [
    gap({
      id: 'real-records-not-demo',
      area: 'day',
      severity: 'critical',
      fixed: realRecords > 0,
      releaseBlocker: realRecords === 0,
      title: 'День должен жить на реальных записях, не на demo-агрегатах',
      fixedDetail: `${realRecords} реальных записей уже есть в Daily Records.`,
      openDetail: 'Сейчас день может выглядеть заполненным за счёт demo-агрегатов из Day Core. Для staging нужно хотя бы несколько manual/import/apply записей.',
      nextAction: 'Добавить реальный заказ/расход вручную или применить import/template через Local Apply.'
    }),
    gap({
      id: 'daily-save-qa-not-blocked',
      area: 'qa',
      severity: 'critical',
      fixed: saveQa.status !== 'blocked',
      releaseBlocker: saveQa.status === 'blocked',
      title: 'Daily Save QA не должен быть blocked',
      fixedDetail: `${saveQa.headline}.`,
      openDetail: `${saveQa.headline}. ${saveQa.nextAction}`,
      nextAction: saveQa.nextAction
    }),
    gap({
      id: 'money-baseline-present',
      area: 'money',
      severity: 'high',
      fixed: hasMoneyBaseline,
      title: 'Нужна live-база денег сейчас',
      fixedDetail: 'Наличные/карта/Drivee введены, свободные деньги считаются реалистичнее.',
      openDetail: 'Без наличных/карты/Drivee свободные деньги и дневной план остаются условными.',
      nextAction: 'Ввести текущие деньги перед сменой или перед сохранением дня.'
    }),
    gap({
      id: 'work-costs-separated',
      area: 'work',
      severity: hasOrdersOrGross ? 'high' : 'medium',
      fixed: !hasOrdersOrGross || hasWorkCosts,
      title: 'Бензин и Drivee должны быть отделены от личных расходов',
      fixedDetail: hasWorkCosts ? 'Рабочие издержки видны отдельно.' : 'Нет оборота — проверка издержек пока не критична.',
      openDetail: 'Есть оборот/заказы, но бензин или Drivee не внесены как рабочие издержки: чистые будут завышены.',
      nextAction: 'Добавить бензин и Drivee как work-cost записи, не как личные траты.'
    }),
    gap({
      id: 'period-history-week-coverage',
      area: 'history',
      severity: 'high',
      fixed: weekSummary.savedDays >= 3,
      releaseBlocker: weekSummary.savedDays === 0,
      title: 'Period History должен видеть хотя бы 3 дня недели',
      fixedDetail: `${weekSummary.label}: ${weekSummary.savedDays} snapshot-ов сохранено.`,
      openDetail: `${weekSummary.label}: сохранено ${weekSummary.savedDays} snapshot-ов. Для честной недели нужно 3–7 дней.`,
      nextAction: 'Сохранять день через Daily Save QA после каждого рабочего дня или импортировать исторические дни.'
    }),
    gap({
      id: 'import-apply-not-hanging',
      area: 'import',
      severity: 'medium',
      fixed: importCandidates === 0 || localApplyBatches > 0,
      title: 'Импорт/шаблоны не должны висеть вне Daily Records',
      fixedDetail: importCandidates === 0 ? 'Нет висящих import candidates.' : `Есть ${localApplyBatches} apply batch для импортов/шаблонов.`,
      openDetail: `Есть ${importCandidates} import candidates, но нет применённого Local Apply batch. Данные могут быть в preview, а не в дне.`,
      nextAction: 'Открыть System → Данные → Apply, выбрать ready drafts, подтвердить запись или отклонить мусор.'
    }),
    gap({
      id: 'backup-before-staging',
      area: 'backup',
      severity: 'critical',
      fixed: backupCount > 0,
      releaseBlocker: backupCount === 0,
      title: 'Перед staging нужен backup/rollback',
      fixedDetail: `Найдено backup-снимков: ${backupCount}.`,
      openDetail: 'Нет локального backup. Нельзя идти к Supabase/cloud-write проверкам без точки отката.',
      nextAction: 'Сделать backup в System → Backup перед cloud/preflight тестами.'
    }),
    gap({
      id: 'telegram-device-context',
      area: 'telegram',
      severity: 'medium',
      fixed: Boolean(storage.insideTelegram),
      title: 'Нужно проверить реальный Telegram WebView',
      fixedDetail: 'Приложение запущено внутри Telegram WebView.',
      openDetail: 'Обычный браузер не показывает все проблемы Telegram viewport/safe-area/keyboard.',
      nextAction: 'Запустить deploy-safe в Telegram Mini App и пройти System → Telegram → Preflight.'
    }),
    gap({
      id: 'cloud-writes-safe-off',
      area: 'cloud',
      severity: 'critical',
      fixed: !storage.supabaseWritesEnabled,
      releaseBlocker: Boolean(storage.supabaseWritesEnabled),
      title: 'Cloud writes должны оставаться safe-off',
      fixedDetail: 'Supabase writes выключены, staging остаётся безопасным.',
      openDetail: 'Обнаружен флаг cloud writes. Это нельзя включать до backup/RLS/conflict тестов.',
      nextAction: 'Отключить writes и пройти RLS/conflict/manual backup test.'
    }),
    gap({
      id: 'conflicts-reviewed',
      area: 'cloud',
      severity: cloudConflicts > 0 ? 'high' : 'low',
      fixed: cloudConflicts === 0,
      title: 'Cloud conflicts не должны оставаться без review',
      fixedDetail: 'Активных conflict cards не найдено.',
      openDetail: `Найдено conflict cards: ${cloudConflicts}. Их нельзя игнорировать перед sync.`,
      nextAction: 'Открыть System → Cloud → Sync и разобрать conflict cards вручную.'
    }),
    gap({
      id: 'n8n-external-off',
      area: 'n8n',
      severity: 'medium',
      fixed: !storage.n8nExternalEnabled,
      title: 'n8n external calls остаются выключены',
      fixedDetail: 'n8n остаётся dry-run/contract mode.',
      openDetail: 'External n8n включён слишком рано: нет private staging/auth/redaction/consent полного цикла.',
      nextAction: 'Вернуть n8n в dry-run до отдельного private staging audit.'
    })
  ];

  const blockers = gaps.filter(item => item.releaseBlocker || item.status === 'blocked');
  const open = gaps.filter(item => item.status === 'open' || item.status === 'blocked');
  const watch = gaps.filter(item => item.status === 'watch');
  const fixed = gaps.filter(item => item.status === 'fixed');
  const critical = gaps.filter(item => item.severity === 'critical' && item.status !== 'fixed');
  const score = gaps.reduce((sum, item) => {
    if (item.status === 'fixed') return sum + 1;
    if (item.status === 'watch') return sum + 0.55;
    return sum;
  }, 0);
  const percent = Math.round((score / gaps.length) * 100);
  const mode: RealUsageGapsSnapshot['mode'] = blockers.length > 0
    ? 'blocked'
    : open.length > 2
      ? 'needs_real_usage_pass'
      : 'staging_ready_local';
  const nextGap = blockers[0] ?? open[0] ?? watch[0] ?? gaps.find(item => item.status === 'fixed');

  return {
    version: REAL_USAGE_GAPS_VERSION,
    generatedAtIso: nowIso,
    localDate: input.dayInput.localDate,
    percent,
    mode,
    headline: mode === 'staging_ready_local'
      ? `Staging pass почти чистый · ${percent}%`
      : mode === 'blocked'
        ? `Есть blockers перед staging · ${percent}%`
        : `Нужно закрыть usage gaps · ${percent}%`,
    nextAction: nextGap?.nextAction ?? 'Закрыть оставшиеся мелкие watch-пункты и переходить к финальной UI-проверке.',
    counters: {
      totalGaps: gaps.length,
      blockers: blockers.length,
      critical: critical.length,
      open: open.length,
      watch: watch.length,
      fixed: fixed.length,
      realRecords,
      weekSavedDays: weekSummary.savedDays,
      backupCount
    },
    gaps,
    stagingChecklist: [
      'Вести 1 реальный день через записи, а не только demo-агрегаты.',
      'Прогнать Daily Save QA и сохранить snapshot дня.',
      'Проверить Period History: неделя / месяц / год для Деньги и Работа.',
      'Сделать local backup перед любым cloud/preflight тестом.',
      'Пройти Telegram → Preflight внутри реального Telegram WebView.',
      'Оставить Supabase writes и external n8n calls выключенными до отдельного audit.'
    ],
    hardStops: [
      'Daily Save QA blocked, но день пытаются сохранить.',
      'Нет backup перед cloud/preflight stage.',
      'Cloud writes включены до RLS/conflict/manual backup test.',
      'Deploy-safe содержит private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/docs/node_modules.',
      'Import/apply данные показаны в preview, но не попали в Daily Records.'
    ]
  };
}

function gap(input: {
  id: string;
  area: RealUsageGapArea;
  severity: RealUsageGapSeverity;
  fixed: boolean;
  title: string;
  fixedDetail: string;
  openDetail: string;
  nextAction: string;
  releaseBlocker?: boolean;
}): RealUsageGap {
  const status: RealUsageGapStatus = input.fixed ? 'fixed' : input.releaseBlocker ? 'blocked' : input.severity === 'low' ? 'watch' : 'open';
  return {
    id: input.id,
    area: input.area,
    severity: input.severity,
    status,
    title: input.title,
    detail: input.fixed ? input.fixedDetail : input.openDetail,
    nextAction: input.nextAction,
    releaseBlocker: Boolean(input.releaseBlocker && !input.fixed)
  };
}
