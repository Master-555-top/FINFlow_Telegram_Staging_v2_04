'use client';

import { useMemo } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { buildRealDailyUseSnapshot, type RealDailyUseStepStatus } from '@/lib/project/realDailyUseHardening';

export function RealDailyUseHardeningPanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[]; compact?: boolean }) {
  const snapshot = useMemo(() => buildRealDailyUseSnapshot(props.dayInput, props.records), [props.dayInput, props.records]);
  const visibleSteps = props.compact ? snapshot.steps.slice(0, 4) : snapshot.steps;

  return (
    <section className={`card money-engine-panel daily-use-hardening-panel money-engine-${snapshot.mode} ${props.compact ? 'compact' : ''}`}>
      <div className="section-kicker">Ежедневное использование</div>
      <h2 className="card-heading">Ежедневный цикл</h2>
      <p className="card-description">Проверяет, что деньги, работа, история и сохранение дня связаны между собой.</p>

      <div className="money-engine-hero templates-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{snapshot.percent}%</b>
          <small>готовность сегодняшнего цикла</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics templates-engine-metrics">
        <Metric label="Записей" value={String(snapshot.counters.records)} mode="amber" />
        <Metric label="Заказов" value={String(snapshot.counters.orders)} mode="green" />
        <Metric label="Грязными" value={formatRub(snapshot.counters.grossDone)} mode="green" />
        <Metric label="Свободно" value={formatRub(snapshot.counters.safeToSpend)} mode={snapshot.mode} />
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Что закрыть сегодня</b><span>сегодня</span></div>
        {visibleSteps.map(step => (
          <article className={`daily-use-step daily-use-step-${step.status}`} key={step.id}>
            <div>
              <b>{statusIcon(step.status)} {step.title}</b>
              <span>{step.detail}</span>
            </div>
            <strong>{step.section}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric(props: { label: string; value: string; mode: 'green' | 'amber' | 'red' }) {
  return (
    <div className={`money-engine-metric metric-${props.mode}`}>
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}

function statusIcon(status: RealDailyUseStepStatus) {
  if (status === 'done') return '✓';
  if (status === 'warning') return '△';
  if (status === 'blocked') return '!';
  return '→';
}
