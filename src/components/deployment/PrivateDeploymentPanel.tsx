'use client';

import { useEffect, useState } from 'react';

type DeploymentReadinessPayload = {
  mode: 'local_only' | 'cloud_blocked' | 'cloud_ready' | 'ai_ready' | 'deployment_ready';
  cloudReady: boolean;
  telegramReady: boolean;
  supabaseReady: boolean;
  aiReady: boolean;
  flags: {
    cloudSyncEnabled: boolean;
    supabaseWritesEnabled: boolean;
    externalAiEnabled: boolean;
  };
  secrets: Array<{
    key: string;
    requiredFor: string;
    configured: boolean;
    browserSafe: boolean;
    serverOnly: boolean;
  }>;
  warnings: string[];
  nextActions: string[];
};

export function PrivateDeploymentPanel() {
  const [payload, setPayload] = useState<DeploymentReadinessPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    fetch('/api/deployment/readiness', { cache: 'no-store' })
      .then(response => response.json())
      .then((data: DeploymentReadinessPayload) => {
        if (alive) setPayload(data);
      })
      .catch((reason: unknown) => {
        if (alive) setError(reason instanceof Error ? reason.message : 'deployment_readiness_failed');
      });

    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <section className="private-deployment-panel error">
        <b>Приватная публикация</b>
        <p>Не удалось проверить deployment readiness: {error}</p>
      </section>
    );
  }

  if (!payload) {
    return (
      <section className="private-deployment-panel checking">
        <b>Приватная публикация</b>
        <p>Проверяем env и режим запуска…</p>
      </section>
    );
  }

  return (
    <section className={`private-deployment-panel ${payload.mode}`}>
      <div className="deployment-head">
        <div>
          <span>v1.80 • Приватная публикация</span>
          <b>{getModeLabel(payload.mode)}</b>
        </div>
        <p>Секреты не должны быть в коде. Они должны лежать в environment variables хостинга и читаться только server-side.</p>
      </div>

      <div className="deployment-status-grid">
        <DeploymentStatus title="Telegram" ok={payload.telegramReady} />
        <DeploymentStatus title="Supabase" ok={payload.supabaseReady} />
        <DeploymentStatus title="Cloud sync" ok={payload.cloudReady} />
        <DeploymentStatus title="External AI" ok={payload.aiReady || !payload.flags.externalAiEnabled} />
      </div>

      <div className="deployment-secret-list">
        {payload.secrets.map(item => (
          <div className="deployment-secret-row" key={item.key}>
            <b>{item.key}</b>
            <span>{item.configured ? 'configured' : 'missing'}</span>
            <small>{item.requiredFor} • {item.browserSafe ? 'browser-safe' : 'not browser-safe'}{item.serverOnly ? ' • server-only' : ''}</small>
          </div>
        ))}
      </div>

      <div className="deployment-next-actions">
        {payload.nextActions.slice(0, 5).map(action => <p key={action}>{action}</p>)}
      </div>
    </section>
  );
}

function DeploymentStatus(props: { title: string; ok: boolean }) {
  return (
    <div>
      <span>{props.title}</span>
      <b>{props.ok ? 'ready' : 'blocked'}</b>
    </div>
  );
}

function getModeLabel(mode: DeploymentReadinessPayload['mode']) {
  if (mode === 'deployment_ready') return 'Deployment-ready';
  if (mode === 'cloud_ready') return 'Cloud sync ready';
  if (mode === 'cloud_blocked') return 'Cloud sync blocked';
  if (mode === 'ai_ready') return 'AI bridge ready, cloud not ready';
  return 'Local-only safe mode';
}
