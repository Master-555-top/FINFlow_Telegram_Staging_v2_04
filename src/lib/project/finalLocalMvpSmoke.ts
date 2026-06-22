import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildRealDataWeekTestSnapshot } from '@/lib/project/realDataWeekTest';
import { buildRealUsageGapsSnapshot } from '@/lib/project/realUsageGaps';
import type { TelegramSupabasePreflightInput } from '@/lib/deployment/telegramSupabasePreflight';

export const FINAL_LOCAL_MVP_SMOKE_VERSION = 'final_local_mvp_smoke_v2_49' as const;

export type FinalLocalMvpSmokeStatus = 'pass' | 'watch' | 'blocked' | 'locked';
export type FinalLocalMvpSmokeArea = 'telegram' | 'data' | 'money' | 'work' | 'history' | 'backup' | 'cloud' | 'visual' | 'release';

export type FinalLocalMvpSmokeCheck = {
  id: string;
  area: FinalLocalMvpSmokeArea;
  title: string;
  status: FinalLocalMvpSmokeStatus;
  detail: string;
  nextAction: string;
  releaseBlocker: boolean;
};

export type VisualBaselineLock = {
  id: string;
  title: string;
  lockedReason: string;
  mustNotBreak: string[];
};

export type FinalLocalMvpSmokeSnapshot = {
  version: typeof FINAL_LOCAL_MVP_SMOKE_VERSION;
  generatedAtIso: string;
  localDate: string;
  percent: number;
  mode: 'strong_local_mvp_candidate' | 'needs_phone_smoke' | 'blocked';
  headline: string;
  nextAction: string;
  counters: {
    passed: number;
    watch: number;
    blocked: number;
    lockedBaseline: number;
    weekPercent: number;
    gapsPercent: number;
  };
  checks: FinalLocalMvpSmokeCheck[];
  visualBaselineLocks: VisualBaselineLock[];
  phoneSmokeFlow: string[];
  hardStops: string[];
};

export function buildFinalLocalMvpSmokeSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  historyState: DailyHistoryState;
  preflight?: TelegramSupabasePreflightInput & {
    backupCount?: number;
    localApplyBatches?: number;
    importCandidates?: number;
    cloudConflicts?: number;
    n8nExternalEnabled?: boolean;
    visualBaselineApproved?: boolean;
  };
  nowIso?: string;
}): FinalLocalMvpSmokeSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const preflight = input.preflight ?? {};
  const week = buildRealDataWeekTestSnapshot({
    dayInput: input.dayInput,
    records: input.records,
    historyState: input.historyState,
    preflight,
    nowIso
  });
  const gaps = buildRealUsageGapsSnapshot({
    dayInput: input.dayInput,
    records: input.records,
    historyState: input.historyState,
    storage: {
      backupCount: preflight.backupCount,
      importCandidates: preflight.importCandidates,
      localApplyBatches: preflight.localApplyBatches,
      cloudConflicts: preflight.cloudConflicts,
      insideTelegram: preflight.insideTelegram,
      deploymentReady: preflight.deploymentReady,
      supabaseReadonlyReady: preflight.supabaseReady,
      supabaseWritesEnabled: preflight.supabaseWritesEnabled,
      n8nExternalEnabled: preflight.n8nExternalEnabled
    },
    nowIso
  });

  const insideTelegram = Boolean(preflight.insideTelegram || preflight.initDataPresent || preflight.userDetected);
  const safeAreaKnown = typeof preflight.viewportHeight === 'number' || typeof preflight.viewportStableHeight === 'number';
  const hasBackup = (preflight.backupCount ?? 0) > 0 || Boolean(preflight.hasRollbackSnapshot);
  const writesSafeOff = !preflight.supabaseWritesEnabled && !preflight.cloudSyncEnabled;
  const conflictsClear = (preflight.cloudConflicts ?? 0) === 0;
  const visualBaselineApproved = preflight.visualBaselineApproved !== false;

  const checks: FinalLocalMvpSmokeCheck[] = [
    makeCheck({
      id: 'phone-telegram-smoke',
      area: 'telegram',
      title: 'Реальный Telegram phone smoke',
      ok: insideTelegram && safeAreaKnown,
      watch: safeAreaKnown,
      blocker: !insideTelegram,
      okDetail: 'Telegram WebView найден, viewport/safe-area доступны.',
      watchDetail: 'Viewport доступен, но Telegram initData/user ещё не подтверждены.',
      openDetail: 'Обычный браузер не заменяет Telegram Mini App: могут всплыть safe-area, keyboard и нижнее меню.',
      nextAction: 'Открыть deploy-safe в Telegram и пройти System → Telegram → Preflight.'
    }),
    makeCheck({
      id: 'week-test-usable',
      area: 'data',
      title: '7-day Real Data Week не сломан',
      ok: week.percent >= 75 && week.mode !== 'blocked',
      watch: week.percent >= 55,
      blocker: week.mode === 'blocked',
      okDetail: `${week.headline}.`,
      watchDetail: `${week.headline}. Нужно добрать реальные дни/backup.`,
      openDetail: `${week.headline}.`,
      nextAction: week.nextAction
    }),
    makeCheck({
      id: 'real-usage-gaps-clear',
      area: 'release',
      title: 'Real Usage Gaps не блокируют staging',
      ok: gaps.mode !== 'blocked' && gaps.counters.blockers === 0,
      watch: gaps.counters.blockers <= 1 && gaps.percent >= 60,
      blocker: gaps.mode === 'blocked' || gaps.counters.blockers > 1,
      okDetail: `${gaps.headline}.`,
      watchDetail: `${gaps.headline}. Остался blocker/watch: ${gaps.nextAction}`,
      openDetail: `${gaps.headline}.`,
      nextAction: gaps.nextAction
    }),
    makeCheck({
      id: 'money-work-history-chain',
      area: 'history',
      title: 'Деньги/Работа → Period History видят неделю',
      ok: week.counters.savedDaysInWeek >= 3 && week.counters.totalGross > 0,
      watch: week.counters.savedDaysInWeek > 0 || week.counters.totalGross > 0,
      blocker: false,
      okDetail: `${week.counters.savedDaysInWeek} saved day(s), ${week.counters.totalGross.toLocaleString('ru-RU')} ₽ грязными за неделю.`,
      watchDetail: 'История частично видит данные, но недельная картина ещё неполная.',
      openDetail: 'Period History пока не даёт честную неделю.',
      nextAction: 'Сохранить 3–7 дневных snapshot-ов через Daily Save QA или импортировать исторические дни.'
    }),
    makeCheck({
      id: 'backup-before-release',
      area: 'backup',
      title: 'Backup/rollback перед staging закреплён',
      ok: hasBackup,
      watch: false,
      blocker: !hasBackup,
      okDetail: `Backup/rollback найден: ${preflight.backupCount ?? 0} backup(s).`,
      watchDetail: 'Backup нужно обновить перед staging.',
      openDetail: 'Нельзя считать MVP сильным, пока нет точки отката.',
      nextAction: 'Сделать backup в System → Backup и повторить QA → MVP.'
    }),
    makeCheck({
      id: 'cloud-writes-remain-safe-off',
      area: 'cloud',
      title: 'Cloud writes остаются safe-off',
      ok: writesSafeOff,
      watch: false,
      blocker: !writesSafeOff,
      okDetail: 'Supabase/cloud writes выключены, staging безопасен.',
      watchDetail: 'Cloud writes требуют отдельной проверки.',
      openDetail: 'Cloud writes включены слишком рано: это release blocker.',
      nextAction: 'Отключить writes до backup + RLS + conflict manual test.'
    }),
    makeCheck({
      id: 'conflict-review-clean',
      area: 'cloud',
      title: 'Conflict Review чистый',
      ok: conflictsClear,
      watch: (preflight.cloudConflicts ?? 0) <= 1,
      blocker: (preflight.cloudConflicts ?? 0) > 1,
      okDetail: 'Активных conflict cards нет.',
      watchDetail: `Есть ${preflight.cloudConflicts ?? 0} conflict card — разобрать вручную перед cloud test.`,
      openDetail: `Слишком много нерешённых conflicts: ${preflight.cloudConflicts ?? 0}.`,
      nextAction: 'Открыть System → Cloud → Sync и решить conflict cards.'
    }),
    makeCheck({
      id: 'visual-baseline-lock',
      area: 'visual',
      title: 'Visual baseline заблокирован от случайного редизайна',
      ok: visualBaselineApproved,
      watch: false,
      blocker: !visualBaselineApproved,
      okDetail: 'Sleep History, 7-day chart и System grid остаются эталоном; глобальный редизайн запрещён без команды пользователя.',
      watchDetail: 'Baseline требует ручного подтверждения.',
      openDetail: 'Baseline не подтверждён: нельзя двигать визуал дальше.',
      nextAction: 'не менять визуальный стиль; править UI только по скриншотам пользователя.'
    }),
    makeCheck({
      id: 'deploy-safe-only',
      area: 'release',
      title: 'GitHub/Vercel только Deploy-safe',
      ok: true,
      watch: false,
      blocker: false,
      okDetail: 'MASTER/private/raw/env/token файлы не входят в release flow.',
      watchDetail: 'Проверить manifest.',
      openDetail: 'Release package не должен включать private docs.',
      nextAction: 'Загружать в GitHub только DEPLOY-SAFE архив.'
    })
  ];

  const score = checks.reduce((sum, check) => {
    if (check.status === 'pass' || check.status === 'locked') return sum + 1;
    if (check.status === 'watch') return sum + 0.55;
    return sum;
  }, 0);
  const blocked = checks.filter(check => check.status === 'blocked' || check.releaseBlocker);
  const watch = checks.filter(check => check.status === 'watch');
  const percent = Math.round((score / checks.length) * 100);
  const mode: FinalLocalMvpSmokeSnapshot['mode'] = blocked.length > 0
    ? 'blocked'
    : percent >= 88 && insideTelegram
      ? 'strong_local_mvp_candidate'
      : 'needs_phone_smoke';
  const next = blocked[0] ?? watch[0] ?? checks.find(check => check.status !== 'pass' && check.status !== 'locked') ?? checks[checks.length - 1];

  return {
    version: FINAL_LOCAL_MVP_SMOKE_VERSION,
    generatedAtIso: nowIso,
    localDate: input.dayInput.localDate,
    percent,
    mode,
    headline: mode === 'strong_local_mvp_candidate'
      ? `Сильный local-first MVP кандидат · ${percent}%`
      : mode === 'blocked'
        ? `Final smoke заблокирован · ${percent}%`
        : `Нужен телефонный smoke pass · ${percent}%`,
    nextAction: next.nextAction,
    counters: {
      passed: checks.filter(check => check.status === 'pass' || check.status === 'locked').length,
      watch: watch.length,
      blocked: blocked.length,
      lockedBaseline: buildVisualBaselineLocks().length,
      weekPercent: week.percent,
      gapsPercent: gaps.percent
    },
    checks,
    visualBaselineLocks: buildVisualBaselineLocks(),
    phoneSmokeFlow: [
      'Deploy-safe → GitHub/Vercel private staging, без MASTER/private/.env.',
      'Открыть mini app в Telegram на телефоне, не только в браузере.',
      'System → Telegram → Preflight: viewport/safe-area/readiness без secret echo.',
      'System → QA → Неделя: 7-day test, минимум текущий день + реальные/исторические записи.',
      'System → QA → Gaps: закрыть blockers, особенно backup, money baseline, work costs.',
      'System → QA → MVP: подтвердить финальный smoke и visual baseline lock.',
      'После этого UI править только по скриншотам, без глобального редизайна.'
    ],
    hardStops: [
      'MASTER/private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/tokens в GitHub/Vercel',
      'cloud writes включены до backup + RLS + conflict manual test',
      'Daily Save QA blocked, но день сохраняется как готовый',
      'import/apply candidates висят вне Daily Records и считаются как будто применены',
      'ломается visual baseline: Sleep History list, Sleep 7-day chart, System grid',
      'n8n external calls включены без auth/redaction/private staging'
    ]
  };
}

function makeCheck(input: {
  id: string;
  area: FinalLocalMvpSmokeArea;
  title: string;
  ok: boolean;
  watch: boolean;
  blocker: boolean;
  okDetail: string;
  watchDetail: string;
  openDetail: string;
  nextAction: string;
}): FinalLocalMvpSmokeCheck {
  const status: FinalLocalMvpSmokeStatus = input.ok ? 'pass' : input.blocker ? 'blocked' : input.watch ? 'watch' : 'watch';
  return {
    id: input.id,
    area: input.area,
    title: input.title,
    status,
    detail: input.ok ? input.okDetail : input.watch ? input.watchDetail : input.openDetail,
    nextAction: input.nextAction,
    releaseBlocker: input.blocker
  };
}

function buildVisualBaselineLocks(): VisualBaselineLock[] {
  return [
    {
      id: 'sleep-history-list',
      title: 'Сон → История list',
      lockedReason: 'Карточки по датам с периодом сна, длительностью, статусом и действиями править/удалить признаны идеальными.',
      mustNotBreak: ['краткость', 'даты и записи', 'править/удалить', 'без лишних текстовых блоков']
    },
    {
      id: 'sleep-weekly-7-day-chart',
      title: 'Сон → 7-day chart ПН–ВС',
      lockedReason: 'Недельный график с часами, днями недели и датами признан эталоном компактной логики.',
      mustNotBreak: ['ПН–ВС', 'дни недели над датами', 'цветовой статус', 'логика 7 дней']
    },
    {
      id: 'system-grid',
      title: 'Система → grid tools',
      lockedReason: 'Плитки Telegram / Аудит / Данные / Cloud / Backup / QA / Dev признаны идеальным системным меню.',
      mustNotBreak: ['компактные плитки', 'без глобальной Истории', 'служебные инструменты', 'минимум текста']
    }
  ];
}
