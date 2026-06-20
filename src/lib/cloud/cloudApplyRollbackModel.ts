import { parseFinflowCloudDayDocument, type FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';

export const CLOUD_APPLY_ROLLBACK_MODEL_VERSION = 'cloud_apply_rollback_model_v1_94' as const;
export const CLOUD_APPLY_ROLLBACK_STORAGE_KEY = 'finflow.cloudApplyRollback.v1_94';

export type CloudApplyRollbackSnapshot = {
  schemaVersion: typeof CLOUD_APPLY_ROLLBACK_MODEL_VERSION;
  id: string;
  createdAt: string;
  source: 'cloud_preview_apply';
  cloudRevision: number | null;
  localDocumentBeforeApply: FinflowCloudDayDocument;
  cloudDocumentApplied: FinflowCloudDayDocument;
};

export function createCloudApplyRollbackSnapshot(input: {
  localDocumentBeforeApply: FinflowCloudDayDocument;
  cloudDocumentApplied: FinflowCloudDayDocument;
  cloudRevision: number | null;
  now?: string;
}): CloudApplyRollbackSnapshot {
  const now = input.now ?? new Date().toISOString();
  return {
    schemaVersion: CLOUD_APPLY_ROLLBACK_MODEL_VERSION,
    id: `cloud_apply_rollback_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    source: 'cloud_preview_apply',
    cloudRevision: input.cloudRevision,
    localDocumentBeforeApply: input.localDocumentBeforeApply,
    cloudDocumentApplied: input.cloudDocumentApplied
  };
}

export function parseCloudApplyRollbackSnapshot(raw: string | null): CloudApplyRollbackSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CloudApplyRollbackSnapshot;
    if (parsed.schemaVersion !== CLOUD_APPLY_ROLLBACK_MODEL_VERSION) return null;
    if (typeof parsed.id !== 'string') return null;
    if (typeof parsed.createdAt !== 'string' || Number.isNaN(Date.parse(parsed.createdAt))) return null;
    if (parsed.source !== 'cloud_preview_apply') return null;
    if (parsed.cloudRevision !== null && typeof parsed.cloudRevision !== 'number') return null;

    const localDocumentBeforeApply = parseFinflowCloudDayDocument(parsed.localDocumentBeforeApply);
    const cloudDocumentApplied = parseFinflowCloudDayDocument(parsed.cloudDocumentApplied);
    if (!localDocumentBeforeApply || !cloudDocumentApplied) return null;

    return {
      schemaVersion: CLOUD_APPLY_ROLLBACK_MODEL_VERSION,
      id: parsed.id,
      createdAt: parsed.createdAt,
      source: 'cloud_preview_apply',
      cloudRevision: parsed.cloudRevision,
      localDocumentBeforeApply,
      cloudDocumentApplied
    };
  } catch {
    return null;
  }
}

export function serializeCloudApplyRollbackSnapshot(snapshot: CloudApplyRollbackSnapshot) {
  return JSON.stringify(snapshot);
}

export function summarizeCloudApplyRollbackSnapshot(snapshot: CloudApplyRollbackSnapshot) {
  return {
    createdAt: snapshot.createdAt,
    cloudRevision: snapshot.cloudRevision,
    localDateBeforeApply: snapshot.localDocumentBeforeApply.dayInput.localDate,
    appliedCloudDate: snapshot.cloudDocumentApplied.dayInput.localDate,
    localRecordsBeforeApply: snapshot.localDocumentBeforeApply.records.length,
    appliedCloudRecords: snapshot.cloudDocumentApplied.records.length
  };
}
