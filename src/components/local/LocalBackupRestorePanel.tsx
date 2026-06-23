'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import {
  LOCAL_BACKUP_STORAGE_KEY,
  addLocalBackup,
  createInitialLocalBackupState,
  createLocalBackupEntry,
  deleteLocalBackup,
  exportLocalBackupAsJson,
  parseImportedLocalBackup,
  parseLocalBackupState,
  summarizeLocalBackups,
  type LocalFinflowBackupEntry,
  type LocalFinflowBackupState
} from '@/lib/local/localBackupModel';
import { buildLocalBackupRestorePreview, type LocalBackupRestorePreview } from '@/lib/local/localBackupDiffModel';
import { formatLocalDateStartIso } from '@/lib/time/localDate';

export function LocalBackupRestorePanel(props: {
  document: FinflowCloudDayDocument;
  onRestore: (document: FinflowCloudDayDocument) => void;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<LocalFinflowBackupState>(() => createInitialLocalBackupState(formatLocalDateStartIso()));
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [previewBackup, setPreviewBackup] = useState<LocalFinflowBackupEntry | null>(null);

  useEffect(() => {
    try {
      const parsed = parseLocalBackupState(window.localStorage.getItem(LOCAL_BACKUP_STORAGE_KEY));
      if (parsed) setState(parsed);
    } catch {
      // Keep safe default.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LOCAL_BACKUP_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const summary = useMemo(() => summarizeLocalBackups(state), [state]);
  const restorePreview: LocalBackupRestorePreview | null = useMemo(() => previewBackup ? buildLocalBackupRestorePreview({ current: props.document, backup: previewBackup.document }) : null, [previewBackup, props.document]);

  function notifyBackupRefresh() {
    window.dispatchEvent(new Event('finflow-backup-refresh'));
  }

  function createBackup() {
    const backup = createLocalBackupEntry({
      document: props.document,
      label,
      note
    });
    setState(previous => addLocalBackup({ state: previous, backup }));
    setLabel('');
    setNote('');
    setExportText(exportLocalBackupAsJson(backup));
    window.setTimeout(notifyBackupRefresh, 0);
  }

  function previewRestoreBackup(backup: LocalFinflowBackupEntry) {
    setPreviewBackup(backup);
  }

  function confirmRestoreBackup(backup: LocalFinflowBackupEntry) {
    const confirmed = window.confirm(`Восстановить копию "${backup.label}"? Текущий день будет заменён, облако не изменится.`);
    if (!confirmed) return;
    props.onRestore(backup.document);
    setPreviewBackup(null);
  }

  function removeBackup(backupId: string) {
    const confirmed = window.confirm('Удалить эту локальную копию? Облако и текущий день не изменятся.');
    if (!confirmed) return;
    setState(previous => deleteLocalBackup({ state: previous, backupId }));
    window.setTimeout(notifyBackupRefresh, 0);
  }

  function exportBackup(backup: LocalFinflowBackupEntry) {
    setExportText(exportLocalBackupAsJson(backup));
  }

  function importBackup() {
    const imported = parseImportedLocalBackup(importText);
    if (!imported) {
      setExportText('Не удалось импортировать копию: файл не похож на FINFlow backup.');
      return;
    }
    setState(previous => addLocalBackup({ state: previous, backup: imported }));
    setImportText('');
    setExportText(`Копия импортирована: ${imported.label}`);
    window.setTimeout(notifyBackupRefresh, 0);
  }

  async function copyExport() {
    if (!exportText) return;
    try {
      await window.navigator.clipboard.writeText(exportText);
    } catch {
      // Manual copy remains available in textarea.
    }
  }

  return (
    <section className="local-backup-panel">
      <div className="local-backup-head">
        <span>Резервные копии</span>
        <b>Локальная копия дня</b>
        <p>
          Перед восстановлением видно, что изменится: дата, деньги, записи, топливо и пробег. Всё остаётся локально.
        </p>
      </div>

      <div className="local-backup-summary">
        <div><span>Копии</span><b>{summary.total}</b></div>
        <div><span>Последняя</span><b>{summary.latestLabel ?? 'нет'}</b></div>
        <div><span>Обновлено</span><b>{summary.latestBackupAt?.slice(0, 16).replace('T', ' ') ?? '—'}</b></div>
      </div>

      <div className="local-backup-create">
        <input placeholder="название копии" value={label} onChange={event => setLabel(event.target.value)} />
        <textarea placeholder="заметка без токенов и банковских файлов" value={note} onChange={event => setNote(event.target.value)} />
        <button type="button" onClick={createBackup}>создать копию</button>
      </div>

      <div className="local-backup-list">
        {state.backups.length === 0 ? <p className="quick-note">Локальных копий пока нет.</p> : null}
        {state.backups.map(backup => (
          <div className="local-backup-row" key={backup.id}>
            <div>
              <b>{backup.label}</b>
              <span>{backup.createdAt.slice(0, 16).replace('T', ' ')} • {backup.document.dayInput.localDate}</span>
              {backup.note ? <small>{backup.note}</small> : null}
            </div>
            <div className="local-backup-actions">
              <button type="button" onClick={() => previewRestoreBackup(backup)}>проверить</button>
              <button type="button" onClick={() => exportBackup(backup)}>экспорт</button>
              <button type="button" onClick={() => removeBackup(backup.id)}>удалить</button>
            </div>
          </div>
        ))}
      </div>


      {previewBackup && restorePreview ? (
        <div className={`local-backup-preview ${restorePreview.hasDifferences ? 'has-diff' : 'no-diff'}`}>
          <div className="local-backup-preview-head">
            <div>
              <b>Проверка восстановления: {previewBackup.label}</b>
              <span>{restorePreview.summary.total} изменений • предупреждений {restorePreview.summary.warnings} • проверить {restorePreview.summary.watches}</span>
            </div>
            <div className="local-backup-actions">
              <button type="button" onClick={() => confirmRestoreBackup(previewBackup)}>восстановить</button>
              <button type="button" onClick={() => setPreviewBackup(null)}>отмена</button>
            </div>
          </div>
          {restorePreview.hasDifferences ? (
            <div className="local-backup-diff-list">
              {restorePreview.items.map(item => (
                <div className={`local-backup-diff-item ${item.severity}`} key={item.id}>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <div>
                    <span>сейчас: {item.currentValue}</span>
                    <span>копия: {item.backupValue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="quick-note">Копия совпадает с текущим состоянием по ключевым полям.</p>
          )}
        </div>
      ) : null}

      <div className="local-backup-import-export">
        <textarea
          placeholder="вставь текст копии для импорта"
          value={importText}
          onChange={event => setImportText(event.target.value)}
        />
        <button type="button" onClick={importBackup}>импортировать копию</button>
        {exportText ? (
          <>
            <button type="button" onClick={copyExport}>скопировать экспорт</button>
            <textarea readOnly value={exportText} />
          </>
        ) : null}
      </div>
    </section>
  );
}
