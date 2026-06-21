'use client';

import { useMemo, useState } from 'react';
import { buildFinflowDataPreview, buildFinflowStorageExport, type FinflowDataScope, type FinflowDataSection } from '@/lib/data/finflowDataRegistry';
import { getTodayDateInput } from '@/lib/sleep/sleepModel';

const sectionOptions: { id: FinflowDataSection; label: string }[] = [
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

export function DataStoragePanel() {
  const [section, setSection] = useState<FinflowDataSection>('all');
  const [period, setPeriod] = useState<FinflowDataScope['period']>('all');
  const [anchorDateIso, setAnchorDateIso] = useState(getTodayDateInput());
  const [format, setFormat] = useState<'summary' | 'text' | 'json' | 'ai_prompt'>('summary');
  const [exportText, setExportText] = useState('');
  const scope = useMemo(() => ({ section, period, anchorDateIso }), [section, period, anchorDateIso]);
  const preview = useMemo(() => buildFinflowDataPreview(scope), [scope, exportText]);
  const filledItems = preview.items.filter(item => item.bytes > 0);
  const timelinePreview = preview.timeline.slice(0, 12);

  function buildExport() {
    setExportText(buildFinflowStorageExport(format, scope));
  }

  async function copyExport() {
    const text = exportText || buildFinflowStorageExport(format, scope);
    setExportText(text);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Text area remains as fallback copy surface.
    }
  }

  return (
    <div className="system-data-panel">
      <div className="system-data-hero">
        <span>Единая витрина</span>
        <b>Хранилище данных</b>
        <p>Данные строятся из актуального local-state по единому History Engine: период, раздел, экспорт и сброс смотрят на одну структуру.</p>
      </div>

      <div className="system-data-controls">
        <label>
          <span>Область</span>
          <select value={section} onChange={event => setSection(event.target.value as FinflowDataSection)}>
            {sectionOptions.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Период</span>
          <select value={period} onChange={event => setPeriod(event.target.value as FinflowDataScope['period'])}>
            {['all', 'year', 'month', 'week', 'day'].map(item => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Дата</span>
          <input type="date" value={anchorDateIso} onChange={event => setAnchorDateIso(event.target.value)} />
        </label>
        <label>
          <span>Формат</span>
          <select value={format} onChange={event => setFormat(event.target.value as typeof format)}>
            <option value="summary">краткая сводка</option>
            <option value="text">подробный текст</option>
            <option value="json">JSON</option>
            <option value="ai_prompt">промпт для ИИ</option>
          </select>
        </label>
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Блоки данных</b>
          <span>{filledItems.length} блоков · {preview.exactCount} точных записей</span>
        </div>
        {filledItems.map(item => (
          <article key={item.key}>
            <b>{item.label}</b>
            <span>{item.scopedCount || item.count} · {item.bytes}b</span>
          </article>
        ))}
      </div>

      <div className="system-data-timeline">
        <div className="system-data-preview-head">
          <b>Таймлайн периода</b>
          <span>{preview.timeline.length} записей</span>
        </div>
        {timelinePreview.length ? timelinePreview.map(entry => (
          <article key={entry.id} className={`data-timeline-row data-${entry.category}`}>
            <span>{entry.dateIso}</span>
            <b>{entry.title}</b>
            <em>{entry.summary}</em>
          </article>
        )) : (
          <p>Для выбранного периода пока нет точных записей.</p>
        )}
      </div>

      <div className="system-data-actions">
        <button type="button" onClick={buildExport}>собрать формат</button>
        <button type="button" onClick={copyExport}>копировать</button>
      </div>
      <textarea className="system-export-textarea" value={exportText} onChange={event => setExportText(event.target.value)} placeholder="Здесь появится сводка / JSON / промпт для ИИ" />
    </div>
  );
}
