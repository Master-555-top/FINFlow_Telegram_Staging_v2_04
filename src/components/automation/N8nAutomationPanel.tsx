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
    <section className="system-data-panel global-backbone-panel n8n-automation-panel">
      <div className="system-data-hero">
        <span>v2.41 • n8n Automation Contract</span>
        <b>{snapshot.readinessPercent}% contract ready</b>
        <p>{buildModeCopy(snapshot)}</p>
      </div>

      <div className="system-data-preview compact backbone-progress-grid">
        <div className="system-data-preview-head">
          <b>Automation status</b>
          <span>{snapshot.mode}</span>
        </div>
        <article><b>{snapshot.workflows.length}</b><span>workflows</span></article>
        <article><b>{snapshot.workflows.filter(item => item.status === 'dry_run_ready').length}</b><span>dry-run</span></article>
        <article className="watch"><b>{snapshot.workflows.filter(item => item.risk === 'watch').length}</b><span>watch</span></article>
        <article className="danger"><b>{snapshot.workflows.filter(item => item.risk === 'blocked').length}</b><span>blocked</span></article>
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Workflow contracts</b>
          <span>no secrets</span>
        </div>
        {snapshot.workflows.map(workflow => (
          <article key={workflow.id} className={workflow.risk === 'blocked' ? 'danger' : workflow.risk === 'watch' ? 'watch' : ''}>
            <b>{workflow.title}</b>
            <span>{workflow.trigger} · {workflow.status}</span>
            <p>{workflow.output}</p>
            <small>{workflow.safetyGate}</small>
          </article>
        ))}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Dry-run payload</b>
          <span>preview-only</span>
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
          <b>{snapshot.dryRunPayloadExample.redaction.containsSecrets ? 'risk' : 'safe'}</b>
          <span>secrets: {snapshot.dryRunPayloadExample.redaction.containsSecrets ? 'yes' : 'no'} · external call: no</span>
          <p>FINFlow готовит только компактный агрегированный payload. Сырые private/raw/env данные не входят в контракт.</p>
        </article>
        <button type="button" className="ecosystem-toggle" onClick={runDryRun} disabled={loading}>
          {loading ? 'проверяю…' : 'запустить dry-run'}
        </button>
        {dryRun ? <DryRunCard dryRun={dryRun} /> : null}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Credentials policy</b>
          <span>locked</span>
        </div>
        {snapshot.credentialsPolicy.map(rule => <article key={rule}><b>{rule}</b><span>required</span></article>)}
      </div>

      <div className="system-data-preview compact">
        <div className="system-data-preview-head">
          <b>Осталось до production automation</b>
          <span>{snapshot.remainingToProduction.length} steps</span>
        </div>
        {snapshot.remainingToProduction.map(step => <article key={step}><b>{step}</b><span>next</span></article>)}
      </div>
    </section>
  );
}

function DryRunCard(props: { dryRun: DryRunResponse }) {
  const status = props.dryRun.ok ? 'ok' : 'failed';
  return (
    <article className={props.dryRun.ok ? '' : 'danger'}>
      <b>Dry-run: {status}</b>
      <span>{props.dryRun.event} · external call: {props.dryRun.externalCallMade ? 'yes' : 'no'}</span>
      <p>secretsReturned: {props.dryRun.safety?.secretsReturned ? 'yes' : 'no'} · dryRunOnly: {props.dryRun.safety?.dryRunOnly ? 'yes' : 'no'}</p>
    </article>
  );
}

function buildModeCopy(snapshot: N8nAutomationContractSnapshot) {
  if (snapshot.mode === 'ready_for_private_n8n') return 'Private n8n можно подключать после финального auth/backup теста.';
  if (snapshot.mode === 'blocked_by_cloud') return 'Контракты готовы, но cloud-sensitive workflows заблокированы до Supabase/RLS/backup smoke test.';
  if (snapshot.mode === 'dry_run_ready') return 'Можно проверять automation payloads локально: без внешнего вызова и без секретов.';
  return 'Пока только контракт: endpoint, payload keys, запреты и safety gates.';
}
