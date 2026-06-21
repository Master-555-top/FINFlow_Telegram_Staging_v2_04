'use client';

import { useState } from 'react';
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
  platform?: string;
  version?: string;
  colorScheme?: string;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
};

const IDLE_RESULTS: RuntimeCheckResult[] = [
  { id: 'device_bridge', title: 'Telegram bridge', status: 'idle', detail: 'Нажми проверить.' },
  { id: 'verify_api', title: 'Verify', status: 'idle', detail: 'POST /api/telegram/verify.' },
  { id: 'deployment_readiness', title: 'Deploy', status: 'idle', detail: 'GET /api/deployment/readiness.' },
  { id: 'supabase_readiness', title: 'Supabase', status: 'idle', detail: 'Optional endpoint.' },
  { id: 'cloud_read_dry_run', title: 'Cloud read', status: 'idle', detail: 'GET dry-run без записи.' }
];

export function TelegramDeviceTestPanel() {
  const [diagnostics, setDiagnostics] = useState<DeviceDiagnostics>(() => collectDiagnostics());
  const [results, setResults] = useState<RuntimeCheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const visibleResults = results.length ? results : IDLE_RESULTS;
  const okCount = results.filter(result => result.status === 'passed' || result.status === 'expected_safe_fail').length;

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
      title: 'Telegram bridge',
      status: initData ? 'passed' : 'expected_safe_fail',
      detail: initData ? 'Telegram WebApp bridge и initData есть.' : 'initData нет. Открой Mini App в Telegram.'
    });
    setResults([...nextResults]);

    if (initData) {
      nextResults.push(await postVerify(initData));
    } else {
      nextResults.push({ id: 'verify_api', title: 'Verify', status: 'skipped', detail: 'Нет real Telegram initData.' });
    }
    setResults([...nextResults]);

    nextResults.push(await getJsonCheck('/api/deployment/readiness', 'deployment_readiness', 'Deploy'));
    setResults([...nextResults]);

    nextResults.push(await getJsonCheck('/api/supabase/readiness', 'supabase_readiness', 'Supabase'));
    setResults([...nextResults]);

    if (initData) {
      nextResults.push(await cloudReadDryRun(initData, today));
    } else {
      nextResults.push({ id: 'cloud_read_dry_run', title: 'Cloud read', status: 'skipped', detail: 'Cloud dry-run требует real Telegram initData. PUT/write не запускается.' });
    }

    setResults(nextResults);
    setDiagnostics(collectDiagnostics());
    setRunning(false);
  }

  return (
    <section className="telegram-device-compact">
      <div className="device-hero-card">
        <div>
          <span>режим</span>
          <b>{diagnostics.insideTelegram ? 'Telegram Mini App' : 'Browser'}</b>
        </div>
        <i>{diagnostics.initDataPresent ? `${diagnostics.initDataBytes} bytes` : 'no initData'}</i>
      </div>

      <div className="device-mini-grid">
        <div><span>viewport</span><b>{diagnostics.viewportHeight ? `${diagnostics.viewportHeight}px` : '—'}</b></div>
        <div><span>expanded</span><b>{String(Boolean(diagnostics.isExpanded))}</b></div>
        <div><span>user</span><b>{diagnostics.userDetected ? 'safe' : 'hidden'}</b></div>
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={refreshDiagnostics}>обновить</button>
        <button type="button" onClick={runSafeDeviceChecks} disabled={running}>{running ? 'проверяю…' : 'проверить'}</button>
      </div>

      <div className="premium-result-list">
        <div className="premium-result-head">
          <b>Результат</b>
          <span>{results.length ? `${okCount}/${results.length} ok` : 'готово к тесту'}</span>
        </div>
        {visibleResults.map(result => (
          <article className={`premium-result-row ${result.status}`} key={result.id}>
            <span>{runtimeLabel(result.status)}</span>
            <div>
              <b>{compactRuntimeTitle(result)}</b>
              <small>{result.httpStatus ? `HTTP ${result.httpStatus}` : result.status === 'idle' ? 'ожидает' : ''}</small>
            </div>
            <details>
              <summary>детали</summary>
              <p>{result.detail}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
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
        title: 'Verify',
        status: 'passed',
        httpStatus: response.status,
        detail: `OK · mode=${data.mode ?? 'unknown'} · profile=${Boolean(data.profileReady)}`
      };
    }
    return { id: 'verify_api', title: 'Verify', status: 'failed', httpStatus: response.status, detail: data?.reason ?? data?.error ?? 'verify failed without secret exposure' };
  } catch {
    return { id: 'verify_api', title: 'Verify', status: 'failed', detail: 'network error during verify check' };
  }
}

async function getJsonCheck(url: string, id: string, title: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json().catch(() => null);
    const secretLeak = hasRawSecretLeak(data);
    const optionalSupabaseOff = id === 'supabase_readiness' && response.status === 404;
    const ok = response.ok && Boolean(data) && !secretLeak;
    return {
      id,
      title,
      status: ok ? 'passed' : optionalSupabaseOff ? 'expected_safe_fail' : 'failed',
      httpStatus: response.status,
      detail: ok
        ? 'OK · endpoint доступен, raw secret values не показаны.'
        : optionalSupabaseOff
          ? 'Supabase route optional на текущем этапе. Не блокер для Telegram UI.'
          : secretLeak
            ? 'Возможная утечка raw secret value. Нужно остановиться и проверить endpoint.'
            : 'Endpoint ответил, но формат требует проверки.'
    };
  } catch {
    return { id, title, status: 'failed', detail: 'network error during readiness check' };
  }
}

function hasRawSecretLeak(data: unknown) {
  const text = JSON.stringify(data ?? '');
  return /\d{6,}:[A-Za-z0-9_-]{20,}/.test(text)
    || /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(text)
    || /(sk-[A-Za-z0-9_-]{20,})/.test(text);
}

async function cloudReadDryRun(initData: string, localDate: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch(`/api/sync/day?localDate=${encodeURIComponent(localDate)}`, {
      method: 'GET',
      headers: { 'x-telegram-init-data': initData }
    });
    const data = await response.json().catch(() => null);
    if (response.ok) {
      return { id: 'cloud_read_dry_run', title: 'Cloud read', status: 'passed', httpStatus: response.status, detail: `GET OK · record=${data?.record ? 'есть' : 'нет'} · без записи.` };
    }
    const reason = data?.reason ?? data?.error ?? 'safe_fail';
    return { id: 'cloud_read_dry_run', title: 'Cloud read', status: reason === 'FINFLOW_ENABLE_CLOUD_SYNC_not_true' ? 'expected_safe_fail' : 'failed', httpStatus: response.status, detail: `Без записи · reason=${reason}` };
  } catch {
    return { id: 'cloud_read_dry_run', title: 'Cloud read', status: 'failed', detail: 'network error during cloud dry-run' };
  }
}

function compactRuntimeTitle(result: RuntimeCheckResult) {
  if (result.id === 'device_bridge') return 'Telegram bridge';
  return result.title;
}

function runtimeLabel(status: RuntimeCheckStatus) {
  if (status === 'passed') return 'ok';
  if (status === 'expected_safe_fail') return 'safe';
  if (status === 'skipped') return 'skip';
  if (status === 'running') return 'run';
  if (status === 'failed') return 'fail';
  return 'wait';
}
