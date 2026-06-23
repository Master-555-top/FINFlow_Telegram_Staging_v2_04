'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildN8nAutomationContractSnapshot, type N8nAutomationContractSnapshot, type N8nAutomationWorkflowId } from '@/lib/automation/n8nAutomationContract';

type DryRunResponse = {
  ok: boolean;
  event: N8nAutomationWorkflowId;
  externalCallMade: boolean;
  payload?: unknown;
  safety?: {
    secretsReturned: boolean;
    dryRunOnly: boolean;
  };
};

export function N8nAutomationPanel() {
  const snapshot = useMemo(() => buildN8nAutomationContractSnapshot(), []);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nAutomationWorkflowId>('daily_evening_report');
  const [dryRun, setDryRun] = useState<DryRunResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDryRun(null);
  }, [selectedWorkflow]);

  async function runDryRun() {
    setLoading(true);
    try {
      const response = await fetch(`/api/automation/n8n/dry-run?event=${selectedWorkflow}`, { cache: 'no-store' });
      setDryRun(await response.json() as DryRunResponse);
    } catch {
      setDryRun({ ok: false, event: selectedWorkflow, externalCallMade: false, safety: { secretsReturned: false, dryRunOnly: true } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="system-data-panel global-backbone-panel n8n-automation-panel clean-copy-panel">
      <div className="system-data-hero">
        <span>Автоматизация</span>
        <b>{snapshot.readinessPercent}% подготовлено</b>
        <p>{buildModeCopy(snapshot)}</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Состояние</b>
          <span>{humanMode(snapshot.mode)}</span>
        </div>
        <article><b>{snapshot.workflows.length}</b><span>сценариев</span></article>
        <article><b>{snapshot.workflows.filter(item => item.status === 'dry_run_ready').length}</b><span>проверка</span></article>
        <article className="watch"><b>{snapshot.workflows.filter(item => item.risk === 'watch').length}</b><span>контроль</span></article>
        <article className="danger"><b>{snapshot.workflows.filter(item => item.risk === 'blocked').length}</b><span>закрыто</span></article>
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Сценарии</b>
          <span>без секретов</span>
        </div>
        {snapshot.workflows.map(workflow => (
          <article key={workflow.id} className={workflow.risk === 'blocked' ? 'danger' : workflow.risk === 'watch' ? 'watch' : ''}>
            <b>{workflow.title}</b>
            <span>{workflow.trigger} · {humanWorkflowStatus(workflow.status)}</span>
            <p>{workflow.output}</p>
            <small>{workflow.safetyGate}</small>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Пробная проверка</b>
          <span>без отправки</span>
        </div>
        <label className="n8n-select-row">
          <span>Сценарий</span>
          <select value={selectedWorkflow} onChange={event => setSelectedWorkflow(event.target.value as N8nAutomationWorkflowId)}>
            {snapshot.workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>{workflow.title}</option>
            ))}
          </select>
        </label>
        <article>
          <b>{snapshot.dryRunPayloadExample.redaction.containsSecrets ? 'риск' : 'чисто'}</b>
          <span>секретов нет · наружу не отправляется</span>
          <p>FINFlow готовит только короткую сводку. Личные файлы и секреты не используются.</p>
        </article>
        <button type="button" className="ecosystem-toggle" onClick={runDryRun} disabled={loading}>
          {loading ? 'проверяю…' : 'проверить сценарий'}
        </button>
        {dryRun ? <DryRunCard dryRun={dryRun} /> : null}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Правила безопасности</b>
          <span>зафиксировано</span>
        </div>
        {snapshot.credentialsPolicy.map(rule => <article key={rule}><b>{cleanTechCopy(rule)}</b><span>обязательно</span></article>)}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Что ещё нужно</b>
          <span>{snapshot.remainingToProduction.length} шагов</span>
        </div>
        {snapshot.remainingToProduction.map(step => <article key={step}><b>{cleanTechCopy(step)}</b><span>следующий шаг</span></article>)}
      </div>
    </section>
  );
}

function DryRunCard(props: { dryRun: DryRunResponse }) {
  const status = props.dryRun.ok ? 'прошла' : 'не прошла';
  return (
    <article className={props.dryRun.ok ? '' : 'danger'}>
      <b>Проверка: {status}</b>
      <span>{humanWorkflowId(props.dryRun.event)} · внешний вызов: {props.dryRun.externalCallMade ? 'да' : 'нет'}</span>
      <p>{props.dryRun.safety?.secretsReturned ? 'Проверь: есть риск лишних данных.' : 'Секреты не показаны.'} {props.dryRun.safety?.dryRunOnly ? 'Проверка без отправки.' : 'Нужна дополнительная проверка.'}</p>
    </article>
  );
}

function buildModeCopy(snapshot: N8nAutomationContractSnapshot) {
  if (snapshot.mode === 'ready_for_private_n8n') return 'Автоматизацию можно подключать только после финальной проверки и резервной копии.';
  if (snapshot.mode === 'blocked_by_cloud') return 'Сценарии готовы, но внешние действия закрыты до проверки облака и копии.';
  if (snapshot.mode === 'dry_run_ready') return 'Можно проверить сценарии без внешней отправки и без секретов.';
  return 'Пока это только безопасная заготовка сценариев.';
}


function humanMode(mode: string) {
  if (mode === 'ready_for_private_n8n') return 'можно готовить';
  if (mode === 'blocked_by_cloud') return 'нужна проверка';
  if (mode === 'dry_run_ready') return 'проверка';
  return 'черновик';
}

function humanWorkflowStatus(status: string) {
  if (status === 'dry_run_ready') return 'можно проверить';
  if (status === 'blocked') return 'закрыто';
  if (status === 'watch') return 'под контролем';
  return status.replaceAll('_', ' ');
}

function humanWorkflowId(id: string) {
  return id.replaceAll('_', ' ');
}

function cleanTechCopy(text: string) {
  return text
    .replaceAll('dry-run', 'проверка')
    .replaceAll('payload', 'данные')
    .replaceAll('endpoint', 'точка подключения')
    .replaceAll('auth', 'защита')
    .replaceAll('backup', 'копия')
    .replaceAll('Supabase/RLS', 'облако/доступ')
    .replaceAll('RLS', 'доступ')
    .replaceAll('cloud', 'облако')
    .replaceAll('external', 'внешний')
    .replaceAll('n8n', 'автоматизация');
}
