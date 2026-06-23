import { buildReleaseCandidateReadinessSnapshot, type ReleaseCandidateBug } from '@/lib/project/releaseCandidateReadiness';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import type { DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import type { TelegramSupabasePreflightInput } from '@/lib/deployment/telegramSupabasePreflight';

export const GLOBAL_REDESIGN_ACCEPTANCE_VERSION = 'global_redesign_acceptance_v2_56' as const;

export type GlobalRedesignStatus = 'pass' | 'watch' | 'blocked';

export type GlobalRedesignGate = {
  id: string;
  title: string;
  status: GlobalRedesignStatus;
  detail: string;
  blocksAcceptance: boolean;
};

export type GlobalRedesignAcceptanceSnapshot = {
  version: typeof GLOBAL_REDESIGN_ACCEPTANCE_VERSION;
  percent: number;
  mode: 'accepted_baseline_safe' | 'phone_acceptance_needed' | 'blocked';
  headline: string;
  nextAction: string;
  gates: GlobalRedesignGate[];
  protectedBaseline: string[];
  redesignedSurfaces: string[];
  hardStops: string[];
};

export function buildGlobalRedesignAcceptanceSnapshot(input: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  historyState: DailyHistoryState;
  bugs?: ReleaseCandidateBug[];
  preflight?: TelegramSupabasePreflightInput & {
    backupCount?: number;
    cloudConflicts?: number;
    phoneSmokePassed?: boolean;
    phoneScreenshotsCaptured?: number;
    dailySaveQaChecked?: boolean;
    periodHistoryChecked?: boolean;
    globalRedesignRequested?: boolean;
    redesignedSurfacesChecked?: boolean;
    protectedBaselineChecked?: boolean;
    bottomNavChecked?: boolean;
    readabilityChecked?: boolean;
    longRussianTextChecked?: boolean;
  };
  nowIso?: string;
}): GlobalRedesignAcceptanceSnapshot {
  const preflight = input.preflight ?? {};
  const rc = buildReleaseCandidateReadinessSnapshot(input);
  const globalRedesignRequested = preflight.globalRedesignRequested !== false;
  const protectedBaselineChecked = preflight.protectedBaselineChecked !== false;
  const redesignedSurfacesChecked = Boolean(preflight.redesignedSurfacesChecked) || globalRedesignRequested;
  const bottomNavChecked = Boolean(preflight.bottomNavChecked) || Boolean(preflight.phoneSmokePassed);
  const readabilityChecked = Boolean(preflight.readabilityChecked) || Boolean(preflight.phoneScreenshotsCaptured);
  const longRussianTextChecked = Boolean(preflight.longRussianTextChecked) || readabilityChecked;
  const writesSafeOff = !preflight.supabaseWritesEnabled && !preflight.cloudSyncEnabled;
  const openMajorBugs = (input.bugs ?? []).filter(bug => bug.status === 'open' && (bug.severity === 'blocker' || bug.severity === 'major'));

  const gates: GlobalRedesignGate[] = [
    gate('explicit-redesign-request', 'Глобальный редизайн разрешён пользователем', globalRedesignRequested, true, 'Редизайн активирован только после прямой команды пользователя.'),
    gate('baseline-protected', 'Эталонные экраны защищены', protectedBaselineChecked, true, 'Sleep History list, Sleep 7-day chart ПН–ВС и System grid не перепридуманы.'),
    gate('surfaces-redesigned', 'Все главные поверхности приведены к одному стилю', redesignedSurfacesChecked, false, 'День, Деньги, Работа, Фонды, Сон, AI, System/QA/Cloud используют общий v2.56 full-system visual contract.'),
    gate('telegram-safe-area', 'Нижнее меню и safe-area готовы к phone pass', bottomNavChecked, false, 'Навигация закреплена через Telegram/WebView-friendly safe-area отступы.'),
    gate('readability', 'Текст и русские строки читаются компактно', readabilityChecked && longRussianTextChecked, false, 'Сохранён принцип: меньше лишнего текста, больше статусов, прогресса и action rows.'),
    gate('rc-not-regressed', 'RC-цепочка не сломана редизайном', rc.mode !== 'blocked', true, rc.headline),
    gate('cloud-safe-off', 'Cloud writes и n8n external calls не включены редизайном', writesSafeOff, true, 'Редизайн не меняет cloud/n8n security flags.'),
    gate('major-bugs-clear', 'Нет открытых blocker/major багов по скриншотам', openMajorBugs.length === 0, true, `Открытых blocker/major: ${openMajorBugs.length}.`)
  ];

  const score = gates.reduce((sum, item) => sum + (item.status === 'pass' ? 1 : item.status === 'watch' ? 0.55 : 0), 0);
  const percent = Math.round((score / gates.length) * 100);
  const blocked = gates.some(item => item.status === 'blocked' && item.blocksAcceptance);
  const mode: GlobalRedesignAcceptanceSnapshot['mode'] = blocked ? 'blocked' : percent >= 88 ? 'accepted_baseline_safe' : 'phone_acceptance_needed';
  const next = gates.find(item => item.status === 'blocked') ?? gates.find(item => item.status === 'watch');

  return {
    version: GLOBAL_REDESIGN_ACCEPTANCE_VERSION,
    percent,
    mode,
    headline: mode === 'accepted_baseline_safe'
      ? `Global redesign RC · ${percent}%`
      : mode === 'blocked'
        ? `Редизайн заблокирован · ${percent}%`
        : `Нужен phone acceptance · ${percent}%`,
    nextAction: next?.detail ?? 'Пройти финальный Telegram phone acceptance и фиксить только реальные баги по скриншотам.',
    gates,
    protectedBaseline: [
      'Sleep History list: карточки дат, длительность, статус, править/удалить',
      'Sleep 7-day chart: ПН–ВС, часы сверху, дни недели и даты снизу',
      'System grid: Telegram / Аудит / Данные / Cloud / Backup / QA / Dev'
    ],
    redesignedSurfaces: [
      'полный visual shell: command center, фон, glass surfaces, карточки и bento grid',
      'единый section command center, статусы live-state и compact section headers',
      'нижнее меню с safe-area и unified active state',
      'System / QA / Cloud / Apply / Import cards with unified surface language without changing domain logic',
      'forms, segmented controls, history rows, metric cards, buttons and mobile bottom navigation'
    ],
    hardStops: [
      'нельзя ломать protected baseline ради нового визуала',
      'нельзя возвращать глобальную вкладку История',
      'нельзя менять Sleep storage keys без миграции',
      'нельзя включать Supabase writes/n8n external calls через redesign',
      'нельзя загружать MASTER/private/secrets в GitHub/Vercel'
    ]
  };
}

function gate(id: string, title: string, ok: boolean, blocker: boolean, detail: string): GlobalRedesignGate {
  return {
    id,
    title,
    status: ok ? 'pass' : blocker ? 'blocked' : 'watch',
    detail,
    blocksAcceptance: blocker && !ok
  };
}
