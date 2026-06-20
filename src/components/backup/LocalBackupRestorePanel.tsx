'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FINFLOW_BACKUP_MAX_FILE_BYTES,
  applyFinflowBackupRestore,
  createFinflowLocalBackup,
  parseFinflowLocalBackup,
  parseRollbackSnapshot,
  previewFinflowBackupRestore,
  restoreRollbackSnapshot,
  serializeFinflowLocalBackup,
  type FinflowBackupPreview,
  type FinflowBackupRollbackSnapshot,
  type FinflowLocalBackup
} from '@/lib/backup/localBackupRestore';

const rollbackSessionKey = 'finflow.backupRestoreRollback.v1_87';

export function LocalBackupRestorePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState('Подготовка локального backup-инструмента…');
  const [pendingBackup, setPendingBackup] = useState<FinflowLocalBackup | null>(null);
  const [preview, setPreview] = useState<FinflowBackupPreview | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [rollback, setRollback] = useState<FinflowBackupRollbackSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setMessage('Backup создаётся только из FINFlow localStorage и никуда не отправляется.');
    try {
      setRollback(parseRollbackSnapshot(window.sessionStorage.getItem(rollbackSessionKey)));
    } catch {
      // sessionStorage can be unavailable; in-memory rollback still works after apply.
    }
  }, []);

  const canApply = useMemo(
    () => Boolean(pendingBackup) && confirmation.trim().toUpperCase() === 'ВОССТАНОВИТЬ' && !busy,
    [pendingBackup, confirmation, busy]
  );

  function downloadBackup() {
    if (!hydrated) return;
    setBusy(true);
    try {
      const backup = createFinflowLocalBackup(window.localStorage);
      const serialized = serializeFinflowLocalBackup(backup);
      const blob = new Blob([serialized], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = buildBackupFilename(backup.createdAt);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(`Backup сохранён: ${backup.entries.length} FINFlow-ключей, checksum ${backup.checksum}.`);
    } catch (error) {
      setMessage(`Не удалось создать backup: ${safeError(error)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function selectBackupFile(file: File | null) {
    setPendingBackup(null);
    setPreview(null);
    setConfirmation('');
    if (!file) return;
    if (file.size > FINFLOW_BACKUP_MAX_FILE_BYTES) {
      setMessage('Файл слишком большой для безопасного локального restore.');
      return;
    }

    setBusy(true);
    try {
      const parsed = parseFinflowLocalBackup(await file.text());
      if (!parsed.ok) {
        setMessage(`Restore отклонён: ${parsed.reason}. Локальные данные не изменены.`);
        return;
      }
      const nextPreview = previewFinflowBackupRestore(window.localStorage, parsed.backup);
      setPendingBackup(parsed.backup);
      setPreview(nextPreview);
      setMessage('Backup проверен. Просмотрите preview и введите ВОССТАНОВИТЬ для применения.');
    } catch (error) {
      setMessage(`Не удалось прочитать backup: ${safeError(error)}.`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function applyRestore() {
    if (!pendingBackup || !canApply) return;
    const accepted = window.confirm(
      `Применить ${pendingBackup.entries.length} FINFlow-ключей? Restore работает в merge-only режиме и не удаляет отсутствующие ключи.`
    );
    if (!accepted) return;

    setBusy(true);
    const result = applyFinflowBackupRestore(window.localStorage, pendingBackup);
    if (!result.ok) {
      setMessage(`Restore не выполнен: ${result.reason}. Выполнен автоматический откат.`);
      setBusy(false);
      return;
    }

    setRollback(result.rollback);
    try {
      window.sessionStorage.setItem(rollbackSessionKey, JSON.stringify(result.rollback));
    } catch {
      // Keep rollback available in memory for this page session.
    }
    setPendingBackup(null);
    setPreview(null);
    setConfirmation('');
    setMessage(`Restore применён к ${result.appliedEntries} ключам. Перезагрузите интерфейс для чтения восстановленного состояния.`);
    setBusy(false);
  }

  function rollbackRestore() {
    if (!rollback) return;
    if (!window.confirm('Откатить последний restore к состоянию до его применения?')) return;
    const result = restoreRollbackSnapshot(window.localStorage, rollback);
    if (!result.ok) {
      setMessage(`Откат не завершён: ${result.reason}. Не закрывайте страницу и сохраните текущий backup.`);
      return;
    }
    setRollback(null);
    try {
      window.sessionStorage.removeItem(rollbackSessionKey);
    } catch {
      // Nothing else to do.
    }
    setMessage('Последний restore отменён. Перезагрузите интерфейс.');
  }

  return (
    <section className="local-backup-panel">
      <div className="local-backup-head">
        <span>v1.90 • Codex Browser LocalStorage Backup</span>
        <b>Резервная копия FINFlow</b>
        <p>
          Экспортирует только FINFlow-данные браузера в JSON. Restore проверяет схему и checksum, показывает preview и не удаляет лишние ключи.
        </p>
      </div>

      <div className="local-backup-status" role="status">{message}</div>

      <div className="local-backup-actions">
        <button type="button" disabled={!hydrated || busy} onClick={downloadBackup}>скачать backup JSON</button>
        <label className={busy ? 'disabled' : ''}>
          выбрать backup для preview
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            disabled={!hydrated || busy}
            onChange={event => selectBackupFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {pendingBackup && preview ? (
        <div className="local-backup-preview">
          <div><span>Создан</span><b>{formatDate(pendingBackup.createdAt)}</b></div>
          <div><span>Всего ключей</span><b>{preview.totalEntries}</b></div>
          <div><span>Новых</span><b>{preview.newEntries}</b></div>
          <div><span>Будут заменены</span><b>{preview.changedEntries}</b></div>
          <div><span>Без изменений</span><b>{preview.unchangedEntries}</b></div>
          <div><span>Объём</span><b>{formatBytes(preview.totalValueBytes)}</b></div>
          <p>Checksum: <code>{pendingBackup.checksum}</code>. Файл никуда не загружался.</p>
          <input
            value={confirmation}
            onChange={event => setConfirmation(event.target.value)}
            placeholder="Введите ВОССТАНОВИТЬ"
            autoComplete="off"
          />
          <button type="button" disabled={!canApply} onClick={applyRestore}>применить restore</button>
        </div>
      ) : null}

      {rollback ? (
        <div className="local-backup-rollback">
          <b>Доступен откат последнего restore</b>
          <span>Снимок создан {formatDate(rollback.createdAt)}.</span>
          <button type="button" disabled={busy} onClick={rollbackRestore}>откатить restore</button>
          <button type="button" disabled={busy} onClick={() => window.location.reload()}>перезагрузить интерфейс</button>
        </div>
      ) : null}

      <p className="local-backup-warning">
        Backup может содержать личные финансовые данные из браузера. Храните файл приватно. Исходные PDF/CSV из `private_raw_data` этим инструментом не копируются.
      </p>
    </section>
  );
}

function buildBackupFilename(createdAt: string) {
  const stamp = createdAt.replace(/[:.]/g, '-');
  return `finflow-local-backup-v1_87-${stamp}.json`;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('ru-RU');
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} Б`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} КБ`;
  return `${(value / (1024 * 1024)).toFixed(2)} МБ`;
}

function safeError(error: unknown) {
  if (!(error instanceof Error)) return 'unknown_error';
  return error.message.replace(/[^a-zA-Z0-9_:\-.]/g, '_').slice(0, 160);
}
