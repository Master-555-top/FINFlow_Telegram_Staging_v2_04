'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CLOUD_CONFLICT_REVIEW_STORAGE_KEY,
  CLOUD_SYNC_QUEUE_STORAGE_KEY,
  buildCloudSyncQueueSnapshot,
  parseCloudConflictReviews,
  parseCloudSyncQueue,
  resolveCloudConflict,
  type CloudConflictReview,
  type CloudSyncQueueItem
} from '@/lib/cloud/cloudSyncQueueModel';

type ReadinessApiPayload = {
  supabaseServerStatus?: {
    writesEnabled?: boolean;
    cloudSyncEnabled?: boolean;
  };
};

export function CloudSyncQueuePanel() {
  const [queue, setQueue] = useState<CloudSyncQueueItem[]>([]);
  const [conflicts, setConflicts] = useState<CloudConflictReview[]>([]);
  const [hasTelegramInitData, setHasTelegramInitData] = useState(false);
  const [writesEnabled, setWritesEnabled] = useState(false);

  useEffect(() => {
    refreshFromStorage();
    const telegram = (window as typeof window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
    setHasTelegramInitData(Boolean(telegram?.initData));

    function handleStorage() {
      refreshFromStorage();
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('finflow-cloud-queue-refresh', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('finflow-cloud-queue-refresh', handleStorage);
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadReadiness() {
      try {
        const response = await fetch('/api/supabase/readiness', { cache: 'no-store' });
        const payload = await response.json() as ReadinessApiPayload;
        if (!ignore) {
          setWritesEnabled(Boolean(payload.supabaseServerStatus?.writesEnabled && payload.supabaseServerStatus?.cloudSyncEnabled));
        }
      } catch {
        if (!ignore) setWritesEnabled(false);
      }
    }
    void loadReadiness();
    return () => { ignore = true; };
  }, []);

  const snapshot = useMemo(() => buildCloudSyncQueueSnapshot({
    queue,
    conflicts,
    hasTelegramInitData,
    writesEnabled
  }), [queue, conflicts, hasTelegramInitData, writesEnabled]);

  function refreshFromStorage() {
    setQueue(readQueue());
    setConflicts(readConflicts());
  }

  function clearAppliedAndDismissed() {
    const nextQueue = queue.filter(item => item.status !== 'applied' && item.status !== 'rolled_back');
    const nextConflicts = conflicts.filter(conflict => conflict.status === 'open');
    writeQueue(nextQueue);
    writeConflicts(nextConflicts);
    setQueue(nextQueue);
    setConflicts(nextConflicts);
  }

  function markConflict(id: string, status: CloudConflictReview['status']) {
    const nextConflicts = resolveCloudConflict(conflicts, id, status);
    writeConflicts(nextConflicts);
    setConflicts(nextConflicts);
  }

  return (
    <section className="system-data-panel global-backbone-panel cloud-sync-queue-panel">
      <div className="system-data-hero">
        <span>Очередь синхронизации</span>
        <b>{100 - Math.min(30, snapshot.summary.conflicts * 12 + snapshot.summary.blocked * 8)}% готово</b>
        <p>{snapshot.nextAction}</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Сводка</b>
          <span>{cleanQueueCopy(snapshot.mode)}</span>
        </div>
        <article><b>{snapshot.summary.total}</b><span>в очереди</span></article>
        <article className={snapshot.summary.conflicts > 0 ? 'danger' : ''}><b>{snapshot.summary.conflicts}</b><span>конфликты</span></article>
        <article><b>{snapshot.summary.rollbackAvailable}</b><span>откат</span></article>
        <article className={writesEnabled ? 'watch' : ''}><b>{writesEnabled ? 'вкл' : 'выкл'}</b><span>запись в облако</span></article>
      </div>

      {snapshot.conflicts.length > 0 ? (
        <div className="system-data-preview compact">
          <div className="system-data-preview-head">
            <b>Конфликты</b>
            <span>{snapshot.conflicts.length} открыто</span>
          </div>
          {snapshot.conflicts.map(conflict => (
            <article key={conflict.id} className="danger cloud-conflict-card">
              <b>{conflict.headline}</b>
              <span>{conflict.localDate} · облако {conflict.cloudRevision ?? '—'}</span>
              <p>{conflict.message}</p>
              <small>{conflict.recommendedAction}</small>
              <div className="cloud-conflict-actions">
                <button type="button" onClick={() => markConflict(conflict.id, 'resolved_local')}>оставить локальное</button>
                <button type="button" onClick={() => markConflict(conflict.id, 'resolved_cloud')}>принять облачное</button>
                <button type="button" onClick={() => markConflict(conflict.id, 'dismissed')}>отложить</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Последние действия</b>
          <span>{snapshot.queue.length} записей</span>
        </div>
        {snapshot.queue.length > 0 ? snapshot.queue.map(item => (
          <article key={item.id} className={item.risk === 'danger' ? 'danger' : item.risk === 'watch' ? 'watch' : ''}>
            <b>{item.title}</b>
            <span>{item.localDate} · {cleanQueueCopy(item.status)} · версия {item.cloudRevision ?? item.expectedRevision ?? '—'}</span>
            <p>{item.summary}</p>
          </article>
        )) : (
          <article>
            <b>Очередь чистая</b>
            <span>готово к проверке</span>
          </article>
        )}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Правила безопасности</b>
          <span>зафиксировано</span>
        </div>
        {snapshot.safetyRules.map(rule => (
          <article key={rule}><b>{cleanQueueCopy(rule)}</b><span>обязательно</span></article>
        ))}
      </div>

      <div className="cloud-sync-actions">
        <button type="button" onClick={refreshFromStorage}>обновить очередь</button>
        <button type="button" onClick={clearAppliedAndDismissed}>очистить закрытое</button>
      </div>
    </section>
  );
}

function readQueue() {
  try {
    return parseCloudSyncQueue(JSON.parse(window.localStorage.getItem(CLOUD_SYNC_QUEUE_STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function readConflicts() {
  try {
    return parseCloudConflictReviews(JSON.parse(window.localStorage.getItem(CLOUD_CONFLICT_REVIEW_STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function writeQueue(queue: CloudSyncQueueItem[]) {
  try {
    window.localStorage.setItem(CLOUD_SYNC_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('finflow-cloud-queue-refresh'));
  } catch {
    // localStorage can be unavailable in private mode.
  }
}

function writeConflicts(conflicts: CloudConflictReview[]) {
  try {
    window.localStorage.setItem(CLOUD_CONFLICT_REVIEW_STORAGE_KEY, JSON.stringify(conflicts));
    window.dispatchEvent(new Event('finflow-cloud-queue-refresh'));
  } catch {
    // localStorage can be unavailable in private mode.
  }
}


function cleanQueueCopy(text: string) {
  return text
    .replaceAll('safe-off', 'без записи')
    .replaceAll('cloud flags', 'запись в облако')
    .replaceAll('Cloud', 'Облако')
    .replaceAll('cloud', 'облако')
    .replaceAll('queue', 'очередь')
    .replaceAll('conflict', 'конфликт')
    .replaceAll('staging', 'проверка')
    .replaceAll('smoke test', 'проверка')
    .replaceAll('preview', 'проверка')
    .replaceAll('backup', 'копия')
    .replaceAll('rollback', 'откат')
    .replaceAll('required', 'обязательно')
    .replaceAll('_', ' ');
}
