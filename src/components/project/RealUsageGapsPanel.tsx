'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildRealUsageGapsSnapshot, type RealUsageGap } from '@/lib/project/realUsageGaps';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

export function RealUsageGapsPanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => createInitialDailyHistoryState());
  const [signals, setSignals] = useState(() => readStorageSignals());

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  function refresh() {
    setHistoryState(browserLocalDailyHistoryAdapter.read() ?? createInitialDailyHistoryState());
    setSignals(readStorageSignals());
  }

  const snapshot = useMemo(() => buildRealUsageGapsSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    historyState,
    storage: signals
  }), [props.dayInput, props.records, historyState, signals]);

  const visibleGaps = props.compact ? snapshot.gaps.filter(gap => gap.status !== 'fixed').slice(0, 4) : snapshot.gaps;

  return (
    <section className={`card money-engine-panel real-usage-gaps-panel money-engine-${snapshot.mode === 'blocked' ? 'red' : snapshot.mode === 'staging_ready_local' ? 'green' : 'amber'} ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Проблемы перед запуском</div>
      <h2 className="card-heading">Что мешает пользоваться</h2>
      <p className="card-description">Практические проблемы перед тестовым запуском: записи, история, копия, Telegram и облако без включения записи.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>{snapshot.localDate}</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Blockers" value={String(snapshot.counters.blockers)} mode={snapshot.counters.blockers ? 'red' : 'green'} />
        <Metric label="Открыто" value={String(snapshot.counters.open)} mode={snapshot.counters.open ? 'amber' : 'green'} />
        <Metric label="Реальных записей" value={String(snapshot.counters.realRecords)} mode={snapshot.counters.realRecords ? 'green' : 'amber'} />
        <Metric label="Backup" value={String(snapshot.counters.backupCount)} mode={snapshot.counters.backupCount ? 'green' : 'red'} />
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Gaps</b>
          <span>актуально</span>
        </div>
        {visibleGaps.length ? visibleGaps.map(gap => <GapRow key={gap.id} gap={gap} />) : (
          <article><b>Критичных проблем не видно</b><span>можно переходить к проверке на телефоне</span></article>
        )}
      </div>

      {!props.compact ? (
        <>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Проверка перед запуском</b><span>без облачной записи</span></div>
            {snapshot.stagingChecklist.map(item => <article key={item}><b>{item}</b><span>проверить</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Стоп-факторы</b><span>stop</span></div>
            {snapshot.hardStops.map(item => <article className="danger" key={item}><b>{item}</b><span>blocked</span></article>)}
          </div>
        </>
      ) : null}

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={refresh}>обновить gaps</button>
      </div>
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

function GapRow(props: { gap: RealUsageGap }) {
  const className = props.gap.status === 'blocked' || props.gap.severity === 'critical'
    ? 'danger'
    : props.gap.status === 'watch'
      ? 'watch'
      : props.gap.status === 'fixed'
        ? ''
        : 'watch';
  return (
    <article className={className}>
      <b>{props.gap.title}</b>
      <span>{props.gap.status} · {props.gap.area} · {props.gap.detail}</span>
    </article>
  );
}

function readStorageSignals() {
  const webApp = getTelegramWebApp();
  return {
    backupCount: readBackupCount(),
    importCandidates: readImportCandidateCount(),
    localApplyBatches: readLocalApplyNumber('batches'),
    localApplyRecords: readLocalApplyNumber('records'),
    cloudConflicts: readCloudConflictCount(),
    insideTelegram: Boolean(webApp),
    deploymentReady: undefined,
    supabaseReadonlyReady: undefined,
    supabaseWritesEnabled: false,
    n8nExternalEnabled: false
  };
}

function readBackupCount() {
  try {
    const raw = window.localStorage.getItem('finflow.localBackups.v1_87');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { backups?: unknown[] };
    return Array.isArray(parsed.backups) ? parsed.backups.length : 0;
  } catch {
    return 0;
  }
}

function readImportCandidateCount() {
  try {
    const raw = window.localStorage.getItem('finflow.importReviewQueue.v2_33');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { queue?: { candidates?: unknown[] } };
    return Array.isArray(parsed.queue?.candidates) ? parsed.queue.candidates.length : 0;
  } catch {
    return 0;
  }
}

function readLocalApplyNumber(key: 'records' | 'batches') {
  try {
    const raw = window.localStorage.getItem('finflow.localApply.v2_42');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { records?: unknown[]; batches?: unknown[] };
    const value = parsed[key];
    return Array.isArray(value) ? value.length : 0;
  } catch {
    return 0;
  }
}

function readCloudConflictCount() {
  try {
    const raw = window.localStorage.getItem('finflow.cloudConflictReviews.v2_40');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { conflicts?: unknown[]; reviews?: unknown[] } | unknown[];
    if (Array.isArray(parsed)) return parsed.length;
    if (Array.isArray(parsed.conflicts)) return parsed.conflicts.length;
    if (Array.isArray(parsed.reviews)) return parsed.reviews.length;
    return 0;
  } catch {
    return 0;
  }
}
