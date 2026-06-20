'use client';

import { useMemo, useState } from 'react';
import { buildTelegramDeviceTestRunbook } from '@/lib/deployment/telegramDeviceTestModel';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

type RuntimeCheckStatus = 'idle' | 'running' | 'passed' | 'failed' | 'expected_safe_fail' | 'skipped';
type DevicePanelView = 'status' | 'checks' | 'safety';

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

const DEVICE_PANEL_VIEWS: { id: DevicePanelView; label: string; caption: string }[] = [
  { id: 'status', label: 'Статус', caption: 'диагностика + запуск' },
  { id: 'checks', label: 'Проверки', caption: 'device / API / cloud' },
  { id: 'safety', label: 'Защита', caption: 'rules + rollback' }
];

export function TelegramDeviceTestPanel() {
  const runbook = useMemo(() => buildTelegramDeviceTestRunbook(), []);
  const [activeView, setActiveView] = useState<DevicePanelView>('status');
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
    setActiveView('status');
    const nextResults: RuntimeCheckResult[] = [];
    const webApp = getTelegramWebApp();
    const initData = webApp?.initData ?? '';
    const today = new Date().toISOString().slice(0, 10);

    nextResults.push({
      id: 'device_bridge',
      title: 'Telegram bridge',
      status: initData ? 'passed' : 'expected_safe_fail',
      detail: initData
        ? 'Telegram WebApp bridge и initData есть.'
        : 'initData нет. Это нормально для обычного браузера; открой Mini App в Telegram.'
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
        detail: 'Пропущено: cloud dry-run требует real Telegram initData header. PUT/write не запускается.'
      });
    }

    setResults(nextResults);
    setRunning(false);
  }

  return (
    <section className="telegram-device-test-panel system-module-panel">
      <div className="deployment-head compact">
        <div>
          <span>v2.10 • Telegram cockpit</span>
          <b>Короткая проверка Mini App</b>
        </div>
        <p>Проверяем Telegram, server verify и безопасный cloud read без лишнего текста.</p>
      </div>

      <div className="system-inner-tabs" role="tablist" aria-label="Telegram test center">
        {DEVICE_PANEL_VIEWS.map(view => (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={activeView === view.id}
            className={`system-inner-tab${activeView === view.id ? ' active' : ''}`}
            onClick={() => setActiveView(view.id)}
          >
            <b>{view.label}</b>
            <small>{view.caption}</small>
          </button>
        ))}
      </div>

      {activeView === 'status' && (
        <div className="system-module-window">
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
              <small>user: <strong>{diagnostics.userDetected ? 'detected safely' : 'not exposed'}</strong></small>
            </div>
            <p>Секреты и raw initData скрыты. Показываем только безопасные признаки.</p>
          </div>

          <div className="telegram-device-actions">
            <button type="button" onClick={refreshDiagnostics}>обновить диагностику</button>
            <button type="button" onClick={runSafeDeviceChecks} disabled={running}>
              {running ? 'проверяю…' : 'запустить safe checks'}
            </button>
          </div>

          {results.length ? (
            <div className="telegram-device-results compact-list">
              <div className="runtime-results-head">
                <b>Результат</b>
                <span>{results.filter(result => result.status === 'passed' || result.status === 'expected_safe_fail').length}/{results.length} ok</span>
              </div>
              {results.map(result => (
                <article className={`telegram-device-result ${result.status}`} key={result.id}>
                  <div className="runtime-result-main">
                    <span>{runtimeLabel(result.status)}</span>
                    <strong title={result.title}>{compactRuntimeTitle(result)}</strong>
                    {result.httpStatus ? <small>HTTP {result.httpStatus}</small> : null}
                  </div>
                  <details className="runtime-result-details">
                    <summary>детали</summary>
                    <p>{result.detail}</p>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="system-empty-hint">
              Нажми safe checks. Запись в облако не запускается.
            </div>
          )}
        </div>
      )}

      {activeView === 'checks' && (
        <div className="system-module-window">
          <ChecklistBlock title="Device" items={runbook.deviceChecks} />
          <ChecklistBlock title="API" items={runbook.apiChecks} />
          <ChecklistBlock title="Cloud dry-run" items={runbook.cloudDryRunChecks} />
        </div>
      )}

      {activeView === 'safety' && (
        <div className="system-module-window">
          <div className="telegram-device-safe-rules">
            <b>Safety rules</b>
            {runbook.safeModeRules.map(rule => <p key={rule}>🛡 {rule}</p>)}
          </div>

          <div className="telegram-staging-next">
            <b>Rollback</b>
            {runbook.rollbackPlan.map(item => <p key={item}>↩ {item}</p>)}
            <strong>Следующий шаг: {runbook.nextStepAfterDeviceTest}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function ChecklistBlock(props: { title: string; items: ReturnType<typeof buildTelegramDeviceTestRunbook>['deviceChecks'] }) {
  return (
    <div className="telegram-device-checklist compact-checklist">
      <div className="compact-checklist-head">
        <b>{props.title}</b>
        <span>{props.items.length} шаг.</span>
      </div>
      {props.items.map(item => (
        <article className={`telegram-device-item ${item.status}`} key={item.id}>
          <div className="compact-check-row">
            <span>{compactItemStatus(item.status)}</span>
            <strong>{item.title}</strong>
          </div>
          <details className="runtime-result-details">
            <summary>подробнее</summary>
            <p>{item.detail}</p>
            <small>Успех: {item.successCriteria}</small>
          </details>
        </article>
      ))}
    </div>
  );
}

function compactItemStatus(status: string) {
  if (status === 'ready') return 'ok';
  if (status === 'blocked') return 'block';
  if (status === 'test_required') return 'test';
  if (status === 'manual_required') return 'manual';
  return status.replace('_', ' ');
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
        detail: `OK · mode=${data.mode ?? 'unknown'} · profile=${Boolean(data.profileReady)}`
      };
    }
    return {
      id: 'verify_api',
      title: '/api/telegram/verify',
      status: 'failed',
      httpStatus: response.status,
      detail: data?.reason ?? data?.error ?? 'verify failed without secret exposure'
    };
  } catch {
    return { id: 'verify_api', title: '/api/telegram/verify', status: 'failed', detail: 'network error during verify check' };
  }
}

async function getJsonCheck(url: string, id: string, title: string): Promise<RuntimeCheckResult> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json().catch(() => null);
    const secretLeak = hasRawSecretLeak(data);
    const ok = response.ok && Boolean(data) && !secretLeak;
    return {
      id,
      title,
      status: ok ? 'passed' : 'failed',
      httpStatus: response.status,
      detail: ok
        ? 'OK · endpoint доступен, raw secret values не показаны.'
        : response.status === 404
          ? 'Route не найден. Проверь, что загружен свежий deploy-safe пакет и Vercel redeploy стал Ready.'
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
      return {
        id: 'cloud_read_dry_run',
        title: 'Cloud read dry-run',
        status: 'passed',
        httpStatus: response.status,
        detail: `GET OK · record=${data?.record ? 'есть' : 'нет'} · без записи.`
      };
    }
    const reason = data?.reason ?? data?.error ?? 'safe_fail';
    return {
      id: 'cloud_read_dry_run',
      title: 'Cloud read dry-run',
      status: reason === 'FINFLOW_ENABLE_CLOUD_SYNC_not_true' ? 'expected_safe_fail' : 'failed',
      httpStatus: response.status,
      detail: `Без записи · reason=${reason}`
    };
  } catch {
    return { id: 'cloud_read_dry_run', title: 'Cloud read dry-run', status: 'failed', detail: 'network error during cloud dry-run' };
  }
}


function compactRuntimeTitle(result: RuntimeCheckResult) {
  if (result.id === 'device_bridge') return 'Telegram';
  if (result.id === 'verify_api') return 'Verify';
  if (result.id === 'deployment_readiness') return 'Deploy';
  if (result.id === 'supabase_readiness') return 'Supabase';
  if (result.id === 'cloud_read_dry_run') return 'Cloud read';
  return result.title;
}

function runtimeLabel(status: RuntimeCheckStatus) {
  if (status === 'passed') return 'ok';
  if (status === 'expected_safe_fail') return 'safe';
  if (status === 'skipped') return 'skipped';
  if (status === 'running') return 'running';
  if (status === 'failed') return 'fail';
  return 'idle';
}
