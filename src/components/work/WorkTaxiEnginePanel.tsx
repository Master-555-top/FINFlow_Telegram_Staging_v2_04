'use client';

import { useMemo } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { buildWorkTaxiShiftSnapshot, type WorkTaxiMode } from '@/lib/work/workTaxiEngine';
import { buildWorkShiftLifecycleSnapshot } from '@/lib/work/workShiftLifecycle';

export function WorkTaxiEnginePanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[] }) {
  const snapshot = useMemo(() => buildWorkTaxiShiftSnapshot(props.dayInput, props.records), [props.dayInput, props.records]);
  const lifecycle = useMemo(() => buildWorkShiftLifecycleSnapshot(props.dayInput, props.records), [props.dayInput, props.records]);

  return (
    <section className={`card work-engine-panel work-engine-${snapshot.mode}`}>
      <div className="section-kicker">Работа и такси</div>
      <h2 className="card-heading">Работа: смена, темп, издержки</h2>
      <p className="card-description">Рабочий слой такси: заказы, грязный оборот, ₽/час, бензин, Drivee и связь с Деньгами.</p>

      <div className="money-engine-hero work-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{formatRub(snapshot.shift.grossDone)}</b>
          <small>{snapshot.shift.ordersCount} заказ(ов) · {snapshot.shift.activeHours}ч активно</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics work-engine-metrics">
        <Metric label="Активный ₽/ч" value={`${snapshot.shift.activeRubPerHour.toLocaleString('ru-RU')} ₽`} mode={paceMode(snapshot.shift.activeRubPerHour, snapshot.shift.targetActiveRubPerHour)} />
        <Metric label="Смена ₽/ч" value={`${snapshot.shift.shiftRubPerHour.toLocaleString('ru-RU')} ₽`} mode={paceMode(snapshot.shift.shiftRubPerHour, snapshot.shift.targetShiftRubPerHour)} />
        <Metric label="Осталось" value={formatRub(snapshot.shift.remainingGrossToTarget)} mode={snapshot.shift.remainingGrossToTarget > 0 ? 'amber' : 'green'} />
        <Metric label="Чистыми после работы" value={formatRub(snapshot.costs.netAfterWorkCosts)} mode={snapshot.mode} />
      </div>

      <div className="money-engine-sources work-engine-sources">
        <Source label="Бензин" value={formatRub(snapshot.costs.fuelPaid)} meta={`план ${formatRub(snapshot.costs.fuelPlanned)}`} />
        <Source label="Drivee" value={formatRub(snapshot.costs.estimatedDriveeCommission)} meta={`${snapshot.costs.driveeRatePercent}% оценка`} />
        <Source label="Пробег" value={`${snapshot.costs.distanceKmPlannedMin}–${snapshot.costs.distanceKmPlannedMax} км`} meta={`${snapshot.costs.expectedFuelCostPerKmMin}–${snapshot.costs.expectedFuelCostPerKmMax} ₽/км`} />
      </div>

      <div className="money-engine-block compact work-lifecycle-block">
        <div className="money-engine-head"><b>Состояние смены</b><span>{lifecycle.version}</span></div>
        <div className="money-engine-hero work-lifecycle-hero">
          <div>
            <span>{lifecycle.headline}</span>
            <b>{lifecycle.progressPercent}%</b>
            <small>{lifecycle.shift.ordersCount} заказ(ов) · {lifecycle.shift.fullShiftHours}ч окно</small>
          </div>
          <p>{lifecycle.nextAction}</p>
        </div>
        <div className="money-template-row work-lifecycle-actions">
          <span>{lifecycle.canOpenShift ? 'можно открыть смену' : 'смена в процессе'}</span>
          <span>{lifecycle.canAddOrder ? 'можно добавить заказ' : 'нужен старт'}</span>
          <span>{lifecycle.canCloseShift ? 'можно закрыть' : 'закрытие позже'}</span>
        </div>
        <p className="quick-note">{lifecycle.closePreview.summary}</p>
        {lifecycle.checkpoints.map(checkpoint => (
          <article key={checkpoint.id} className={`money-signal signal-${checkpoint.level}`}>
            <div><b>{checkpoint.title}</b><span>{checkpoint.message}</span></div>
          </article>
        ))}
      </div>

      <div className="money-engine-block">
        <div className="money-engine-head"><b>Связка разделов</b><span>Работа → Деньги → День → Сон</span></div>
        <BridgeLine text={snapshot.bridge.moneyImpact} />
        <BridgeLine text={snapshot.bridge.dayImpact} />
        <BridgeLine text={snapshot.bridge.sleepImpact} />
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Шаблоны работы</b><span>foundation</span></div>
        <div className="money-template-row">
          {snapshot.templates.map(template => <span key={template.id}>{template.label}</span>)}
        </div>
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Сигналы</b><span>{snapshot.version}</span></div>
        {snapshot.signals.map(signal => (
          <article key={signal.id} className={`money-signal signal-${signal.level}`}>
            <div><b>{signal.title}</b><span>{signal.message}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric(props: { label: string; value: string; mode: WorkTaxiMode }) {
  return (
    <div className={`money-engine-metric metric-${props.mode}`}>
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}

function Source(props: { label: string; value: string; meta: string }) {
  return (
    <article className="money-source work-source">
      <span>{props.label}</span>
      <b>{props.value}</b>
      <small>{props.meta}</small>
    </article>
  );
}

function BridgeLine(props: { text: string }) {
  return <article className="money-signal work-bridge-line"><div><span>{props.text}</span></div></article>;
}

function paceMode(value: number, target: number): WorkTaxiMode {
  if (value >= target) return 'green';
  if (value >= Math.round(target * 0.7)) return 'amber';
  return 'red';
}
