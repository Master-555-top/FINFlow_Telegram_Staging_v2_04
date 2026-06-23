'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildHistoricalLedgerAnalytics } from '@/lib/data/historicalLedgerAnalytics';
import { type FinflowHistoryPeriod } from '@/lib/data/finflowHistoryEngine';
import {
  HISTORICAL_LEDGER_UPDATED_EVENT,
  readAllHistoricalLedgers,
  type HistoricalLedgerSection
} from '@/lib/data/privateImportBundle';
import { getTodayDateInput } from '@/lib/sleep/sleepModel';

const PERIODS: Array<{ id: FinflowHistoryPeriod; label: string }> = [
  { id: 'month', label: 'Месяц' },
  { id: 'week', label: 'Неделя' },
  { id: 'day', label: 'День' },
  { id: 'year', label: 'Год' },
  { id: 'all', label: 'Всё' }
];

export function HistoricalLedgerAnalyticsPanel(props: { section: HistoricalLedgerSection }) {
  const [period, setPeriod] = useState<FinflowHistoryPeriod>('month');
  const [anchorDateIso, setAnchorDateIso] = useState(getTodayDateInput());
  const [ledgers, setLedgers] = useState(() => readAllHistoricalLedgers());

  useEffect(() => {
    const refresh = () => setLedgers(readAllHistoricalLedgers());
    refresh();
    window.addEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const snapshot = useMemo(() => buildHistoricalLedgerAnalytics(ledgers, {
    section: props.section,
    period,
    anchorDateIso
  }), [anchorDateIso, ledgers, period, props.section]);

  const title = props.section === 'money' ? 'Историческая статистика денег' : props.section === 'work' ? 'Историческая статистика работы' : 'Историческая статистика фондов';

  return (
    <section className="card historical-analytics-panel">
      <div className="section-kicker">v2.54 • Live Historical Analytics</div>
      <div className="historical-analytics-head">
        <div><h2 className="card-heading">{title}</h2><p className="card-description">Считаются только подтверждённые записи. Review и отклонённые записи в суммы не попадают.</p></div>
        <div className="historical-analytics-controls">
          <select value={period} onChange={event => setPeriod(event.target.value as FinflowHistoryPeriod)} aria-label="Период статистики">
            {PERIODS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <input type="date" value={anchorDateIso} onChange={event => setAnchorDateIso(event.target.value)} aria-label="Дата статистики" />
        </div>
      </div>

      <div className="historical-analytics-metrics">
        {props.section === 'funds' ? (
          <>
            <Metric label="Пополнения" value={money(snapshot.fundContributions)} />
            <Metric label="Обязательства" value={money(snapshot.obligations)} />
            <Metric label="Подтверждено" value={String(snapshot.approvedCount)} />
            <Metric label="На проверке" value={String(snapshot.reviewCount)} />
          </>
        ) : (
          <>
            <Metric label={props.section === 'work' ? 'Оборот' : 'Доход'} value={money(snapshot.income)} />
            <Metric label={props.section === 'work' ? 'Раб. расходы' : 'Расход'} value={money(snapshot.expense)} />
            <Metric label="Нетто" value={signedMoney(snapshot.net)} />
            <Metric label="На проверке" value={String(snapshot.reviewCount)} />
          </>
        )}
      </div>

      {props.section === 'work' ? (
        <div className="historical-analytics-secondary">
          <span>Заказов <b>{snapshot.ordersCount}</b></span>
          <span>Смен <b>{snapshot.shiftsCount}</b></span>
          <span>Средний заказ <b>{money(snapshot.averageOrder)}</b></span>
          <span>Средняя смена <b>{money(snapshot.averageShift)}</b></span>
        </div>
      ) : null}

      <div className="historical-analytics-categories">
        {snapshot.categories.length ? snapshot.categories.map(category => (
          <div key={category.category}><span>{categoryLabel(category.category)} · {category.count}</span><b>{money(category.amount)}</b></div>
        )) : <p>В этом периоде пока нет подтверждённых исторических записей.</p>}
      </div>

      <div className="historical-analytics-foot">
        <span>Подтверждено: {snapshot.approvedCount} · review: {snapshot.reviewCount} · отклонено: {snapshot.rejectedCount}</span>
        <span>Последняя дата: {snapshot.latestDate ?? '—'}</span>
      </div>
      <p className="quick-note">История обновляет этот отчёт сразу после сохранения, но намеренно не меняет остаток активного дня и текущие остатки фондов.</p>
    </section>
  );
}

function Metric(props: { label: string; value: string }) {
  return <div><span>{props.label}</span><b>{props.value}</b></div>;
}

function money(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function signedMoney(value: number) {
  return `${value >= 0 ? '+' : '−'}${money(Math.abs(value))}`;
}

function categoryLabel(value: string) {
  return value.replaceAll('_', ' ');
}
