'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildTelegramSupabaseVerificationChecklist, type VerificationStage, type VerificationStageId } from '@/lib/deployment/telegramSupabaseVerificationChecklist';
import { buildVerificationHandoffReport } from '@/lib/deployment/verificationHandoffReport';
import { formatLocalDateStartIso } from '@/lib/time/localDate';
import {
  VERIFICATION_CHECKLIST_PROGRESS_STORAGE_KEY,
  createInitialVerificationChecklistProgressState,
  defaultUserStatusFromStage,
  getVerificationStageProgress,
  parseVerificationChecklistProgressState,
  resetVerificationChecklistProgress,
  setVerificationStageNote,
  setVerificationStageStatus,
  summarizeVerificationChecklistProgress,
  type VerificationChecklistProgressState,
  type VerificationStageUserStatus
} from '@/lib/deployment/verificationChecklistProgress';

const checklist = buildTelegramSupabaseVerificationChecklist();

type VerificationView = 'overview' | 'stages' | 'export' | 'path';
type StageAreaFilter = 'all' | VerificationStage['area'];

const VERIFICATION_VIEWS: { id: VerificationView; label: string; caption: string }[] = [
  { id: 'overview', label: 'Обзор', caption: 'прогресс' },
  { id: 'stages', label: 'Этапы', caption: 'отметки' },
  { id: 'export', label: 'Export', caption: 'handoff' },
  { id: 'path', label: 'Путь', caption: 'критические шаги' }
];

export function TelegramSupabaseVerificationChecklistPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [activeView, setActiveView] = useState<VerificationView>('overview');
  const [areaFilter, setAreaFilter] = useState<StageAreaFilter>('all');
  const [progressState, setProgressState] = useState<VerificationChecklistProgressState>(() => createInitialVerificationChecklistProgressState(formatLocalDateStartIso()));
  const [handoffText, setHandoffText] = useState('');
  const [handoffMode, setHandoffMode] = useState<'markdown' | 'json'>('markdown');

  useEffect(() => {
    try {
      const parsed = parseVerificationChecklistProgressState(window.localStorage.getItem(VERIFICATION_CHECKLIST_PROGRESS_STORAGE_KEY));
      if (parsed) setProgressState(parsed);
    } catch {
      // Keep safe default.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(VERIFICATION_CHECKLIST_PROGRESS_STORAGE_KEY, JSON.stringify(progressState));
  }, [hydrated, progressState]);

  const summary = useMemo(() => summarizeVerificationChecklistProgress(checklist.stages, progressState), [progressState]);
  const totals = checklist.stages.reduce(
    (acc, stage) => {
      acc[stage.status] += 1;
      return acc;
    },
    { done: 0, manual_required: 0, blocked: 0, planned: 0 }
  );

  const stageAreas = useMemo(() => Array.from(new Set(checklist.stages.map(stage => stage.area))), []);
  const filteredStages = areaFilter === 'all' ? checklist.stages : checklist.stages.filter(stage => stage.area === areaFilter);

  function updateStage(stageId: VerificationStageId, status: VerificationStageUserStatus) {
    setProgressState(previous => setVerificationStageStatus({ state: previous, stageId, status }));
  }

  function updateNote(stageId: VerificationStageId, note: string) {
    setProgressState(previous => setVerificationStageNote({ state: previous, stageId, note }));
  }

  function buildHandoff(mode: 'markdown' | 'json') {
    const report = buildVerificationHandoffReport({ checklist, progressState });
    setHandoffMode(mode);
    setHandoffText(mode === 'markdown' ? report.markdown : report.json);
  }

  async function copyHandoff() {
    if (!handoffText) return;
    try {
      await window.navigator.clipboard.writeText(handoffText);
    } catch {
      // Manual copy fallback through textarea remains available.
    }
  }

  function resetProgress() {
    const confirmed = window.confirm('Сбросить локальные отметки verification checklist? Код, облако и документы не изменятся.');
    if (!confirmed) return;
    setProgressState(resetVerificationChecklistProgress());
  }

  return (
    <section className="verification-checklist-panel system-module-panel">
      <div className="verification-head compact">
        <span>v2.14</span>
        <b>Checklist</b>
      </div>

      <div className="system-inner-tabs" role="tablist" aria-label="Verification center">
        {VERIFICATION_VIEWS.map(view => (
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

      {activeView === 'overview' && (
        <div className="system-module-window">
          <div className="readiness-grid">
            <ReadinessCard title="Local Foundation" value={checklist.readiness.localFoundation} />
            <ReadinessCard title="Daily local use" value={checklist.readiness.dailyLocalUse} />
            <ReadinessCard title="Cloud foundation" value={checklist.readiness.cloudFoundation} />
            <ReadinessCard title="Production ecosystem" value={checklist.readiness.productionEcosystem} />
          </div>

          <div className="verification-progress-box">
            <div>
              <span>Verification progress</span>
              <b>{summary.percentDone}%</b>
            </div>
            <div className="readiness-track">
              <div style={{ width: `${summary.percentDone}%` }} />
            </div>
            <p>{summary.done}/{summary.total} готово</p>
            <button type="button" onClick={resetProgress}>сброс</button>
          </div>

          <div className="verification-summary-row">
            <span>template done: <b>{totals.done}</b></span>
            <span>manual: <b>{totals.manual_required}</b></span>
            <span>blocked: <b>{totals.blocked}</b></span>
            <span>planned: <b>{totals.planned}</b></span>
            <span>local done: <b>{summary.done}</b></span>
          </div>
        </div>
      )}

      {activeView === 'stages' && (
        <div className="system-module-window">
          <div className="verification-filter-row">
            <button type="button" className={areaFilter === 'all' ? 'active' : ''} onClick={() => setAreaFilter('all')}>Все</button>
            {stageAreas.map(area => (
              <button key={area} type="button" className={areaFilter === area ? 'active' : ''} onClick={() => setAreaFilter(area)}>{area}</button>
            ))}
          </div>

          <div className="verification-stage-list compact-list">
            {filteredStages.map(stage => (
              <VerificationStageRow
                key={stage.id}
                stage={stage}
                status={getVerificationStageProgress(progressState, stage.id)?.status ?? defaultUserStatusFromStage(stage)}
                note={getVerificationStageProgress(progressState, stage.id)?.note ?? ''}
                onStatusChange={status => updateStage(stage.id, status)}
                onNoteChange={note => updateNote(stage.id, note)}
              />
            ))}
          </div>
        </div>
      )}

      {activeView === 'export' && (
        <div className="verification-handoff-box system-module-window">
          <div>
            <b>Export / Handoff report</b>
            
          </div>
          <div className="verification-handoff-actions">
            <button type="button" onClick={() => buildHandoff('markdown')}>собрать Markdown</button>
            <button type="button" onClick={() => buildHandoff('json')}>собрать JSON</button>
            <button type="button" disabled={!handoffText} onClick={copyHandoff}>копировать</button>
          </div>
          {handoffText ? (
            <textarea
              className="verification-handoff-output"
              readOnly
              value={handoffText}
              aria-label={`Verification handoff ${handoffMode}`}
            />
          ) : null}
        </div>
      )}

      {activeView === 'path' && (
        <div className="critical-path-box system-module-window">
          <b>Критический путь</b>
          {checklist.nextCriticalPath.map(step => <p key={step}>{step}</p>)}
        </div>
      )}
    </section>
  );
}

function VerificationStageRow(props: {
  stage: VerificationStage;
  status: VerificationStageUserStatus;
  note: string;
  onStatusChange: (status: VerificationStageUserStatus) => void;
  onNoteChange: (note: string) => void;
}) {
  return (
    <div className={`verification-stage ${props.status}`}>
      <div className="verification-stage-main">
        <b>{props.stage.title}</b>
        <span>{props.stage.area} • {compactStageStatus(props.status)}</span>
      </div>
      <details className="runtime-result-details">
        <summary>детали</summary>
        <p>{props.stage.description}</p>
        <small>{props.stage.evidence}</small>
      </details>
      <div className="verification-stage-controls">
        <button type="button" onClick={() => props.onStatusChange('not_started')}>нет</button>
        <button type="button" onClick={() => props.onStatusChange('in_progress')}>в работе</button>
        <button type="button" onClick={() => props.onStatusChange('done')}>готово</button>
        <button type="button" onClick={() => props.onStatusChange('blocked')}>блок</button>
      </div>
      <textarea
        placeholder="короткая заметка"
        value={props.note}
        onChange={event => props.onNoteChange(event.target.value)}
      />
    </div>
  );
}

function compactStageStatus(status: VerificationStageUserStatus) {
  if (status === 'not_started') return 'нет';
  if (status === 'in_progress') return 'работа';
  if (status === 'done') return 'ok';
  return 'блок';
}

function ReadinessCard(props: { title: string; value: number }) {
  return (
    <div className="readiness-card">
      <span>{props.title}</span>
      <b>{props.value}%</b>
      <div className="readiness-track">
        <div style={{ width: `${props.value}%` }} />
      </div>
    </div>
  );
}
