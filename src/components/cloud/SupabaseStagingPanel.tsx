'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildSupabaseStagingReadiness, type SupabaseStagingReadiness } from '@/lib/persistence/supabaseStagingFoundation';

type ReadinessApiPayload = {
  ok?: boolean;
  supabaseServerStatus?: {
    ready?: boolean;
    writesEnabled?: boolean;
    cloudSyncEnabled?: boolean;
    reason?: string;
  };
  guard?: {
    hasUrl?: boolean;
    hasAnonKey?: boolean;
    hasServiceRoleKey?: boolean;
  };
  staging?: SupabaseStagingReadiness;
};

export function SupabaseStagingPanel() {
  const [serverPayload, setServerPayload] = useState<ReadinessApiPayload | null>(null);
  const [localBackupCount, setLocalBackupCount] = useState(0);
  const [hasRollbackSnapshot, setHasRollbackSnapshot] = useState(false);
  const [hasTelegramInitData, setHasTelegramInitData] = useState(false);

  useEffect(() => {
    setLocalBackupCount(readLocalBackupCount());
    setHasRollbackSnapshot(Boolean(readSessionValue('finflow.cloudApplyRollback.v1')));
    const telegram = (window as typeof window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
    setHasTelegramInitData(Boolean(telegram?.initData));
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadReadiness() {
      try {
        const response = await fetch('/api/supabase/readiness', { cache: 'no-store' });
        const payload = await response.json() as ReadinessApiPayload;
        if (!ignore) setServerPayload(payload);
      } catch {
        if (!ignore) setServerPayload(null);
      }
    }
    void loadReadiness();
    return () => { ignore = true; };
  }, []);

  const readiness = useMemo(() => serverPayload?.staging ?? buildSupabaseStagingReadiness({
    serverReady: serverPayload?.supabaseServerStatus?.ready,
    writesEnabled: serverPayload?.supabaseServerStatus?.writesEnabled,
    cloudSyncEnabled: serverPayload?.supabaseServerStatus?.cloudSyncEnabled,
    hasUrl: serverPayload?.guard?.hasUrl,
    hasAnonKey: serverPayload?.guard?.hasAnonKey,
    hasServiceRoleKey: serverPayload?.guard?.hasServiceRoleKey,
    hasTelegramInitData,
    backupCount: localBackupCount,
    hasRollbackSnapshot
  }), [serverPayload, hasTelegramInitData, localBackupCount, hasRollbackSnapshot]);

  return (
    <section className="system-data-panel global-backbone-panel supabase-staging-panel">
      <div className="system-data-hero">
        <span>Подготовка облака</span>
        <b>{readiness.readinessPercent}% готово</b>
        <p>{cleanCloudCopy(readiness.headline)}. Запись в облако выключена до резервной копии и проверки безопасности. Секреты не показываются.</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Проверки облака</b>
          <span>{humanCloudMode(readiness.mode)}</span>
        </div>
        {readiness.gates.map(gate => (
          <article key={gate.id} className={gate.status === 'blocked' ? 'danger' : gate.status === 'watch' ? 'watch' : ''}>
            <b>{gate.title}</b>
            <span>{humanGateStatus(gate.status)} · {humanOwner(gate.owner)}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Схема базы</b>
          <span>{readiness.migrations.length} файла</span>
        </div>
        {readiness.migrations.map(migration => (
          <article key={migration.id} className={migration.applyMode === 'manual_review_required' ? 'danger' : ''}>
            <b>{migration.file.replace('supabase/migrations/', '')}</b>
            <span>{humanApplyMode(migration.applyMode)}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Доступ и безопасность</b>
          <span>до записи</span>
        </div>
        {readiness.rlsChecklist.slice(0, 6).map(item => (
          <article key={item}>
            <b>{cleanCloudCopy(item)}</b>
            <span>обязательно</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Следующие действия</b>
          <span>{readiness.canEnableWrites ? 'можно готовить' : 'без записи'}</span>
        </div>
        {readiness.nextActions.slice(0, 5).map(action => (
          <article key={action}>
            <b>{cleanCloudCopy(action)}</b>
            <span>подготовка</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function readLocalBackupCount() {
  try {
    const raw = window.localStorage.getItem('finflow.localBackups.v1_87');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { backups?: unknown[] };
    return Array.isArray(parsed.backups) ? parsed.backups.length : 0;
  } catch {
    return 0;
  }
}

function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}


function humanCloudMode(mode: string) {
  if (mode === 'ready_for_staging') return 'готово к проверке';
  if (mode === 'blocked') return 'есть стоп-факторы';
  if (mode === 'local_only') return 'локально';
  return mode.replaceAll('_', ' ');
}

function humanGateStatus(status: string) {
  if (status === 'pass') return 'готово';
  if (status === 'watch') return 'проверить';
  if (status === 'blocked') return 'стоп';
  return status;
}

function humanOwner(owner: string) {
  return owner.replaceAll('dev', 'система').replaceAll('security', 'безопасность').replaceAll('_', ' ');
}

function humanApplyMode(mode: string) {
  if (mode === 'manual_review_required') return 'проверить вручную';
  if (mode === 'already_applied') return 'уже применено';
  return mode.replaceAll('_', ' ');
}

function cleanCloudCopy(text: string) {
  return text
    .replaceAll('RLS', 'доступ')
    .replaceAll('writes', 'запись')
    .replaceAll('write', 'запись')
    .replaceAll('staging', 'подготовка')
    .replaceAll('migration', 'схема')
    .replaceAll('Supabase', 'облако')
    .replaceAll('backup', 'копия')
    .replaceAll('rollback', 'откат')
    .replaceAll('cross-user', 'между пользователями')
    .replaceAll('cloud', 'облако');
}
