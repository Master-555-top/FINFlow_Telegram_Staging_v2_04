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
        <span>v2.39 • Supabase Staging Foundation</span>
        <b>{readiness.readinessPercent}% staging</b>
        <p>{readiness.headline}. Cloud writes остаются safe-off до backup + RLS + conflict проверки. Секреты в UI не выводятся.</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Cloud gates</b>
          <span>{readiness.mode}</span>
        </div>
        {readiness.gates.map(gate => (
          <article key={gate.id} className={gate.status === 'blocked' ? 'danger' : gate.status === 'watch' ? 'watch' : ''}>
            <b>{gate.title}</b>
            <span>{gate.status} · {gate.owner}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Migrations</b>
          <span>{readiness.migrations.length} files</span>
        </div>
        {readiness.migrations.map(migration => (
          <article key={migration.id} className={migration.applyMode === 'manual_review_required' ? 'danger' : ''}>
            <b>{migration.file.replace('supabase/migrations/', '')}</b>
            <span>{migration.applyMode}</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>RLS / security checklist</b>
          <span>before writes</span>
        </div>
        {readiness.rlsChecklist.slice(0, 6).map(item => (
          <article key={item}>
            <b>{item}</b>
            <span>required</span>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Next actions</b>
          <span>{readiness.canEnableWrites ? 'candidate' : 'safe-off'}</span>
        </div>
        {readiness.nextActions.slice(0, 5).map(action => (
          <article key={action}>
            <b>{action}</b>
            <span>staging</span>
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
