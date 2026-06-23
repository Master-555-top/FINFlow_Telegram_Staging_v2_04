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
  const [message, setMessage] = useState('Готовим резервную копию…');
  const [pendingBackup, setPendingBackup] = useState<FinflowLocalBackup | null>(null);
  const [preview, setPreview] = useState<FinflowBackupPreview | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [rollback, setRollback] = useState<FinflowBackupRollbackSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setMessage('Копия создаётся только на этом устройстве и никуда не отправляется.');
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
      setMessage(`Копия сохранена: ${backup.entries.length} записей.`);
    } catch (error) {
      setMessage(`Не удалось создать копию: ${safeError(error)}.`);
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
      setMessage('Файл слишком большой для безопасного восстановления.');
      return;
    }

    setBusy(true);
    try {
      const parsed = parseFinflowLocalBackup(await file.text());
      if (!parsed.ok) {
        setMessage(`Восстановление отклонено: ${safeError(parsed.reason)}. Данные не изменены.`);
        return;
      }
      const nextPreview = previewFinflowBackupRestore(window.localStorage, parsed.backup);
      setPendingBackup(parsed.backup);
      setPreview(nextPreview);
      setMessage('Копия проверена. Посмотрите изменения и введите ВОССТАНОВИТЬ.');
    } catch (error) {
      setMessage(`Не удалось прочитать копию: ${safeError(error)}.`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function applyRestore() {
    if (!pendingBackup || !canApply) return;
    const accepted = window.confirm(
      `Применить ${pendingBackup.entries.length} записей? Восстановление добавляет и обновляет данные, но не удаляет отсутствующие.`
    );
    if (!accepted) return;

    setBusy(true);
    const result = applyFinflowBackupRestore(window.localStorage, pendingBackup);
    if (!result.ok) {
      setMessage(result.rolledBack
        ? `Восстановление не выполнено: ${safeError(result.reason)}. Автоматический откат подтверждён.`
        : `Восстановление не выполнено: ${safeError(result.reason)}. Откат тоже не завершён — не закрывайте страницу и сохраните текущие данные.`);
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
    setMessage(`Восстановлено ${result.appliedEntries} записей. Перезагрузите интерфейс.`);
    setBusy(false);
  }

  function rollbackRestore() {
    if (!rollback) return;
    if (!window.confirm('Отменить последнее восстановление?')) return;
    const result = restoreRollbackSnapshot(window.localStorage, rollback);
    if (!result.ok) {
      setMessage(`Откат не завершён: ${safeError(result.reason)}. Не закрывайте страницу и сохраните текущую копию.`);
      return;
    }
    setRollback(null);
    try {
      window.sessionStorage.removeItem(rollbackSessionKey);
    } catch {
      // Nothing else to do.
    }
    setMessage('Последнее восстановление отменено. Перезагрузите интерфейс.');
  }

  return (
    <section className="local-backup-panel">
      <div className="local-backup-head">
        <span>Резервная копия</span>
        <b>Резервная копия FINFlow</b>
        <p>
          Сохраняет данные FINFlow в файл. Перед восстановлением показывает, что изменится.
        </p>
      </div>

      <div className="local-backup-status" role="status">{message}</div>

      <div className="local-backup-actions">
        <button type="button" disabled={!hydrated || busy} onClick={downloadBackup}>скачать копию</button>
        <label className={busy ? 'disabled' : ''}>
          выбрать копию для проверки
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
          <div><span>Всего записей</span><b>{preview.totalEntries}</b></div>
          <div><span>Новых</span><b>{preview.newEntries}</b></div>
          <div><span>Будут заменены</span><b>{preview.changedEntries}</b></div>
          <div><span>Без изменений</span><b>{preview.unchangedEntries}</b></div>
          <div><span>Объём</span><b>{formatBytes(preview.totalValueBytes)}</b></div>
          <p>Файл проверен. Никуда не загружался.</p>
          <input
            value={confirmation}
            onChange={event => setConfirmation(event.target.value)}
            placeholder="Введите ВОССТАНОВИТЬ"
            autoComplete="off"
          />
          <button type="button" disabled={!canApply} onClick={applyRestore}>восстановить</button>
        </div>
      ) : null}

      {rollback ? (
        <div className="local-backup-rollback">
          <b>Можно отменить последнее восстановление</b>
          <span>Снимок создан {formatDate(rollback.createdAt)}.</span>
          <button type="button" disabled={busy} onClick={rollbackRestore}>отменить восстановление</button>
          <button type="button" disabled={busy} onClick={() => window.location.reload()}>перезагрузить интерфейс</button>
        </div>
      ) : null}

      <p className="local-backup-warning">
        Копия может содержать личные финансовые данные. Храните её приватно и не отправляйте посторонним.
      </p>
    </section>
  );
}

function buildBackupFilename(createdAt: string) {
  const stamp = createdAt.replace(/[:.]/g, '-');
  return `finflow-backup-${stamp}.json`;
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
  if (typeof error === 'string') return error.replace(/[_-]/g, ' ').slice(0, 160);
  if (!(error instanceof Error)) return 'неизвестная ошибка';
  return error.message.replace(/[_-]/g, ' ').replace(/[^a-zA-Zа-яА-Я0-9ёЁ:., ]/g, '').slice(0, 160);
}
