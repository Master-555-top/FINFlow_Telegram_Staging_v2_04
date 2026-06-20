'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildTelegramSupabaseVerificationChecklist, type VerificationStage, type VerificationStageId } from '@/lib/deployment/telegramSupabaseVerificationChecklist';
import { buildVerificationHandoffReport } from '@/lib/deployment/verificationHandoffReport';
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

export function TelegramSupabaseVerificationChecklistPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [progressState, setProgressState] = useState<VerificationChecklistProgressState>(() => createInitialVerificationChecklistProgressState(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`));
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
    <section className="verification-checklist-panel">
      <div className="verification-head">
        <span>v1.84 • Verification Export / Handoff</span>
        <b>Готовность проекта</b>
        <p>
          Чеклист можно отмечать, сохранять локально и выгружать как безопасный handoff-отчёт без секретов.
        </p>
      </div>

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
        <p>
          Выполнено {summary.done}/{summary.total}. Следующий шаг: {summary.nextManualStage?.title ?? 'все шаги отмечены'}.
        </p>
        <button type="button" onClick={resetProgress}>сбросить отметки</button>
      </div>

      <div className="verification-summary-row">
        <span>template done: <b>{totals.done}</b></span>
        <span>manual: <b>{totals.manual_required}</b></span>
        <span>blocked: <b>{totals.blocked}</b></span>
        <span>planned: <b>{totals.planned}</b></span>
        <span>local done: <b>{summary.done}</b></span>
      </div>

      <div className="verification-stage-list">
        {checklist.stages.map(stage => (
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


      <div className="verification-handoff-box">
        <div>
          <b>Export / Handoff report</b>
          <p>Безопасный отчёт для следующего чата, Codex или ручной проверки. Реальные секреты не включаются.</p>
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


      <div className="critical-path-box">
        <b>Критический путь до реального ежедневного Mini App</b>
        {checklist.nextCriticalPath.map(step => <p key={step}>{step}</p>)}
      </div>
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
      <div>
        <b>{props.stage.title}</b>
        <span>{props.stage.area} • {props.status}</span>
      </div>
      <p>{props.stage.description}</p>
      <small>{props.stage.evidence}</small>
      <div className="verification-stage-controls">
        <button type="button" onClick={() => props.onStatusChange('not_started')}>не начато</button>
        <button type="button" onClick={() => props.onStatusChange('in_progress')}>в работе</button>
        <button type="button" onClick={() => props.onStatusChange('done')}>готово</button>
        <button type="button" onClick={() => props.onStatusChange('blocked')}>блокер</button>
      </div>
      <textarea
        placeholder="заметка / ссылка / что проверить дальше"
        value={props.note}
        onChange={event => props.onNoteChange(event.target.value)}
      />
    </div>
  );
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
