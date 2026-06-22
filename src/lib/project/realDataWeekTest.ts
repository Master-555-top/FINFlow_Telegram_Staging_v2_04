import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyHistoryState, DailyHistorySnapshot } from '@/lib/day-core/dailyHistoryModel';
import { buildDailyHistoryPeriodSummary, buildDailySaveQaSnapshot, createDailyHistorySnapshot } from '@/lib/day-core/dailyHistoryModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { summarizeDailyRecords } from '@/lib/day-core/dailyRecordsModel';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';
import { buildTelegramSupabasePreflightReport, type TelegramSupabasePreflightInput } from '@/lib/deployment/telegramSupabasePreflight';

export const REAL_DATA_WEEK_TEST_VERSION = 'real_data_week_test_v2_47' as const;

export type RealDataWeekTestStatus = 'pass' | 'watch' | 'blocked';
export type RealDataWeekTestArea = 'week' | 'money' | 'work' | 'apply' | 'history' | 'backup' | 'cloud' | 'qa';

export type RealDataWeekTestCheck = {
  id: string;
  area: RealDataWeekTestArea;
  title: string;
  status: RealDataWeekTestStatus;
  detail: string;
  nextAction: string;
};

export type RealDataWeekDay = {
  localDate: string;
  label: string;
  source: 'history' | 'today' | 'generated_placeholder';
  gross: number;
  clean: number;
  orders: number;
  freeAfterPlan: number;
  qaStatus: 'ready' | 'review' | 'blocked';
};

export type RealDataWeekTestSnapshot = {
  version: typeof REAL_DATA_WEEK_TEST_VERSION;
  generatedAtIso: string;
  localDate: string;
  percent: number;
  mode: 'ready_local_week' | 'needs_more_real_days' | 'blocked';
  headline: string;
  nextAction: string;
  weekLabel: string;
  days: RealDataWeekDay[];
  counters: {
    savedDaysInWeek: number;
    realDays: number;
    totalGross: number;
    totalClean: number;
    totalOrders: number;
    averageClean: number;
    currentDayQaPercent: number;
    supabaseReadonlyPercent: number;
  };
  checks: RealDataWeekTestCheck[];
  readonlyStaging: {
    percent: number;
    mode: string;
    writeCandidate: boolean;
    blockers: string[];
  };
  runbook: string[];
  hardStops: string[];
};

export function buildRealDataWeekTestSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  historyState: DailyHistoryState;
  preflight?: TelegramSupabasePreflightInput;
  nowIso?: string;
}): RealDataWeekTestSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const net = calculateDayNet(input.dayInput);
  const recordsSummary = summarizeDailyRecords(input.records);
  const weekSummary = buildDailyHistoryPeriodSummary(input.historyState, 'week', input.dayInput.localDate, input.dayInput.taxi.targetNetToday || 8500);
  const currentDayQa = buildDailySaveQaSnapshot({
    dayInput: input.dayInput,
    net,
    recordsCount: input.records.filter(record => record.enabled).length,
    ordersCount: recordsSummary.ordersCount || input.dayInput.taxi.ordersDone,
    workCosts: recordsSummary.fuelPaid + recordsSummary.driveeTopupPaid,
    personalExpenses: recordsSummary.expensesTotal,
    historyState: input.historyState
  });
  const readonlyPreflight = buildTelegramSupabasePreflightReport({
    cloudSyncEnabled: false,
    supabaseWritesEnabled: false,
    ...input.preflight
  });

  const weekDays = buildWeekDays(input.dayInput.localDate, weekSummary.snapshots, input.dayInput, net);
  const realDays = weekDays.filter(day => day.source !== 'generated_placeholder').length;
  const hasEnoughWeekCoverage = realDays >= 5;
  const hasCurrentDaySaveQa = currentDayQa.status !== 'blocked';
  const hasOrdersOrIncome = recordsSummary.ordersCount > 0 || input.dayInput.taxi.ordersDone > 0 || recordsSummary.otherIncomeTotal > 0 || net.grossDone > 0;
  const hasWorkCosts = recordsSummary.fuelPaid + recordsSummary.driveeTopupPaid + input.dayInput.taxi.fuelAlreadyPaid > 0;
  const hasPeriodHistory = weekSummary.savedDays > 0;
  const hasBackupGate = Boolean(input.preflight?.hasRollbackSnapshot || (input.preflight?.backupCount ?? 0) > 0);
  const readonlySafe = readonlyPreflight.checks
    .filter(check => ['deployment_endpoint', 'no_secret_echo', 'supabase_readiness', 'cloud_read_dry_run'].includes(check.id))
    .every(check => check.status === 'pass' || check.status === 'watch' || check.status === 'manual');

  const checks: RealDataWeekTestCheck[] = [
    {
      id: 'week-coverage',
      area: 'week',
      title: '7-дневная неделя собрана',
      status: hasEnoughWeekCoverage ? 'pass' : realDays >= 2 ? 'watch' : 'blocked',
      detail: hasEnoughWeekCoverage
        ? `В текущей неделе есть ${realDays} реальных/сохранённых дней.`
        : `Пока есть ${realDays} реальных/сохранённых дней из 7. Остальные дни являются placeholder для QA.` ,
      nextAction: hasEnoughWeekCoverage ? 'Можно смотреть недельные итоги.' : 'Внести/импортировать ещё дни недели через Save QA или Historical Import.'
    },
    {
      id: 'current-day-save-qa',
      area: 'qa',
      title: 'Текущий день проходит Daily Save QA',
      status: hasCurrentDaySaveQa ? currentDayQa.status === 'ready' ? 'pass' : 'watch' : 'blocked',
      detail: `${currentDayQa.headline}. ${currentDayQa.nextAction}`,
      nextAction: currentDayQa.status === 'ready' ? 'Сохранить snapshot дня и сделать backup.' : currentDayQa.nextAction
    },
    {
      id: 'money-work-linked',
      area: 'money',
      title: 'Деньги и Работа дают живые цифры',
      status: hasOrdersOrIncome ? 'pass' : 'blocked',
      detail: hasOrdersOrIncome
        ? `${recordsSummary.ordersCount || input.dayInput.taxi.ordersDone} заказов / ${Math.max(recordsSummary.taxiGross, net.grossDone).toLocaleString('ru-RU')} ₽ грязными.`
        : 'Нет заказов/доходов: Money/Work week test будет пустым.',
      nextAction: hasOrdersOrIncome ? 'Продолжать вести записи order-level.' : 'Добавить заказ, импорт журнала или доход.'
    },
    {
      id: 'work-costs',
      area: 'work',
      title: 'Бензин/Drivee отделены от личных расходов',
      status: hasWorkCosts ? 'pass' : hasOrdersOrIncome ? 'watch' : 'blocked',
      detail: hasWorkCosts
        ? `Рабочие издержки учтены: ${(recordsSummary.fuelPaid + recordsSummary.driveeTopupPaid + input.dayInput.taxi.fuelAlreadyPaid).toLocaleString('ru-RU')} ₽.`
        : 'Есть оборот, но нет рабочих издержек — чистые будут завышены.',
      nextAction: hasWorkCosts ? 'Проверить категории расходов.' : 'Добавить бензин и Drivee как рабочие издержки.'
    },
    {
      id: 'period-history',
      area: 'history',
      title: 'Period History видит неделю',
      status: hasPeriodHistory ? 'pass' : 'watch',
      detail: hasPeriodHistory
        ? `${weekSummary.label}: ${weekSummary.savedDays} snapshot, ${weekSummary.totalGross.toLocaleString('ru-RU')} ₽ грязными.`
        : 'История недели пока строится только из текущего дня/placeholder.',
      nextAction: hasPeriodHistory ? 'Сравнить Деньги/Работа по периодам.' : 'Сохранить хотя бы один snapshot в историю.'
    },
    {
      id: 'backup-before-cloud',
      area: 'backup',
      title: 'Backup/rollback перед cloud проверен',
      status: hasBackupGate ? 'pass' : 'blocked',
      detail: hasBackupGate ? 'Backup или rollback snapshot найден.' : 'Перед Supabase readonly/write тестами нужен локальный backup.',
      nextAction: hasBackupGate ? 'Можно делать readonly staging checks.' : 'Сделать backup в System → Backup.'
    },
    {
      id: 'supabase-readonly',
      area: 'cloud',
      title: 'Supabase readonly staging без writes',
      status: readonlySafe ? 'pass' : 'watch',
      detail: `${readonlyPreflight.readinessPercent}% preflight, mode=${readonlyPreflight.mode}. Writes остаются ${readonlyPreflight.writeCandidate ? 'candidate' : 'safe-off'}.`,
      nextAction: readonlySafe ? 'Проверить GET/read-only из Telegram.' : 'Запустить Telegram → Preflight и исправить blockers.'
    }
  ];

  const score = checks.reduce((sum, check) => {
    if (check.status === 'pass') return sum + 1;
    if (check.status === 'watch') return sum + 0.55;
    return sum;
  }, 0);
  const blocked = checks.filter(check => check.status === 'blocked');
  const percent = Math.round((score / checks.length) * 100);
  const mode: RealDataWeekTestSnapshot['mode'] = blocked.length > 1
    ? 'blocked'
    : hasEnoughWeekCoverage && currentDayQa.status === 'ready'
      ? 'ready_local_week'
      : 'needs_more_real_days';
  const nextCheck = blocked[0] ?? checks.find(check => check.status === 'watch') ?? checks[checks.length - 1];

  return {
    version: REAL_DATA_WEEK_TEST_VERSION,
    generatedAtIso: nowIso,
    localDate: input.dayInput.localDate,
    percent,
    mode,
    headline: mode === 'ready_local_week'
      ? `Неделя готова к readonly staging · ${percent}%`
      : mode === 'blocked'
        ? `Недельный тест пока заблокирован · ${percent}%`
        : `Нужно добрать реальные дни · ${percent}%`,
    nextAction: nextCheck.nextAction,
    weekLabel: weekSummary.label,
    days: weekDays,
    counters: {
      savedDaysInWeek: weekSummary.savedDays,
      realDays,
      totalGross: weekDays.reduce((sum, day) => sum + day.gross, 0),
      totalClean: weekDays.reduce((sum, day) => sum + day.clean, 0),
      totalOrders: weekDays.reduce((sum, day) => sum + day.orders, 0),
      averageClean: realDays > 0 ? Math.round(weekDays.filter(day => day.source !== 'generated_placeholder').reduce((sum, day) => sum + day.clean, 0) / realDays) : 0,
      currentDayQaPercent: currentDayQa.percent,
      supabaseReadonlyPercent: readonlyPreflight.readinessPercent
    },
    checks,
    readonlyStaging: {
      percent: readonlyPreflight.readinessPercent,
      mode: readonlyPreflight.mode,
      writeCandidate: readonlyPreflight.writeCandidate,
      blockers: readonlyPreflight.checks.filter(check => check.requiredBeforeCloudWrite && check.status !== 'pass').map(check => check.title)
    },
    runbook: [
      'Внести или импортировать реальные данные за каждый день текущей недели: заказы, бензин/Drivee, личные расходы, деньги сейчас.',
      'Прогнать Daily Save QA по дню и сохранить snapshot только после review.',
      'Открыть Period History: неделя / месяц / год и проверить, что Деньги/Работа не теряют записи.',
      'Сделать локальный backup перед любым cloud test.',
      'Запустить Supabase readonly/preflight из Telegram; cloud writes оставить safe-off.',
      'Занести найденные ошибки в Dev/Error log и исправлять отдельными пакетами.'
    ],
    hardStops: [
      'нет backup/rollback перед cloud stage',
      'Period History показывает дубли или потерю Money/Work records',
      'Daily Save QA blocked, но день всё равно пытаются сохранить',
      'Supabase write flags включены до RLS/conflict/manual backup test',
      'deploy-safe содержит private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/docs/node_modules'
    ]
  };
}

function buildWeekDays(localDate: string, snapshots: DailyHistorySnapshot[], dayInput: DayCoreInputModel, net: ReturnType<typeof calculateDayNet>): RealDataWeekDay[] {
  const anchor = parseLocalDate(localDate) ?? new Date();
  const monday = getMonday(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = toLocalIsoDate(date);
    const sameDateSnapshots = snapshots.filter(snapshot => snapshot.localDate === iso);
    const latest = sameDateSnapshots[sameDateSnapshots.length - 1] ?? null;
    if (latest) {
      return {
        localDate: iso,
        label: formatWeekLabel(date),
        source: 'history',
        gross: latest.summary.grossDone,
        clean: latest.summary.shiftClean,
        orders: latest.summary.ordersDone,
        freeAfterPlan: latest.summary.freeAfterPlan,
        qaStatus: 'ready'
      };
    }
    if (iso === dayInput.localDate) {
      return {
        localDate: iso,
        label: formatWeekLabel(date),
        source: 'today',
        gross: net.grossDone,
        clean: net.shiftCleanExpected,
        orders: dayInput.taxi.ordersDone,
        freeAfterPlan: net.realFreeExpectedAfterDayPlan,
        qaStatus: dayInput.status === 'confirmed' ? 'ready' : 'review'
      };
    }
    return {
      localDate: iso,
      label: formatWeekLabel(date),
      source: 'generated_placeholder',
      gross: 0,
      clean: 0,
      orders: 0,
      freeAfterPlan: 0,
      qaStatus: 'blocked'
    };
  });
}

function getMonday(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function parseLocalDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(date: Date) {
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${day}.${month}`;
}
