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

export function LocalBackupRestorePanel(props: {
  document: FinflowCloudDayDocument;
  onRestore: (document: FinflowCloudDayDocument) => void;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<LocalFinflowBackupState>(() => createInitialLocalBackupState(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`));
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
    const confirmed = window.confirm(`Восстановить локальный backup "${backup.label}"? Текущий локальный день будет заменён, cloud не изменится.`);
    if (!confirmed) return;
    props.onRestore(backup.document);
    setPreviewBackup(null);
  }

  function removeBackup(backupId: string) {
    const confirmed = window.confirm('Удалить этот локальный backup? Cloud и текущий день не изменятся.');
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
      setExportText('Import failed: invalid FINFlow local backup JSON.');
      return;
    }
    setState(previous => addLocalBackup({ state: previous, backup: imported }));
    setImportText('');
    setExportText(`Imported backup: ${imported.label}`);
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
        <span>v1.89 • Backup Diff / Restore Preview</span>
        <b>Локальный backup перед cloud sync</b>
        <p>
          Перед restore теперь видно, что изменится: дата, деньги, records, bank decisions, топливо/одометр. Restore всё ещё локальный и не пишет в Supabase.
        </p>
      </div>

      <div className="local-backup-summary">
        <div><span>Backups</span><b>{summary.total}</b></div>
        <div><span>Latest</span><b>{summary.latestLabel ?? 'none'}</b></div>
        <div><span>Updated</span><b>{summary.latestBackupAt?.slice(0, 16).replace('T', ' ') ?? '—'}</b></div>
      </div>

      <div className="local-backup-create">
        <input placeholder="backup label" value={label} onChange={event => setLabel(event.target.value)} />
        <textarea placeholder="note без токенов, .env.local, банковских raw data" value={note} onChange={event => setNote(event.target.value)} />
        <button type="button" onClick={createBackup}>создать backup</button>
      </div>

      <div className="local-backup-list">
        {state.backups.length === 0 ? <p className="quick-note">Локальных backup пока нет.</p> : null}
        {state.backups.map(backup => (
          <div className="local-backup-row" key={backup.id}>
            <div>
              <b>{backup.label}</b>
              <span>{backup.createdAt.slice(0, 16).replace('T', ' ')} • {backup.document.dayInput.localDate}</span>
              {backup.note ? <small>{backup.note}</small> : null}
            </div>
            <div className="local-backup-actions">
              <button type="button" onClick={() => previewRestoreBackup(backup)}>preview restore</button>
              <button type="button" onClick={() => exportBackup(backup)}>export</button>
              <button type="button" onClick={() => removeBackup(backup.id)}>delete</button>
            </div>
          </div>
        ))}
      </div>


      {previewBackup && restorePreview ? (
        <div className={`local-backup-preview ${restorePreview.hasDifferences ? 'has-diff' : 'no-diff'}`}>
          <div className="local-backup-preview-head">
            <div>
              <b>Restore preview: {previewBackup.label}</b>
              <span>{restorePreview.summary.total} changes • warnings {restorePreview.summary.warnings} • watch {restorePreview.summary.watches}</span>
            </div>
            <div className="local-backup-actions">
              <button type="button" onClick={() => confirmRestoreBackup(previewBackup)}>confirm restore</button>
              <button type="button" onClick={() => setPreviewBackup(null)}>cancel</button>
            </div>
          </div>
          {restorePreview.hasDifferences ? (
            <div className="local-backup-diff-list">
              {restorePreview.items.map(item => (
                <div className={`local-backup-diff-item ${item.severity}`} key={item.id}>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <div>
                    <span>current: {item.currentValue}</span>
                    <span>backup: {item.backupValue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="quick-note">Backup совпадает с текущим локальным состоянием по ключевым полям.</p>
          )}
        </div>
      ) : null}

      <div className="local-backup-import-export">
        <textarea
          placeholder="paste backup JSON here to import"
          value={importText}
          onChange={event => setImportText(event.target.value)}
        />
        <button type="button" onClick={importBackup}>import backup JSON</button>
        {exportText ? (
          <>
            <button type="button" onClick={copyExport}>copy export/report</button>
            <textarea readOnly value={exportText} />
          </>
        ) : null}
      </div>
    </section>
  );
}
