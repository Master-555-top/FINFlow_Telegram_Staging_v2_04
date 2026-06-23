'use client';

import { useMemo, useState } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';
import { buildTelegramSupabasePreflightReport, type TelegramSupabasePreflightCheck, type TelegramSupabasePreflightInput } from '@/lib/deployment/telegramSupabasePreflight';
import { formatLocalIsoDate } from '@/lib/time/localDate';

type ApiProbe = {
  deploymentReady?: boolean;
  deploymentSecretsSafe?: boolean;
  supabaseReady?: boolean;
  supabaseWritesEnabled?: boolean;
  cloudSyncEnabled?: boolean;
  cloudReadDryRunSafe?: boolean;
};

export function TelegramSupabasePreflightPanel() {
  const [apiProbe, setApiProbe] = useState<ApiProbe>({ deploymentSecretsSafe: true });
  const [running, setRunning] = useState(false);
  const input = useMemo(() => collectPreflightInput(apiProbe), [apiProbe]);
  const report = useMemo(() => buildTelegramSupabasePreflightReport(input), [input]);
  const blockers = report.checks.filter(check => check.requiredBeforeCloudWrite && check.status !== 'pass');

  async function runReadonlyPreflight() {
    setRunning(true);
    const next: ApiProbe = { deploymentSecretsSafe: true };
    const deployment = await getJson('/api/deployment/readiness');
    next.deploymentReady = deployment.ok;
    next.deploymentSecretsSafe = Boolean(next.deploymentSecretsSafe && !deployment.secretLeak);

    const supabase = await getJson('/api/supabase/readiness');
    next.supabaseReady = Boolean(supabase.data?.supabaseServerStatus?.ready || supabase.data?.guard?.hasServiceRoleKey);
    next.supabaseWritesEnabled = Boolean(supabase.data?.supabaseServerStatus?.writesEnabled);
    next.cloudSyncEnabled = Boolean(supabase.data?.supabaseServerStatus?.cloudSyncEnabled);
    next.deploymentSecretsSafe = Boolean(next.deploymentSecretsSafe && !supabase.secretLeak);

    const initData = getTelegramWebApp()?.initData ?? '';
    if (initData) {
      const today = formatLocalIsoDate();
      const cloud = await getJson(`/api/sync/day?localDate=${encodeURIComponent(today)}`, { 'x-telegram-init-data': initData });
      next.cloudReadDryRunSafe = cloud.ok || cloud.expectedSafeFail;
      next.deploymentSecretsSafe = Boolean(next.deploymentSecretsSafe && !cloud.secretLeak);
    } else {
      next.cloudReadDryRunSafe = false;
    }

    setApiProbe(next);
    setRunning(false);
  }

  return (
    <section className="system-data-panel global-backbone-panel telegram-supabase-preflight-panel">
      <div className="system-data-hero">
        <span>v2.46 • Telegram Device QA + Supabase Preflight</span>
        <b>{report.readinessPercent}% preflight</b>
        <p>{report.headline}. Это readonly/device QA: cloud writes не включаются автоматически.</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Preflight gates</b>
          <span>{report.mode}</span>
        </div>
        {report.checks.map(check => <PreflightRow key={check.id} check={check} />)}
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={runReadonlyPreflight} disabled={running}>{running ? 'проверяю…' : 'запустить readonly preflight'}</button>
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>До cloud write нельзя</b>
          <span>{blockers.length ? `${blockers.length} blocker` : 'candidate'}</span>
        </div>
        {(blockers.length ? blockers : report.checks.filter(check => check.requiredBeforeCloudWrite).slice(0, 4)).map(check => (
          <article key={`blocker-${check.id}`} className={check.status === 'blocked' ? 'danger' : check.status === 'watch' ? 'watch' : ''}>
            <b>{check.title}</b>
            <span>{check.status}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Runbook</b>
          <span>phone first</span>
        </div>
        {report.runbook.slice(0, 6).map(step => (
          <article key={step}>
            <b>{step}</b>
            <span>v2.46</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Hard stops</b>
          <span>stop ship</span>
        </div>
        {report.hardStops.slice(0, 5).map(stop => (
          <article key={stop} className="danger">
            <b>{stop}</b>
            <span>blocked</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function PreflightRow(props: { check: TelegramSupabasePreflightCheck }) {
  const className = props.check.status === 'blocked' ? 'danger' : props.check.status === 'watch' ? 'watch' : '';
  return (
    <article className={className}>
      <b>{props.check.title}</b>
      <span>{props.check.status} · {props.check.area}</span>
    </article>
  );
}

function collectPreflightInput(apiProbe: ApiProbe): TelegramSupabasePreflightInput {
  const webApp = getTelegramWebApp();
  return {
    insideTelegram: Boolean(webApp?.initData),
    initDataPresent: Boolean(webApp?.initData),
    viewportHeight: webApp?.viewportHeight,
    viewportStableHeight: webApp?.viewportStableHeight,
    userDetected: Boolean(webApp?.initDataUnsafe?.user?.id),
    backupCount: readLocalBackupCount(),
    hasRollbackSnapshot: Boolean(readSessionValue('finflow.cloudApplyRollback.v1') || readLocalValue('finflow.localApply.v2_42')),
    ...apiProbe
  };
}

async function getJson(url: string, headers?: Record<string, string>) {
  try {
    const response = await fetch(url, { cache: 'no-store', headers });
    const data = await response.json().catch(() => null);
    const secretLeak = hasRawSecretLeak(data);
    const reason = typeof data?.reason === 'string' ? data.reason : typeof data?.error === 'string' ? data.error : '';
    return {
      ok: response.ok && !secretLeak,
      expectedSafeFail: !response.ok && (reason.includes('not_true') || reason.includes('disabled') || reason.includes('not_ready')) && !secretLeak,
      secretLeak,
      data
    };
  } catch {
    return { ok: false, expectedSafeFail: false, secretLeak: false, data: null };
  }
}

function hasRawSecretLeak(data: unknown) {
  const text = JSON.stringify(data ?? '');
  return /\d{6,12}:[A-Za-z0-9_-]{30,}/.test(text)
    || /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(text)
    || /sk-[A-Za-z0-9_-]{20,}/.test(text)
    || /service[_-]?role/i.test(text) && /eyJ/.test(text);
}

function readLocalBackupCount() {
  try {
    const raw = window.localStorage.getItem('finflow.localBackups.v1_87');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { backups?: unknown[] };
    return Array.isArray(parsed.backups) ? parsed.backups.length : 0;
  } catch {
    return 0;
  }
}

function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLocalValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
