'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MANUAL_CLOUD_TEST_WIZARD_STORAGE_KEY,
  MANUAL_CLOUD_TEST_WIZARD_LEGACY_STORAGE_KEYS,
  createInitialManualCloudWizardState,
  getManualCloudWizardProgress,
  manualCloudWizardSteps,
  parseManualCloudWizardState,
  resetManualCloudWizard,
  setManualCloudWizardNote,
  setManualCloudWizardStep,
  summarizeManualCloudWizard,
  type ManualCloudWizardState,
  type ManualCloudWizardStepId,
  type ManualCloudWizardStepStatus
} from '@/lib/deployment/manualCloudTestWizard';
import { buildBackupAwareCloudTestGate, canMarkManualCloudStepAsPassed, getBackupGateBlockMessage } from '@/lib/deployment/backupAwareCloudTestFlow';
import { LOCAL_BACKUP_STORAGE_KEY, parseLocalBackupState, summarizeLocalBackups, createInitialLocalBackupState } from '@/lib/local/localBackupModel';

export function ManualCloudTestWizardPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<ManualCloudWizardState>(() => createInitialManualCloudWizardState(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`));
  const [backupState, setBackupState] = useState(() => createInitialLocalBackupState(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`));
  const summary = useMemo(() => summarizeManualCloudWizard(state), [state]);
  const backupSummary = useMemo(() => summarizeLocalBackups(backupState), [backupState]);
  const backupGate = useMemo(() => buildBackupAwareCloudTestGate({ backupSummary }), [backupSummary]);

  useEffect(() => {
    try {
      const parsed = parseManualCloudWizardState(
        window.localStorage.getItem(MANUAL_CLOUD_TEST_WIZARD_STORAGE_KEY)
        ?? MANUAL_CLOUD_TEST_WIZARD_LEGACY_STORAGE_KEYS.map(key => window.localStorage.getItem(key)).find(Boolean)
        ?? null
      );
      if (parsed) setState(parsed);
      const parsedBackups = parseLocalBackupState(window.localStorage.getItem(LOCAL_BACKUP_STORAGE_KEY));
      if (parsedBackups) setBackupState(parsedBackups);
    } catch {
      // Keep safe default.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(MANUAL_CLOUD_TEST_WIZARD_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;

    function refreshBackups() {
      const parsedBackups = parseLocalBackupState(window.localStorage.getItem(LOCAL_BACKUP_STORAGE_KEY));
      if (parsedBackups) setBackupState(parsedBackups);
    }

    window.addEventListener('storage', refreshBackups);
    window.addEventListener('finflow-backup-refresh', refreshBackups);
    return () => {
      window.removeEventListener('storage', refreshBackups);
      window.removeEventListener('finflow-backup-refresh', refreshBackups);
    };
  }, [hydrated]);

  function updateStep(stepId: ManualCloudWizardStepId, status: ManualCloudWizardStepStatus) {
    const step = manualCloudWizardSteps.find(item => item.id === stepId);
    if (step && !canMarkManualCloudStepAsPassed({ step, requestedStatus: status, gate: backupGate })) {
      setState(previous => setManualCloudWizardStep({
        state: previous,
        stepId,
        status: 'blocked',
        note: getBackupGateBlockMessage(step)
      }));
      return;
    }

    setState(previous => setManualCloudWizardStep({ state: previous, stepId, status }));
  }

  function updateNote(stepId: ManualCloudWizardStepId, note: string) {
    setState(previous => setManualCloudWizardNote({ state: previous, stepId, note }));
  }

  function resetWizard() {
    const confirmed = window.confirm('Сбросить manual cloud test wizard? Это не меняет Supabase и локальные данные.');
    if (!confirmed) return;
    setState(resetManualCloudWizard());
  }

  return (
    <section className="manual-cloud-wizard-panel">
      <div className="manual-cloud-head">
        <span>v1.90 • Codex-Synced Backup-Aware Cloud Test Flow</span>
        <b>Cloud sync test wizard</b>
        <p>
          Пошаговая проверка cloud save/load/conflict теперь связана с local backup gate: manual write/conflict нельзя закрыть как passed без backup.
        </p>
      </div>

      <div className="manual-cloud-summary">
        <div><span>Progress</span><b>{summary.percentPassed}%</b></div>
        <div><span>Passed</span><b>{summary.passed}/{summary.total}</b></div>
        <div><span>Blocked</span><b>{summary.blocked}</b></div>
        <div><span>Skipped</span><b>{summary.skipped}</b></div>
        <div><span>Current</span><b>{summary.currentStep?.title ?? 'done'}</b></div>
      </div>

      <div className="manual-cloud-progress">
        <div style={{ width: `${summary.percentPassed}%` }} />
      </div>

      <div className={`manual-cloud-backup-gate ${backupGate.mode}`}>
        <div>
          <b>{backupGate.headline}</b>
          <p>{backupGate.message}</p>
        </div>
        <div className="manual-cloud-backup-grid">
          <div><span>Backups</span><b>{backupSummary.total}</b></div>
          <div><span>Latest</span><b>{backupSummary.latestLabel ?? 'none'}</b></div>
          <div><span>Manual write</span><b>{backupGate.canProceedToManualWrite ? 'allowed' : 'blocked'}</b></div>
        </div>
        {backupGate.warnings.map(warning => <p className="quick-note" key={warning}>{warning}</p>)}
      </div>

      <div className={`manual-cloud-gate ${summary.readyForRealData ? 'ready' : 'not-ready'}`}>
        <b>{summary.readyForRealData ? 'Gate: close to real data readiness' : 'Gate: not ready for sensitive real data yet'}</b>
        <p>До банковских данных и настоящей ежедневной cloud-зависимости нужны успешные save/load/conflict/RLS проверки.</p>
        <button type="button" onClick={resetWizard}>reset wizard</button>
      </div>

      <div className="manual-cloud-step-list">
        {manualCloudWizardSteps.map(step => {
          const progress = getManualCloudWizardProgress(state, step.id);
          const status = progress?.status ?? 'not_started';
          return (
            <div className={`manual-cloud-step ${status} ${step.safetyLevel}`} key={step.id}>
              <div>
                <b>{step.title}</b>
                <span>{step.safetyLevel} • {status}</span>
              </div>
              <p>{step.description}</p>
              <small>Success: {step.successCriteria}</small>
              {step.warning ? <em>{step.warning}</em> : null}
              <div className="manual-cloud-actions">
                <button type="button" onClick={() => updateStep(step.id, 'not_started')}>not started</button>
                <button type="button" onClick={() => updateStep(step.id, 'in_progress')}>in progress</button>
                <button type="button" onClick={() => updateStep(step.id, 'passed')}>passed</button>
                <button type="button" onClick={() => updateStep(step.id, 'blocked')}>blocked</button>
                <button type="button" onClick={() => updateStep(step.id, 'failed')}>failed</button>
                <button type="button" onClick={() => updateStep(step.id, 'skipped')}>skipped</button>
              </div>
              <textarea
                placeholder="заметка по шагу без токенов, ключей, .env.local и банковских raw data"
                value={progress?.note ?? ''}
                onChange={event => updateNote(step.id, event.target.value)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
