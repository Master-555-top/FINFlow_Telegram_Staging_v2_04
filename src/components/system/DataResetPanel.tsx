'use client';

import { useMemo, useState } from 'react';
import { applyFinflowDataReset, buildFinflowDataPreview, restoreLastReset, type FinflowDataScope, type FinflowDataSection } from '@/lib/data/finflowDataRegistry';
import { getTodayDateInput } from '@/lib/sleep/sleepModel';

const SECTION_OPTIONS: { id: FinflowDataSection; label: string }[] = [
  { id: 'all', label: 'Все данные' },
  { id: 'day', label: 'День' },
  { id: 'records', label: 'Доходы/расходы' },
  { id: 'sleep', label: 'Сон' },
  { id: 'history', label: 'История' },
  { id: 'fuel', label: 'Топливо' },
  { id: 'tasks', label: 'Задачи' },
  { id: 'funds', label: 'Фонды' },
  { id: 'bank', label: 'Bank review' }
];

const PERIOD_OPTIONS: { id: FinflowDataScope['period']; label: string }[] = [
  { id: 'all', label: 'Всё время' },
  { id: 'year', label: 'Год' },
  { id: 'month', label: 'Месяц' },
  { id: 'week', label: 'Неделя' },
  { id: 'day', label: 'День' }
];

export function DataResetPanel() {
  const [section, setSection] = useState<FinflowDataSection>('sleep');
  const [period, setPeriod] = useState<FinflowDataScope['period']>('all');
  const [anchorDateIso, setAnchorDateIso] = useState(getTodayDateInput());
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState('');
  const scope = useMemo(() => ({ section, period, anchorDateIso }), [section, period, anchorDateIso]);
  const preview = useMemo(() => buildFinflowDataPreview(scope), [scope, status]);
  const resetItems = preview.items.filter(item => item.willReset && item.bytes > 0);
  const canReset = confirmText.trim().toUpperCase() === 'RESET' && resetItems.length > 0;

  function reset() {
    if (!canReset) return;
    const approved = window.confirm(`Сбросить выбранную область? Будет затронуто блоков: ${resetItems.length}. Откат последнего сброса будет доступен.`);
    if (!approved) return;
    const backup = applyFinflowDataReset(scope);
    setConfirmText('');
    setStatus(backup ? `Сброс выполнен. Backup: ${backup.createdAtIso}. Перезапусти/обнови приложение, чтобы все экраны перечитали данные.` : 'Сброс недоступен: localStorage не найден.');
  }

  function undo() {
    const restored = restoreLastReset();
    setStatus(restored ? `Откат выполнен: ${restored.createdAtIso}. Обнови приложение.` : 'Нет последнего сброса для отката.');
  }

  return (
    <div className="system-data-panel">
      <div className="system-data-hero warn">
        <span>Безопасный MVP</span>
        <b>Сброс данных</b>
        <p>Это не опасная кнопка “удалить всё”: сначала выбираешь область, видишь предпросмотр, вводишь RESET и только потом подтверждаешь.</p>
      </div>

      <div className="system-data-controls">
        <label>
          <span>Раздел</span>
          <select value={section} onChange={event => setSection(event.target.value as FinflowDataSection)}>
            {SECTION_OPTIONS.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Период</span>
          <select value={period} onChange={event => setPeriod(event.target.value as FinflowDataScope['period'])}>
            {PERIOD_OPTIONS.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Дата периода</span>
          <input type="date" value={anchorDateIso} onChange={event => setAnchorDateIso(event.target.value)} />
        </label>
      </div>

      <div className="system-data-preview">
        <div className="system-data-preview-head">
          <b>Будет затронуто</b>
          <span>{resetItems.length} блоков · ~{preview.totalCount} записей</span>
        </div>
        {preview.items.map(item => (
          <article className={item.willReset ? 'danger' : ''} key={item.key}>
            <b>{item.label}</b>
            <span>{item.willReset ? 'попадает в сброс' : 'не трогаем'} · {item.count} · {item.bytes}b</span>
          </article>
        ))}
      </div>

      <label className="system-confirm-field">
        <span>Для сброса введи RESET</span>
        <input value={confirmText} onChange={event => setConfirmText(event.target.value)} placeholder="RESET" />
      </label>

      <div className="system-data-actions">
        <button type="button" disabled={!canReset} onClick={reset}>сбросить выбранное</button>
        <button type="button" onClick={undo}>отменить последний сброс</button>
      </div>
      {status ? <p className="system-data-status">{status}</p> : null}
    </div>
  );
}
