'use client';

import { useMemo, useState } from 'react';
import { buildTelegramDeviceTestRunbook } from '@/lib/deployment/telegramDeviceTestModel';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

type RuntimeCheckStatus = 'idle' | 'running' | 'passed' | 'failed' | 'expected_safe_fail' | 'skipped';

type RuntimeCheckResult = {
  id: string;
  title: string;
  status: RuntimeCheckStatus;
  detail: string;
  httpStatus?: number;
};

type DeviceDiagnostics = {
  checkedAt: string;
  insideTelegram: boolean;
  initDataPresent: boolean;
  initDataBytes: number;
  userDetected: boolean;
  userId?: number;
  username?: string;
  platform?: string;
  version?: string;
  colorScheme?: string;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
};

export function TelegramDeviceTestPanel() {
  const runbook = useMemo(() => buildTelegramDeviceTestRunbook(), []);
  const [diagnostics, setDiagnostics] = useState<DeviceDiagnostics>(() => collectDiagnostics());
  const [results, setResults] = useState<RuntimeCheckResult[]>([]);
  const [running, setRunning] = useState(false);

  function refreshDiagnostics() {
    const webApp = getTelegramWebApp();
    try {
      webApp?.ready();
      webApp?.expand();
    } catch {
      // Keep diagnostics safe even when Telegram bridge is degraded.
    }
    setDiagnostics(collectDiagnostics());
  }

  async function runSafeDeviceChecks() {
    setRunning(true);
    const nextResults: RuntimeCheckResult[] = [];
    const webApp = getTelegramWebApp();
    const initData = webApp?.initData ?? '';
    const today = new Date().toISOString().slice(0, 10);

    nextResults.push({
      id: 'device_bridge',
      title: 'Telegram device bridge',
      status: initData ? 'passed' : 'expected_safe_fail',
      detail: initData
        ? 'Telegram WebApp bridge и initData обнаружены. Можно проверять server verify.'
        : 'initData отсутствует. Это нормально для обычного браузера; реальный test нужен из Telegram.'
    });
    setResults([...nextResults]);

    if (initData) {
      nextResults.push(await postVerify(initData));
      setResults([...nextResults]);
    } else {
      nextResults.push({
        id: 'verify_api',
        title: '/api/telegram/verify',
        status: 'skipped',
        detail: 'Пропущено: нет real Telegram initData. Не подставляем fake initData, чтобы не создавать ложный успех.'
      });
      setResults([...nextResults]);
    }

    nextResults.push(await getJsonCheck('/api/deployment/readiness', 'deployment_readiness', '/api/deployment/readiness'));
    setResults([...nextResults]);

    nextResults.push(await getJsonCheck('/api/supabase/readiness', 'supabase_readiness', '/api/supabase/readiness'));
    setResults([...nextResults]);

    if (initData) {
      nextResults.push(await cloudReadDryRun(initData, today));
    } else {
      nextResults.push({
        id: 'cloud_read_dry_run',
        title: 'Cloud read dry-run',
        status: 'skipped',
        detail: 'Пропущено: cloud dry-run требует real Telegram initData header. PUT/write в v2.04 не запускается.'
      });
    }

    setResults(nextResults);
    setRunning(false);
  }

  return (
    <section className="telegram-device-test-panel">
      <div className="deployment-head">
        <div>
          <span>v2.04 • Real Telegram Device Test</span>
          <b>initData + viewport + cloud dry-run checklist</b>
        </div>
        <p>{runbook.goal}</p>
      </div>

      <div className="telegram-device-summary-grid">
        <div>
          <span>Telegram ready</span>
          <b>{runbook.readinessBefore}% → {runbook.readinessAfter}%</b>
        </div>
        <div>
          <span>Режим</span>
          <b>{diagnostics.insideTelegram ? 'Telegram Mini App' : 'Browser/local fallback'}</b>
        </div>
        <div>
          <span>initData</span>
          <b>{diagnostics.initDataPresent ? `${diagnostics.initDataBytes} bytes` : 'нет'}</b>
        </div>
      </div>

      <div className="telegram-device-diagnostics">
        <b>Диагностика устройства</b>
        <div className="telegram-device-diagnostics-grid">
          <small>platform: <strong>{diagnostics.platform ?? 'unknown'}</strong></small>
          <small>version: <strong>{diagnostics.version ?? 'unknown'}</strong></small>
          <small>theme: <strong>{diagnostics.colorScheme ?? 'unknown'}</strong></small>
          <small>viewport: <strong>{diagnostics.viewportHeight ?? 0}px / stable {diagnostics.viewportStableHeight ?? 0}px</strong></small>
          <small>expanded: <strong>{String(Boolean(diagnostics.isExpanded))}</strong></small>
          <small>user: <strong>{diagnostics.userDetected ? `id ${diagnostics.userId}${diagnostics.username ? ` / @${diagnostics.username}` : ''}` : 'not exposed'}</strong></small>
        </div>
        <p>Raw initData/hash не выводятся в UI. Панель показывает только безопасные признаки для проверки.</p>
      </div>

      <div className="telegram-device-actions">
        <button type="button" onClick={refreshDiagnostics}>обновить диагностику</button>
        <button type="button" onClick={runSafeDeviceChecks} disabled={running}>
          {running ? 'проверяю…' : 'запустить safe device checks'}
        </button>
      </div>

      <ChecklistBlock title="Device checklist" items={runbook.deviceChecks} />
      <ChecklistBlock title="API checklist" items={runbook.apiChecks} />
      <ChecklistBlock title="Cloud dry-run checklist" items={runbook.cloudDryRunChecks} />

      {results.length ? (
        <div className="telegram-device-results">
          <b>Runtime результаты</b>
          {results.map(result => (
            <article className={`telegram-device-result ${result.status}`} key={result.id}>
              <span>{runtimeLabel(result.status)}</span>
              <strong>{result.title}{result.httpStatus ? ` • HTTP ${result.httpStatus}` : ''}</strong>
              <p>{result.detail}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="telegram-device-safe-rules">
        <b>Safety rules</b>
        {runbook.safeModeRules.map(rule => <p key={rule}>🛡 {rule}</p>)}
      </div>

      <div className="telegram-staging-next">
        <b>Rollback:</b>
        {runbook.rollbackPlan.map(item => <p key={item}>↩ {item}</p>)}
        <strong>Следующий шаг: {runbook.nextStepAfterDeviceTest}</strong>
      </div>
    </section>
  );
}

function ChecklistBlock(props: { title: string; items: ReturnType<typeof buildTelegramDeviceTestRunbook>['deviceChecks'] }) {
  return (
    <div className="telegram-device-checklist">
      <b>{props.title}</b>
      {props.items.map(item => (
        <article className={`telegram-device-item ${item.status}`} key={item.id}>
          <span>{item.status}</span>
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
          <small>Успех: {item.successCriteria}</small>
        </article>
      ))}
    </div>
  );
}

function collectDiagnostics(): DeviceDiagnostics {
  const webApp = getTelegramWebApp();
  const user = webApp?.initDataUnsafe?.user;
  return {
    checkedAt: new Date().toISOString(),
    insideTelegram: Boolean(webApp?.initData),
    initDataPresent: Boolean(webApp?.initData),
    initDataBytes: webApp?.initData ? new Blob([webApp.initData]).size : 0,
    userDetected: Boolean(user?.id),
    userId: user?.id,
    username: user?.username,
    platform: webApp?.platform,
    version: webApp?.version,
    colorScheme: webApp?.colorScheme,
    viewportHeight: webApp?.viewportHeight,
    viewportStableHeight: webApp?.viewportStableHeight,
    isExpanded: webApp?.isExpanded
  };
}

async function postVerify(initData: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch('/api/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.ok) {
      return {
        id: 'verify_api',
        title: '/api/telegram/verify',
        status: 'passed',
        httpStatus: response.status,
        detail: `verify ok; mode=${data.mode ?? 'unknown'}; profileReady=${String(Boolean(data.profileReady))}`
      };
    }
    return {
      id: 'verify_api',
      title: '/api/telegram/verify',
      status: response.status === 401 || data?.reason === 'missing_bot_token' ? 'expected_safe_fail' : 'failed',
      httpStatus: response.status,
      detail: `verify failed safely; reason=${data?.reason ?? 'unknown'}`
    };
  } catch {
    return { id: 'verify_api', title: '/api/telegram/verify', status: 'failed', detail: 'network error during verify check' };
  }
}

async function getJsonCheck(url: string, id: string, title: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json().catch(() => null);
    const secretsSafe = JSON.stringify(data ?? {}).toLowerCase().includes('service_role_key') ? false : data?.safety?.secretsReturned !== true;
    return {
      id,
      title,
      status: response.ok && secretsSafe ? 'passed' : 'failed',
      httpStatus: response.status,
      detail: response.ok && secretsSafe
        ? 'readiness ответ получен; raw secret values не возвращаются.'
        : 'readiness ответ требует проверки: либо HTTP error, либо safety marker подозрительный.'
    };
  } catch {
    return { id, title, status: 'failed', detail: 'network error during readiness check' };
  }
}

async function cloudReadDryRun(initData: string, localDate: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch(`/api/sync/day?localDate=${encodeURIComponent(localDate)}`, {
      method: 'GET',
      headers: { 'x-telegram-init-data': initData }
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.ok) {
      return {
        id: 'cloud_read_dry_run',
        title: 'Cloud read dry-run',
        status: 'passed',
        httpStatus: response.status,
        detail: `GET ok; record=${data.record ? 'found' : 'empty'}; no write executed.`
      };
    }
    return {
      id: 'cloud_read_dry_run',
      title: 'Cloud read dry-run',
      status: data?.reason === 'FINFLOW_ENABLE_CLOUD_SYNC_not_true' ? 'expected_safe_fail' : 'failed',
      httpStatus: response.status,
      detail: `GET finished without write; reason=${data?.reason ?? 'unknown'}`
    };
  } catch {
    return { id: 'cloud_read_dry_run', title: 'Cloud read dry-run', status: 'failed', detail: 'network error during cloud dry-run GET' };
  }
}

function runtimeLabel(status: RuntimeCheckStatus) {
  if (status === 'passed') return 'pass';
  if (status === 'expected_safe_fail') return 'safe fail';
  if (status === 'running') return 'run';
  if (status === 'skipped') return 'skip';
  if (status === 'failed') return 'fail';
  return 'idle';
}
