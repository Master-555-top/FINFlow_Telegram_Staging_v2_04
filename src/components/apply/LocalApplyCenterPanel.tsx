'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { CustomDailyRecordTemplate, DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { deriveDayInputFromRecords } from '@/lib/day-core/dailyRecordsModel';
import { createDefaultEditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import { createInitialFuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';
import { recordsStorageKey } from '@/components/day-core/DailyQuickInputConfig';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { createInitialImportReviewState, browserLocalImportReviewAdapter } from '@/lib/import-review/importReviewPersistence';
import { buildTemplatesEngineSnapshot } from '@/lib/templates/finflowTemplatesEngine';
import { buildTemplateApplyPreview } from '@/lib/templates/templateApplyEngine';
import {
  applyLocalDraftsToDailyRecords,
  buildLocalApplyPreview,
  rollbackLocalApplyBatch,
  type LocalApplyBatch,
  type LocalApplyDraft
} from '@/lib/apply/localApplyEngine';
import {
  browserLocalApplyAdapter,
  buildNextLocalApplyState,
  createInitialLocalApplyState,
  getLocalApplyStorageLabel,
  type LocalApplyPersistedState
} from '@/lib/apply/localApplyPersistence';
import {
  createDailyLiveStateOriginId,
  createDailyLiveStateSnapshot,
  readDailyLiveStateSnapshot,
  writeDailyLiveStateSnapshot
} from '@/lib/day-core/dailyLiveStatePersistence';

export function LocalApplyCenterPanel(props: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  compact?: boolean;
}) {
  const [originId] = useState(() => createDailyLiveStateOriginId());
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<LocalApplyPersistedState>(() => createInitialLocalApplyState(props.records));
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const liveSnapshot = readDailyLiveStateSnapshot();
    const saved = browserLocalApplyAdapter.read();
    const baseRecords = saved?.records ?? liveSnapshot?.records ?? props.records;
    const nextState = saved ?? createInitialLocalApplyState(baseRecords);
    setState(nextState);
    setHydrated(true);
  }, [props.records]);

  const importState = useMemo(() => browserLocalImportReviewAdapter.read() ?? createInitialImportReviewState(), []);
  const templateSnapshot = useMemo(() => buildTemplatesEngineSnapshot({
    dayInput: props.dayInput,
    records: state.records,
    customTemplates: props.customTemplates
  }), [props.customTemplates, props.dayInput, state.records]);
  const templateApplyPreview = useMemo(() => buildTemplateApplyPreview(templateSnapshot.allTemplates, state.records), [state.records, templateSnapshot.allTemplates]);
  const localPreview = useMemo(() => buildLocalApplyPreview({
    templatePreview: templateApplyPreview,
    importQueue: importState.queue,
    records: state.records
  }), [importState.queue, state.records, templateApplyPreview]);

  useEffect(() => {
    if (selectedDraftIds.length > 0) return;
    setSelectedDraftIds(localPreview.drafts.filter(draft => draft.status === 'ready_after_confirm').slice(0, 4).map(draft => draft.id));
  }, [localPreview.drafts, selectedDraftIds.length]);

  function persistState(nextState: LocalApplyPersistedState) {
    setState(nextState);
    browserLocalApplyAdapter.write(nextState);
    publishRecordsToDailyLiveState(nextState.records);
  }

  function publishRecordsToDailyLiveState(nextRecords: DailyRecord[]) {
    if (typeof window === 'undefined') return;
    const liveSnapshot = readDailyLiveStateSnapshot();
    const nextDayInput = deriveDayInputFromRecords(liveSnapshot?.dayInput ?? props.dayInput, nextRecords);
    window.localStorage.setItem(recordsStorageKey, JSON.stringify(nextRecords));
    writeDailyLiveStateSnapshot(createDailyLiveStateSnapshot({
      originTabId: originId,
      source: 'local_input',
      dayInput: nextDayInput,
      records: nextRecords,
      customTemplates: liveSnapshot?.customTemplates ?? props.customTemplates,
      bankDecisions: liveSnapshot?.bankDecisions ?? [],
      fuelInputState: liveSnapshot?.fuelInputState ?? createDefaultEditableFuelInputState(),
      fuelHistoryState: liveSnapshot?.fuelHistoryState ?? createInitialFuelOdometerHistoryState()
    }));
  }

  function toggleDraft(draftId: string) {
    setSelectedDraftIds(prev => prev.includes(draftId) ? prev.filter(id => id !== draftId) : [...prev, draftId]);
  }

  function selectReadyDrafts() {
    setSelectedDraftIds(localPreview.drafts.filter(draft => draft.status === 'ready_after_confirm').slice(0, 8).map(draft => draft.id));
  }

  function applySelectedDrafts() {
    const result = applyLocalDraftsToDailyRecords({
      drafts: localPreview.drafts,
      records: state.records,
      selectedDraftIds
    });
    const nextState = buildNextLocalApplyState({
      previous: state,
      records: result.nextRecords,
      batches: result.appliedCount > 0 ? [result.batch, ...state.batches].slice(0, 20) : state.batches,
      auditEvents: [result.auditEvent, ...state.auditEvents].slice(0, 50)
    });
    persistState(nextState);
    setSelectedDraftIds([]);
    setStatusText(`Записано: ${result.appliedCount}. Пропущено: ${result.skippedCount}.`);
  }

  function rollbackBatch(batch: LocalApplyBatch) {
    if (batch.rolledBackAtIso) return;
    const rollback = rollbackLocalApplyBatch(state.records, batch);
    const nextBatches = state.batches.map(item => item.id === batch.id ? rollback.rolledBackBatch : item);
    const nextState = buildNextLocalApplyState({
      previous: state,
      records: rollback.nextRecords,
      batches: nextBatches,
      auditEvents: [rollback.auditEvent, ...state.auditEvents].slice(0, 50)
    });
    persistState(nextState);
    setStatusText(`Rollback: удалено ${batch.recordIds.length} записей batch.`);
  }

  function resetLocalApply() {
    const liveSnapshot = readDailyLiveStateSnapshot();
    const baseRecords = liveSnapshot?.records ?? props.records;
    browserLocalApplyAdapter.clear();
    const nextState = createInitialLocalApplyState(baseRecords);
    persistState(nextState);
    setSelectedDraftIds([]);
    setStatusText('Черновики очищены. Текущие записи сохранены.');
  }

  const latestBatch = state.batches.find(batch => !batch.rolledBackAtIso) ?? state.batches[0];
  const visibleDrafts = props.compact ? localPreview.drafts.slice(0, 6) : localPreview.drafts.slice(0, 12);

  return (
    <section className={`card money-engine-panel local-apply-panel ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Проверка записей</div>
      <h2 className="card-heading">Подтверждение записей</h2>
      <p className="card-description">
        Сначала проверь записи из шаблонов и импорта, потом добавь их в день. Всё можно откатить.
      </p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{hydrated ? getLocalApplyStorageLabel(state) : 'загрузка'}</span>
          <b>{localPreview.readyAfterConfirm}</b>
          <small>можно добавить · всего записей {state.records.length}</small>
        </div>
        <p>{localPreview.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Готово" value={String(localPreview.readyAfterConfirm)} />
        <Metric label="Проверить" value={String(localPreview.reviewNeeded)} />
        <Metric label="Дубли" value={String(localPreview.duplicates)} />
        <Metric label="Добавления" value={String(state.batches.length)} />
      </div>

      <div className="money-engine-block compact template-apply-preview">
        <div className="money-engine-head"><b>Черновики</b><span>{selectedDraftIds.length} выбрано</span></div>
        <div className="local-apply-draft-list">
          {visibleDrafts.map(draft => (
            <DraftRow key={draft.id} draft={draft} checked={selectedDraftIds.includes(draft.id)} onToggle={() => toggleDraft(draft.id)} />
          ))}
        </div>
        <div className="system-data-actions template-apply-actions">
          <button type="button" onClick={selectReadyDrafts}>выбрать готовые</button>
          <button type="button" onClick={applySelectedDrafts} disabled={selectedDraftIds.length === 0}>подтвердить и записать</button>
          <button type="button" onClick={resetLocalApply}>очистить черновики</button>
        </div>
        {statusText ? <p className="system-data-status">{statusText}</p> : null}
      </div>

      {latestBatch ? (
        <div className="money-engine-block compact local-apply-batch-block">
          <div className="money-engine-head"><b>Последнее добавление</b><span>{latestBatch.rolledBackAtIso ? 'отменено' : 'активно'}</span></div>
          <p className="quick-note">{latestBatch.recordIds.length} записей · {new Date(latestBatch.createdAtIso).toLocaleString('ru-RU')}</p>
          <div className="money-template-row templates-template-row">
            {latestBatch.recordIds.slice(0, 6).map(id => <span key={id}>{id.slice(0, 22)}</span>)}
          </div>
          <div className="system-data-actions template-apply-actions">
            <button type="button" onClick={() => rollbackBatch(latestBatch)} disabled={Boolean(latestBatch.rolledBackAtIso)}>отменить добавление</button>
          </div>
        </div>
      ) : null}

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Локальные записи</b><span>влияют на Деньги и Работу</span></div>
        <div className="money-template-row templates-template-row">
          {state.records.slice(-8).reverse().map(record => (
            <span key={record.id}>{record.title} · {formatRub(record.amount)}</span>
          ))}
        </div>
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Журнал</b><span>{state.auditEvents.length} событий</span></div>
        {state.auditEvents.slice(0, 5).map(event => (
          <article className="money-signal signal-green" key={event.id}>
            <div><b>{event.action}</b><span>{event.note}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DraftRow(props: { draft: LocalApplyDraft; checked: boolean; onToggle: () => void }) {
  const canSelect = props.draft.status === 'ready_after_confirm';
  return (
    <article className={`templates-line local-apply-draft status-${props.draft.status}`}>
      <label className="editable-check">
        <input type="checkbox" checked={props.checked} disabled={!canSelect} onChange={props.onToggle} />
        <span>{props.draft.source === 'template' ? 'шаблон' : 'импорт'}</span>
      </label>
      <div>
        <b>{props.draft.title}</b>
        <span>{props.draft.section} • {props.draft.status}{props.draft.reviewReasons[0] ? ` • ${props.draft.reviewReasons[0]}` : ''}</span>
      </div>
      <em>{props.draft.amount ? formatRub(props.draft.amount) : '—'}</em>
    </article>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div className="money-engine-metric metric-amber">
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}
