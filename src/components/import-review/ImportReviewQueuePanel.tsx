'use client';

import { useEffect, useMemo, useState } from 'react';
import { getRiskLabel, importReviewQueueMock, summarizeImportReviewQueue, type ImportCandidate } from '@/lib/import-review/importReviewQueueModel';
import { dayCoreInputMock, summarizeDayCoreInput, type DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { applyImportReviewAction, canCandidateAffectDayCore, getCandidateActionAvailability, getEntityApplyTarget, type ImportReviewAuditEvent } from '@/lib/import-review/importReviewActions';
import { applyCandidateToDayCore, buildDayCoreApplyPreview, summarizeApplyPreview } from '@/lib/day-core/dayCoreApplyLayer';
import {
  browserLocalImportReviewAdapter,
  buildPersistedImportReviewState,
  createInitialImportReviewState,
  getImportReviewSyncLabel,
  resetImportReviewPersistence,
  type ImportReviewPersistedState
} from '@/lib/import-review/importReviewPersistence';
import {
  addAppliedPatchRecord,
  browserLocalDayCorePatchAdapter,
  createAppliedPatchRecord,
  createInitialDayCorePatchState,
  getDayCorePatchStorageLabel,
  resetDayCorePatchPersistence,
  rollbackAppliedPatchRecord,
  type DayCorePatchPersistedState
} from '@/lib/day-core/dayCorePatchPersistence';

type CandidatePatch = Partial<Pick<ImportCandidate, 'title' | 'amount' | 'proposedCategory' | 'proposedDayId'>>;

export function ImportReviewQueuePanel() {
  const [persistedState, setPersistedState] = useState<ImportReviewPersistedState>(() => createInitialImportReviewState());
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(importReviewQueueMock.candidates[0]?.id ?? '');
  const [hydrated, setHydrated] = useState(false);
  const [dayCorePatchState, setDayCorePatchState] = useState<DayCorePatchPersistedState>(() => createInitialDayCorePatchState(dayCoreInputMock));
  const dayCoreDraft: DayCoreInputModel = dayCorePatchState.dayCore;

  const candidates = persistedState.queue.candidates;
  const auditEvents = persistedState.auditEvents;

  useEffect(() => {
    const savedState = browserLocalImportReviewAdapter.read();
    if (savedState) {
      setPersistedState(savedState);
      setSelectedCandidateId(savedState.queue.candidates[0]?.id ?? '');
    }
    const savedPatchState = browserLocalDayCorePatchAdapter.read();
    if (savedPatchState) {
      setDayCorePatchState(savedPatchState);
    }
    setHydrated(true);
  }, []);

  function persistNextState(nextState: ImportReviewPersistedState) {
    setPersistedState(nextState);
    browserLocalImportReviewAdapter.write(nextState);
  }

  function updateWithAction(candidateId: string, nextCandidate: ImportCandidate, auditEvent: ImportReviewAuditEvent) {
    const nextCandidates = candidates.map(candidate => candidate.id === candidateId ? nextCandidate : candidate);
    const nextAuditEvents = [auditEvent, ...auditEvents].slice(0, 40);
    persistNextState(buildPersistedImportReviewState(nextCandidates, nextAuditEvents, persistedState));
  }

  const queue = useMemo(() => ({ ...persistedState.queue, candidates }), [persistedState.queue, candidates]);
  const summary = summarizeImportReviewQueue(queue);
  const dayInput = summarizeDayCoreInput(dayCoreDraft);
  const selectedCandidate = candidates.find(candidate => candidate.id === selectedCandidateId) ?? candidates[0];
  const applyPreview = selectedCandidate ? buildDayCoreApplyPreview(selectedCandidate, dayCoreDraft) : null;

  function updateCandidate(candidateId: string, patch: CandidatePatch) {
    const current = candidates.find(candidate => candidate.id === candidateId);
    if (!current) return;
    const result = applyImportReviewAction(current, 'edit_before_apply', patch, 'user');
    updateWithAction(candidateId, result.candidate, result.auditEvent);
  }

  function runAction(candidate: ImportCandidate, action: 'approve' | 'reject' | 'attach_to_day' | 'merge_duplicate') {
    const result = applyImportReviewAction(candidate, action, {
      proposedDayId: candidate.proposedDayId ?? 'demo-2026-06-17',
      mergeIntoCandidateId: candidate.duplicateCandidateIds[0],
      rejectionReason: 'Rejected in v1.26 persistent review state layer.'
    }, 'user');

    updateWithAction(candidate.id, result.candidate, result.auditEvent);
  }

  function persistNextPatchState(nextState: DayCorePatchPersistedState) {
    setDayCorePatchState(nextState);
    browserLocalDayCorePatchAdapter.write(nextState);
  }

  function applySelectedCandidateToDayCore() {
    if (!selectedCandidate) return;
    const beforeDayCore = dayCorePatchState.dayCore;
    const result = applyCandidateToDayCore(selectedCandidate, beforeDayCore, 'user');
    if (!result.preview.canApply || !result.historyEvent) return;

    const record = createAppliedPatchRecord({
      candidateId: selectedCandidate.id,
      dayId: selectedCandidate.proposedDayId ?? beforeDayCore.dayId,
      beforeDayCore,
      afterDayCore: result.dayCore,
      historyEvent: result.historyEvent
    });
    persistNextPatchState(addAppliedPatchRecord(dayCorePatchState, record, result.auditEvent));
    if (result.auditEvent) {
      persistNextState(buildPersistedImportReviewState(candidates, [result.auditEvent, ...auditEvents].slice(0, 40), persistedState));
    }
  }

  function rollbackAppliedRecord(recordId: string) {
    persistNextPatchState(rollbackAppliedPatchRecord(dayCorePatchState, recordId));
  }


  function resetDemoState() {
    const nextState = resetImportReviewPersistence();
    const nextPatchState = resetDayCorePatchPersistence(dayCoreInputMock);
    setSelectedCandidateId(nextState.queue.candidates[0]?.id ?? '');
    persistNextState(nextState);
    persistNextPatchState(nextPatchState);
  }

  return (
    <section className="card import-review-card">
      <div className="section-kicker">v1.28 • Persistent patches + rollback</div>
      <h2 className="card-heading">Очередь проверки импорта</h2>
      <p className="card-description">
        Подтверждённые кандидаты теперь сохраняются как applied patch records: есть dry-run preview, явное применение, локальное хранение, audit и rollback-команда. Сырые банковские и личные данные в UI не выводятся.
      </p>

      <div className="review-persistence-bar">
        <span>{hydrated ? getImportReviewSyncLabel(persistedState.storageMode) : 'загрузка состояния'}</span>
        <span>{getDayCorePatchStorageLabel(dayCorePatchState)}</span>
        <span>обновлено: {new Date(persistedState.updatedAt).toLocaleString('ru-RU')}</span>
        <button type="button" onClick={resetDemoState}>сбросить demo</button>
      </div>

      <div className="stats-grid two import-review-stats">
        <SmallStat label="Кандидатов" value={String(summary.total)} />
        <SmallStat label="Нужно проверить" value={String(summary.needsReview)} />
        <SmallStat label="Высокий риск" value={String(summary.highRisk)} />
        <SmallStat label="Свободно сейчас" value={formatRub(dayInput.freeMoneyNow)} />
      </div>

      <div className="review-workbench">
        <div className="import-candidate-list">
          {candidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={candidate.id === selectedCandidate?.id}
              onSelect={() => setSelectedCandidateId(candidate.id)}
              onAction={runAction}
            />
          ))}
        </div>

        {selectedCandidate ? (
          <CandidateEditor
            candidate={selectedCandidate}
            onUpdate={patch => updateCandidate(selectedCandidate.id, patch)}
          />
        ) : null}
      </div>

      {applyPreview ? (
        <div className="day-apply-preview">
          <div className="audit-log-heading">Day Core apply preview • dry-run</div>
          <div className={`apply-status ${applyPreview.canApply ? 'ready' : 'blocked'}`}>
            {summarizeApplyPreview(applyPreview)}
          </div>
          {applyPreview.blockedReasons.length > 0 ? (
            <ul className="apply-block-list">
              {applyPreview.blockedReasons.map(reason => <li key={reason}>{reason}</li>)}
            </ul>
          ) : (
            <div className="patch-list">
              {applyPreview.patches.map(patch => (
                <div className="patch-item" key={patch.id}>
                  <b>{patch.operation}</b> → {patch.targetPath}
                  <span>{patch.description}</span>
                </div>
              ))}
            </div>
          )}
          <button className="apply-day-button" disabled={!applyPreview.canApply} onClick={applySelectedCandidateToDayCore} type="button">
            apply to Day Core demo
          </button>
          <div className="apply-day-summary">
            Day Core сейчас: грязными {formatRub(dayCoreDraft.taxi.grossDone)} • топливо оплачено {formatRub(dayCoreDraft.taxi.fuelAlreadyPaid)} • задач {dayCoreDraft.tasks.length}
          </div>
        </div>
      ) : null}

      <div className="audit-log-preview">
        <div className="audit-log-heading">Audit log preview • persisted</div>
        {auditEvents.length === 0 ? (
          <p className="audit-empty">Пока действий нет. Нажми approve / reject / attach, чтобы увидеть безопасный журнал.</p>
        ) : (
          auditEvents.slice(0, 10).map(event => (
            <div className="audit-event" key={event.id}>
              <b>{event.action}</b> • {event.beforeStatus} → {event.afterStatus}
              <span>{event.note}</span>
            </div>
          ))
        )}
      </div>

      {dayCorePatchState.appliedRecords.length > 0 ? (
        <div className="apply-history-preview">
          <div className="audit-log-heading">Day Core applied patches • persistent rollback</div>
          {dayCorePatchState.appliedRecords.slice(0, 6).map(record => (
            <div className={`audit-event rollback-record ${record.rolledBackAt ? 'rolled-back' : ''}`} key={record.id}>
              <b>{record.dayId}</b> • {record.historyEvent.patches.length} patch(es) • {record.rolledBackAt ? 'rolled back' : 'active'}
              <span>{record.historyEvent.auditNote}</span>
              <button disabled={Boolean(record.rolledBackAt)} onClick={() => rollbackAppliedRecord(record.id)} type="button">
                rollback
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {dayCorePatchState.auditRecords.length > 0 ? (
        <div className="audit-log-preview patch-audit-preview">
          <div className="audit-log-heading">Patch audit • local persistence</div>
          {dayCorePatchState.auditRecords.slice(0, 6).map(event => (
            <div className="audit-event" key={event.id}>
              <b>{event.action}</b> • {event.dayId ?? 'no-day'}
              <span>{event.note}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CandidateCard(props: {
  candidate: ImportCandidate;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (candidate: ImportCandidate, action: 'approve' | 'reject' | 'attach_to_day' | 'merge_duplicate') => void;
}) {
  const { candidate } = props;
  const availability = getCandidateActionAvailability(candidate);
  const canApply = canCandidateAffectDayCore(candidate);

  return (
    <article className={`import-candidate ${candidate.risk} ${props.isSelected ? 'selected' : ''}`}>
      <button className="candidate-main-button" type="button" onClick={props.onSelect}>
        <div className="import-candidate-title">{candidate.title}</div>
        <div className="import-candidate-meta">
          {candidate.entityType} • {getRiskLabel(candidate.risk)} • уверенность {Math.round(candidate.confidence * 100)}%
        </div>
        <div className="import-candidate-reason">{candidate.reviewReason}</div>
        <div className="candidate-target">Цель применения: {getEntityApplyTarget(candidate.entityType)}</div>
      </button>
      <div className="candidate-side">
        <div className={`import-candidate-action ${candidate.status}`}>{candidate.status}</div>
        <div className="review-action-stack">
          <button disabled={!availability.approve} onClick={() => props.onAction(candidate, 'approve')} type="button">approve</button>
          <button disabled={!availability.reject} onClick={() => props.onAction(candidate, 'reject')} type="button">reject</button>
          <button disabled={!availability.attachToDay} onClick={() => props.onAction(candidate, 'attach_to_day')} type="button">attach</button>
          <button disabled={!availability.mergeDuplicate} onClick={() => props.onAction(candidate, 'merge_duplicate')} type="button">merge</button>
        </div>
        <div className="candidate-apply-state">{canApply ? 'готов к Day Core' : 'не влияет на расчёты'}</div>
      </div>
    </article>
  );
}

function CandidateEditor(props: { candidate: ImportCandidate; onUpdate: (patch: CandidatePatch) => void }) {
  const { candidate } = props;
  return (
    <div className="candidate-editor">
      <div className="audit-log-heading">Edit before apply</div>
      <label>
        Название
        <input value={candidate.title} onChange={event => props.onUpdate({ title: event.target.value })} />
      </label>
      <label>
        Сумма
        <input
          inputMode="numeric"
          value={candidate.amount ?? ''}
          onChange={event => props.onUpdate({ amount: event.target.value === '' ? undefined : Number(event.target.value) })}
        />
      </label>
      <label>
        Категория
        <input value={candidate.proposedCategory ?? ''} onChange={event => props.onUpdate({ proposedCategory: event.target.value })} />
      </label>
      <label>
        День
        <input value={candidate.proposedDayId ?? ''} onChange={event => props.onUpdate({ proposedDayId: event.target.value })} />
      </label>
      <p>Редактирование переводит кандидата в ручную проверку, сохраняет состояние и создаёт audit-событие без сырых персональных данных.</p>
    </div>
  );
}

function SmallStat(props: { label: string; value: string }) {
  return (
    <div className="stat-box small-stat">
      <div className="stat-label">{props.label}</div>
      <div className="stat-value">{props.value}</div>
    </div>
  );
}
