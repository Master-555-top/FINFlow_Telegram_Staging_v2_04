'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildReleaseCandidateReadinessSnapshot, type ReleaseCandidateBug, type ReleaseCandidateGate } from '@/lib/project/releaseCandidateReadiness';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

const RC_STATE_KEY = 'finflow.releaseCandidate.v2_50';

type RcLocalState = {
  phoneSmokePassed: boolean;
  phoneScreenshotsCaptured: number;
  dailySaveQaChecked: boolean;
  periodHistoryChecked: boolean;
  bugs: ReleaseCandidateBug[];
};

const defaultState: RcLocalState = {
  phoneSmokePassed: false,
  phoneScreenshotsCaptured: 0,
  dailySaveQaChecked: false,
  periodHistoryChecked: false,
  bugs: []
};

export function ReleaseCandidatePanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => createInitialDailyHistoryState());
  const [state, setState] = useState<RcLocalState>(defaultState);
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
    setState(readRcState());
    setProbe(prev => ({ ...prev, ...readLocalSignals() }));
  }, []);

  const snapshot = useMemo(() => buildReleaseCandidateReadinessSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    historyState,
    bugs: state.bugs,
    preflight: {
      ...probe,
      phoneSmokePassed: state.phoneSmokePassed,
      phoneScreenshotsCaptured: state.phoneScreenshotsCaptured,
      dailySaveQaChecked: state.dailySaveQaChecked,
      periodHistoryChecked: state.periodHistoryChecked
    }
  }), [props.dayInput, props.records, historyState, probe, state]);

  const visibleGates = props.compact ? snapshot.gates.slice(0, 5) : snapshot.gates;

  async function runRcProbe() {
    setRunning(true);
    const local = readLocalSignals();
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

  function patchState(patch: Partial<RcLocalState>) {
    setState(prev => {
      const next = { ...prev, ...patch };
      saveRcState(next);
      return next;
    });
  }

  function addBug(severity: ReleaseCandidateBug['severity']) {
    const bug: ReleaseCandidateBug = {
      id: `bug-${Date.now()}`,
      title: severity === 'blocker' ? 'Телефонный blocker по скриншоту' : severity === 'major' ? 'Major баг реального использования' : 'Minor/UI watch пункт',
      area: severity === 'minor' ? 'visual' : 'release',
      severity,
      status: 'open',
      note: 'Заполни по скриншоту в чате; исправлять точечно, без глобального редизайна.'
    };
    patchState({ bugs: [bug, ...state.bugs] });
  }

  function closeBug(id: string) {
    patchState({ bugs: state.bugs.map(bug => bug.id === id ? { ...bug, status: 'fixed' } : bug) });
  }

  return (
    <section className={`card money-engine-panel release-candidate-panel money-engine-${snapshot.mode === 'blocked' ? 'red' : snapshot.mode === 'release_candidate' ? 'green' : 'amber'} ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">v2.50 • Release Candidate</div>
      <h2 className="card-heading">Phone bugfix + RC</h2>
      <p className="card-description">Финальный локальный RC-gate: Telegram phone pass, screenshot bug log, Daily Save QA, Period History, backup и safe-off cloud.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>{snapshot.version}</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Pass" value={`${snapshot.counters.pass}`} mode="green" />
        <Metric label="Watch" value={`${snapshot.counters.watch}`} mode={snapshot.counters.watch ? 'amber' : 'green'} />
        <Metric label="Blocked" value={`${snapshot.counters.blocked}`} mode={snapshot.counters.blocked ? 'red' : 'green'} />
        <Metric label="Bugs" value={`${snapshot.counters.openBugs}`} mode={snapshot.counters.blockerBugs ? 'red' : snapshot.counters.openBugs ? 'amber' : 'green'} />
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head"><b>RC gates</b><span>{snapshot.mode}</span></div>
        {visibleGates.map(gate => <GateRow key={gate.id} gate={gate} />)}
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={runRcProbe} disabled={running}>{running ? 'проверяю…' : 'запустить RC probe'}</button>
        <button type="button" onClick={() => patchState({ phoneSmokePassed: true })}>phone pass</button>
        <button type="button" onClick={() => patchState({ dailySaveQaChecked: true, periodHistoryChecked: true })}>save/history ok</button>
        <button type="button" onClick={() => patchState({ phoneScreenshotsCaptured: state.phoneScreenshotsCaptured + 1 })}>+ скрин</button>
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={() => addBug('blocker')}>+ blocker</button>
        <button type="button" onClick={() => addBug('major')}>+ major</button>
        <button type="button" onClick={() => addBug('minor')}>+ minor</button>
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head"><b>Screenshot bug log</b><span>{snapshot.counters.openBugs} open</span></div>
        {snapshot.bugs.length ? snapshot.bugs.slice(0, props.compact ? 3 : 8).map(bug => (
          <article key={bug.id} className={bug.status === 'open' && (bug.severity === 'blocker' || bug.severity === 'major') ? 'danger' : bug.status === 'open' ? 'watch' : ''}>
            <b>{bug.title}</b>
            <span>{bug.status} · {bug.severity} · {bug.area}</span>
            {bug.status === 'open' ? <button type="button" onClick={() => closeBug(bug.id)}>закрыть</button> : null}
          </article>
        )) : <article><b>Багов по скриншотам пока нет</b><span>добавлять только реальные phone issues</span></article>}
      </div>

      {!props.compact ? (
        <>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Phone RC flow</b><span>ручной путь</span></div>
            {snapshot.phoneRcFlow.map(step => <article key={step}><b>{step}</b><span>v2.50</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Locked baseline</b><span>не ломать</span></div>
            {snapshot.mustStayLocked.map(item => <article key={item}><b>{item}</b><span>locked</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Hard stops</b><span>blocked</span></div>
            {snapshot.hardStops.map(stop => <article key={stop} className="danger"><b>{stop}</b><span>release stop</span></article>)}
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

function GateRow(props: { gate: ReleaseCandidateGate }) {
  const className = props.gate.status === 'blocked' ? 'danger' : props.gate.status === 'watch' ? 'watch' : '';
  return (
    <article className={className}>
      <b>{props.gate.title}</b>
      <span>{props.gate.status} · {props.gate.area}</span>
    </article>
  );
}

function readRcState(): RcLocalState {
  try {
    const raw = window.localStorage.getItem(RC_STATE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<RcLocalState>;
    return {
      phoneSmokePassed: Boolean(parsed.phoneSmokePassed),
      phoneScreenshotsCaptured: Number(parsed.phoneScreenshotsCaptured ?? 0),
      dailySaveQaChecked: Boolean(parsed.dailySaveQaChecked),
      periodHistoryChecked: Boolean(parsed.periodHistoryChecked),
      bugs: Array.isArray(parsed.bugs) ? parsed.bugs : []
    };
  } catch {
    return defaultState;
  }
}

function saveRcState(state: RcLocalState) {
  try {
    window.localStorage.setItem(RC_STATE_KEY, JSON.stringify(state));
  } catch {
    // local-only convenience state; the RC engine remains functional without it.
  }
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

function readLocalSignals() {
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
