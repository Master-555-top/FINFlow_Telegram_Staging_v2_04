'use client';

import { useMemo, useState } from 'react';
import {
  buildCsvJsonImportMapperPreview,
  buildImportReviewQueueFromCsvJsonPreview,
  type CsvJsonImportColumn,
  type CsvJsonImportMappedRow
} from '@/lib/data/csvJsonImportMapper';

const sampleCsv = `date;time;section;title;category;amount;note
20.06.26;08:48;work;Заказ такси Десятка → Производственная;Такси;350;ручной журнал
20.06.26;12:10;money;Продукты;Еда;900;обед и продукты
20.06.26;18:20;work;Заправка;Работа / Заправка;1800;AI-92
21.06.26;;funds;Платёж за машину;Обязательства;45000;каждое 6 число`;

export function CsvJsonImportMapperPanel(props: { compact?: boolean }) {
  const [sourceText, setSourceText] = useState(sampleCsv);
  const preview = useMemo(() => buildCsvJsonImportMapperPreview(sourceText), [sourceText]);
  const queuePreview = useMemo(() => buildImportReviewQueueFromCsvJsonPreview(preview), [preview]);
  const visibleRows = props.compact ? preview.rows.slice(0, 5) : preview.rows.slice(0, 10);

  return (
    <section className={`card money-engine-panel csv-json-import-mapper-panel ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Импорт таблиц</div>
      <h2 className="card-heading">Табличный импорт</h2>
      <p className="card-description">
        CSV/JSON → сопоставление колонок → массовый preview → Import Review Queue → Local Apply. Автозаписи нет: только confirm/rollback.
      </p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{preview.format}</span>
          <b>{preview.readyAfterConfirm}</b>
          <small>готово · review {preview.needsReview} · дублей {preview.duplicateHints}</small>
        </div>
        <p>{preview.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Rows" value={String(preview.totalRows)} />
        <Metric label="Mapped" value={String(preview.mappedRows)} />
        <Metric label="Queue" value={String(queuePreview.candidates.length)} />
        <Metric label="Reject" value={String(preview.rejectedLines.length)} />
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Колонки</b><span>auto mapping</span></div>
        <div className="money-template-row templates-template-row">
          {preview.columns.slice(0, 9).map(column => <ColumnChip key={column.sourceKey} column={column} />)}
        </div>
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Preview строк</b><span>{preview.readyAfterConfirm} ready</span></div>
        <div className="local-apply-draft-list">
          {visibleRows.map(row => <MappedRowCard key={row.id} row={row} />)}
        </div>
      </div>

      <textarea className="system-export-textarea" value={sourceText} onChange={event => setSourceText(event.target.value)} aria-label="CSV или JSON для табличного импорта" />

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Import Review Queue draft</b><span>{queuePreview.queueId}</span></div>
        <p className="quick-note">{queuePreview.candidates.filter(candidate => candidate.status === 'approved').length} approved · {queuePreview.candidates.filter(candidate => candidate.status === 'needs_review').length} review · source: {queuePreview.sourcePackage}</p>
      </div>
    </section>
  );
}

function ColumnChip(props: { column: CsvJsonImportColumn }) {
  return <span>{props.column.label} → {props.column.role}</span>;
}

function MappedRowCard(props: { row: CsvJsonImportMappedRow }) {
  const danger = props.row.confidence === 'low' || props.row.reviewReasons.length > 1;
  return (
    <article className={`local-apply-draft-card ${danger ? 'danger' : ''}`}>
      <label>
        <span>
          <b>{props.row.title}</b>
          <small>{props.row.dateIso ?? 'дата?'} · {props.row.targetSection} · {props.row.category}</small>
        </span>
        <em>{props.row.amount ?? 'сумма?'}</em>
      </label>
      {props.row.reviewReasons.length > 0 ? <p>{props.row.reviewReasons.slice(0, 3).join(' · ')}</p> : <p>Готово к проверке и добавлению.</p>}
    </article>
  );
}

function Metric(props: { label: string; value: string }) {
  return <div><b>{props.value}</b><span>{props.label}</span></div>;
}
