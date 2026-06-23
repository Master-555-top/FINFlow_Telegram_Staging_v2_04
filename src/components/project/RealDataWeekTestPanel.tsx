'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildRealDataWeekTestSnapshot, type RealDataWeekTestCheck, type RealDataWeekDay } from '@/lib/project/realDataWeekTest';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

export function RealDataWeekTestPanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => createInitialDailyHistoryState());
  const [probe, setProbe] = useState({
    deploymentSecretsSafe: true,
    hasRollbackSnapshot: false,
    backupCount: 0,
    insideTelegram: false,
    initDataPresent: false,
    userDetected: false,
    viewportHeight: undefined as number | undefined,
    viewportStableHeight: undefined as number | undefined,
    deploymentReady: undefined as boolean | undefined,
    supabaseReady: undefined as boolean | undefined,
    cloudReadDryRunSafe: undefined as boolean | undefined,
    cloudSyncEnabled: false,
    supabaseWritesEnabled: false
  });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setHistoryState(browserLocalDailyHistoryAdapter.read() ?? createInitialDailyHistoryState());
    const webApp = getTelegramWebApp();
    setProbe(prev => ({
      ...prev,
      insideTelegram: Boolean(webApp?.initData),
      initDataPresent: Boolean(webApp?.initData),
      userDetected: Boolean(webApp?.initDataUnsafe?.user?.id),
      viewportHeight: webApp?.viewportHeight,
      viewportStableHeight: webApp?.viewportStableHeight,
      backupCount: readLocalBackupCount(),
      hasRollbackSnapshot: Boolean(readSessionValue('finflow.cloudApplyRollback.v1') || readLocalValue('finflow.localApply.v2_42'))
    }));
  }, []);

  const snapshot = useMemo(() => buildRealDataWeekTestSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    historyState,
    preflight: probe
  }), [props.dayInput, props.records, historyState, probe]);

  const visibleChecks = props.compact ? snapshot.checks.slice(0, 4) : snapshot.checks;

  async function runReadonlyStage() {
    setRunning(true);
    const next = { ...probe, deploymentSecretsSafe: true };
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
      const cloud = await getJson(`/api/sync/day?localDate=${encodeURIComponent(props.dayInput.localDate)}`, { 'x-telegram-init-data': initData });
      next.cloudReadDryRunSafe = Boolean(cloud.ok || cloud.expectedSafeFail);
      next.deploymentSecretsSafe = Boolean(next.deploymentSecretsSafe && !cloud.secretLeak);
    } else {
      next.cloudReadDryRunSafe = false;
    }

    next.backupCount = readLocalBackupCount();
    next.hasRollbackSnapshot = Boolean(readSessionValue('finflow.cloudApplyRollback.v1') || readLocalValue('finflow.localApply.v2_42'));
    setProbe(next);
    setRunning(false);
  }

  return (
    <section className={`card money-engine-panel real-data-week-test-panel money-engine-${snapshot.mode === 'blocked' ? 'red' : snapshot.mode === 'ready_local_week' ? 'green' : 'amber'} ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Проверка недели</div>
      <h2 className="card-heading">Неделя реальных данных</h2>
      <p className="card-description">7 дней: День → Деньги → Работа → Импорт → Проверка дня → История → Копия → Облако без записи.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>{snapshot.weekLabel}</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Реальных дней" value={`${snapshot.counters.realDays}/7`} mode={snapshot.counters.realDays >= 5 ? 'green' : 'amber'} />
        <Metric label="Грязными" value={formatRub(snapshot.counters.totalGross)} mode="green" />
        <Metric label="Чистыми" value={formatRub(snapshot.counters.totalClean)} mode="green" />
        <Metric label="Cloud readonly" value={`${snapshot.counters.supabaseReadonlyPercent}%`} mode={snapshot.readonlyStaging.blockers.length ? 'amber' : 'green'} />
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>ПН–ВС coverage</b>
          <span>{snapshot.counters.savedDaysInWeek} saved</span>
        </div>
        {snapshot.days.map(day => <WeekDayRow key={day.localDate} day={day} />)}
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Проверки недели</b>
          <span>неделя</span>
        </div>
        {visibleChecks.map(check => <CheckRow key={check.id} check={check} />)}
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={runReadonlyStage} disabled={running}>{running ? 'проверяю…' : 'запустить readonly staging'}</button>
      </div>

      {!props.compact ? (
        <>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Runbook</b><span>phone/data first</span></div>
            {snapshot.runbook.map(step => <article key={step}><b>{step}</b><span>проверить</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Стоп-факторы</b><span>stop ship</span></div>
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

function WeekDayRow(props: { day: RealDataWeekDay }) {
  const className = props.day.source === 'generated_placeholder' ? 'watch' : props.day.qaStatus === 'blocked' ? 'danger' : '';
  return (
    <article className={className}>
      <b>{props.day.label} · {props.day.source === 'history' ? 'история' : props.day.source === 'today' ? 'сегодня' : 'нет данных'}</b>
      <span>{props.day.orders} зак · {formatRub(props.day.gross)} / {formatRub(props.day.clean)}</span>
    </article>
  );
}

function CheckRow(props: { check: RealDataWeekTestCheck }) {
  const className = props.check.status === 'blocked' ? 'danger' : props.check.status === 'watch' ? 'watch' : '';
  return (
    <article className={className}>
      <b>{props.check.title}</b>
      <span>{props.check.status} · {props.check.area}</span>
    </article>
  );
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
    || (/service[_-]?role/i.test(text) && /eyJ/.test(text));
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
