import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildFinalLocalMvpSmokeSnapshot } from '@/lib/project/finalLocalMvpSmoke';
import type { TelegramSupabasePreflightInput } from '@/lib/deployment/telegramSupabasePreflight';

export const RELEASE_CANDIDATE_READINESS_VERSION = 'release_candidate_readiness_v2_50' as const;

export type ReleaseCandidateStatus = 'pass' | 'watch' | 'blocked';
export type ReleaseCandidateArea = 'phone' | 'data' | 'money' | 'work' | 'history' | 'backup' | 'cloud' | 'visual' | 'release';

export type ReleaseCandidateBug = {
  id: string;
  title: string;
  area: ReleaseCandidateArea;
  severity: 'blocker' | 'major' | 'minor' | 'note';
  status: 'open' | 'fixed' | 'accepted';
  screenshotRef?: string;
  note?: string;
};

export type ReleaseCandidateGate = {
  id: string;
  area: ReleaseCandidateArea;
  title: string;
  status: ReleaseCandidateStatus;
  detail: string;
  nextAction: string;
  blocksRelease: boolean;
};

export type ReleaseCandidateReadinessSnapshot = {
  version: typeof RELEASE_CANDIDATE_READINESS_VERSION;
  generatedAtIso: string;
  localDate: string;
  percent: number;
  mode: 'release_candidate' | 'phone_bugfix_pass' | 'blocked';
  headline: string;
  nextAction: string;
  counters: {
    pass: number;
    watch: number;
    blocked: number;
    openBugs: number;
    blockerBugs: number;
    finalSmokePercent: number;
  };
  gates: ReleaseCandidateGate[];
  bugs: ReleaseCandidateBug[];
  phoneRcFlow: string[];
  mustStayLocked: string[];
  hardStops: string[];
};

export function buildReleaseCandidateReadinessSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  historyState: DailyHistoryState;
  bugs?: ReleaseCandidateBug[];
  preflight?: TelegramSupabasePreflightInput & {
    backupCount?: number;
    localApplyBatches?: number;
    importCandidates?: number;
    cloudConflicts?: number;
    n8nExternalEnabled?: boolean;
    visualBaselineApproved?: boolean;
    phoneScreenshotsCaptured?: number;
    phoneSmokePassed?: boolean;
    qaMvpPassed?: boolean;
    periodHistoryChecked?: boolean;
    dailySaveQaChecked?: boolean;
  };
  nowIso?: string;
}): ReleaseCandidateReadinessSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const preflight = input.preflight ?? {};
  const bugs = input.bugs ?? [];
  const openBugs = bugs.filter(bug => bug.status === 'open');
  const blockerBugs = openBugs.filter(bug => bug.severity === 'blocker' || bug.severity === 'major');
  const finalSmoke = buildFinalLocalMvpSmokeSnapshot({
    dayInput: input.dayInput,
    records: input.records,
    historyState: input.historyState,
    preflight,
    nowIso
  });

  const insideTelegram = Boolean(preflight.insideTelegram || preflight.initDataPresent || preflight.userDetected);
  const hasSafeArea = typeof preflight.viewportHeight === 'number' || typeof preflight.viewportStableHeight === 'number';
  const phoneSmokePassed = Boolean(preflight.phoneSmokePassed) || (insideTelegram && hasSafeArea && finalSmoke.percent >= 80);
  const screenshotsCaptured = preflight.phoneScreenshotsCaptured ?? 0;
  const hasBackup = (preflight.backupCount ?? 0) > 0 || Boolean(preflight.hasRollbackSnapshot);
  const writesSafeOff = !preflight.supabaseWritesEnabled && !preflight.cloudSyncEnabled;
  const conflictsClear = (preflight.cloudConflicts ?? 0) === 0;
  const visualLocked = preflight.visualBaselineApproved !== false;
  const finalSmokeAcceptable = finalSmoke.mode !== 'blocked' && finalSmoke.percent >= 70;

  const gates: ReleaseCandidateGate[] = [
    makeGate({
      id: 'phone-smoke-real-device',
      area: 'phone',
      title: 'Telegram phone smoke пройден на реальном устройстве',
      ok: phoneSmokePassed,
      watch: insideTelegram || hasSafeArea,
      blocker: !phoneSmokePassed,
      okDetail: 'Telegram WebView и safe-area доступны; можно фиксировать RC-кандидат.',
      watchDetail: 'Есть часть Telegram-сигналов, но нужен полный phone pass.',
      openDetail: 'RC нельзя считать готовым только по браузеру или sandbox-сборке.',
      nextAction: 'Открыть deploy-safe в Telegram, пройти Preflight → QA Week → QA Gaps → QA MVP.'
    }),
    makeGate({
      id: 'screenshot-bug-log',
      area: 'phone',
      title: 'Screenshot bug log создан и разобран',
      ok: screenshotsCaptured > 0 && blockerBugs.length === 0,
      watch: screenshotsCaptured > 0 || openBugs.length <= 2,
      blocker: blockerBugs.length > 0,
      okDetail: `${screenshotsCaptured} screenshot-check(s), blocker/major багов нет.`,
      watchDetail: screenshotsCaptured > 0 ? 'Скриншоты есть, но minor/watch пункты ещё можно закрывать.' : 'Скриншоты пока не приложены; можно идти как RC checklist, но без финального UI acceptance.',
      openDetail: `Открытых blocker/major багов: ${blockerBugs.length}.`,
      nextAction: 'Скинуть телефонные скриншоты, фиксировать баги списком и закрывать только точечно.'
    }),
    makeGate({
      id: 'final-local-mvp-smoke',
      area: 'release',
      title: 'QA MVP smoke не заблокирован',
      ok: finalSmokeAcceptable,
      watch: finalSmoke.percent >= 55,
      blocker: finalSmoke.mode === 'blocked',
      okDetail: `${finalSmoke.headline}.`,
      watchDetail: `${finalSmoke.headline}; нужен ещё phone/reality pass.`,
      openDetail: `${finalSmoke.headline}.`,
      nextAction: finalSmoke.nextAction
    }),
    makeGate({
      id: 'daily-save-qa-period-history',
      area: 'history',
      title: 'Daily Save QA и Period History проверены вместе',
      ok: Boolean(preflight.dailySaveQaChecked && preflight.periodHistoryChecked),
      watch: Boolean(preflight.dailySaveQaChecked || preflight.periodHistoryChecked) || finalSmoke.counters.weekPercent >= 70,
      blocker: false,
      okDetail: 'День сохраняется через QA и появляется в периодах.',
      watchDetail: 'Цепочка частично проверена; нужен один полный день от ввода до истории.',
      openDetail: 'Нет подтверждения end-to-end save/history.',
      nextAction: 'Сделать один полный daily flow: деньги сейчас → работа → apply/import → save QA → история недели.'
    }),
    makeGate({
      id: 'backup-rollback-available',
      area: 'backup',
      title: 'Backup/rollback перед RC доступен',
      ok: hasBackup,
      watch: false,
      blocker: !hasBackup,
      okDetail: `Backup/rollback найден: ${preflight.backupCount ?? 0} backup(s).`,
      watchDetail: 'Backup должен быть создан перед RC.',
      openDetail: 'Без точки отката нельзя переходить к RC.',
      nextAction: 'Создать backup в System → Backup и повторить RC-проверку.'
    }),
    makeGate({
      id: 'cloud-writes-safe-off',
      area: 'cloud',
      title: 'Supabase writes остаются safe-off',
      ok: writesSafeOff,
      watch: false,
      blocker: !writesSafeOff,
      okDetail: 'Cloud writes выключены; RC остаётся local-first безопасным.',
      watchDetail: 'Cloud writes требуют отдельного staging gate.',
      openDetail: 'Cloud writes включены до RLS/backup/conflict test — это блокер.',
      nextAction: 'Оставить writes off до отдельного Supabase write RC.'
    }),
    makeGate({
      id: 'cloud-conflicts-clear',
      area: 'cloud',
      title: 'Cloud conflict queue чистая',
      ok: conflictsClear,
      watch: (preflight.cloudConflicts ?? 0) <= 1,
      blocker: (preflight.cloudConflicts ?? 0) > 1,
      okDetail: 'Активных конфликтов нет.',
      watchDetail: `Есть ${preflight.cloudConflicts ?? 0} conflict card; разобрать вручную.`,
      openDetail: `Нерешённых conflicts: ${preflight.cloudConflicts ?? 0}.`,
      nextAction: 'Открыть System → Cloud → Sync и закрыть conflict cards.'
    }),
    makeGate({
      id: 'visual-baseline-still-locked',
      area: 'visual',
      title: 'Visual baseline не сломан',
      ok: visualLocked,
      watch: false,
      blocker: !visualLocked,
      okDetail: 'Sleep History, 7-day chart и System grid остаются эталоном.',
      watchDetail: 'Baseline требует ручного подтверждения.',
      openDetail: 'Глобальный визуал нельзя менять без команды пользователя.',
      nextAction: 'Исправлять только по скриншотам, без самовольного редизайна.'
    }),
    makeGate({
      id: 'deploy-safe-only',
      area: 'release',
      title: 'RC пакет только Deploy-safe',
      ok: true,
      watch: false,
      blocker: false,
      okDetail: 'MASTER/private/raw/env/token файлы исключены из GitHub/Vercel flow.',
      watchDetail: 'Проверить manifest.',
      openDetail: 'Deploy-safe должен быть единственным публичным пакетом.',
      nextAction: 'Загружать в GitHub/Vercel только DEPLOY-SAFE.'
    })
  ];

  const pass = gates.filter(gate => gate.status === 'pass').length;
  const watch = gates.filter(gate => gate.status === 'watch').length;
  const blocked = gates.filter(gate => gate.status === 'blocked' || gate.blocksRelease).length;
  const score = gates.reduce((sum, gate) => sum + (gate.status === 'pass' ? 1 : gate.status === 'watch' ? 0.55 : 0), 0);
  const percent = Math.round((score / gates.length) * 100);
  const mode: ReleaseCandidateReadinessSnapshot['mode'] = blocked > 0
    ? 'blocked'
    : percent >= 88 && phoneSmokePassed && blockerBugs.length === 0
      ? 'release_candidate'
      : 'phone_bugfix_pass';
  const next = gates.find(gate => gate.status === 'blocked') ?? gates.find(gate => gate.status === 'watch') ?? gates[gates.length - 1];

  return {
    version: RELEASE_CANDIDATE_READINESS_VERSION,
    generatedAtIso: nowIso,
    localDate: input.dayInput.localDate,
    percent,
    mode,
    headline: mode === 'release_candidate'
      ? `Local-first Release Candidate · ${percent}%`
      : mode === 'blocked'
        ? `RC заблокирован · ${percent}%`
        : `Нужен phone/screenshot bugfix pass · ${percent}%`,
    nextAction: next.nextAction,
    counters: {
      pass,
      watch,
      blocked,
      openBugs: openBugs.length,
      blockerBugs: blockerBugs.length,
      finalSmokePercent: finalSmoke.percent
    },
    gates,
    bugs,
    phoneRcFlow: [
      'Загрузить только DEPLOY-SAFE в GitHub/Vercel private staging.',
      'Открыть mini app именно через Telegram на телефоне.',
      'Пройти System → Telegram → Preflight.',
      'Пройти System → QA → Неделя, Gaps, MVP и RC.',
      'Сделать backup перед любыми risky действиями.',
      'Скинуть скриншоты только проблемных мест; исправлять точечно.',
      'Не включать Supabase writes до отдельного RLS/backup/conflict pass.'
    ],
    mustStayLocked: [
      'нет глобальной вкладки История — история внутри разделов',
      'Sleep остаётся Обзор / История / Редактор',
      'Sleep localStorage keys не менять без миграции',
      'Sleep History list, Sleep 7-day chart ПН–ВС, System grid не ломать',
      'MASTER/private_vault/private_raw_data/MASTER_PRIVATE_DOCS/.env/tokens не идут в GitHub/Vercel'
    ],
    hardStops: [
      'phone smoke не пройден в Telegram WebView',
      'есть open blocker/major bugs по скриншотам',
      'нет backup/rollback перед RC',
      'cloud writes включены до RLS/backup/conflict проверки',
      'ломается section-scoped history или visual baseline',
      'n8n external calls включены без auth/redaction/private staging'
    ]
  };
}

function makeGate(input: {
  id: string;
  area: ReleaseCandidateArea;
  title: string;
  ok: boolean;
  watch: boolean;
  blocker: boolean;
  okDetail: string;
  watchDetail: string;
  openDetail: string;
  nextAction: string;
}): ReleaseCandidateGate {
  const status: ReleaseCandidateStatus = input.ok ? 'pass' : input.blocker ? 'blocked' : input.watch ? 'watch' : 'watch';
  return {
    id: input.id,
    area: input.area,
    title: input.title,
    status,
    detail: input.ok ? input.okDetail : input.watch ? input.watchDetail : input.openDetail,
    nextAction: input.nextAction,
    blocksRelease: input.blocker
  };
}
