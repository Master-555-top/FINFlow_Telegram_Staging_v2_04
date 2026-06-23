'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { browserLocalDailyHistoryAdapter, createInitialDailyHistoryState, type DailyHistoryState } from '@/lib/day-core/dailyHistoryModel';
import { buildGlobalRedesignAcceptanceSnapshot, type GlobalRedesignGate } from '@/lib/project/globalRedesignAcceptance';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

const REDESIGN_STATE_KEY = 'finflow.globalRedesign.v2_56';

type LocalRedesignState = {
  redesignedSurfacesChecked: boolean;
  protectedBaselineChecked: boolean;
  bottomNavChecked: boolean;
  readabilityChecked: boolean;
  longRussianTextChecked: boolean;
  phoneScreenshotsCaptured: number;
  phoneSmokePassed: boolean;
};

const defaultState: LocalRedesignState = {
  redesignedSurfacesChecked: true,
  protectedBaselineChecked: true,
  bottomNavChecked: false,
  readabilityChecked: false,
  longRussianTextChecked: false,
  phoneScreenshotsCaptured: 0,
  phoneSmokePassed: false
};

export function GlobalRedesignAcceptancePanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const [historyState, setHistoryState] = useState<DailyHistoryState>(() => createInitialDailyHistoryState());
  const [state, setState] = useState<LocalRedesignState>(defaultState);

  useEffect(() => {
    setHistoryState(browserLocalDailyHistoryAdapter.read() ?? createInitialDailyHistoryState());
    setState(readState());
  }, []);

  const snapshot = useMemo(() => buildGlobalRedesignAcceptanceSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    historyState,
    preflight: {
      ...readTelegramSignals(),
      globalRedesignRequested: true,
      redesignedSurfacesChecked: state.redesignedSurfacesChecked,
      protectedBaselineChecked: state.protectedBaselineChecked,
      bottomNavChecked: state.bottomNavChecked,
      readabilityChecked: state.readabilityChecked,
      longRussianTextChecked: state.longRussianTextChecked,
      phoneScreenshotsCaptured: state.phoneScreenshotsCaptured,
      phoneSmokePassed: state.phoneSmokePassed,
      supabaseWritesEnabled: false,
      cloudSyncEnabled: false,
      cloudConflicts: 0,
      backupCount: readBackupCount()
    }
  }), [props.dayInput, props.records, historyState, state]);

  function patch(patchValue: Partial<LocalRedesignState>) {
    setState(prev => {
      const next = { ...prev, ...patchValue };
      saveState(next);
      return next;
    });
  }

  const gates = props.compact ? snapshot.gates.slice(0, 5) : snapshot.gates;

  return (
    <section className={`card money-engine-panel global-redesign-panel money-engine-${snapshot.mode === 'blocked' ? 'red' : snapshot.mode === 'accepted_baseline_safe' ? 'green' : 'amber'}`}>
      <div className="section-kicker">Дизайн</div>
      <h2 className="card-heading">Дизайн и проверка на телефоне</h2>
      <p className="card-description">Внешний вид обновлён, но логика денег, работы, сна и сохранения не меняется.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>проверка</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="telegram-device-actions premium-actions">
        <button type="button" onClick={() => patch({ phoneSmokePassed: true, bottomNavChecked: true })}>проверил на телефоне</button>
        <button type="button" onClick={() => patch({ readabilityChecked: true, longRussianTextChecked: true })}>текст понятный</button>
        <button type="button" onClick={() => patch({ phoneScreenshotsCaptured: state.phoneScreenshotsCaptured + 1 })}>+ скриншот</button>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head"><b>Проверка дизайна</b><span>{snapshot.mode}</span></div>
        {gates.map(gate => <GateRow key={gate.id} gate={gate} />)}
      </div>

      {!props.compact ? (
        <>
          <div className="system-data-preview compact redesign-baseline-lock">
            <div className="system-data-preview-head"><b>Что нельзя ломать</b><span>locked</span></div>
            {snapshot.protectedBaseline.map(item => <article key={item}><b>{item}</b><span>не ломать</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Обновлённые экраны</b><span>новый стиль</span></div>
            {snapshot.redesignedSurfaces.map(item => <article key={item}><b>{item}</b><span>единый стиль</span></article>)}
          </div>
          <div className="system-data-preview compact">
            <div className="system-data-preview-head"><b>Стоп-факторы</b><span>security</span></div>
            {snapshot.hardStops.map(stop => <article key={stop} className="danger"><b>{stop}</b><span>stop</span></article>)}
          </div>
        </>
      ) : null}
    </section>
  );
}

function GateRow(props: { gate: GlobalRedesignGate }) {
  const className = props.gate.status === 'blocked' ? 'danger' : props.gate.status === 'watch' ? 'watch' : '';
  return <article className={className}><b>{props.gate.title}</b><span>{props.gate.status}</span></article>;
}

function readTelegramSignals() {
  const webApp = getTelegramWebApp();
  return {
    insideTelegram: Boolean(webApp?.initData),
    initDataPresent: Boolean(webApp?.initData),
    userDetected: Boolean(webApp?.initDataUnsafe?.user?.id),
    viewportHeight: webApp?.viewportHeight,
    viewportStableHeight: webApp?.viewportStableHeight
  };
}

function readBackupCount() {
  try {
    const raw = window.localStorage.getItem('finflow.localBackups.v1_87');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { backups?: unknown[] };
    return Array.isArray(parsed.backups) ? parsed.backups.length : 0;
  } catch { return 0; }
}

function readState(): LocalRedesignState {
  try {
    const raw = window.localStorage.getItem(REDESIGN_STATE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<LocalRedesignState>;
    return { ...defaultState, ...parsed };
  } catch { return defaultState; }
}

function saveState(state: LocalRedesignState) {
  try { window.localStorage.setItem(REDESIGN_STATE_KEY, JSON.stringify(state)); } catch {}
}
