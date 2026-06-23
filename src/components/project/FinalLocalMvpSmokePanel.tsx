'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildFinalLocalMvpSmokeSnapshot, type FinalLocalMvpSmokeCheck } from '@/lib/project/finalLocalMvpSmoke';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

export function FinalLocalMvpSmokePanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => createInitialDailyHistoryState());
  const [probe, setProbe] = useState({
    insideTelegram: false,
    initDataPresent: false,
    userDetected: false,
    viewportHeight: undefined as number | undefined,
    viewportStableHeight: undefined as number | undefined,
    backupCount: 0,
    hasRollbackSnapshot: false,
    localApplyBatches: 0,
    importCandidates: 0,
    cloudConflicts: 0,
    deploymentReady: undefined as boolean | undefined,
    supabaseReady: undefined as boolean | undefined,
    cloudSyncEnabled: false,
    supabaseWritesEnabled: false,
    n8nExternalEnabled: false,
    visualBaselineApproved: true
  });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setHistoryState(browserLocalDailyHistoryAdapter.read() ?? createInitialDailyHistoryState());
    setProbe(prev => ({ ...prev, ...readLocalSmokeSignals() }));
  }, []);

  const snapshot = useMemo(() => buildFinalLocalMvpSmokeSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    historyState,
    preflight: probe
  }), [props.dayInput, props.records, historyState, probe]);

  const visibleChecks = props.compact ? snapshot.checks.slice(0, 5) : snapshot.checks;

  async function runSmoke() {
    setRunning(true);
    const local = readLocalSmokeSignals();
    const next = { ...probe, ...local };
    const deployment = await getJson('/api/deployment/readiness');
    next.deploymentReady = Boolean(deployment.ok && !deployment.secretLeak);

    const supabase = await getJson('/api/supabase/readiness');
    next.supabaseReady = Boolean(supabase.data?.supabaseServerStatus?.ready || supabase.data?.guard?.hasServiceRoleKey);
    next.supabaseWritesEnabled = Boolean(supabase.data?.supabaseServerStatus?.writesEnabled);
    next.cloudSyncEnabled = Boolean(supabase.data?.supabaseServerStatus?.cloudSyncEnabled);
    setProbe(next);
    setRunning(false);
  }

  return (
    <section className={`card money-engine-panel final-local-mvp-smoke-panel money-engine-${snapshot.mode === 'blocked' ? 'red' : snapshot.mode === 'strong_local_mvp_candidate' ? 'green' : 'amber'} ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Финальная проверка</div>
      <h2 className="card-heading">Финальный local-first smoke</h2>
      <p className="card-description">Проверка перед реальным использованием: телефон, история, сохранение, резервная копия и стабильный дизайн.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>готовность</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Pass" value={`${snapshot.counters.passed}`} mode="green" />
        <Metric label="Watch" value={`${snapshot.counters.watch}`} mode={snapshot.counters.watch ? 'amber' : 'green'} />
        <Metric label="Blocked" value={`${snapshot.counters.blocked}`} mode={snapshot.counters.blocked ? 'red' : 'green'} />
        <Metric label="Baseline" value={`${snapshot.counters.lockedBaseline}`} mode="green" />
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head"><b>Smoke checks</b><span>{snapshot.mode}</span></div>
        {visibleChecks.map(check => <CheckRow key={check.id} check={check} />)}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head"><b>Visual baseline lock</b><span>не редизайнить</span></div>
        {snapshot.visualBaselineLocks.map(lock => (
          <article key={lock.id}>
            <b>{lock.title}</b>
            <span>{lock.mustNotBreak.join(' · ')}</span>
          </article>
        ))}
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={runSmoke} disabled={running}>{running ? 'проверяю…' : 'запустить final smoke'}</button>
      </div>

      {!props.compact ? (
        <>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Phone smoke flow</b><span>ручной путь</span></div>
            {snapshot.phoneSmokeFlow.map(step => <article key={step}><b>{step}</b><span>проверить</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Стоп-факторы</b><span>нельзя релизить</span></div>
            {snapshot.hardStops.map(stop => <article key={stop} className="danger"><b>{stop}</b><span>blocked</span></article>)}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Metric(props: { label: string; value: string; mode: 'green' | 'amber' | 'red' }) {
  return (
    <div className={`money-engine-metric metric-${props.mode}`}>
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}

function CheckRow(props: { check: FinalLocalMvpSmokeCheck }) {
  const className = props.check.status === 'blocked' ? 'danger' : props.check.status === 'watch' ? 'watch' : '';
  return (
    <article className={className}>
      <b>{props.check.title}</b>
      <span>{props.check.status} · {props.check.area}</span>
    </article>
  );
}

async function getJson(url: string) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json().catch(() => null);
    const secretLeak = hasRawSecretLeak(data);
    return { ok: response.ok && !secretLeak, secretLeak, data };
  } catch {
    return { ok: false, secretLeak: false, data: null };
  }
}

function readLocalSmokeSignals() {
  const webApp = getTelegramWebApp();
  return {
    insideTelegram: Boolean(webApp?.initData),
    initDataPresent: Boolean(webApp?.initData),
    userDetected: Boolean(webApp?.initDataUnsafe?.user?.id),
    viewportHeight: webApp?.viewportHeight,
    viewportStableHeight: webApp?.viewportStableHeight,
    backupCount: readLocalBackupCount(),
    hasRollbackSnapshot: Boolean(readSessionValue('finflow.cloudApplyRollback.v1') || readLocalValue('finflow.localApply.v2_42')),
    localApplyBatches: readLocalApplyBatchCount(),
    importCandidates: readImportCandidateCount(),
    cloudConflicts: readCloudConflictCount(),
    visualBaselineApproved: true
  };
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

function readLocalApplyBatchCount() {
  try {
    const raw = window.localStorage.getItem('finflow.localApply.v2_42');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { batches?: unknown[] };
    return Array.isArray(parsed.batches) ? parsed.batches.length : 0;
  } catch {
    return 0;
  }
}

function readImportCandidateCount() {
  try {
    const raw = window.localStorage.getItem('finflow.importReviewQueue.v2_33');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { candidates?: unknown[]; items?: unknown[] };
    if (Array.isArray(parsed.candidates)) return parsed.candidates.length;
    return Array.isArray(parsed.items) ? parsed.items.length : 0;
  } catch {
    return 0;
  }
}

function readCloudConflictCount() {
  try {
    const raw = window.localStorage.getItem('finflow.cloudSyncQueue.v2_40');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { conflicts?: unknown[] };
    return Array.isArray(parsed.conflicts) ? parsed.conflicts.length : 0;
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

function hasRawSecretLeak(data: unknown) {
  const text = JSON.stringify(data ?? '');
  return /\d{6,12}:[A-Za-z0-9_-]{30,}/.test(text)
    || /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(text)
    || /sk-[A-Za-z0-9_-]{20,}/.test(text)
    || (/service[_-]?role/i.test(text) && /eyJ/.test(text));
}
