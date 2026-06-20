export const MANUAL_CLOUD_TEST_WIZARD_VERSION = 'manual_cloud_test_wizard_v1_90' as const;
export const MANUAL_CLOUD_TEST_WIZARD_STORAGE_KEY = 'finflow.manualCloudTestWizard.v1_90';
export const MANUAL_CLOUD_TEST_WIZARD_LEGACY_STORAGE_KEYS = [
  'finflow.manualCloudTestWizard.v1_88',
  'finflow.manualCloudTestWizard.v1_87',
  'finflow.manualCloudTestWizard.v1_86'
] as const;

export type ManualCloudWizardStepId =
  | 'prepare_env'
  | 'open_telegram_phone'
  | 'run_safe_checks'
  | 'create_test_day_marker'
  | 'create_local_backup'
  | 'manual_save'
  | 'load_preview'
  | 'apply_preview'
  | 'second_session_conflict'
  | 'rls_security_review'
  | 'record_result'
  | 'rollback_cleanup';

export type ManualCloudWizardStepStatus = 'not_started' | 'in_progress' | 'passed' | 'blocked' | 'failed' | 'skipped';

export type ManualCloudWizardStep = {
  id: ManualCloudWizardStepId;
  title: string;
  safetyLevel: 'safe' | 'manual_write' | 'manual_conflict' | 'cleanup';
  description: string;
  successCriteria: string;
  warning?: string;
};

export type ManualCloudWizardProgress = {
  stepId: ManualCloudWizardStepId;
  status: ManualCloudWizardStepStatus;
  note: string;
  updatedAt: string;
};

export type ManualCloudWizardState = {
  schemaVersion: typeof MANUAL_CLOUD_TEST_WIZARD_VERSION;
  progress: ManualCloudWizardProgress[];
  updatedAt: string;
};

export type ManualCloudWizardSummary = {
  total: number;
  passed: number;
  blocked: number;
  failed: number;
  inProgress: number;
  notStarted: number;
  skipped: number;
  percentPassed: number;
  currentStep: ManualCloudWizardStep | null;
  readyForRealData: boolean;
};

export const manualCloudWizardSteps: ManualCloudWizardStep[] = [
  {
    id: 'prepare_env',
    title: 'Prepare private env',
    safetyLevel: 'safe',
    description: 'Проверить, что env-переменные добавлены в hosting/server env, а не в код.',
    successCriteria: '/api/deployment/readiness показывает cloud_ready или конкретные missing-поля без раскрытия секретов.'
  },
  {
    id: 'open_telegram_phone',
    title: 'Open through Telegram phone',
    safetyLevel: 'safe',
    description: 'Открыть FINFlow Mini App через Telegram на телефоне.',
    successCriteria: 'CloudDaySyncPanel видит Telegram initData и не остаётся в local-only режиме.'
  },
  {
    id: 'run_safe_checks',
    title: 'Run safe acceptance checks',
    safetyLevel: 'safe',
    description: 'Запустить safe checks из Deployment Acceptance Runner.',
    successCriteria: 'readiness routes проходят, Telegram verify проходит, cloud read-preview не падает.'
  },
  {
    id: 'create_test_day_marker',
    title: 'Create harmless test marker',
    safetyLevel: 'safe',
    description: 'В локальном дне добавить понятную безопасную заметку/значение для проверки синхронизации.',
    successCriteria: 'Тестовый marker легко увидеть после cloud load/apply.',
    warning: 'Не добавляй банковские raw data, токены или личные документы как тестовый marker.'
  },
  {
    id: 'create_local_backup',
    title: 'Create local backup before cloud write',
    safetyLevel: 'safe',
    description: 'Создать локальный backup текущего дня в блоке Local Backup / Restore.',
    successCriteria: 'В wizard виден backup gate passed и есть latest backup.',
    warning: 'Без backup нельзя отмечать manual save/apply/conflict как passed.'
  },
  {
    id: 'manual_save',
    title: 'Manual save to cloud',
    safetyLevel: 'manual_write',
    description: 'Нажать сохранение в CloudDaySyncPanel вручную.',
    successCriteria: 'Ответ ok=true, revision увеличился, UI показывает saved.',
    warning: 'Это реальная запись в Supabase. Делать только на тестовом/безопасном дне.'
  },
  {
    id: 'load_preview',
    title: 'Load cloud preview',
    safetyLevel: 'safe',
    description: 'Нажать загрузить из облака. Данные должны попасть в preview/pending state, а не примениться автоматически.',
    successCriteria: 'Появляется кнопка применить загруженное; локальные данные ещё не заменены.'
  },
  {
    id: 'apply_preview',
    title: 'Apply loaded preview manually',
    safetyLevel: 'manual_write',
    description: 'Нажать применить загруженное только после проверки preview.',
    successCriteria: 'Локальный день меняется только после ручного подтверждения.'
  },
  {
    id: 'second_session_conflict',
    title: 'Two-session conflict test',
    safetyLevel: 'manual_conflict',
    description: 'Открыть вторую сессию, сохранить новую ревизию, затем попытаться сохранить устаревшую первую.',
    successCriteria: 'Устаревшая сессия получает conflict/409, данные не перезаписываются молча.',
    warning: 'Делать только с тестовым днём и понятным marker.'
  },
  {
    id: 'rls_security_review',
    title: 'RLS / server bridge security review',
    safetyLevel: 'safe',
    description: 'Проверить отсутствие прямого anon/authenticated доступа к профилям и cloud-документам.',
    successCriteria: 'Browser не получает service role; прямые запросы anon/authenticated отклоняются; доступ идёт только через Telegram-validated server bridge.'
  },
  {
    id: 'record_result',
    title: 'Record verification result',
    safetyLevel: 'safe',
    description: 'Отметить результат в checklist и export/handoff report.',
    successCriteria: 'Отчёт можно передать в следующий чат/Codex без секретов.'
  },
  {
    id: 'rollback_cleanup',
    title: 'Rollback / cleanup plan',
    safetyLevel: 'cleanup',
    description: 'Проверить, что можно вернуться в local-first режим и не потерять данные.',
    successCriteria: 'Cloud flags можно выключить; localStorage/day state остаётся доступным.'
  }
];

export function createInitialManualCloudWizardState(now: string = new Date().toISOString()): ManualCloudWizardState {
  return {
    schemaVersion: MANUAL_CLOUD_TEST_WIZARD_VERSION,
    progress: [],
    updatedAt: now
  };
}

export function parseManualCloudWizardState(raw: string | null): ManualCloudWizardState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ManualCloudWizardState & { schemaVersion?: string };
    if (![MANUAL_CLOUD_TEST_WIZARD_VERSION, ...MANUAL_CLOUD_TEST_WIZARD_LEGACY_STORAGE_KEYS.map(key => key.replace('finflow.manualCloudTestWizard.', 'manual_cloud_test_wizard_'))].includes(parsed.schemaVersion ?? '')) return null;
    if (!Array.isArray(parsed.progress)) return null;

    const progressByStep = new Map<ManualCloudWizardStepId, ManualCloudWizardProgress>();
    for (const item of parsed.progress) {
      if (!isProgress(item)) continue;
      progressByStep.set(item.stepId, {
        stepId: item.stepId,
        status: item.status,
        note: sanitizeWizardNote(item.note),
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString()
      });
    }

    return {
      schemaVersion: MANUAL_CLOUD_TEST_WIZARD_VERSION,
      progress: manualCloudWizardSteps
        .map(step => progressByStep.get(step.id))
        .filter((item): item is ManualCloudWizardProgress => Boolean(item)),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function setManualCloudWizardStep(input: {
  state: ManualCloudWizardState;
  stepId: ManualCloudWizardStepId;
  status: ManualCloudWizardStepStatus;
  note?: string;
  now?: string;
}): ManualCloudWizardState {
  const now = input.now ?? new Date().toISOString();
  const existing = input.state.progress.find(item => item.stepId === input.stepId);
  const next: ManualCloudWizardProgress = {
    stepId: input.stepId,
    status: input.status,
    note: sanitizeWizardNote(input.note ?? existing?.note ?? ''),
    updatedAt: now
  };

  return {
    schemaVersion: MANUAL_CLOUD_TEST_WIZARD_VERSION,
    progress: [
      ...input.state.progress.filter(item => item.stepId !== input.stepId),
      next
    ],
    updatedAt: now
  };
}

export function setManualCloudWizardNote(input: {
  state: ManualCloudWizardState;
  stepId: ManualCloudWizardStepId;
  note: string;
  now?: string;
}): ManualCloudWizardState {
  const current = getManualCloudWizardProgress(input.state, input.stepId);
  return setManualCloudWizardStep({
    state: input.state,
    stepId: input.stepId,
    status: current?.status ?? 'not_started',
    note: input.note,
    now: input.now
  });
}

export function getManualCloudWizardProgress(state: ManualCloudWizardState, stepId: ManualCloudWizardStepId) {
  return state.progress.find(item => item.stepId === stepId) ?? null;
}

export function summarizeManualCloudWizard(state: ManualCloudWizardState): ManualCloudWizardSummary {
  const statusByStep = new Map(state.progress.map(item => [item.stepId, item.status]));
  const total = manualCloudWizardSteps.length;
  const passed = manualCloudWizardSteps.filter(step => statusByStep.get(step.id) === 'passed').length;
  const blocked = manualCloudWizardSteps.filter(step => statusByStep.get(step.id) === 'blocked').length;
  const failed = manualCloudWizardSteps.filter(step => statusByStep.get(step.id) === 'failed').length;
  const inProgress = manualCloudWizardSteps.filter(step => statusByStep.get(step.id) === 'in_progress').length;
  const skipped = manualCloudWizardSteps.filter(step => statusByStep.get(step.id) === 'skipped').length;
  const notStarted = Math.max(0, total - passed - blocked - failed - inProgress - skipped);
  const currentStep = manualCloudWizardSteps.find(step => {
    const status = statusByStep.get(step.id) ?? 'not_started';
    return status !== 'passed';
  }) ?? null;

  return {
    total,
    passed,
    blocked,
    failed,
    inProgress,
    notStarted,
    skipped,
    percentPassed: total > 0 ? Math.round((passed / total) * 100) : 0,
    currentStep,
    readyForRealData: passed === total && failed === 0 && blocked === 0 && skipped === 0
  };
}

export function resetManualCloudWizard(now: string = new Date().toISOString()): ManualCloudWizardState {
  return createInitialManualCloudWizardState(now);
}

export function sanitizeWizardNote(value: string) {
  return String(value ?? '')
    .replace(/(service[_-]?role|bot[_-]?token|openai|api[_-]?key|telegram[_-]?bot[_-]?token)/gi, '[secret-name-redacted]')
    .replace(/eyJ[a-zA-Z0-9_\-.]+/g, '[jwt-like-token-redacted]')
    .replace(/[A-Za-z0-9_\-]{40,}/g, '[long-token-redacted]')
    .slice(0, 500);
}

function isProgress(value: unknown): value is ManualCloudWizardProgress {
  if (!value || typeof value !== 'object') return false;
  const item = value as ManualCloudWizardProgress;
  return manualCloudWizardSteps.some(step => step.id === item.stepId)
    && ['not_started', 'in_progress', 'passed', 'blocked', 'failed', 'skipped'].includes(item.status)
    && typeof item.note === 'string';
}
