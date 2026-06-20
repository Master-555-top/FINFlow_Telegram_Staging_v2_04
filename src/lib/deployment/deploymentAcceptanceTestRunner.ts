export const DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION = 'deployment_acceptance_test_runner_v1_85' as const;
export const DEPLOYMENT_ACCEPTANCE_TEST_STORAGE_KEY = 'finflow.deploymentAcceptanceTests.v1_85';

export type DeploymentAcceptanceTestId =
  | 'deployment_readiness'
  | 'supabase_readiness'
  | 'telegram_verify'
  | 'cloud_read_preview'
  | 'cloud_save_manual'
  | 'cloud_conflict_manual'
  | 'rls_security_manual';

export type DeploymentAcceptanceTestStatus = 'not_run' | 'running' | 'passed' | 'blocked' | 'failed' | 'manual_required';

export type DeploymentAcceptanceTestDefinition = {
  id: DeploymentAcceptanceTestId;
  title: string;
  area: 'deployment' | 'supabase' | 'telegram' | 'cloud_sync' | 'security';
  mode: 'safe_auto' | 'manual_guarded';
  description: string;
  expected: string;
};

export type DeploymentAcceptanceTestResult = {
  id: DeploymentAcceptanceTestId;
  status: DeploymentAcceptanceTestStatus;
  message: string;
  checkedAt: string;
};

export type DeploymentAcceptanceTestState = {
  schemaVersion: typeof DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION;
  results: DeploymentAcceptanceTestResult[];
  updatedAt: string;
};

export type DeploymentAcceptanceTestSummary = {
  total: number;
  passed: number;
  blocked: number;
  failed: number;
  manualRequired: number;
  notRun: number;
  percentPassed: number;
};

export const deploymentAcceptanceTests: DeploymentAcceptanceTestDefinition[] = [
  {
    id: 'deployment_readiness',
    title: 'Deployment readiness route',
    area: 'deployment',
    mode: 'safe_auto',
    description: 'Проверяет server-side readiness без раскрытия секретов.',
    expected: '/api/deployment/readiness returns safe JSON.'
  },
  {
    id: 'supabase_readiness',
    title: 'Supabase readiness route',
    area: 'supabase',
    mode: 'safe_auto',
    description: 'Проверяет Supabase server env/guard status без реальных ключей в ответе.',
    expected: '/api/supabase/readiness returns safe JSON.'
  },
  {
    id: 'telegram_verify',
    title: 'Telegram verify',
    area: 'telegram',
    mode: 'safe_auto',
    description: 'В Telegram Mini App отправляет initData на server-side verification route.',
    expected: '/api/telegram/verify validates initData or safely reports local/blocked mode.'
  },
  {
    id: 'cloud_read_preview',
    title: 'Cloud read preview',
    area: 'cloud_sync',
    mode: 'safe_auto',
    description: 'Безопасно читает облачный день через GET без записи и без автоприменения.',
    expected: '/api/sync/day GET returns record/null or safe disabled response.'
  },
  {
    id: 'cloud_save_manual',
    title: 'Manual cloud save',
    area: 'cloud_sync',
    mode: 'manual_guarded',
    description: 'Сохранение дня должно выполняться только вручную через CloudDaySyncPanel.',
    expected: 'PUT /api/sync/day returns ok=true and revision > 0 after manual confirmation.'
  },
  {
    id: 'cloud_conflict_manual',
    title: 'Manual two-session conflict',
    area: 'cloud_sync',
    mode: 'manual_guarded',
    description: 'Проверка двух сессий должна подтвердить HTTP 409 без silent overwrite.',
    expected: 'Second stale save gets conflict and local data is not silently overwritten.'
  },
  {
    id: 'rls_security_manual',
    title: 'Manual RLS/security review',
    area: 'security',
    mode: 'manual_guarded',
    description: 'Перед реальными банковскими данными нужен отдельный review Supabase policies and server-only bridge.',
    expected: 'No direct client writes with service role; user isolation verified.'
  }
];

export function createInitialDeploymentAcceptanceTestState(now: string = new Date().toISOString()): DeploymentAcceptanceTestState {
  return {
    schemaVersion: DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION,
    results: [],
    updatedAt: now
  };
}

export function parseDeploymentAcceptanceTestState(raw: string | null): DeploymentAcceptanceTestState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DeploymentAcceptanceTestState;
    if (parsed.schemaVersion !== DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION) return null;
    if (!Array.isArray(parsed.results)) return null;

    return {
      schemaVersion: DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION,
      results: parsed.results.filter(isResult).map(result => ({
        id: result.id,
        status: result.status,
        message: sanitizeResultMessage(result.message),
        checkedAt: typeof result.checkedAt === 'string' ? result.checkedAt : new Date().toISOString()
      })),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function setDeploymentAcceptanceTestResult(input: {
  state: DeploymentAcceptanceTestState;
  result: DeploymentAcceptanceTestResult;
  now?: string;
}): DeploymentAcceptanceTestState {
  const now = input.now ?? new Date().toISOString();
  return {
    schemaVersion: DEPLOYMENT_ACCEPTANCE_TEST_RUNNER_VERSION,
    results: [
      ...input.state.results.filter(result => result.id !== input.result.id),
      {
        ...input.result,
        message: sanitizeResultMessage(input.result.message),
        checkedAt: input.result.checkedAt || now
      }
    ],
    updatedAt: now
  };
}

export function getDeploymentAcceptanceTestResult(state: DeploymentAcceptanceTestState, id: DeploymentAcceptanceTestId) {
  return state.results.find(result => result.id === id) ?? null;
}

export function summarizeDeploymentAcceptanceTests(state: DeploymentAcceptanceTestState): DeploymentAcceptanceTestSummary {
  const statusById = new Map(state.results.map(result => [result.id, result.status]));
  const total = deploymentAcceptanceTests.length;
  const passed = deploymentAcceptanceTests.filter(test => statusById.get(test.id) === 'passed').length;
  const blocked = deploymentAcceptanceTests.filter(test => statusById.get(test.id) === 'blocked').length;
  const failed = deploymentAcceptanceTests.filter(test => statusById.get(test.id) === 'failed').length;
  const manualRequired = deploymentAcceptanceTests.filter(test => (statusById.get(test.id) ?? defaultStatus(test)) === 'manual_required').length;
  const notRun = Math.max(0, total - passed - blocked - failed - manualRequired);
  return {
    total,
    passed,
    blocked,
    failed,
    manualRequired,
    notRun,
    percentPassed: total > 0 ? Math.round((passed / total) * 100) : 0
  };
}

export function defaultStatus(test: DeploymentAcceptanceTestDefinition): DeploymentAcceptanceTestStatus {
  return test.mode === 'manual_guarded' ? 'manual_required' : 'not_run';
}

export function sanitizeResultMessage(value: string) {
  return String(value ?? '')
    .replace(/(service[_-]?role|bot[_-]?token|openai|api[_-]?key|telegram[_-]?bot[_-]?token)/gi, '[secret-name-redacted]')
    .replace(/eyJ[a-zA-Z0-9_\-.]+/g, '[jwt-like-token-redacted]')
    .replace(/[A-Za-z0-9_\-]{40,}/g, '[long-token-redacted]')
    .slice(0, 400);
}

function isResult(value: unknown): value is DeploymentAcceptanceTestResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as DeploymentAcceptanceTestResult;
  return typeof result.id === 'string'
    && ['not_run', 'running', 'passed', 'blocked', 'failed', 'manual_required'].includes(result.status)
    && typeof result.message === 'string';
}
