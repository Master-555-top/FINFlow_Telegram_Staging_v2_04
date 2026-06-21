'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import {
  FINFLOW_SLEEP_LIVE_SESSION_KEY,
  FINFLOW_SLEEP_STORAGE_KEY,
  FINFLOW_SLEEP_STORAGE_KEY_V2_17,
  analyzeSleepRecords,
  buildSleepStats,
  buildWakeDecision,
  calculateSleepMinutes,
  createLiveSleepSession,
  createSleepRecord,
  finishLiveSleepSession,
  formatDateShort,
  formatSleepMinutes,
  getLocalDateInput,
  getLocalTimeInput,
  getSleepStatus,
  getTodayDateInput,
  getYesterdayDateInput,
  makeSleepNightLabel,
  seedSleepRecords,
  sortSleepRecords,
  type LiveSleepSession,
  type SleepRecord,
  type SleepRecordAnalysis,
  type WakeDecision
} from '@/lib/sleep/sleepModel';

type SleepView = 'overview' | 'now' | 'history' | 'editor';

type SleepFormState = {
  fromDate: string;
  toDate: string;
  sleptAt: string;
  wokeAt: string;
  shiftEndedAt: string;
  shiftWasClosed: boolean;
  note: string;
};

export function SleepDashboard(props: { dayInput?: DayCoreInputModel }) {
  const [activeView, setActiveView] = useState<SleepView>('now');
  const [records, setRecords] = useState<SleepRecord[]>(seedSleepRecords);
  const [selectedId, setSelectedId] = useState(seedSleepRecords[seedSleepRecords.length - 1]?.id ?? '');
  const [form, setForm] = useState<SleepFormState>(() => buildDefaultForm());
  const [liveSession, setLiveSession] = useState<LiveSleepSession | null>(null);
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [liveShiftEndedAt, setLiveShiftEndedAt] = useState('04:00');
  const [liveAfterShift, setLiveAfterShift] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FINFLOW_SLEEP_STORAGE_KEY_V2_17) ?? window.localStorage.getItem(FINFLOW_SLEEP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SleepRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sorted = sortSleepRecords(parsed);
          setRecords(sorted);
          setSelectedId(sorted[sorted.length - 1]?.id ?? '');
        }
      }
      const liveRaw = window.localStorage.getItem(FINFLOW_SLEEP_LIVE_SESSION_KEY);
      if (liveRaw) {
        const parsedLive = JSON.parse(liveRaw) as LiveSleepSession;
        if (parsedLive?.status === 'sleeping' && parsedLive.sleptAtIso) setLiveSession(parsedLive);
      }
    } catch {
      // local fallback keeps seed records available
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FINFLOW_SLEEP_STORAGE_KEY_V2_17, JSON.stringify(records));
    } catch {
      // keep UI working even if localStorage is unavailable
    }
  }, [records]);

  useEffect(() => {
    try {
      if (liveSession) window.localStorage.setItem(FINFLOW_SLEEP_LIVE_SESSION_KEY, JSON.stringify(liveSession));
      else window.localStorage.removeItem(FINFLOW_SLEEP_LIVE_SESSION_KEY);
    } catch {
      // local-only session persistence can fail safely
    }
  }, [liveSession]);

  const analyses = useMemo(() => analyzeSleepRecords(records), [records]);
  const stats = useMemo(() => buildSleepStats(records), [records]);
  const selectedAnalysis = analyses.find(item => item.record.id === selectedId) ?? analyses[analyses.length - 1] ?? null;
  const previewMinutes = calculateSleepMinutes(form.fromDate, form.sleptAt, form.toDate, form.wokeAt);
  const previewStatus = getSleepStatus(previewMinutes, stats.debtDays >= 2 || (stats.lastAnalysis?.debtStreakBefore ?? 0) >= 2);
  const taxiShiftHours = props.dayInput?.taxi.fullShiftHours ?? 0;
  const taxiActiveHours = props.dayInput?.taxi.activeHours ?? 0;
  const wakeDecision = buildWakeDecision({
    session: liveSession,
    records,
    now: liveNow,
    taxiShiftHours,
    taxiActiveHours
  });

  function updateForm(partial: Partial<SleepFormState>) {
    setForm(prev => ({ ...prev, ...partial }));
  }

  function saveSleepRecord() {
    const record = createSleepRecord(form);
    saveRecord(record);
    setActiveView('overview');
  }

  function saveRecord(record: SleepRecord) {
    setRecords(prev => {
      const withoutSameDay = prev.filter(item => item.id !== record.id);
      return sortSleepRecords([...withoutSameDay, record]);
    });
    setSelectedId(record.id);
  }

  function startLiveSleep() {
    const session = createLiveSleepSession({
      shiftWasClosed: liveAfterShift,
      shiftEndedAt: liveAfterShift ? liveShiftEndedAt : undefined
    }, new Date());
    setLiveSession(session);
    setActiveView('now');
  }

  function finishLiveSleep() {
    if (!liveSession) return;
    const record = finishLiveSleepSession(liveSession, new Date());
    saveRecord(record);
    setLiveSession(null);
    setActiveView('history');
  }

  function cancelLiveSleep() {
    setLiveSession(null);
  }

  function applyPreset(kind: 'yesterday' | 'today' | 'after_shift') {
    const today = getTodayDateInput();
    const yesterday = getYesterdayDateInput();
    if (kind === 'yesterday') {
      updateForm({ fromDate: yesterday, toDate: today, sleptAt: '04:30', wokeAt: '12:30' });
      return;
    }
    if (kind === 'after_shift') {
      updateForm({ fromDate: today, toDate: today, sleptAt: '05:00', wokeAt: '13:00', shiftWasClosed: true, shiftEndedAt: '04:00' });
      return;
    }
    updateForm({ fromDate: today, toDate: today, sleptAt: '06:00', wokeAt: '14:00' });
  }

  function resetToSeed() {
    setRecords(seedSleepRecords);
    setSelectedId(seedSleepRecords[seedSleepRecords.length - 1]?.id ?? '');
  }

  function exportHistory() {
    const payload = JSON.stringify({ version: 'sleep_v2_17', exportedAt: new Date().toISOString(), records }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow_sleep_history_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const title = activeView === 'history' ? 'История сна' : activeView === 'editor' ? 'Редактор сна' : activeView === 'now' ? 'Сейчас' : 'Сон';

  return (
    <section className="sleep-screen premium-screen sleep-v217">
      <div className="premium-screen-head sleep-head compact">
        <h1>{title}</h1>
        <span>v2.17</span>
      </div>

      <div className="premium-segmented sleep-segmented compact" role="tablist" aria-label="Sleep tabs">
        {[
          ['overview', 'Обзор'],
          ['now', 'Сейчас'],
          ['history', 'История'],
          ['editor', 'Редактор']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeView === id}
            className={activeView === id ? 'active' : ''}
            onClick={() => setActiveView(id as SleepView)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === 'overview' ? (
        <SleepOverview
          stats={stats}
          analyses={analyses}
          selectedAnalysis={selectedAnalysis}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          taxiShiftHours={taxiShiftHours}
          taxiActiveHours={taxiActiveHours}
          onAdd={() => setActiveView('now')}
        />
      ) : null}

      {activeView === 'now' ? (
        <SleepNowPanel
          liveSession={liveSession}
          liveNow={liveNow}
          wakeDecision={wakeDecision}
          liveAfterShift={liveAfterShift}
          setLiveAfterShift={setLiveAfterShift}
          liveShiftEndedAt={liveShiftEndedAt}
          setLiveShiftEndedAt={setLiveShiftEndedAt}
          startLiveSleep={startLiveSleep}
          finishLiveSleep={finishLiveSleep}
          cancelLiveSleep={cancelLiveSleep}
        />
      ) : null}

      {activeView === 'editor' ? (
        <SleepAddForm
          form={form}
          updateForm={updateForm}
          previewMinutes={previewMinutes}
          previewStatus={previewStatus}
          saveSleepRecord={saveSleepRecord}
          applyPreset={applyPreset}
        />
      ) : null}

      {activeView === 'history' ? (
        <SleepHistory
          analyses={analyses}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          resetToSeed={resetToSeed}
          exportHistory={exportHistory}
        />
      ) : null}
    </section>
  );
}

function SleepNowPanel(props: {
  liveSession: LiveSleepSession | null;
  liveNow: Date;
  wakeDecision: WakeDecision | null;
  liveAfterShift: boolean;
  setLiveAfterShift: (value: boolean) => void;
  liveShiftEndedAt: string;
  setLiveShiftEndedAt: (value: string) => void;
  startLiveSleep: () => void;
  finishLiveSleep: () => void;
  cancelLiveSleep: () => void;
}) {
  if (!props.liveSession) {
    return (
      <div className="sleep-live-start">
        <div className="sleep-live-orb">☾</div>
        <div className="sleep-live-copy">
          <span>Основной режим</span>
          <b>Перед сном нажми «Лёг»</b>
          <p>FINFlow сам запомнит время. Утром нажмёшь «Встал» — запись уйдёт в историю.</p>
        </div>
        <div className="sleep-live-options">
          <label className="sleep-toggle-row compact">
            <input type="checkbox" checked={props.liveAfterShift} onChange={event => props.setLiveAfterShift(event.target.checked)} />
            <span>после смены</span>
          </label>
          <label>
            <span>смена закрыта</span>
            <input type="time" value={props.liveShiftEndedAt} onChange={event => props.setLiveShiftEndedAt(event.target.value)} />
          </label>
        </div>
        <button type="button" className="sleep-primary-action" onClick={props.startLiveSleep}>Лёг</button>
      </div>
    );
  }

  const decision = props.wakeDecision;
  return (
    <div className="sleep-live-active">
      <div className={`sleep-live-status tone-${decision?.status.tone ?? 'blue'}`}>
        <span>Ты спишь</span>
        <b>{decision ? formatSleepMinutes(decision.minutesAsleep) : 'считаю…'}</b>
        <em>{decision?.status.shortLabel ?? 'live'}</em>
      </div>

      <div className="sleep-live-grid">
        <div>
          <span>лёг</span>
          <b>{props.liveSession.sleptAt}</b>
        </div>
        <div>
          <span>сейчас</span>
          <b>{getLocalTimeInput(props.liveNow)}</b>
        </div>
        <div>
          <span>ещё можно</span>
          <b>{decision ? formatSleepMinutes(decision.maxMoreMinutes) : '—'}</b>
        </div>
      </div>

      {decision ? (
        <div className={`sleep-wake-card tone-${decision.status.tone}`}>
          <span>{decision.wakeHeadline}</span>
          <b>{decision.sleepAdvice}</b>
          <p>{decision.workAdvice}</p>
          <p>{decision.dayWindowAdvice}</p>
        </div>
      ) : null}

      <div className="sleep-live-actions">
        <button type="button" className="sleep-primary-action" onClick={props.finishLiveSleep}>Встал</button>
        <button type="button" onClick={props.cancelLiveSleep}>отменить</button>
      </div>
    </div>
  );
}

function SleepOverview(props: {
  stats: ReturnType<typeof buildSleepStats>;
  analyses: SleepRecordAnalysis[];
  selectedAnalysis: SleepRecordAnalysis | null;
  selectedId: string;
  setSelectedId: (id: string) => void;
  taxiShiftHours: number;
  taxiActiveHours: number;
  onAdd: () => void;
}) {
  const last = props.stats.lastAnalysis;
  const lastStatus = last?.status;
  return (
    <>
      <div className={`sleep-hero-status tone-${lastStatus?.tone ?? 'blue'}`}>
        <div className="sleep-hero-icon">☾</div>
        <div>
          <span>{lastStatus?.workLabel ?? 'Режим'}</span>
          <b>{lastStatus?.label ?? 'Добавь сон'}</b>
          <p>{props.stats.recommendation}</p>
        </div>
        <button type="button" onClick={props.onAdd}>+</button>
      </div>

      <div className="sleep-stat-grid adaptive">
        <SleepStat icon="◴" label="Среднее" value={formatSleepMinutes(props.stats.averageMinutes)} />
        <SleepStat icon="✓" label="Норма" value={`${props.stats.normalDays}/${props.stats.days}`} sub="6–8ч" tone="green" />
        <SleepStat icon="!" label="Недосып" value={`${props.stats.debtDays}`} sub="<5ч" tone="orange" />
        <SleepStat icon="×" label="Проспал" value={`${props.stats.oversleptDays}`} sub=">10ч" tone="red" />
      </div>

      <div className="sleep-adaptive-card">
        <div>
          <span>Работа</span>
          <b>{lastStatus?.workLabel ?? 'Нужен сон'}</b>
          <p>{buildTaxiAdaptiveText(props.taxiShiftHours, props.taxiActiveHours, props.selectedAnalysis)}</p>
        </div>
        <div className="sleep-work-mini">
          <span>смена</span>
          <b>{props.taxiShiftHours ? `${props.taxiShiftHours.toFixed(1)}ч` : '—'}</b>
        </div>
      </div>

      <div className="sleep-chart-card compact">
        <div className="sleep-card-title-row">
          <b>Последние дни</b>
          <span>{props.stats.days} записей</span>
        </div>
        <div className="sleep-chart" aria-label="Sleep duration chart">
          {props.analyses.slice(-8).map(analysis => (
            <button
              className={`sleep-bar-wrap tone-${analysis.status.tone}${analysis.record.id === props.selectedId ? ' active' : ''}`}
              key={analysis.record.id}
              type="button"
              onClick={() => props.setSelectedId(analysis.record.id)}
            >
              <span>{Math.round(analysis.record.minutes / 60)}ч</span>
              <div className="sleep-bar-track">
                <i style={{ height: `${Math.max(12, Math.min(100, (analysis.record.minutes / 720) * 100))}%` }} />
              </div>
              <small>{formatDateShort(analysis.record.toDate)}</small>
            </button>
          ))}
          <div className="sleep-target-line" />
        </div>
      </div>

      {props.selectedAnalysis ? <SelectedSleepCard analysis={props.selectedAnalysis} /> : null}
    </>
  );
}

function SleepAddForm(props: {
  form: SleepFormState;
  updateForm: (partial: Partial<SleepFormState>) => void;
  previewMinutes: number;
  previewStatus: ReturnType<typeof getSleepStatus>;
  saveSleepRecord: () => void;
  applyPreset: (kind: 'yesterday' | 'today' | 'after_shift') => void;
}) {
  return (
    <div className="sleep-add-panel">
      <div className={`sleep-preview-card tone-${props.previewStatus.tone}`}>
        <span>Предпросмотр</span>
        <b>{formatSleepMinutes(props.previewMinutes)}</b>
        <em>{props.previewStatus.shortLabel}</em>
      </div>

      <div className="sleep-preset-row">
        <button type="button" onClick={() => props.applyPreset('yesterday')}>вчера</button>
        <button type="button" onClick={() => props.applyPreset('today')}>сегодня</button>
        <button type="button" onClick={() => props.applyPreset('after_shift')}>после смены</button>
      </div>

      <div className="sleep-form-grid">
        <label>
          <span>Дата с</span>
          <input type="date" value={props.form.fromDate} onChange={event => props.updateForm({ fromDate: event.target.value })} />
        </label>
        <label>
          <span>Дата на</span>
          <input type="date" value={props.form.toDate} onChange={event => props.updateForm({ toDate: event.target.value })} />
        </label>
        <label>
          <span>Уснул</span>
          <input type="time" value={props.form.sleptAt} onChange={event => props.updateForm({ sleptAt: event.target.value })} />
        </label>
        <label>
          <span>Встал</span>
          <input type="time" value={props.form.wokeAt} onChange={event => props.updateForm({ wokeAt: event.target.value })} />
        </label>
      </div>

      <div className="sleep-shift-card">
        <label className="sleep-toggle-row">
          <input
            type="checkbox"
            checked={props.form.shiftWasClosed}
            onChange={event => props.updateForm({ shiftWasClosed: event.target.checked })}
          />
          <span>Сон после смены</span>
        </label>
        <label>
          <span>Смена закончена</span>
          <input type="time" value={props.form.shiftEndedAt} onChange={event => props.updateForm({ shiftEndedAt: event.target.value })} />
        </label>
      </div>

      <label className="sleep-note-field">
        <span>Заметка</span>
        <textarea value={props.form.note} onChange={event => props.updateForm({ note: event.target.value })} placeholder="например: тяжёлая смена, проснулся разбитый, нужно лечь раньше" />
      </label>

      <button type="button" className="sleep-save-button" onClick={props.saveSleepRecord} disabled={props.previewMinutes <= 0}>
        сохранить сон
      </button>
    </div>
  );
}

function SleepHistory(props: {
  analyses: SleepRecordAnalysis[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  resetToSeed: () => void;
  exportHistory: () => void;
}) {
  return (
    <div className="sleep-history-list adaptive">
      <div className="sleep-history-actions">
        <button type="button" onClick={props.exportHistory}>экспорт</button>
        <button type="button" onClick={props.resetToSeed}>шаблон</button>
      </div>
      {props.analyses.map(analysis => (
        <button
          type="button"
          className={`sleep-history-row tone-${analysis.status.tone}${analysis.record.id === props.selectedId ? ' active' : ''}`}
          key={analysis.record.id}
          onClick={() => props.setSelectedId(analysis.record.id)}
        >
          <b>{makeSleepNightLabel(analysis.record)}</b>
          <span><small>Уснул</small>{analysis.record.sleptAt}</span>
          <span><small>Встал</small>{analysis.record.wokeAt}</span>
          <strong>☾ {formatSleepMinutes(analysis.record.minutes)}</strong>
          <em>{analysis.status.shortLabel}</em>
        </button>
      ))}
    </div>
  );
}

function SelectedSleepCard(props: { analysis: SleepRecordAnalysis }) {
  const { record, status } = props.analysis;
  return (
    <div className={`sleep-selected-card tone-${status.tone}`}>
      <div className="sleep-card-title-row">
        <b>{makeSleepNightLabel(record)}</b>
        <em>{status.shortLabel}</em>
      </div>
      <div className="sleep-selected-grid">
        <span><small>уснул</small>{record.sleptAt}</span>
        <span><small>встал</small>{record.wokeAt}</span>
        <span><small>сон</small>{formatSleepMinutes(record.minutes)}</span>
      </div>
      <p>{props.analysis.shiftAdaptiveNote}</p>
      {props.analysis.suggestedNextSleepAt && props.analysis.suggestedWakeAt ? (
        <div className="sleep-plan-mini">
          <span>лечь {props.analysis.suggestedNextSleepAt}</span>
          <span>встать {props.analysis.suggestedWakeAt}</span>
        </div>
      ) : null}
    </div>
  );
}

function SleepStat(props: { icon: string; label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className={`sleep-stat-card ${props.tone ? `tone-${props.tone}` : ''}`}>
      <i>{props.icon}</i>
      <span>{props.label}</span>
      <b>{props.value}</b>
      {props.sub ? <small>{props.sub}</small> : null}
    </div>
  );
}

function buildDefaultForm(): SleepFormState {
  return {
    fromDate: getYesterdayDateInput(),
    toDate: getTodayDateInput(),
    sleptAt: '04:30',
    wokeAt: '12:30',
    shiftEndedAt: '03:30',
    shiftWasClosed: false,
    note: ''
  };
}

function buildTaxiAdaptiveText(taxiShiftHours: number, taxiActiveHours: number, analysis: SleepRecordAnalysis | null) {
  if (!analysis) return 'После первой записи FINFlow начнёт подстраивать сон под смену.';
  const work = taxiShiftHours ? `Текущая смена ${taxiShiftHours.toFixed(1)}ч, активная работа ${taxiActiveHours.toFixed(1)}ч. ` : '';
  return `${work}${analysis.status.recommendation}`;
}
