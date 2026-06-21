import type { DailyAllocationBucket } from '@/lib/day-core/dailyAllocationModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import type { DailyRecordType } from '@/lib/day-core/dailyRecordsModel';

export function AllocationBucketRow(props: { bucket: DailyAllocationBucket }) {
  const percent = props.bucket.targetAmount > 0 ? Math.round((props.bucket.allocatedAmount / props.bucket.targetAmount) * 100) : 0;
  return (
    <article className={`allocation-bucket ${props.bucket.priority}`}>
      <div>
        <div className="allocation-bucket-title">{props.bucket.title}</div>
        <div className="allocation-bucket-note">{props.bucket.reason}</div>
        <ProgressBar value={percent} />
      </div>
      <div className="allocation-bucket-money">
        <b>{formatRub(props.bucket.allocatedAmount)}</b>
        <span>из {formatRub(props.bucket.targetAmount)}</span>
        {props.bucket.remainingNeed > 0 ? <small>ещё {formatRub(props.bucket.remainingNeed)}</small> : <small>закрыто</small>}
      </div>
    </article>
  );
}


export function LiveStateStatus(props: { syncedAt: string }) {
  return (
    <div className="live-state-status-pill">
      <b>live-state</b>
      <span>{props.syncedAt ? `сохранено ${new Date(props.syncedAt).toLocaleTimeString('ru-RU')}` : 'готов к первому сохранению'}</span>
    </div>
  );
}

export function MoneyInput(props: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label className="quick-money-input">
      <span>{props.label}</span>
      <input inputMode="numeric" value={String(props.value)} onChange={event => props.onChange(event.target.value)} />
    </label>
  );
}

export function ProgressBar(props: { value: number }) {
  return (
    <div className="progress-track" aria-label={`Прогресс ${props.value}%`}>
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, props.value))}%` }} />
    </div>
  );
}

export function parseMoney(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

export function parseRate(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(parsed)) return 0;
  if (parsed > 1) return Math.max(0, Math.min(0.5, parsed / 100));
  return Math.max(0, Math.min(0.5, parsed));
}

export function markNote(previous: string[], note: string) {
  return [note, ...previous.filter(item => item !== note)].slice(0, 12);
}

export function formatSignedRub(value: number) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatRub(value)}`;
}

export function getRecordTypeLabel(type: DailyRecordType) {
  if (type === 'taxi_order') return 'Заказ такси';
  if (type === 'fuel') return 'Бензин';
  if (type === 'drivee_topup') return 'Drivee пополнение';
  if (type === 'income') return 'Доход';
  return 'Расход';
}
