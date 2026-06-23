'use client';

import { useMemo, useState } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { CustomDailyRecordTemplate, DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { buildTemplatesEngineSnapshot, type FinflowTemplateDefinition, type FinflowTemplateGroup } from '@/lib/templates/finflowTemplatesEngine';
import { applyApprovedTemplateDraftsToDailyRecords, buildTemplateApplyPreview, rollbackTemplateApplyResult, type TemplateApplyResult } from '@/lib/templates/templateApplyEngine';

export function TemplatesEnginePanel(props: {
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  compact?: boolean;
}) {
  const [lastApplyResult, setLastApplyResult] = useState<TemplateApplyResult | null>(null);
  const snapshot = useMemo(() => buildTemplatesEngineSnapshot({
    dayInput: props.dayInput,
    records: props.records,
    customTemplates: props.customTemplates
  }), [props.dayInput, props.records, props.customTemplates]);
  const applyPreview = useMemo(() => buildTemplateApplyPreview(snapshot.allTemplates, props.records), [snapshot.allTemplates, props.records]);
  const readyDraftIds = useMemo(() => applyPreview.drafts.filter(draft => draft.safety === 'ready_after_confirm').slice(0, 3).map(draft => draft.id), [applyPreview.drafts]);

  function runPreviewApply() {
    setLastApplyResult(applyApprovedTemplateDraftsToDailyRecords(applyPreview.drafts, props.records, readyDraftIds));
  }

  function runRollbackPreview() {
    if (!lastApplyResult) return;
    const rolledBackRecords = rollbackTemplateApplyResult(lastApplyResult);
    setLastApplyResult({
      ...lastApplyResult,
      nextRecords: rolledBackRecords,
      appliedCount: 0,
      skippedCount: lastApplyResult.skippedCount + lastApplyResult.auditEvents.length,
      auditEvents: []
    });
  }

  return (
    <section className={`card money-engine-panel templates-engine-panel ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">v2.38 • Templates Engine + Apply</div>
      <h2 className="card-heading">Шаблоны: быстрый ввод и повторения</h2>
      <p className="card-description">Единый registry для денег, работы, фондов, дня и recurring-сценариев: шаблон → preview → confirm → запись → rollback.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>Готовность шаблонов</span>
          <b>{snapshot.percentReady}%</b>
          <small>{snapshot.readyLocalTemplates}/{snapshot.totalTemplates} готовы локально · {snapshot.customTemplates} своих</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Всего" value={`${snapshot.totalTemplates}`} />
        <Metric label="Готово" value={`${snapshot.readyLocalTemplates}`} />
        <Metric label="Apply-ready" value={`${applyPreview.readyAfterConfirm}`} />
        <Metric label="Своих" value={`${snapshot.customTemplates}`} />
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Быстрые шаблоны</b><span>для записи в Деньги/Работу</span></div>
        <div className="money-template-row templates-template-row">
          {snapshot.quickRecordTemplates.slice(0, props.compact ? 8 : 12).map(template => (
            <span key={template.id}>{template.label}{template.defaultAmount ? ` · ${formatRub(template.defaultAmount)}` : ''}</span>
          ))}
        </div>
      </div>


      <div className="money-engine-block compact template-apply-preview">
        <div className="money-engine-head"><b>Apply preview</b><span>{applyPreview.readyAfterConfirm}/{applyPreview.totalDrafts} ready · дублей {applyPreview.duplicateHints}</span></div>
        <div className="money-template-row templates-template-row">
          {applyPreview.drafts.filter(draft => draft.safety === 'ready_after_confirm').slice(0, props.compact ? 4 : 8).map(draft => (
            <span key={draft.id}>{draft.templateLabel}{draft.amount ? ` · ${formatRub(draft.amount)}` : ''}</span>
          ))}
        </div>
        {!props.compact ? (
          <div className="system-data-actions template-apply-actions">
            <button type="button" onClick={runPreviewApply} disabled={readyDraftIds.length === 0}>Применить preview</button>
            <button type="button" onClick={runRollbackPreview} disabled={!lastApplyResult}>Rollback</button>
          </div>
        ) : null}
        {lastApplyResult ? <p className="system-data-status">Apply: {lastApplyResult.appliedCount} · rollback ids: {lastApplyResult.rollbackSnapshot.recordIdsToRemove.length}</p> : null}
      </div>

      <div className="money-engine-block compact template-recurring-preview">
        <div className="money-engine-head"><b>Повторения</b><span>{applyPreview.recurringOccurrences.length} ближайших</span></div>
        <div className="money-template-row templates-template-row">
          {applyPreview.recurringOccurrences.slice(0, props.compact ? 4 : 8).map(item => (
            <span key={item.id}>{item.templateLabel} · {item.dueLabel}</span>
          ))}
        </div>
      </div>

      {!props.compact ? (
        <div className="templates-engine-groups">
          {snapshot.groups.map(group => <TemplateGroupCard key={group.id} group={group} />)}
        </div>
      ) : null}

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Сигналы</b><span>{snapshot.version}</span></div>
        {snapshot.recommendations.map(item => (
          <article key={item.id} className={`money-signal signal-${item.level}`}>
            <div><b>{item.title}</b><span>{item.message}</span></div>
          </article>
        ))}
      </div>
    </section>
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

function TemplateGroupCard(props: { group: FinflowTemplateGroup }) {
  return (
    <article className="money-engine-block templates-group-card">
      <div className="money-engine-head">
        <b>{props.group.title}</b>
        <span>{props.group.readyCount} готово · {props.group.needsConfirmationCount} confirm · {props.group.plannedCount} позже</span>
      </div>
      <p className="quick-note">{props.group.summary}</p>
      <div className="templates-group-list">
        {props.group.templates.slice(0, 5).map(template => <TemplateLine key={template.id} template={template} />)}
      </div>
    </article>
  );
}

function TemplateLine(props: { template: FinflowTemplateDefinition }) {
  return (
    <div className={`templates-line readiness-${props.template.readiness}`}>
      <div>
        <b>{props.template.label}</b>
        <span>{props.template.action}</span>
      </div>
      <em>{props.template.defaultAmount ? formatRub(props.template.defaultAmount) : props.template.cadence}</em>
    </div>
  );
}
