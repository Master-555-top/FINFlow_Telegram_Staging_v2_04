'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import { APP_UI_VERSION } from '@/lib/appVersion';
import { buildMorningPlanner, type MorningPlannerSummary } from '@/lib/day-core/morningPlanModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { formatIsoDateShort, getDateMonthKey, getDateYear, getDayLabel, getMonthLabel, parseRussianDateInput } from '@/lib/data/dateInput';
import {
  FINFLOW_SLEEP_CURRENT_STORAGE_KEY,
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
  getLocalTimeInput,
  getSleepStatus,
  getTodayDateInput,
  getYesterdayDateInput,
  isRecoveryWindowAllowed,
  makeSleepNightLabel,
  seedSleepRecords,
  sortSleepRecords,
  type LiveSleepSession,
  type SleepRecord,
  type SleepRecordAnalysis,
  type WakeDecision
} from '@/lib/sleep/sleepModel';

type SleepView = 'overview' | 'history' | 'editor';

type SleepFormState = {
  fromDate: string;
  toDate: string;
  sleptAt: string;
  wokeAt: string;
  shiftEndedAt: string;
  shiftWasClosed: boolean;
  note: string;
};

const SLEEP_UI_VERSION = APP_UI_VERSION;

type SleepWeekDay = {
  iso: string;
  weekday: string;
  dateLabel: string;
  analysis: SleepRecordAnalysis | null;
};

type SleepPeriodSummary = {
  days: number;
  averageMinutes: number;
  maxMinutes: number;
  normalDays: number;
  debtDays: number;
  oversleptDays: number;
  recoveryDays: number;
  lastAnalysis: SleepRecordAnalysis | null;
};

export function SleepDashboard(props: { dayInput?: DayCoreInputModel }) {
  const [activeView, setActiveView] = useState<SleepView>('overview');
  const [records, setRecords] = useState<SleepRecord[]>(seedSleepRecords);
  const [selectedId, setSelectedId] = useState(seedSleepRecords[seedSleepRecords.length - 1]?.id ?? '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SleepFormState>(() => buildDefaultForm());
  const [liveSession, setLiveSession] = useState<LiveSleepSession | null>(null);
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [liveSleptAt, setLiveSleptAt] = useState(() => getLocalTimeInput());

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(FINFLOW_SLEEP_CURRENT_STORAGE_KEY) ??
        window.localStorage.getItem(FINFLOW_SLEEP_STORAGE_KEY_V2_17) ??
        window.localStorage.getItem(FINFLOW_SLEEP_STORAGE_KEY);

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
      window.localStorage.setItem(FINFLOW_SLEEP_CURRENT_STORAGE_KEY, JSON.stringify(records));
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
  const previewStatus = getSleepStatus(previewMinutes, isRecoveryWindowAllowed(records));
  const taxiShiftHours = props.dayInput?.taxi.fullShiftHours ?? 0;
  const taxiActiveHours = props.dayInput?.taxi.activeHours ?? 0;
  const wakeDecision = buildWakeDecision({
    session: liveSession,
    records,
    now: liveNow,
    taxiShiftHours,
    taxiActiveHours
  });
  const morningPlanner = useMemo(() => wakeDecision
    ? buildMorningPlanner({ dayInput: props.dayInput ?? buildSleepDayFallback(), options: wakeDecision.options })
    : null, [props.dayInput, wakeDecision]);

  function updateForm(partial: Partial<SleepFormState>) {
    setForm(prev => ({ ...prev, ...partial }));
  }

  function saveSleepRecord() {
    const existing = editingId ? records.find(record => record.id === editingId) ?? null : null;
    const record = createSleepRecord(form, existing);
    saveRecord(record);
    setEditingId(null);
    setForm(buildDefaultForm());
    setActiveView('history');
  }

  function saveRecord(record: SleepRecord) {
    setRecords(prev => {
      const withoutSameId = prev.filter(item => item.id !== record.id);
      return sortSleepRecords([...withoutSameId, record]);
    });
    setSelectedId(record.id);
  }

  function startLiveSleep() {
    const sleepStart = buildLiveSleepStartDate(liveSleptAt, new Date());
    const session = createLiveSleepSession({}, sleepStart);
    setLiveSession(session);
    setActiveView('overview');
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

  function startEditing(record: SleepRecord) {
    setEditingId(record.id);
    setSelectedId(record.id);
    setForm({
      fromDate: record.fromDate,
      toDate: record.toDate,
      sleptAt: record.sleptAt,
      wokeAt: record.wokeAt,
      shiftEndedAt: record.shiftEndedAt ?? '04:00',
      shiftWasClosed: record.shiftWasClosed ?? false,
      note: record.note ?? ''
    });
    setActiveView('editor');
  }

  function deleteRecord(id: string) {
    setRecords(prev => {
      const next = prev.filter(record => record.id !== id);
      setSelectedId(next[next.length - 1]?.id ?? '');
      return next.length > 0 ? next : seedSleepRecords;
    });
    if (editingId === id) {
      setEditingId(null);
      setForm(buildDefaultForm());
    }
  }

  function applyPreset(kind: 'yesterday' | 'today' | 'after_shift') {
    const today = getTodayDateInput();
    const yesterday = getYesterdayDateInput();
    setEditingId(null);
    if (kind === 'yesterday') {
      updateForm({ fromDate: yesterday, toDate: today, sleptAt: '04:30', wokeAt: '12:30', shiftWasClosed: false, shiftEndedAt: '03:30' });
      return;
    }
    if (kind === 'after_shift') {
      updateForm({ fromDate: today, toDate: today, sleptAt: '05:00', wokeAt: '13:00', shiftWasClosed: true, shiftEndedAt: '04:00' });
      return;
    }
    updateForm({ fromDate: today, toDate: today, sleptAt: '06:00', wokeAt: '14:00', shiftWasClosed: false, shiftEndedAt: '03:30' });
  }

  function resetToSeed() {
    setRecords(seedSleepRecords);
    setSelectedId(seedSleepRecords[seedSleepRecords.length - 1]?.id ?? '');
    setEditingId(null);
    setForm(buildDefaultForm());
  }

  function exportHistory() {
    const payload = JSON.stringify({ version: 'sleep_v2_31', exportedAt: new Date().toISOString(), records }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow_sleep_history_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const title = activeView === 'history'
    ? 'История сна'
    : activeView === 'editor'
      ? editingId ? 'Правка сна' : 'Редактор сна'
      : 'Сон';

  return (
    <section className="sleep-screen premium-screen sleep-v2181 sleep-v229 sleep-v230 sleep-v231">
      <div className="premium-screen-head sleep-head compact">
        <h1>{title}</h1>
        <span>{SLEEP_UI_VERSION}</span>
      </div>

      <div className="premium-segmented sleep-segmented compact v2181" role="tablist" aria-label="Sleep tabs">
        {[
          ['overview', 'Обзор'],
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
          liveSession={liveSession}
          liveNow={liveNow}
          wakeDecision={wakeDecision}
          morningPlanner={morningPlanner}
          liveSleptAt={liveSleptAt}
          setLiveSleptAt={setLiveSleptAt}
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
          editingId={editingId}
          cancelEditing={() => {
            setEditingId(null);
            setForm(buildDefaultForm());
          }}
        />
      ) : null}

      {activeView === 'history' ? (
        <SleepHistory
          analyses={analyses}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          resetToSeed={resetToSeed}
          exportHistory={exportHistory}
          startEditing={startEditing}
          deleteRecord={deleteRecord}
        />
      ) : null}

    </section>
  );
}

function SleepNowPanel(props: {
  liveSession: LiveSleepSession | null;
  liveNow: Date;
  wakeDecision: WakeDecision | null;
  morningPlanner: MorningPlannerSummary | null;
  liveSleptAt: string;
  setLiveSleptAt: (value: string) => void;
  startLiveSleep: () => void;
  finishLiveSleep: () => void;
  cancelLiveSleep: () => void;
}) {
  if (!props.liveSession) {
    return (
      <div className="sleep-live-start sleep-live-start-v230">
        <div className="sleep-live-orb" aria-hidden="true">☾</div>
        <div className="sleep-live-copy">
          <span>Основной режим</span>
        </div>
        <label className="sleep-live-time-field">
          <span>Во сколько лёг</span>
          <input type="time" value={props.liveSleptAt} onChange={event => props.setLiveSleptAt(event.target.value)} />
        </label>
        <button type="button" className="sleep-primary-action" onClick={props.startLiveSleep}>Засыпаю</button>
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
          <span>уснул</span>
          <b>{props.liveSession.sleptAt}</b>
        </div>
        <div>
          <span>сейчас</span>
          <b>{getLocalTimeInput(props.liveNow)}</b>
        </div>
        <div>
          <span>лимит</span>
          <b>{decision ? formatSleepMinutes(decision.maxMoreMinutes) : '—'}</b>
        </div>
      </div>

      {decision ? (
        <>
          <div className={`sleep-wake-card tone-${decision.status.tone}`}>
            <span>{decision.wakeHeadline}</span>
            <b>{decision.sleepAdvice}</b>
            <p>{decision.workAdvice}</p>
            <p>{decision.dayWindowAdvice}</p>
          </div>
          <WakeDecisionOptions decision={decision} />
          {props.morningPlanner ? <MorningPlannerCard planner={props.morningPlanner} /> : null}
        </>
      ) : null}

      <div className="sleep-live-actions">
        <button type="button" className="sleep-primary-action" onClick={props.finishLiveSleep}>Встал</button>
        <button type="button" onClick={props.cancelLiveSleep}>отменить</button>
      </div>
    </div>
  );
}

function WakeDecisionOptions(props: { decision: WakeDecision }) {
  return (
    <div className="wake-options-card">
      <div className="sleep-card-title-row">
        <b>Утреннее решение</b>
        <span>без баллов</span>
      </div>
      <div className="wake-options-grid">
        {props.decision.options.map(option => (
          <article className={`wake-option tone-${option.status.tone}${option.canChoose ? '' : ' blocked'}`} key={option.id}>
            <span>{option.label}</span>
            <b>{formatSleepMinutes(option.projectedMinutes)}</b>
            <em>{option.status.shortLabel}</em>
            <small>{option.headline}</small>
            <p>{option.workHoursEstimate.toFixed(1)}ч работы</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function MorningPlannerCard(props: { planner: MorningPlannerSummary }) {
  const primary = props.planner.primary;
  return (
    <div className={`morning-planner-card safety-${primary.safety}`}>
      <div className="sleep-card-title-row">
        <b>День после подъёма</b>
        <span>{primary.safetyLabel}</span>
      </div>
      <div className="morning-primary-grid">
        <div>
          <span>старт</span>
          <b>{primary.startTime}</b>
        </div>
        <div>
          <span>работа</span>
          <b>{primary.recommendedWorkHours.toFixed(1)}ч</b>
        </div>
        <div>
          <span>грязными</span>
          <b>{formatRub(primary.potentialGross)}</b>
        </div>
      </div>
      <p>{primary.headline}</p>
      <p>{primary.recommendation}</p>
      <div className="morning-plan-options">
        {props.planner.options.map(option => (
          <div className={`morning-plan-option safety-${option.safety}`} key={option.optionId}>
            <span>{option.label}</span>
            <b>{formatRub(option.potentialGross)}</b>
            <small>{option.recommendedWorkHours.toFixed(1)}ч · {option.safetyLabel}</small>
          </div>
        ))}
      </div>
      <div className="morning-task-strip">
        {props.planner.primary.canFitTasks.slice(0, 4).map(item => (
          <span className={item.fits ? 'fit' : 'miss'} key={item.task.id}>{item.fits ? '✓' : '×'} {item.task.title}</span>
        ))}
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
  liveSession: LiveSleepSession | null;
  liveNow: Date;
  wakeDecision: WakeDecision | null;
  morningPlanner: MorningPlannerSummary | null;
  liveSleptAt: string;
  setLiveSleptAt: (value: string) => void;
  startLiveSleep: () => void;
  finishLiveSleep: () => void;
  cancelLiveSleep: () => void;
}) {
  const weekDays = useMemo(() => buildSleepWeekDays(props.analyses), [props.analyses]);
  const weekSummary = useMemo(() => buildSleepPeriodSummary(weekDays), [weekDays]);
  const last = props.stats.lastAnalysis;
  const lastStatus = last?.status;
  return (
    <>
      <SleepNowPanel
        liveSession={props.liveSession}
        liveNow={props.liveNow}
        wakeDecision={props.wakeDecision}
        morningPlanner={props.morningPlanner}
        liveSleptAt={props.liveSleptAt}
        setLiveSleptAt={props.setLiveSleptAt}
        startLiveSleep={props.startLiveSleep}
        finishLiveSleep={props.finishLiveSleep}
        cancelLiveSleep={props.cancelLiveSleep}
      />

      <div className={`sleep-hero-status sleep-mode-signal tone-${lastStatus?.tone ?? 'blue'}`}>
        <div className="sleep-hero-icon" aria-hidden="true">☾</div>
        <div>
          <span>Последний сон</span>
          <b>{lastStatus?.label ?? 'Добавь сон'}</b>
          <p>{last ? `${formatSleepMinutes(last.record.minutes)} · ${makeSleepNightLabel(last.record)} · ${buildShortModeAdvice(last)}` : 'После первой записи здесь будет короткий итог без лишнего текста.'}</p>
        </div>
      </div>

      <div className="sleep-stat-grid adaptive sleep-week-stat-grid" aria-label="Краткая статистика сна за текущую неделю">
        <SleepStat icon="◴" label="Среднее" value={weekSummary.days ? formatSleepMinutes(weekSummary.averageMinutes) : '—'} sub="ПН–ВС" />
        <SleepStat icon="✓" label="Норма" value={`${weekSummary.normalDays}/7`} sub="6–8ч" tone="green" />
        <SleepStat icon="!" label="Недосып" value={`${weekSummary.debtDays}`} sub="<5ч" tone="orange" />
        <SleepStat icon="×" label="Проспал" value={`${weekSummary.oversleptDays}`} sub=">10ч" tone="red" />
      </div>

      <SleepChart weekDays={weekDays} selectedId={props.selectedId} setSelectedId={props.setSelectedId} />

      <SleepModePanel
        weekSummary={weekSummary}
        lastAnalysis={last}
        taxiShiftHours={props.taxiShiftHours}
        taxiActiveHours={props.taxiActiveHours}
      />
    </>
  );
}

function SleepChart(props: { weekDays: SleepWeekDay[]; selectedId: string; setSelectedId: (id: string) => void }) {
  return (
    <div className="sleep-chart-card compact sleep-week-chart-card">
      <div className="sleep-chart sleep-week-chart" aria-label="Сон за текущую неделю с понедельника по воскресенье">
        {props.weekDays.map(day => {
          const analysis = day.analysis;
          const height = analysis ? `${Math.max(12, Math.min(100, (analysis.record.minutes / 720) * 100))}%` : '0%';
          return (
            <button
              className={`sleep-bar-wrap sleep-week-bar tone-${analysis?.status.tone ?? 'blue'}${analysis?.record.id === props.selectedId ? ' active' : ''}${analysis ? '' : ' empty'}`}
              key={day.iso}
              type="button"
              onClick={() => { if (analysis) props.setSelectedId(analysis.record.id); }}
              disabled={!analysis}
            >
              <span>{analysis ? `${Math.round(analysis.record.minutes / 60)}ч` : '—'}</span>
              <div className="sleep-bar-track">
                <i style={{ height }} />
              </div>
              <small><em>{day.weekday}</em>{day.dateLabel}</small>
            </button>
          );
        })}
        <div className="sleep-target-line" />
      </div>
    </div>
  );
}

function SleepAddForm(props: {
  form: SleepFormState;
  updateForm: (partial: Partial<SleepFormState>) => void;
  previewMinutes: number;
  previewStatus: ReturnType<typeof getSleepStatus>;
  saveSleepRecord: () => void;
  applyPreset: (kind: 'yesterday' | 'today' | 'after_shift') => void;
  editingId: string | null;
  cancelEditing: () => void;
}) {
  return (
    <div className="sleep-add-panel">
      <div className={`sleep-preview-card tone-${props.previewStatus.tone}`}>
        <span>{props.editingId ? 'Правка записи' : 'Предпросмотр'}</span>
        <b>{formatSleepMinutes(props.previewMinutes)}</b>
        <em>{props.previewStatus.shortLabel}</em>
      </div>

      <div className="sleep-preset-row">
        <button type="button" onClick={() => props.applyPreset('yesterday')}>вчера</button>
        <button type="button" onClick={() => props.applyPreset('today')}>сегодня</button>
        <button type="button" onClick={() => props.applyPreset('after_shift')}>после смены</button>
      </div>

      <div className="sleep-form-grid">
        <DateTextInput label="Дата с" value={props.form.fromDate} onChange={iso => props.updateForm({ fromDate: iso })} />
        <DateTextInput label="Дата на" value={props.form.toDate} onChange={iso => props.updateForm({ toDate: iso })} />
        <label>
          <span>Уснул</span>
          <input type="time" value={props.form.sleptAt} onChange={event => props.updateForm({ sleptAt: event.target.value })} />
        </label>
        <label>
          <span>Встал</span>
          <input type="time" value={props.form.wokeAt} onChange={event => props.updateForm({ wokeAt: event.target.value })} />
        </label>
      </div>
      <p className="sleep-date-hint">Дата вводится как 05.06.26 или 5.6.2026 и сохраняется как стабильный формат YYYY-MM-DD.</p>

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

      <div className="sleep-editor-actions">
        <button type="button" className="sleep-save-button" onClick={props.saveSleepRecord} disabled={props.previewMinutes <= 0}>
          {props.editingId ? 'сохранить правку' : 'сохранить сон'}
        </button>
        {props.editingId ? <button type="button" onClick={props.cancelEditing}>отмена</button> : null}
      </div>
    </div>
  );
}

function DateTextInput(props: { label: string; value: string; onChange: (iso: string) => void }) {
  const [draft, setDraft] = useState(formatIsoDateShort(props.value));
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(formatIsoDateShort(props.value));
    setError('');
  }, [props.value]);

  function commit(value: string) {
    const parsed = parseRussianDateInput(value);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError('');
    setDraft(parsed.display);
    props.onChange(parsed.iso);
  }

  return (
    <label className={`sleep-date-input ${error ? 'invalid' : ''}`}>
      <span>{props.label}</span>
      <input
        inputMode="numeric"
        placeholder="05.06.26"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onBlur={event => commit(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') commit((event.target as HTMLInputElement).value);
        }}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function SleepHistory(props: {
  analyses: SleepRecordAnalysis[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  resetToSeed: () => void;
  exportHistory: () => void;
  startEditing: (record: SleepRecord) => void;
  deleteRecord: (id: string) => void;
}) {
  const years = useMemo(() => Array.from(new Set(props.analyses.map(analysis => getDateYear(analysis.record.toDate)))).sort().reverse(), [props.analyses]);
  const [selectedYear, setSelectedYear] = useState(years[0] ?? getTodayDateInput().slice(0, 4));
  const months = useMemo(() => Array.from(new Set(props.analyses
    .filter(analysis => getDateYear(analysis.record.toDate) === selectedYear)
    .map(analysis => getDateMonthKey(analysis.record.toDate))))
    .sort()
    .reverse(), [props.analyses, selectedYear]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? getTodayDateInput().slice(0, 7));

  useEffect(() => {
    if (!years.includes(selectedYear)) setSelectedYear(years[0] ?? getTodayDateInput().slice(0, 4));
  }, [selectedYear, years]);

  useEffect(() => {
    if (!months.includes(selectedMonth)) setSelectedMonth(months[0] ?? getTodayDateInput().slice(0, 7));
  }, [months, selectedMonth]);

  const visible = props.analyses.filter(analysis => getDateMonthKey(analysis.record.toDate) === selectedMonth);
  const groupedByDay = visible.reduce<Record<string, SleepRecordAnalysis[]>>((acc, analysis) => {
    const key = analysis.record.toDate;
    acc[key] = acc[key] ? [...acc[key], analysis] : [analysis];
    return acc;
  }, {});
  const dayKeys = Object.keys(groupedByDay).sort().reverse();

  return (
    <div className="sleep-history-list adaptive sleep-history-v226">
      <div className="sleep-history-actions">
        <button type="button" onClick={props.exportHistory}>экспорт</button>
        <button type="button" onClick={props.resetToSeed}>шаблон</button>
      </div>

      <div className="history-period-card">
        <span>История → Год → Месяц → День → Сон</span>
        <div className="history-year-row">
          {years.map(year => (
            <button key={year} type="button" className={selectedYear === year ? 'active' : ''} onClick={() => setSelectedYear(year)}>{year}</button>
          ))}
        </div>
        <div className="history-month-row">
          {months.map(month => (
            <button key={month} type="button" className={selectedMonth === month ? 'active' : ''} onClick={() => setSelectedMonth(month)}>{getMonthLabel(month)}</button>
          ))}
        </div>
      </div>

      {dayKeys.map(day => (
        <section className="history-day-group" key={day}>
          <div className="history-day-head">
            <b>{getDayLabel(day)}</b>
            <span>{groupedByDay[day].length} запись</span>
          </div>
          {groupedByDay[day].map(analysis => (
            <article
              className={`sleep-history-row tone-${analysis.status.tone}${analysis.record.id === props.selectedId ? ' active' : ''}`}
              key={analysis.record.id}
            >
              <button type="button" className="sleep-history-main" onClick={() => props.setSelectedId(analysis.record.id)}>
                <b>{makeSleepNightLabel(analysis.record)}</b>
                <span><small>Уснул</small>{analysis.record.sleptAt}</span>
                <span><small>Встал</small>{analysis.record.wokeAt}</span>
                <strong>☾ {formatSleepMinutes(analysis.record.minutes)}</strong>
                <em>{analysis.status.shortLabel}</em>
              </button>
              <div className="sleep-history-tools">
                <button type="button" onClick={() => props.startEditing(analysis.record)}>править</button>
                <button type="button" onClick={() => props.deleteRecord(analysis.record.id)}>удалить</button>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

function SleepModePanel(props: {
  weekSummary: SleepPeriodSummary;
  lastAnalysis: SleepRecordAnalysis | null;
  taxiShiftHours: number;
  taxiActiveHours: number;
}) {
  const normalPct = Math.round((props.weekSummary.normalDays / 7) * 100);
  const workLabel = props.lastAnalysis?.status.workLabel ?? 'Нужен сон';
  return (
    <div className="sleep-stats-panel sleep-mode-panel-v231">
      <div className="sleep-stats-hero sleep-mode-hero-v231">
        <span>Режим</span>
        <b>{normalPct}% недели в норме</b>
        <p>{buildModePanelAdvice(props.weekSummary, props.lastAnalysis, props.taxiShiftHours, props.taxiActiveHours)}</p>
      </div>
      <div className="sleep-mode-mini-grid">
        <div>
          <span>Цель</span>
          <b>6–8ч</b>
        </div>
        <div>
          <span>Неделя</span>
          <b>{props.weekSummary.days}/7</b>
        </div>
        <div>
          <span>Работа</span>
          <b>{workLabel}</b>
        </div>
      </div>
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

function buildSleepWeekDays(analyses: SleepRecordAnalysis[], anchorIso = getTodayDateInput()): SleepWeekDay[] {
  const anchor = parseIsoDateAtNoon(anchorIso);
  const monday = new Date(anchor);
  const dayIndex = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dayIndex);

  const byDate = new Map<string, SleepRecordAnalysis>();
  analyses.forEach(analysis => {
    const current = byDate.get(analysis.record.toDate);
    if (!current || `${analysis.record.toDate}T${analysis.record.wokeAt}` > `${current.record.toDate}T${current.record.wokeAt}`) {
      byDate.set(analysis.record.toDate, analysis);
    }
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = toIsoDate(date);
    return {
      iso,
      weekday: WEEKDAY_SHORT[index],
      dateLabel: formatSleepChartDate(iso),
      analysis: byDate.get(iso) ?? null
    };
  });
}

function buildSleepPeriodSummary(days: SleepWeekDay[]): SleepPeriodSummary {
  const analyses = days.map(day => day.analysis).filter((analysis): analysis is SleepRecordAnalysis => Boolean(analysis));
  const total = analyses.reduce((sum, analysis) => sum + analysis.record.minutes, 0);
  return {
    days: analyses.length,
    averageMinutes: analyses.length ? Math.round(total / analyses.length) : 0,
    maxMinutes: analyses.length ? Math.max(...analyses.map(analysis => analysis.record.minutes)) : 0,
    normalDays: analyses.filter(analysis => analysis.status.id === 'normal').length,
    debtDays: analyses.filter(analysis => analysis.record.minutes < 300).length,
    oversleptDays: analyses.filter(analysis => analysis.status.id === 'overslept').length,
    recoveryDays: analyses.filter(analysis => analysis.status.id === 'recovery').length,
    lastAnalysis: analyses[analyses.length - 1] ?? null
  };
}

function buildShortModeAdvice(analysis: SleepRecordAnalysis) {
  switch (analysis.status.id) {
    case 'normal':
      return 'можно планировать обычный день';
    case 'critical_short':
      return 'только безопасный день';
    case 'low':
      return 'лучше облегчить смену';
    case 'recovery':
      return 'восстановление после недосыпа';
    case 'long':
      return 'следующий сон лучше раньше';
    case 'overslept':
      return 'день может быть сбит';
    default:
      return analysis.status.shortLabel;
  }
}

function buildModePanelAdvice(summary: SleepPeriodSummary, last: SleepRecordAnalysis | null, taxiShiftHours: number, taxiActiveHours: number) {
  if (!last) return 'Добавь сон — FINFlow начнёт связывать режим с планом дня и работой.';
  if (summary.days === 0) return 'На этой неделе пока нет записей сна.';
  const work = taxiShiftHours ? `Смена ${taxiShiftHours.toFixed(1)}ч, активная ${taxiActiveHours.toFixed(1)}ч. ` : '';
  if (summary.oversleptDays > 0) return `${work}Есть пересып >10ч: цель — мягкий день и следующий сон раньше, без дублирующих предупреждений.`;
  if (summary.debtDays >= 2) return `${work}На неделе накопился недосып: лучше не добивать ночь и вернуть 6–8ч.`;
  if (summary.normalDays >= 4) return `${work}Режим близко к норме: можно держать обычный рабочий план.`;
  if (last.status.id === 'long' || last.status.id === 'recovery') return `${work}Сон длиннее нормы: это не отдельная тревога, а сигнал удержать следующий сон раньше.`;
  return `${work}${buildShortModeAdvice(last)}.`;
}

const WEEKDAY_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const;

function parseIsoDateAtNoon(iso: string) {
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSleepChartDate(iso: string) {
  return formatDateShort(iso).toLocaleLowerCase('ru-RU');
}

function buildLiveSleepStartDate(timeInput: string, now = new Date()) {
  const [hours, minutes] = timeInput.split(':').map(Number);
  if (![hours, minutes].every(Number.isFinite)) return now;

  const start = new Date(now);
  start.setHours(hours, minutes, 0, 0);

  // If it is just after midnight and the user enters 23:xx, that start belongs
  // to the previous calendar day. Keep the live timer human-correct.
  if (start.getTime() - now.getTime() > 10 * 60 * 1000) {
    start.setDate(start.getDate() - 1);
  }

  return start;
}

function buildSleepDayFallback() {
  return {
    schemaVersion: 'day_core_input_v1_24' as const,
    dayId: 'sleep-fallback-day',
    localDate: getTodayDateInput(),
    localTime: getLocalTimeInput(),
    source: 'system_default' as const,
    status: 'draft' as const,
    money: { cash: 0, card: 0, driveeBalance: 0, reservedNotFree: 0, note: 'Fallback for Sleep → Day planner.' },
    taxi: {
      ordersDone: 0,
      grossDone: 0,
      activeHours: 0,
      fullShiftHours: 0,
      expectedGrossByEvening: 10000,
      targetGrossToday: 12000,
      targetNetToday: 8000,
      driveeRate: 0.128,
      fuelPlanned: 1800,
      fuelAlreadyPaid: 0,
      distanceKmPlannedMin: 80,
      distanceKmPlannedMax: 150
    },
    obligations: [],
    funds: [],
    tasks: [
      { id: 'morning-food', title: 'Еда', type: 'food' as const, plannedToday: true, timeCostMinutes: 35, moneyCost: 500, priority: 'high' as const },
      { id: 'fuel-check', title: 'Заправка', type: 'work' as const, plannedToday: true, timeCostMinutes: 20, moneyCost: 1800, priority: 'critical' as const },
      { id: 'soft-start', title: 'Сборы', type: 'rest' as const, plannedToday: true, timeCostMinutes: 35, moneyCost: 0, priority: 'normal' as const }
    ],
    reviewNotes: ['Fallback data is only used when Day Core input is unavailable.']
  };
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
