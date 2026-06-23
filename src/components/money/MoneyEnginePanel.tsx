'use client';

import { useMemo } from 'react';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { DailyRecord } from '@/lib/day-core/dailyRecordsModel';
import { buildMoneyEngineSnapshot, type MoneyDirection, type MoneySafetyMode } from '@/lib/money/moneyEngine';
import { formatRub } from '@/lib/day-core/dayCoreModel';

export function MoneyEnginePanel(props: { dayInput: DayCoreInputModel; records: DailyRecord[] }) {
  const snapshot = useMemo(() => buildMoneyEngineSnapshot(props.dayInput, props.records), [props.dayInput, props.records]);
  const topCategories = snapshot.categorySummaries.filter(item => item.amount > 0).slice(0, 6);

  return (
    <section className={`card money-engine-panel money-engine-${snapshot.mode}`}>
      <div className="section-kicker">Деньги</div>
      <h2 className="card-heading">Деньги: доходы, расходы, источники</h2>
      <p className="card-description">Рабочий слой денег: что пришло, что ушло, сколько реально свободно и где нужен контроль.</p>

      <div className="money-engine-hero">
        <div>
          <span>{snapshot.headline}</span>
          <b>{formatRub(snapshot.totals.safeToSpendToday)}</b>
          <small>условно свободно сегодня</small>
        </div>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="money-engine-metrics">
        <Metric label="Доход" value={snapshot.totals.totalIncome} mode="green" />
        <Metric label="Раб. издержки" value={snapshot.totals.workCosts} mode="amber" />
        <Metric label="Личные траты" value={snapshot.totals.personalExpenses} mode="red" />
        <Metric label="После записей" value={snapshot.totals.netAfterTrackedOutflow} mode={snapshot.mode} />
      </div>

      <div className="money-engine-sources">
        {snapshot.sourceSummaries.filter(source => source.amount > 0).slice(0, 7).map(source => (
          <article key={source.id} className={`money-source money-source-${source.kind}`}>
            <span>{source.label}</span>
            <b>{formatRub(source.amount)}</b>
            <small>{source.count ? `${source.count} зап.` : 'баланс'}</small>
          </article>
        ))}
      </div>

      <div className="money-engine-block">
        <div className="money-engine-head"><b>Категории</b><span>из текущих записей</span></div>
        {topCategories.length ? topCategories.map(category => (
          <article key={category.id} className={`money-category money-direction-${category.direction}`}>
            <div><b>{category.label}</b><span>{category.count} зап. · {directionLabel(category.direction)}</span></div>
            <strong>{formatRub(category.amount)}</strong>
          </article>
        )) : <EmptyLine text="Пока нет записей — добавь доход/расход или импортируй историю через System → Данные." />}
      </div>

      <div className="money-engine-block">
        <div className="money-engine-head"><b>Обязательства</b><span>связь Деньги ↔ Фонды</span></div>
        {snapshot.obligations.slice(0, 4).map(obligation => (
          <article key={obligation.id} className={`money-obligation obligation-${obligation.urgency}`}>
            <div><b>{obligation.title}</b><span>{obligation.note}</span></div>
            <strong>{formatRub(obligation.remaining)}</strong>
          </article>
        ))}
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Шаблоны</b><span>основа</span></div>
        <div className="money-template-row">
          {snapshot.templateSuggestions.slice(0, 6).map(template => (
            <span key={template.id}>{template.label} · {formatRub(template.defaultAmount)}</span>
          ))}
        </div>
      </div>

      <div className="money-engine-block compact">
        <div className="money-engine-head"><b>Сигналы</b><span>{snapshot.version}</span></div>
        {snapshot.signals.slice(0, 4).map(signal => (
          <article key={signal.id} className={`money-signal signal-${signal.level}`}>
            <div><b>{signal.title}</b><span>{signal.message}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric(props: { label: string; value: number; mode: MoneySafetyMode }) {
  return (
    <div className={`money-engine-metric metric-${props.mode}`}>
      <span>{props.label}</span>
      <b>{formatRub(props.value)}</b>
    </div>
  );
}

function EmptyLine(props: { text: string }) {
  return <article className="money-empty-line"><span>{props.text}</span></article>;
}

function directionLabel(direction: MoneyDirection) {
  if (direction === 'income') return 'доход';
  if (direction === 'work_cost') return 'работа';
  if (direction === 'obligation') return 'обяз.';
  if (direction === 'neutral') return 'нейтр.';
  return 'расход';
}
