'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildFinflowHistoryTimeline, type FinflowDataSection } from '@/lib/data/finflowDataRegistry';
import { buildHistoryTree, type FinflowHistoryEntry, type FinflowHistoryPeriod } from '@/lib/data/finflowHistoryEngine';
import { getTodayDateInput } from '@/lib/sleep/sleepModel';
import { HISTORICAL_LEDGER_UPDATED_EVENT } from '@/lib/data/privateImportBundle';

type SectionHistoryPanelProps = {
  title: string;
  subtitle: string;
  sections: FinflowDataSection[];
  categories?: string[];
};

const PERIODS: { id: FinflowHistoryPeriod; label: string }[] = [
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
  { id: 'week', label: 'Неделя' },
  { id: 'day', label: 'День' },
  { id: 'all', label: 'Всё' }
];

export function SectionHistoryPanel(props: SectionHistoryPanelProps) {
  const [period, setPeriod] = useState<FinflowHistoryPeriod>('month');
  const [anchorDateIso, setAnchorDateIso] = useState(getTodayDateInput());
  const [entries, setEntries] = useState<FinflowHistoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      const next = props.sections.flatMap(section => buildFinflowHistoryTimeline({ section, period, anchorDateIso }));
      const deduped = new Map(next.map(entry => [entry.id, entry]));
      setEntries([...deduped.values()].sort((a, b) => `${b.dateIso}:${b.id}`.localeCompare(`${a.dateIso}:${a.id}`)));
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
    };
  }, [props.sections, period, anchorDateIso]);

  const filteredEntries = useMemo(() => {
    if (!props.categories?.length) return entries;
    return entries.filter(entry => props.categories?.includes(entry.category));
  }, [entries, props.categories]);
  const periodSummary = useMemo(() => {
    const income = filteredEntries.reduce((sum, entry) => sum + (entry.direction === 'income' && typeof entry.amount === 'number' ? entry.amount : 0), 0);
    const expense = filteredEntries.reduce((sum, entry) => sum + (entry.direction === 'expense' && typeof entry.amount === 'number' ? entry.amount : 0), 0);
    const categoryCount = new Set(filteredEntries.map(entry => entry.category)).size;
    const latestDate = filteredEntries[0]?.dateIso ?? '—';
    return { income, expense, net: income - expense, categoryCount, latestDate };
  }, [filteredEntries]);
  const tree = useMemo(() => buildHistoryTree(filteredEntries), [filteredEntries]);
  const activeYear = tree[0] ?? null;
  const activeMonth = activeYear?.months[0] ?? null;
  const visibleDays = activeMonth?.days ?? [];

  return (
    <section className="section-history-panel">
      <div className="section-history-head">
        <div>
          <span>История раздела</span>
          <b>{props.title}</b>
          <p>{props.subtitle}</p>
        </div>
        <em>{filteredEntries.length}</em>
      </div>

      <div className="section-history-controls">
        <label>
          <span>Период</span>
          <select value={period} onChange={event => setPeriod(event.target.value as FinflowHistoryPeriod)}>
            {PERIODS.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Дата</span>
          <input type="date" value={anchorDateIso} onChange={event => setAnchorDateIso(event.target.value)} />
        </label>
      </div>

      <div className="section-history-path" aria-label="Структура истории">
        <span>{activeYear?.year ?? 'год'}</span>
        <i>→</i>
        <span>{activeMonth?.label ?? 'месяц'}</span>
        <i>→</i>
        <span>{visibleDays.length ? `${visibleDays.length} дн.` : 'дни'}</span>
      </div>

      <div className="history-summary-grid section-period-summary">
        <div><span>Записей</span><b>{filteredEntries.length}</b></div>
        <div><span>Доход</span><b>{periodSummary.income ? `+${periodSummary.income.toLocaleString('ru-RU')} ₽` : '—'}</b></div>
        <div><span>Расход</span><b>{periodSummary.expense ? `−${periodSummary.expense.toLocaleString('ru-RU')} ₽` : '—'}</b></div>
        <div><span>Нетто</span><b>{`${periodSummary.net >= 0 ? '+' : '−'}${Math.abs(periodSummary.net).toLocaleString('ru-RU')} ₽`}</b></div>
        <div><span>Категорий</span><b>{periodSummary.categoryCount}</b></div>
        <div><span>Последняя дата</span><b>{periodSummary.latestDate}</b></div>
      </div>

      <div className="section-history-days">
        {visibleDays.length ? visibleDays.slice(0, 10).map(day => (
          <article key={day.day}>
            <div className="section-history-day-title">
              <b>{day.label}</b>
              <span>{day.count} записей</span>
            </div>
            {day.entries.slice(0, 5).map(entry => (
              <div className={`section-history-entry category-${entry.category} direction-${entry.direction}`} key={entry.id}>
                <span>{entry.section}</span>
                <b>{entry.title}</b>
                <em>{entry.summary}</em>
              </div>
            ))}
          </article>
        )) : (
          <div className="section-history-empty">
            <b>Пока нет записей</b>
            <span>Когда появятся данные этого раздела, они попадут сюда по году, месяцу и дню.</span>
          </div>
        )}
      </div>
    </section>
  );
}
