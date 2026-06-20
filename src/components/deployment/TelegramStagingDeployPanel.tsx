import { buildTelegramStagingRunbook } from '@/lib/deployment/telegramStagingRunbook';

export function TelegramStagingDeployPanel() {
  const runbook = buildTelegramStagingRunbook();

  return (
    <section className="telegram-staging-panel">
      <div className="deployment-head">
        <div>
          <span>v2.03 • Telegram staging</span>
          <b>Deploy-safe package + BotFather runbook</b>
        </div>
        <p>{runbook.goal}</p>
      </div>

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
        <b>Нельзя загружать:</b> {runbook.forbiddenUploadRoots.join(' • ')}
      </div>

      <ChecklistBlock title="Environment перед staging" items={runbook.requiredEnvironment} />
      <ChecklistBlock title="BotFather" items={runbook.botFatherSteps} />
      <ChecklistBlock title="Первые тесты в Telegram" items={runbook.stagingTests} />

      <div className="telegram-staging-next">
        <b>Rollback:</b>
        {runbook.rollbackPlan.map(item => <p key={item}>↩ {item}</p>)}
        <strong>Следующий шаг: {runbook.nextStepAfterStaging}</strong>
      </div>
    </section>
  );
}

function ChecklistBlock(props: { title: string; items: ReturnType<typeof buildTelegramStagingRunbook>['requiredEnvironment'] }) {
  return (
    <div className="telegram-staging-checklist">
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
