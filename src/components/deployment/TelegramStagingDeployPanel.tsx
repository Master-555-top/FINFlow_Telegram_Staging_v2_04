'use client';

import { useState } from 'react';
import { buildTelegramStagingRunbook } from '@/lib/deployment/telegramStagingRunbook';

type StagingView = 'overview' | 'env' | 'bot' | 'tests';

const STAGING_VIEWS: { id: StagingView; label: string; caption: string }[] = [
  { id: 'overview', label: 'Обзор', caption: 'что загружать' },
  { id: 'env', label: 'Env', caption: 'секреты и flags' },
  { id: 'bot', label: 'BotFather', caption: 'кнопка Mini App' },
  { id: 'tests', label: 'Тесты', caption: 'первый запуск' }
];

export function TelegramStagingDeployPanel() {
  const runbook = buildTelegramStagingRunbook();
  const [activeView, setActiveView] = useState<StagingView>('overview');

  return (
    <section className="telegram-staging-panel system-module-panel">
      <div className="deployment-head compact">
        <div>
          <span>v2.07 • Telegram launch center</span>
          <b>Deploy-safe + BotFather без простыни</b>
        </div>
        <p>{runbook.goal}</p>
      </div>

      <div className="system-inner-tabs" role="tablist" aria-label="Telegram launch center">
        {STAGING_VIEWS.map(view => (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={activeView === view.id}
            className={`system-inner-tab${activeView === view.id ? ' active' : ''}`}
            onClick={() => setActiveView(view.id)}
          >
            <b>{view.label}</b>
            <small>{view.caption}</small>
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <div className="system-module-window">
          <div className="telegram-staging-summary-grid">
            <div>
              <span>Telegram ready</span>
              <b>{runbook.readinessBefore}% → {runbook.readinessAfter}%</b>
            </div>
            <div>
              <span>Загружать можно</span>
              <b>{runbook.allowedUploadRoot}</b>
            </div>
            <div>
              <span>Deploy-safe archive</span>
              <b>{runbook.deploySafePackageName}</b>
            </div>
          </div>

          <div className="telegram-staging-warning">
            <b>Нельзя загружать</b>
            <p>{runbook.forbiddenUploadRoots.join(' • ')}</p>
          </div>
        </div>
      )}

      {activeView === 'env' && <ChecklistBlock title="Environment" items={runbook.requiredEnvironment} />}
      {activeView === 'bot' && <ChecklistBlock title="BotFather" items={runbook.botFatherSteps} />}

      {activeView === 'tests' && (
        <div className="system-module-window">
          <ChecklistBlock title="Первые тесты" items={runbook.stagingTests} />
          <div className="telegram-staging-next">
            <b>Rollback</b>
            {runbook.rollbackPlan.map(item => <p key={item}>↩ {item}</p>)}
            <strong>Следующий шаг: {runbook.nextStepAfterStaging}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function ChecklistBlock(props: { title: string; items: ReturnType<typeof buildTelegramStagingRunbook>['requiredEnvironment'] }) {
  return (
    <div className="telegram-staging-checklist system-module-window">
      <b>{props.title}</b>
      {props.items.map(item => (
        <article className={`telegram-staging-item ${item.status}`} key={item.id}>
          <span>{statusLabel(item.status)}</span>
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function statusLabel(status: 'ready' | 'manual_required' | 'blocked_until_env' | 'test_required') {
  if (status === 'ready') return 'ready';
  if (status === 'manual_required') return 'manual';
  if (status === 'blocked_until_env') return 'env';
  return 'test';
}
