import type { MoneyBucket } from '@/lib/day-core/dayCoreModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';

export function MetricTile(props: { className?: string; label: string; value: string; sub: string; tone: string }) {
  return (
    <article className={`${props.className ?? 'day-metric-tile'} tone-${props.tone}`}>
      <span>{props.label}</span>
      <b>{props.value}</b>
      <small>{props.sub}</small>
    </article>
  );
}

export function FinanceTile(props: { label: string; value: string; sub: string }) {
  return (
    <article className="day-finance-tile">
      <span>{props.label}</span>
      <b>{props.value}</b>
      <small>{props.sub}</small>
    </article>
  );
}

export function ProgressBar(props: { value: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, props.value));
  return (
    <div className="progress-track" aria-label={props.label ?? `Прогресс ${safeValue}%`}>
      <div className="progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function ShiftBar(props: { label: string; value: number; max: number }) {
  const pct = Math.round((props.value / Math.max(1, props.max)) * 100);
  return (
    <div className="day-shift-bar">
      <div>
        <span>{props.label}</span>
        <b>{formatRub(props.value)}</b>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}

export function AllocationRow(props: { bucket: MoneyBucket }) {
  return (
    <article className={`allocation-row ${props.bucket.priority}`}>
      <div>
        <div className="allocation-title">{props.bucket.title}</div>
        <div className="allocation-note">{props.bucket.note}</div>
      </div>
      <div className="allocation-amount">{formatRub(props.bucket.amount)}</div>
    </article>
  );
}
