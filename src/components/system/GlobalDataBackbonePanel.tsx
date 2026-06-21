'use client';

import { useMemo, useState } from 'react';
import { buildCanonicalBackboneSummary, FINFLOW_CANONICAL_ENTITIES } from '@/lib/data/finflowCanonicalDataModel';
import { FINFLOW_DATA_KEYS } from '@/lib/data/finflowDataRegistry';
import { parseHistoricalImportDraft } from '@/lib/data/historicalImportDraft';
import { buildCanonicalWritePreview } from '@/lib/data/canonicalWriteAdapters';
import { buildMiniAppDeliveryPlan } from '@/lib/project/miniAppDeliveryPlan';

const sampleImport = '20.06.26 такси смена 8500\n20.06.26 бензин 1800\n20.06.26 продукты 900\n19.06.26 сон уснул 04:20 встал 14:20';

export function GlobalDataBackbonePanel() {
  const backbone = useMemo(() => buildCanonicalBackboneSummary(FINFLOW_DATA_KEYS), []);
  const delivery = useMemo(() => buildMiniAppDeliveryPlan(), []);
  const [draftText, setDraftText] = useState(sampleImport);
  const draft = useMemo(() => parseHistoricalImportDraft(draftText), [draftText]);
  const writePreview = useMemo(() => buildCanonicalWritePreview(draft), [draft]);
  const strongEntities = FINFLOW_CANONICAL_ENTITIES.filter(item => item.requiredForStrongMiniApp);

  return (
    <div className="system-data-panel global-backbone-panel">
      <div className="system-data-hero">
        <span>v2.38 • Data Backbone + Apply/Lifecycle</span>
        <b>{delivery.overallStrongMiniAppPercent}% готово</b>
        <p>До сильного полностью рабочего mini app осталось примерно {delivery.remainingPercent}%. Теперь учитываются apply/rollback шаблонов, lifecycle смены и readiness по слоям.</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Крупные слои</b>
          <span>{delivery.realisticBuildsLeft}</span>
        </div>
        {delivery.areas.map(area => (
          <article key={area.id} className={area.status === 'blocked' ? 'danger' : ''}>
            <b>{area.title}</b>
            <span>{area.percent}% · {area.status}</span>
          </article>
        ))}
      </div>

      <div className="system-data-timeline">
        <div className="system-data-preview-head">
          <b>Canonical entities</b>
          <span>{backbone.readiness}% data-readiness</span>
        </div>
        {strongEntities.map(entity => (
          <article key={entity.kind} className={`data-timeline-row data-${entity.section === 'sleep' ? 'sleep' : entity.section === 'work' ? 'fuel' : 'record'}`}>
            <span>{entity.section}</span>
            <b>{entity.label}</b>
            <em>{entity.localStatus} → {entity.cloudTable}</em>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Historical import draft</b>
          <span>{draft.acceptedByParser}/{draft.totalLines} parsed · review {draft.needsReview}</span>
        </div>
        {draft.items.slice(0, 5).map(item => (
          <article key={item.id} className={item.confidence === 'low' ? 'danger' : ''}>
            <b>{item.dateIso ?? 'дата?' } · {item.targetSection}</b>
            <span>{item.amount ?? 'сумма?'} · {item.confidence}</span>
          </article>
        ))}
      </div>


      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Canonical write preview</b>
          <span>{writePreview.readyAfterConfirm}/{writePreview.totalCandidates} ready · дублей {writePreview.duplicateHints}</span>
        </div>
        {writePreview.candidates.slice(0, 5).map(candidate => (
          <article key={candidate.id} className={candidate.safety === 'blocked_needs_manual_review' ? 'danger' : ''}>
            <b>{candidate.dateIso ?? 'дата?'} · {candidate.section}/{candidate.entityKind}</b>
            <span>{candidate.amount ?? 'сумма?'} · {candidate.writeAdapter === 'daily_records_money_work_v2_37' ? 'money/work adapter' : 'позже'}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Visual baseline locked</b>
          <span>Sleep + System</span>
        </div>
        <article>
          <b>Sleep History list</b>
          <span>считать эталоном: кратко, логично, информативно</span>
        </article>
        <article>
          <b>7-day Sleep chart</b>
          <span>ПН–ВС, даты аккуратно, без лишних заголовков</span>
        </article>
        <article>
          <b>System grid</b>
          <span>оставить текущую плиточную структуру</span>
        </article>
      </div>

      <textarea className="system-export-textarea" value={draftText} onChange={event => setDraftText(event.target.value)} aria-label="Черновик исторического импорта" />

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Следующий build</b>
          <span>{delivery.nextBuild}</span>
        </div>
        {delivery.criticalPath.slice(0, 4).map(step => (
          <article key={step}>
            <b>{step}</b>
            <span>critical path</span>
          </article>
        ))}
      </div>
    </div>
  );
}
