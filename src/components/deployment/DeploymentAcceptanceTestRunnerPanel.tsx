'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatLocalDateStartIso } from '@/lib/time/localDate';
import {
  DEPLOYMENT_ACCEPTANCE_TEST_STORAGE_KEY,
  createInitialDeploymentAcceptanceTestState,
  defaultStatus,
  deploymentAcceptanceTests,
  getDeploymentAcceptanceTestResult,
  parseDeploymentAcceptanceTestState,
  setDeploymentAcceptanceTestResult,
  summarizeDeploymentAcceptanceTests,
  type DeploymentAcceptanceTestId,
  type DeploymentAcceptanceTestResult,
  type DeploymentAcceptanceTestState,
  type DeploymentAcceptanceTestStatus
} from '@/lib/deployment/deploymentAcceptanceTestRunner';

export function DeploymentAcceptanceTestRunnerPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<DeploymentAcceptanceTestState>(() => createInitialDeploymentAcceptanceTestState(formatLocalDateStartIso()));
  const [busy, setBusy] = useState(false);
  const summary = useMemo(() => summarizeDeploymentAcceptanceTests(state), [state]);

  useEffect(() => {
    try {
      const parsed = parseDeploymentAcceptanceTestState(window.localStorage.getItem(DEPLOYMENT_ACCEPTANCE_TEST_STORAGE_KEY));
      if (parsed) setState(parsed);
    } catch {
      // Keep safe default.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DEPLOYMENT_ACCEPTANCE_TEST_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  async function runSafeChecks() {
    setBusy(true);
    try {
      await runDeploymentReadiness();
      await runSupabaseReadiness();
      await runTelegramVerify();
      await runCloudReadPreview();
    } finally {
      setBusy(false);
    }
  }

  async function runDeploymentReadiness() {
    await runJsonRoute('deployment_readiness', '/api/deployment/readiness', payload => payload?.cloudReady === true);
  }

  async function runSupabaseReadiness() {
    await runJsonRoute('supabase_readiness', '/api/supabase/readiness', payload => (
      payload?.supabaseServerStatus?.ready === true
      && payload?.supabaseServerStatus?.writesEnabled === true
      && payload?.supabaseServerStatus?.cloudSyncEnabled === true
    ));
  }

  async function runTelegramVerify() {
    const initData = getTelegramInitData();
    if (!initData) {
      record({
        id: 'telegram_verify',
        status: 'blocked',
        message: 'Telegram WebApp initData is missing. Open through Telegram Mini App on phone.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    try {
      recordRunning('telegram_verify');
      const response = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      });
      const payload = await response.json().catch(() => ({}));
      record({
        id: 'telegram_verify',
        status: response.ok && payload?.ok && payload?.profileReady ? 'passed' : 'blocked',
        message: safeMessage(payload?.reason ?? payload?.mode ?? `HTTP_${response.status}`),
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      record({
        id: 'telegram_verify',
        status: 'failed',
        message: safeErrorMessage(error),
        checkedAt: new Date().toISOString()
      });
    }
  }

  async function runCloudReadPreview() {
    const initData = getTelegramInitData();
    if (!initData) {
      record({
        id: 'cloud_read_preview',
        status: 'blocked',
        message: 'Telegram initData missing; cloud read preview requires real Mini App context.',
        checkedAt: new Date().toISOString()
      });
      return;
    }

    try {
      recordRunning('cloud_read_preview');
      const localDate = formatLocalDate(new Date());
      const response = await fetch(`/api/sync/day?localDate=${encodeURIComponent(localDate)}`, {
        method: 'GET',
        headers: { 'x-telegram-init-data': initData },
        cache: 'no-store'
      });
      const payload = await response.json().catch(() => ({}));
      record({
        id: 'cloud_read_preview',
        status: response.ok && payload?.ok ? 'passed' : response.status === 503 ? 'blocked' : 'failed',
        message: safeMessage(payload?.reason ?? (payload?.record ? 'cloud_record_found' : `HTTP_${response.status}`)),
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      record({
        id: 'cloud_read_preview',
        status: 'failed',
        message: safeErrorMessage(error),
        checkedAt: new Date().toISOString()
      });
    }
  }

  async function runJsonRoute(
    id: DeploymentAcceptanceTestId,
    url: string,
    isReady: (payload: any) => boolean
  ) {
    try {
      recordRunning(id);
      const response = await fetch(url, { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      record({
        id,
        status: response.ok && isReady(payload) ? 'passed' : response.status >= 500 || response.ok ? 'blocked' : 'failed',
        message: safeMessage(payload?.mode ?? payload?.reason ?? `HTTP_${response.status}`),
        checkedAt: new Date().toISOString()
      });
    } catch (error) {
      record({
        id,
        status: 'failed',
        message: safeErrorMessage(error),
        checkedAt: new Date().toISOString()
      });
    }
  }

  function markManual(id: DeploymentAcceptanceTestId, status: DeploymentAcceptanceTestStatus) {
    record({
      id,
      status,
      message: status === 'passed' ? 'Marked manually after real controlled test.' : 'Marked manually.',
      checkedAt: new Date().toISOString()
    });
  }

  function resetResults() {
    const confirmed = window.confirm('Сбросить результаты acceptance tests? Это не меняет cloud data.');
    if (!confirmed) return;
    setState(createInitialDeploymentAcceptanceTestState());
  }

  function recordRunning(id: DeploymentAcceptanceTestId) {
    record({
      id,
      status: 'running',
      message: 'Running safe check…',
      checkedAt: new Date().toISOString()
    });
  }

  function record(result: DeploymentAcceptanceTestResult) {
    setState(previous => setDeploymentAcceptanceTestResult({ state: previous, result }));
  }

  return (
    <section className="deployment-acceptance-panel">
      <div className="acceptance-head">
        <span>Прогон публикации</span>
        <b>Acceptance tests</b>
        <p>
          Безопасный runner проверяет readiness routes и read-preview. Cloud save/conflict/RLS остаются ручными, чтобы не было случайной записи или silent overwrite.
        </p>
      </div>

      <div className="acceptance-summary-grid">
        <div><span>Passed</span><b>{summary.passed}/{summary.total}</b></div>
        <div><span>Blocked</span><b>{summary.blocked}</b></div>
        <div><span>Failed</span><b>{summary.failed}</b></div>
        <div><span>Progress</span><b>{summary.percentPassed}%</b></div>
      </div>

      <div className="acceptance-actions">
        <button type="button" disabled={busy} onClick={runSafeChecks}>run safe checks</button>
        <button type="button" onClick={resetResults}>reset results</button>
      </div>

      <div className="acceptance-test-list">
        {deploymentAcceptanceTests.map(test => {
          const result = getDeploymentAcceptanceTestResult(state, test.id);
          const status = result?.status ?? defaultStatus(test);
          return (
            <div className={`acceptance-test ${status}`} key={test.id}>
              <div>
                <b>{test.title}</b>
                <span>{test.area} • {test.mode} • {status}</span>
              </div>
              <p>{test.description}</p>
              <small>{test.expected}</small>
              {result ? <em>{result.message} • {result.checkedAt}</em> : null}
              {test.mode === 'manual_guarded' ? (
                <div className="acceptance-manual-actions">
                  <button type="button" onClick={() => markManual(test.id, 'manual_required')}>manual</button>
                  <button type="button" onClick={() => markManual(test.id, 'passed')}>passed</button>
                  <button type="button" onClick={() => markManual(test.id, 'blocked')}>blocked</button>
                  <button type="button" onClick={() => markManual(test.id, 'failed')}>failed</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getTelegramInitData() {
  return (window as typeof window & {
    Telegram?: { WebApp?: { initData?: string } };
  }).Telegram?.WebApp?.initData ?? '';
}

function safeMessage(value: unknown) {
  return String(value ?? 'ok').replace(/[^a-zA-Z0-9_:\-. ]/g, '_').slice(0, 180);
}

function safeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'unknown_error';
  return safeMessage(error.message);
}

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
