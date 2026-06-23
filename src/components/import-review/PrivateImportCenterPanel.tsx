'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  createManualHistoricalRecord,
  createHistoricalLedgerExport,
  HISTORICAL_LEDGER_UPDATED_EVENT,
  mergePrivateBundleIntoLedgers,
  parseHistoricalLedgerBackup,
  parsePrivateImportBundle,
  readAllHistoricalLedgers,
  restoreHistoricalLedgerBackup,
  updateHistoricalLedgerRecord,
  writeAllHistoricalLedgers,
  type HistoricalLedgerRecord,
  type HistoricalLedgerSection,
  type HistoricalLedgerStatus
} from '@/lib/data/privateImportBundle';
import {
  applyHistoricalTemplateToRecord,
  buildHistoricalTemplateCatalog,
  createHistoricalRecordFromTemplate,
  type HistoricalLedgerTemplate
} from '@/lib/data/historicalLedgerTemplates';

export function PrivateImportCenterPanel() {
  const [sourceText, setSourceText] = useState('');
  const [fileName, setFileName] = useState('');
  const [ledgers, setLedgers] = useState<ReturnType<typeof readAllHistoricalLedgers>>(() => readAllHistoricalLedgers());
  const [selectedId, setSelectedId] = useState('');
  const [manualDraft, setManualDraft] = useState<HistoricalLedgerRecord | null>(null);
  const [section, setSection] = useState<'all' | HistoricalLedgerSection>('all');
  const [status, setStatus] = useState<'all' | HistoricalLedgerStatus>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('История хранится на этом устройстве. Проверь записи перед сохранением.');
  const parsed = useMemo(() => parsePrivateImportBundle(sourceText), [sourceText]);
  const parsedBackup = useMemo(() => parseHistoricalLedgerBackup(sourceText), [sourceText]);
  const allRecords = useMemo(() => [...ledgers.money.records, ...ledgers.work.records, ...ledgers.funds.records], [ledgers]);
  const templateCatalog = useMemo(() => buildHistoricalTemplateCatalog(allRecords), [allRecords]);
  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allRecords.filter(record => {
      if (section !== 'all' && record.section !== section) return false;
      if (status !== 'all' && record.status !== status) return false;
      if (!normalizedQuery) return true;
      return `${record.title} ${record.category} ${record.localDate} ${record.note}`.toLowerCase().includes(normalizedQuery);
    }).sort((a, b) => `${b.localDate}:${b.occurredAtIso ?? ''}`.localeCompare(`${a.localDate}:${a.occurredAtIso ?? ''}`));
  }, [allRecords, query, section, status]);
  const selected = manualDraft ?? allRecords.find(record => record.id === selectedId) ?? visibleRecords[0] ?? null;
  const counts = useMemo(() => ({
    total: allRecords.length,
    approved: allRecords.filter(record => record.status === 'approved').length,
    review: allRecords.filter(record => record.status === 'needs_review').length,
    rejected: allRecords.filter(record => record.status === 'rejected').length
  }), [allRecords]);
  const visibleTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return templateCatalog
      .filter(template => section === 'all' || template.section === section)
      .filter(template => !normalizedQuery || `${template.label} ${template.category} ${template.defaultTitle}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 24);
  }, [query, section, templateCatalog]);
  const templateCounts = useMemo(() => ({
    total: templateCatalog.length,
    system: templateCatalog.filter(template => template.source === 'system').length,
    history: templateCatalog.filter(template => template.source === 'history').length
  }), [templateCatalog]);

  useEffect(() => {
    const refresh = () => setLedgers(readAllHistoricalLedgers());
    refresh();
    window.addEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(HISTORICAL_LEDGER_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setSourceText(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setMessage('Не удалось прочитать файл на этом устройстве.');
    reader.readAsText(file, 'utf-8');
  }

  function importBundleOrRestore() {
    if (parsedBackup.backup) {
      const total = Object.values(parsedBackup.backup.ledgers).reduce((sum, ledger) => sum + ledger.records.length, 0);
      if (!window.confirm(`Восстановить исторический backup (${total} записей)? Текущие исторические реестры будут заменены, активный день не изменится.`)) return;
      const persisted = restoreHistoricalLedgerBackup(parsedBackup.backup);
      setLedgers(readAllHistoricalLedgers());
      setMessage(persisted
        ? `Исторический backup восстановлен: ${total} записей. Активный день и текущие балансы не изменены.`
        : 'Backup не восстановлен: localStorage переполнен или недоступен; предыдущее состояние сохранено.');
      return;
    }
    if (!parsed.bundle) {
      setMessage(parsed.errors[0] ?? 'Bundle не прошёл проверку.');
      return;
    }
    const result = mergePrivateBundleIntoLedgers(parsed.bundle);
    setLedgers(result.next);
    setMessage(result.persisted
      ? `Импорт завершён: добавлено ${result.added}, обновлено ${result.updated}, без изменений ${result.skipped}.`
      : 'Импорт не записан: localStorage этого устройства переполнен или недоступен. Предыдущее состояние восстановлено; используйте устройство/домен с большим свободным локальным хранилищем.');
  }

  function saveRecord(record: HistoricalLedgerRecord) {
    if (!record.title.trim() || !record.localDate || record.amount <= 0) {
      setMessage('Не сохранено: заполните название, дату и сумму больше нуля.');
      return false;
    }
    const result = updateHistoricalLedgerRecord({ ...record, title: record.title.trim(), category: record.category.trim() || 'other' });
    setLedgers(result.states);
    if (!result.persisted) {
      setMessage('Изменения не записаны: локальное хранилище переполнено. Предыдущее состояние восстановлено.');
      return false;
    }
    setManualDraft(null);
    setSelectedId(record.id);
    setMessage(`Запись «${record.title.trim()}» сохранена. История обновлена.`);
    return true;
  }

  function addManualRecord() {
    const targetSection = section === 'all' ? 'money' : section;
    const draft = createManualHistoricalRecord(targetSection);
    setManualDraft(draft);
    setSelectedId('');
    setMessage('Заполни поля и сохрани запись.');
  }

  function addRecordFromTemplate(template: HistoricalLedgerTemplate) {
    const draft = createHistoricalRecordFromTemplate(template);
    setManualDraft(draft);
    setSelectedId('');
    if (section !== 'all' && section !== template.section) setSection(template.section);
    setMessage(`Шаблон «${template.label}» подготовил запись. Проверь сумму и дату.`);
  }

  function approveSafeRecords() {
    const next = readAllHistoricalLedgers();
    let changed = 0;
    for (const targetSection of ['money', 'work', 'funds'] as const) {
      next[targetSection] = {
        ...next[targetSection],
        records: next[targetSection].records.map(record => {
          const safe = record.status === 'needs_review'
            && record.sourceType !== 'bank_statement'
            && record.confidence >= 0.9
            && record.duplicateOfIds.length === 0;
          if (!safe) return record;
          changed += 1;
          return { ...record, status: 'approved' as const };
        }),
        updatedAtIso: new Date().toISOString()
      };
    }
    const persisted = writeAllHistoricalLedgers(next);
    setLedgers(persisted ? next : readAllHistoricalLedgers());
    setMessage(persisted
      ? `Подтверждено безопасных записей: ${changed}. Банк и дубли остались на ручной проверке.`
      : 'Изменения не записаны: локальное хранилище переполнено. Предыдущее состояние восстановлено.');
  }

  function exportBackup() {
    const blob = new Blob([createHistoricalLedgerExport()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `FINFlow_PRIVATE_HISTORICAL_LEDGER_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Локальный backup подготовлен. Он содержит личные данные — не загружайте его в публичный репозиторий.');
  }

  return (
    <section className="card private-import-center">
      
      <h2 className="card-heading">История и шаблоны</h2>
      <p className="card-description">
        Добавляй старые записи через файл или шаблон. Активный день не перезаписывается.
      </p>

      <div className="private-import-warning">
        <b>Локально</b>
        <span>Личные данные остаются на устройстве, пока ты сам не сделаешь backup или перенос.</span>
      </div>

      <div className="private-import-upload">
        <label>
          <span>Файл истории</span>
          <input type="file" accept=".json,application/json" onChange={onFileChange} />
        </label>
        <div><b>{fileName || 'файл не выбран'}</b><span>{parsedBackup.backup ? 'исторический backup готов к восстановлению' : parsed.bundle ? `${parsed.bundle.records.length} записей · ${parsed.bundle.sources.length} источника` : 'выбери файл истории или backup'}</span></div>
        <button type="button" disabled={!parsed.bundle && !parsedBackup.backup} onClick={importBundleOrRestore}>{parsedBackup.backup ? 'восстановить backup' : 'проверить и добавить'}</button>
      </div>

      {!parsedBackup.backup && (parsed.errors.length || parsed.warnings.length) ? (
        <div className="private-import-validation">
          {parsed.errors.slice(0, 4).map(error => <p className="error" key={error}>{error}</p>)}
          {parsed.warnings.slice(0, 4).map(warning => <p key={warning}>{warning}</p>)}
        </div>
      ) : null}

      <div className="private-import-message">{message}</div>

      <div className="private-import-stats">
        <Metric label="Всего" value={counts.total} />
        <Metric label="В истории" value={counts.approved} />
        <Metric label="Проверить" value={counts.review} />
        <Metric label="Шаблонов" value={templateCounts.total} />
        <Metric label="Отклонено" value={counts.rejected} />
      </div>

      <div className="private-import-toolbar">
        <select value={section} onChange={event => setSection(event.target.value as typeof section)} aria-label="Раздел исторического импорта">
          <option value="all">Все разделы</option><option value="money">Деньги</option><option value="work">Работа</option><option value="funds">Фонды</option>
        </select>
        <select value={status} onChange={event => setStatus(event.target.value as typeof status)} aria-label="Статус исторического импорта">
          <option value="all">Все статусы</option><option value="approved">В истории</option><option value="needs_review">Нужна проверка</option><option value="rejected">Отклонено</option>
        </select>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск: дата, категория, название" />
        <button type="button" onClick={addManualRecord}>+ ручная запись</button>
        <button type="button" onClick={approveSafeRecords}>подтвердить безопасные</button>
        <button type="button" onClick={exportBackup}>backup JSON</button>
      </div>

      <div className="private-template-panel">
        <div className="money-engine-head">
          <b>Шаблонный ввод вместо ручного текста</b>
          <span>{templateCounts.system} системных · {templateCounts.history} из твоей истории</span>
        </div>
        <p className="quick-note">Кнопка создаёт структурированную запись: раздел, тип, категория, название и сумма подставляются сразу. Старые банковские/Telegram-записи можно открыть и применить шаблон в редакторе — сумма и дата сохраняются.</p>
        <div className="private-template-grid">
          {visibleTemplates.map(template => (
            <button type="button" key={template.id} onClick={() => addRecordFromTemplate(template)}>
              <b>{template.label}</b>
              <span>{template.section} · {template.category} · {template.defaultAmount.toLocaleString('ru-RU')} ₽{template.targetAmount ? ` · цель ${template.targetAmount.toLocaleString('ru-RU')} ₽` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="private-import-workbench">
        <div className="private-import-list">
          {visibleRecords.slice(0, 100).map(record => (
            <button type="button" className={`${record.status} ${selected?.id === record.id ? 'selected' : ''}`} onClick={() => { setManualDraft(null); setSelectedId(record.id); }} key={record.id}>
              <span>{record.localDate} · {record.section} · {record.category}</span>
              <b>{record.title}</b>
              <em>{record.amount.toLocaleString('ru-RU')} ₽ · {Math.round(record.confidence * 100)}%</em>
            </button>
          ))}
          {visibleRecords.length > 100 ? <p>Показаны первые 100 из {visibleRecords.length}; уточните фильтр или поиск.</p> : null}
          {!visibleRecords.length ? <p>В выбранном фильтре записей пока нет.</p> : null}
        </div>

        {selected ? <HistoricalRecordEditor key={selected.id} record={selected} templates={templateCatalog} isNew={Boolean(manualDraft)} onSave={saveRecord} onCancel={() => setManualDraft(null)} /> : null}
      </div>
    </section>
  );
}

function HistoricalRecordEditor(props: { record: HistoricalLedgerRecord; templates: HistoricalLedgerTemplate[]; isNew: boolean; onSave: (record: HistoricalLedgerRecord) => boolean; onCancel: () => void }) {
  const [draft, setDraft] = useState(props.record);
  const [dirty, setDirty] = useState(false);
  const compatibleTemplates = useMemo(() => props.templates.filter(template => template.section === draft.section).slice(0, 14), [draft.section, props.templates]);
  const patch = (value: Partial<HistoricalLedgerRecord>) => {
    setDraft(previous => ({ ...previous, ...value }));
    setDirty(true);
  };
  const applyTemplate = (templateId: string) => {
    const template = props.templates.find(item => item.id === templateId);
    if (!template) return;
    setDraft(previous => applyHistoricalTemplateToRecord(previous, template));
    setDirty(true);
  };
  const save = () => {
    if (props.onSave(draft)) setDirty(false);
  };
  return (
    <div className="private-import-editor">
      <div><span>Источник</span><b>{draft.sourceType} · {draft.sourceRecordId}</b></div>
      <div className="private-import-template-tools wide">
        <label>
          <span>Шаблон</span>
          <select value="" onChange={event => applyTemplate(event.target.value)}>
            <option value="">Выбрать шаблон для этой записи</option>
            {compatibleTemplates.map(template => (
              <option key={template.id} value={template.id}>{template.label} · {template.category} · {template.defaultAmount.toLocaleString('ru-RU')} ₽</option>
            ))}
          </select>
        </label>
        <div className="private-template-chip-row">
          {compatibleTemplates.slice(0, 8).map(template => (
            <button type="button" key={template.id} onClick={() => applyTemplate(template.id)}>{template.label}</button>
          ))}
        </div>
      </div>
      <label><span>Дата</span><input type="date" value={draft.localDate} onChange={event => patch({ localDate: event.target.value })} /></label>
      <label><span>Название</span><input value={draft.title} onChange={event => patch({ title: event.target.value })} /></label>
      <label><span>Сумма</span><input inputMode="decimal" value={String(draft.amount)} onChange={event => patch({ amount: Math.max(0, Number(event.target.value.replace(',', '.')) || 0) })} /></label>
      <label><span>Категория</span><input value={draft.category} onChange={event => patch({ category: event.target.value })} /></label>
      <label><span>Раздел</span><select value={draft.section} onChange={event => patch({ section: event.target.value as HistoricalLedgerSection })}><option value="money">Деньги</option><option value="work">Работа</option><option value="funds">Фонды</option></select></label>
      <label><span>Тип</span><select value={draft.entityKind} onChange={event => patch({ entityKind: event.target.value as HistoricalLedgerRecord['entityKind'] })}><option value="expense">Расход</option><option value="income">Доход</option><option value="taxi_order">Заказ такси</option><option value="taxi_shift">Смена такси</option><option value="fund">Пополнение фонда</option><option value="obligation">Обязательство</option></select></label>
      <label><span>Статус</span><select value={draft.status} onChange={event => patch({ status: event.target.value as HistoricalLedgerStatus })}><option value="approved">В истории</option><option value="needs_review">Нужна проверка</option><option value="rejected">Отклонено</option></select></label>
      <label className="wide"><span>Заметка</span><textarea value={draft.note} onChange={event => patch({ note: event.target.value })} /></label>
      {draft.reviewReasons.length ? <p className="wide">Проверить: {draft.reviewReasons.join(' · ')}</p> : <p className="wide">Запись структурирована; исходник остаётся private/local.</p>}
      <div className="private-import-editor-actions wide">
        <button type="button" onClick={() => patch({ status: 'approved' })}>в историю</button>
        <button type="button" onClick={() => patch({ status: 'needs_review' })}>на проверку</button>
        <button type="button" onClick={() => patch({ status: 'rejected' })}>отклонить</button>
        <button type="button" className="primary" onClick={save}>{dirty || props.isNew ? 'сохранить' : 'сохранено'}</button>
        {props.isNew ? <button type="button" onClick={props.onCancel}>отмена</button> : null}
      </div>
    </div>
  );
}

function Metric(props: { label: string; value: number }) {
  return <div><span>{props.label}</span><b>{props.value}</b></div>;
}
