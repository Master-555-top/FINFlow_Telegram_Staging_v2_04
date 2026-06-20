import type { LocalBackupSummary } from '@/lib/local/localBackupModel';
import type { ManualCloudWizardStep, ManualCloudWizardStepStatus } from '@/lib/deployment/manualCloudTestWizard';

export const BACKUP_AWARE_CLOUD_TEST_FLOW_VERSION = 'backup_aware_cloud_test_flow_v1_88' as const;

export type BackupAwareCloudTestGate = {
  version: typeof BACKUP_AWARE_CLOUD_TEST_FLOW_VERSION;
  backupRequired: boolean;
  backupReady: boolean;
  canProceedToManualWrite: boolean;
  mode: 'backup_missing' | 'backup_ready' | 'manual_write_guarded';
  headline: string;
  message: string;
  warnings: string[];
};

export function buildBackupAwareCloudTestGate(input: {
  backupSummary: LocalBackupSummary;
}): BackupAwareCloudTestGate {
  const backupReady = input.backupSummary.total > 0;

  if (!backupReady) {
    return {
      version: BACKUP_AWARE_CLOUD_TEST_FLOW_VERSION,
      backupRequired: true,
      backupReady: false,
      canProceedToManualWrite: false,
      mode: 'backup_missing',
      headline: 'Backup required before cloud write tests',
      message: 'Перед manual save / apply / conflict нужно создать локальный backup текущего дня.',
      warnings: [
        'Не запускай real cloud write/conflict без local backup.',
        'Backup не должен содержать токены, .env.local, raw bank files или private_raw_data.'
      ]
    };
  }

  return {
    version: BACKUP_AWARE_CLOUD_TEST_FLOW_VERSION,
    backupRequired: true,
    backupReady: true,
    canProceedToManualWrite: true,
    mode: 'backup_ready',
    headline: 'Backup gate passed',
    message: `Есть локальный backup: ${input.backupSummary.latestLabel ?? 'без названия'}. Можно переходить к manual cloud write шагам осторожно.`,
    warnings: [
      'Manual cloud save всё равно выполняется только вручную.',
      'Перед реальными банковскими данными нужен RLS/security review.'
    ]
  };
}

export function canMarkManualCloudStepAsPassed(input: {
  step: ManualCloudWizardStep;
  requestedStatus: ManualCloudWizardStepStatus;
  gate: BackupAwareCloudTestGate;
}) {
  if (input.requestedStatus !== 'passed' && input.requestedStatus !== 'in_progress') return true;
  if (input.step.safetyLevel === 'manual_write' || input.step.safetyLevel === 'manual_conflict') {
    return input.gate.canProceedToManualWrite;
  }
  return true;
}

export function getBackupGateBlockMessage(step: ManualCloudWizardStep) {
  return `Шаг "${step.title}" требует local backup перед ручной cloud-записью/conflict-тестом. Сначала создай backup в блоке Local Backup / Restore.`;
}
