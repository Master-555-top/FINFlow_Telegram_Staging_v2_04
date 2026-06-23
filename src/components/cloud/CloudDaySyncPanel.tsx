'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseFinflowCloudDayDocument, type FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import { buildCloudRestorePreviewDiff } from '@/lib/cloud/cloudRestoreDiffModel';
import { CLOUD_APPLY_ROLLBACK_STORAGE_KEY, createCloudApplyRollbackSnapshot, parseCloudApplyRollbackSnapshot, serializeCloudApplyRollbackSnapshot, summarizeCloudApplyRollbackSnapshot, type CloudApplyRollbackSnapshot } from '@/lib/cloud/cloudApplyRollbackModel';
import { buildCloudSavePreflightReport } from '@/lib/cloud/cloudSavePreflightModel';
import {
  CLOUD_CONFLICT_REVIEW_STORAGE_KEY,
  CLOUD_SYNC_QUEUE_STORAGE_KEY,
  createCloudConflictReview,
  createCloudSyncQueueItem,
  parseCloudConflictReviews,
  parseCloudSyncQueue,
  upsertCloudConflictReview,
  upsertCloudSyncQueueItem,
  type CloudConflictReview,
  type CloudSyncQueueItem
} from '@/lib/cloud/cloudSyncQueueModel';

type CloudSyncStatus = 'checking' | 'local_only' | 'ready' | 'loading' | 'saving' | 'saved' | 'conflict' | 'error';

export function CloudDaySyncPanel(props: {
  document: FinflowCloudDayDocument;
  onLoad: (document: FinflowCloudDayDocument) => void;
}) {
  const [initData, setInitData] = useState('');
  const [status, setStatus] = useState<CloudSyncStatus>('checking');
  const [message, setMessage] = useState('Проверяем Telegram-контекст…');
  const [revision, setRevision] = useState<number | null>(null);
  const [pendingDocument, setPendingDocument] = useState<FinflowCloudDayDocument | null>(null);
  const [lastRollback, setLastRollback] = useState<CloudApplyRollbackSnapshot | null>(null);
  const [localBackupSummary, setLocalBackupSummary] = useState(() => readLocalBackupSummary());
  const cloudSavePreflight = useMemo(() => buildCloudSavePreflightReport({
    backupSummary: localBackupSummary,
    hasRollbackSnapshot: Boolean(lastRollback),
    revision,
    hasPendingCloudPreview: Boolean(pendingDocument),
    hasTelegramInitData: Boolean(initData)
  }), [localBackupSummary, lastRollback, revision, pendingDocument, initData]);
  const cloudRestoreDiff = useMemo(() => pendingDocument ? buildCloudRestorePreviewDiff({ current: props.document, cloud: pendingDocument, revision }) : null, [pendingDocument, props.document, revision]);

  useEffect(() => {
    function refreshLocalBackups() {
      setLocalBackupSummary(readLocalBackupSummary());
    }

    try {
      const parsedRollback = parseCloudApplyRollbackSnapshot(window.sessionStorage.getItem(CLOUD_APPLY_ROLLBACK_STORAGE_KEY));
      if (parsedRollback) setLastRollback(parsedRollback);
    } catch {
      // sessionStorage can be unavailable; rollback remains optional.
    }

    refreshLocalBackups();
    window.addEventListener('storage', refreshLocalBackups);
    window.addEventListener('finflow-backup-refresh', refreshLocalBackups);
    return () => {
      window.removeEventListener('storage', refreshLocalBackups);
      window.removeEventListener('finflow-backup-refresh', refreshLocalBackups);
    };
  }, []);

  useEffect(() => {
    const telegram = (window as typeof window & {
      Telegram?: { WebApp?: { initData?: string; ready?: () => void } };
    }).Telegram?.WebApp;
    const nextInitData = telegram?.initData ?? '';
    telegram?.ready?.();

    if (!nextInitData) {
      setStatus('local_only');
      setMessage('Локальный режим. Облачная синхронизация появится при запуске через Telegram Mini App.');
      return;
    }

    setInitData(nextInitData);
    setStatus('ready');
    setMessage('Telegram-контекст найден. Сервер проверит подпись перед доступом к данным.');
  }, []);

  useEffect(() => {
    setRevision(null);
    setPendingDocument(null);
  }, [props.document.dayInput.localDate]);

  function pushQueueItem(item: CloudSyncQueueItem) {
    try {
      const current = parseCloudSyncQueue(JSON.parse(window.localStorage.getItem(CLOUD_SYNC_QUEUE_STORAGE_KEY) ?? '[]'));
      window.localStorage.setItem(CLOUD_SYNC_QUEUE_STORAGE_KEY, JSON.stringify(upsertCloudSyncQueueItem(current, item)));
      window.dispatchEvent(new Event('finflow-cloud-queue-refresh'));
    } catch {
      // Queue is helpful but must never block the sync action itself.
    }
  }

  function pushConflictReview(review: CloudConflictReview) {
    try {
      const current = parseCloudConflictReviews(JSON.parse(window.localStorage.getItem(CLOUD_CONFLICT_REVIEW_STORAGE_KEY) ?? '[]'));
      window.localStorage.setItem(CLOUD_CONFLICT_REVIEW_STORAGE_KEY, JSON.stringify(upsertCloudConflictReview(current, review)));
      window.dispatchEvent(new Event('finflow-cloud-queue-refresh'));
    } catch {
      // Conflict review state is local-only and non-blocking.
    }
  }

  async function loadFromCloud() {
    if (!initData) return;
    setStatus('loading');
    setPendingDocument(null);
    setMessage('Загружаем день из облака…');

    try {
      const response = await fetch(`/api/sync/day?localDate=${encodeURIComponent(props.document.dayInput.localDate)}`, {
        method: 'GET',
        headers: { 'x-telegram-init-data': initData },
        cache: 'no-store'
      });
      const payload = await response.json() as {
        ok?: boolean;
        reason?: string;
        record?: { document?: unknown; revision?: number; updatedAt?: string } | null;
      };

      if (!response.ok || !payload.ok) throw new Error(payload.reason ?? `HTTP_${response.status}`);
      if (!payload.record) {
        setRevision(0);
        setStatus('ready');
        setMessage('В облаке этого дня ещё нет. Локальные данные не изменены.');
        return;
      }

      const parsed = parseFinflowCloudDayDocument(payload.record.document);
      if (!parsed) throw new Error('cloud_document_validation_failed');

      setPendingDocument(parsed);
      setRevision(payload.record.revision ?? null);
      pushQueueItem(createCloudSyncQueueItem({
        action: 'load_preview',
        status: 'previewed',
        risk: 'safe',
        document: parsed,
        cloudRevision: payload.record.revision ?? null,
        title: 'Облачная версия загружена',
        summary: `Проверка для ${parsed.dayInput.localDate}: ${parsed.records.length} записей.`
      }));
      setStatus('ready');
      setMessage('Облачный день загружен для проверки. Нажмите «применить», чтобы заменить локальный день.');
    } catch (error) {
      setStatus('error');
      setMessage(`Не удалось загрузить: ${safeErrorMessage(error)}`);
    }
  }

  async function saveToCloud() {
    if (!initData) return;
    if (!cloudSavePreflight.canSave) {
      setStatus('error');
      setMessage(cloudSavePreflight.message);
      return;
    }
    if (cloudSavePreflight.level === 'watch') {
      const confirmed = window.confirm(`${cloudSavePreflight.headline}. Продолжить сохранение в облако?`);
      if (!confirmed) return;
    }
    setStatus('saving');
    setMessage('Сохраняем день в облако…');
    pushQueueItem(createCloudSyncQueueItem({
      action: 'save_day',
      status: 'queued',
      risk: cloudSavePreflight.level === 'ready' ? 'safe' : 'watch',
      document: props.document,
      expectedRevision: revision,
      title: 'Сохранение в облако подготовлено',
      summary: `День ${props.document.dayInput.localDate}: ${props.document.records.length} записей.`
    }));

    try {
      const response = await fetch('/api/sync/day', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, document: props.document, expectedRevision: revision })
      });
      const payload = await response.json() as {
        ok?: boolean;
        reason?: string;
        conflict?: boolean;
        revision?: number;
        currentRevision?: number;
      };

      if (response.status === 409 || payload.conflict) {
        const review = createCloudConflictReview({
          localDate: props.document.dayInput.localDate,
          localRevision: revision,
          cloudRevision: payload.currentRevision ?? null
        });
        pushConflictReview(review);
        pushQueueItem(createCloudSyncQueueItem({
          action: 'resolve_conflict',
          status: 'conflict',
          risk: 'danger',
          document: props.document,
          expectedRevision: revision,
          cloudRevision: payload.currentRevision ?? null,
          title: 'Облачная версия изменилась',
          summary: 'Автоперезапись заблокирована. Сначала загрузите свежие данные.'
        }));
        setStatus('conflict');
        setMessage(`Облако изменилось отдельно (ревизия ${payload.currentRevision ?? '—'}). Сначала загрузите данные; локальные данные не перезаписаны.`);
        return;
      }
      if (!response.ok || !payload.ok) throw new Error(payload.reason ?? `HTTP_${response.status}`);

      setRevision(payload.revision ?? null);
      pushQueueItem(createCloudSyncQueueItem({
        action: 'save_day',
        status: 'applied',
        risk: 'safe',
        document: props.document,
        expectedRevision: revision,
        cloudRevision: payload.revision ?? null,
        title: 'День сохранён в облако',
        summary: `День ${props.document.dayInput.localDate} сохранён.`,
        rollbackAvailable: Boolean(lastRollback)
      }));
      setStatus('saved');
      setMessage('День сохранён в облако.');
    } catch (error) {
      setStatus('error');
      setMessage(`Не удалось сохранить: ${safeErrorMessage(error)}`);
    }
  }

  function applyLoadedDocument() {
    if (!pendingDocument) return;
    const confirmed = window.confirm('Применить облачную версию к локальному дню? Перед заменой будет создана точка отката. Облако не изменится.');
    if (!confirmed) return;

    const rollback = createCloudApplyRollbackSnapshot({
      localDocumentBeforeApply: props.document,
      cloudDocumentApplied: pendingDocument,
      cloudRevision: revision
    });

    setLastRollback(rollback);
    try {
      window.sessionStorage.setItem(CLOUD_APPLY_ROLLBACK_STORAGE_KEY, serializeCloudApplyRollbackSnapshot(rollback));
    } catch {
      // Keep rollback in React state if sessionStorage is unavailable.
    }

    pushQueueItem(createCloudSyncQueueItem({
      action: 'apply_cloud_preview',
      status: 'applied',
      risk: cloudRestoreDiff?.riskLevel === 'warning' ? 'watch' : 'safe',
      document: pendingDocument,
      cloudRevision: revision,
      title: 'Облачная версия применена локально',
      summary: `День ${pendingDocument.dayInput.localDate}: изменения применены, точка отката создана.`,
      rollbackAvailable: true
    }));
    props.onLoad(pendingDocument);
    setPendingDocument(null);
    setStatus('ready');
    setMessage('Облачная версия применена к локальному дню. Точка отката создана.');
  }

  function restoreLastRollback() {
    if (!lastRollback) return;
    const summary = summarizeCloudApplyRollbackSnapshot(lastRollback);
    const confirmed = window.confirm(`Отменить применение облачной версии? Вернём день ${summary.localDateBeforeApply} с ${summary.localRecordsBeforeApply} записями. Облако не изменится.`);
    if (!confirmed) return;

    pushQueueItem(createCloudSyncQueueItem({
      action: 'rollback_apply',
      status: 'rolled_back',
      risk: 'safe',
      document: lastRollback.localDocumentBeforeApply,
      cloudRevision: lastRollback.cloudRevision,
      title: 'Применение облака отменено локально',
      summary: `Вернули локальный день ${lastRollback.localDocumentBeforeApply.dayInput.localDate}. Облако не изменено.`,
      rollbackAvailable: false
    }));
    props.onLoad(lastRollback.localDocumentBeforeApply);
    setLastRollback(null);
    try {
      window.sessionStorage.removeItem(CLOUD_APPLY_ROLLBACK_STORAGE_KEY);
    } catch {
      // Nothing else to do.
    }
    setStatus('ready');
    setMessage('Применение облачной версии отменено локально. Облако не изменено.');
  }

  function clearLastRollback() {
    if (!lastRollback) return;
    const confirmed = window.confirm('Удалить последнюю точку отката? Это не меняет локальные и облачные данные.');
    if (!confirmed) return;
    setLastRollback(null);
    try {
      window.sessionStorage.removeItem(CLOUD_APPLY_ROLLBACK_STORAGE_KEY);
    } catch {
      // Nothing else to do.
    }
  }

  const busy = status === 'loading' || status === 'saving';
  const enabled = Boolean(initData) && !busy;

  return (
    <div className={`cloud-sync-panel ${status}`}>
      <div>
        <b>Облачная синхронизация</b>
        <p>{message}</p>
      </div>


      <div className={`cloud-save-preflight ${cloudSavePreflight.level}`}>
        <div className="cloud-save-preflight-head">
          <b>Проверка перед сохранением</b>
          <span>{cloudSavePreflight.headline}</span>
          <p>{cloudSavePreflight.message}</p>
        </div>
        <div className="cloud-save-preflight-checks">
          {cloudSavePreflight.checks.map(check => (
            <div className={check.ok ? 'ok' : 'not-ok'} key={check.id}>
              <b>{check.ok ? '✓' : '!'}</b>
              <span>{check.title}</span>
              <p>{check.message}</p>
            </div>
          ))}
        </div>
      </div>

      {cloudRestoreDiff ? (
        <div className={`cloud-restore-diff ${cloudRestoreDiff.riskLevel}`}>
          <div className="cloud-restore-diff-head">
            <b>Что изменится при восстановлении</b>
            <span>{cloudRestoreDiff.headline}</span>
          </div>
          <div className="cloud-restore-diff-summary">
            <div><span>Изменения</span><b>{cloudRestoreDiff.summary.total}</b></div>
            <div><span>Предупреждения</span><b>{cloudRestoreDiff.summary.warnings}</b></div>
            <div><span>Проверить</span><b>{cloudRestoreDiff.summary.watches}</b></div>
          </div>
          {cloudRestoreDiff.hasDifferences ? (
            <div className="cloud-restore-diff-list">
              {cloudRestoreDiff.items.map(item => (
                <div className={`cloud-restore-diff-item ${item.severity}`} key={item.id}>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <div>
                    <span>сейчас: {item.currentValue}</span>
                    <span>облако: {item.backupValue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="quick-note">Облачная версия совпадает с текущими данными.</p>
          )}
        </div>
      ) : null}


      {lastRollback ? (
        <div className="cloud-apply-rollback-box">
          <div>
            <b>Откат после восстановления</b>
            <p>
              Точка отката создана {lastRollback.createdAt.slice(0, 16).replace('T', ' ')}.
              Откат локальный и не меняет облако.
            </p>
          </div>
          <div className="cloud-sync-actions">
            <button type="button" disabled={busy} onClick={restoreLastRollback}>отменить применение</button>
            <button type="button" disabled={busy} onClick={clearLastRollback}>убрать точку отката</button>
          </div>
        </div>
      ) : null}

      <div className="cloud-sync-actions">
        <button type="button" disabled={!enabled} onClick={loadFromCloud}>загрузить из облака</button>
        <button type="button" disabled={!enabled || !cloudSavePreflight.canSave || Boolean(pendingDocument)} onClick={saveToCloud}>сохранить в облако</button>
        {pendingDocument ? (
          <button type="button" disabled={busy} onClick={applyLoadedDocument}>применить после проверки</button>
        ) : null}
      </div>
    </div>
  );
}


function readLocalBackupSummary() {
  if (typeof window === 'undefined') {
    return { total: 0, latestBackupAt: null, latestLabel: null };
  }

  try {
    const raw = window.localStorage.getItem('finflow.localBackups.v1_87');
    if (!raw) return { total: 0, latestBackupAt: null, latestLabel: null };
    const parsed = JSON.parse(raw) as { backups?: Array<{ label?: string; createdAt?: string }> };
    const backups = Array.isArray(parsed.backups) ? parsed.backups : [];
    const sorted = [...backups].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
    const latest = sorted[0] ?? null;
    return {
      total: backups.length,
      latestBackupAt: latest?.createdAt ?? null,
      latestLabel: latest?.label ?? null
    };
  } catch {
    return { total: 0, latestBackupAt: null, latestLabel: null };
  }
}

function safeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'неизвестная ошибка';
  return error.message.replace(/[_-]/g, ' ').replace(/[^a-zA-Zа-яА-Я0-9ёЁ:., ]/g, '').slice(0, 180);
}
