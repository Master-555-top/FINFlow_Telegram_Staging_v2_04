'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseFinflowCloudDayDocument, type FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import { buildCloudRestorePreviewDiff } from '@/lib/cloud/cloudRestoreDiffModel';
import { CLOUD_APPLY_ROLLBACK_STORAGE_KEY, createCloudApplyRollbackSnapshot, parseCloudApplyRollbackSnapshot, serializeCloudApplyRollbackSnapshot, summarizeCloudApplyRollbackSnapshot, type CloudApplyRollbackSnapshot } from '@/lib/cloud/cloudApplyRollbackModel';
import { buildCloudSavePreflightReport } from '@/lib/cloud/cloudSavePreflightModel';

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
      setStatus('ready');
      setMessage(`Облачный день получен для проверки. Ревизия ${payload.record.revision ?? '—'}. Нажмите «применить», чтобы заменить локальный день.`);
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
      const confirmed = window.confirm(`${cloudSavePreflight.headline}. Продолжить cloud save?`);
      if (!confirmed) return;
    }
    setStatus('saving');
    setMessage('Сохраняем день в облако…');

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
        setStatus('conflict');
        setMessage(`Облако изменилось отдельно (ревизия ${payload.currentRevision ?? '—'}). Сначала загрузите данные; локальные данные не перезаписаны.`);
        return;
      }
      if (!response.ok || !payload.ok) throw new Error(payload.reason ?? `HTTP_${response.status}`);

      setRevision(payload.revision ?? null);
      setStatus('saved');
      setMessage(`День сохранён в облако. Ревизия ${payload.revision ?? '—'}.`);
    } catch (error) {
      setStatus('error');
      setMessage(`Не удалось сохранить: ${safeErrorMessage(error)}`);
    }
  }

  function applyLoadedDocument() {
    if (!pendingDocument) return;
    const confirmed = window.confirm('Применить cloud preview к локальному дню? Перед заменой будет создан rollback-снимок. Supabase не изменится.');
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

    props.onLoad(pendingDocument);
    setPendingDocument(null);
    setStatus('ready');
    setMessage(`Облачная ревизия ${revision ?? '—'} применена к локальному дню. Rollback-снимок создан.`);
  }

  function restoreLastRollback() {
    if (!lastRollback) return;
    const summary = summarizeCloudApplyRollbackSnapshot(lastRollback);
    const confirmed = window.confirm(`Откатить cloud apply? Вернём локальный день ${summary.localDateBeforeApply} с ${summary.localRecordsBeforeApply} records. Supabase не изменится.`);
    if (!confirmed) return;

    props.onLoad(lastRollback.localDocumentBeforeApply);
    setLastRollback(null);
    try {
      window.sessionStorage.removeItem(CLOUD_APPLY_ROLLBACK_STORAGE_KEY);
    } catch {
      // Nothing else to do.
    }
    setStatus('ready');
    setMessage('Cloud apply rollback выполнен локально. Supabase не изменён.');
  }

  function clearLastRollback() {
    if (!lastRollback) return;
    const confirmed = window.confirm('Удалить последний rollback-снимок? Это не меняет локальные/cloud данные.');
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
        <b>Telegram + Supabase sync</b>
        <p>{message}</p>
      </div>


      <div className={`cloud-save-preflight ${cloudSavePreflight.level}`}>
        <div className="cloud-save-preflight-head">
          <b>Cloud save preflight</b>
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
            <b>Cloud restore preview diff</b>
            <span>{cloudRestoreDiff.headline}</span>
          </div>
          <div className="cloud-restore-diff-summary">
            <div><span>Changes</span><b>{cloudRestoreDiff.summary.total}</b></div>
            <div><span>Warnings</span><b>{cloudRestoreDiff.summary.warnings}</b></div>
            <div><span>Watch</span><b>{cloudRestoreDiff.summary.watches}</b></div>
          </div>
          {cloudRestoreDiff.hasDifferences ? (
            <div className="cloud-restore-diff-list">
              {cloudRestoreDiff.items.map(item => (
                <div className={`cloud-restore-diff-item ${item.severity}`} key={item.id}>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <div>
                    <span>local: {item.currentValue}</span>
                    <span>cloud: {item.backupValue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="quick-note">Cloud preview совпадает с текущим локальным состоянием по ключевым полям.</p>
          )}
        </div>
      ) : null}


      {lastRollback ? (
        <div className="cloud-apply-rollback-box">
          <div>
            <b>Cloud apply rollback snapshot</b>
            <p>
              Снимок до последнего cloud apply: {lastRollback.createdAt.slice(0, 16).replace('T', ' ')} • cloud rev {lastRollback.cloudRevision ?? '—'}.
              Откат локальный и не пишет в Supabase.
            </p>
          </div>
          <div className="cloud-sync-actions">
            <button type="button" disabled={busy} onClick={restoreLastRollback}>откатить cloud apply</button>
            <button type="button" disabled={busy} onClick={clearLastRollback}>убрать snapshot</button>
          </div>
        </div>
      ) : null}

      <div className="cloud-sync-actions">
        <button type="button" disabled={!enabled} onClick={loadFromCloud}>загрузить из облака</button>
        <button type="button" disabled={!enabled || !cloudSavePreflight.canSave || Boolean(pendingDocument)} onClick={saveToCloud}>сохранить в облако</button>
        {pendingDocument ? (
          <button type="button" disabled={busy} onClick={applyLoadedDocument}>применить после preview</button>
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
  if (!(error instanceof Error)) return 'unknown_error';
  return error.message.replace(/[^a-zA-Z0-9_:\-.]/g, '_').slice(0, 180);
}
