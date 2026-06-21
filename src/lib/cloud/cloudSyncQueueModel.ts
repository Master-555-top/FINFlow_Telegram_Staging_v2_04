import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import type { CloudRestorePreviewDiff } from '@/lib/cloud/cloudRestoreDiffModel';

export const CLOUD_SYNC_QUEUE_MODEL_VERSION = 'cloud_sync_queue_model_v2_40' as const;
export const CLOUD_SYNC_QUEUE_STORAGE_KEY = 'finflow.cloudSyncQueue.v2_40' as const;
export const CLOUD_CONFLICT_REVIEW_STORAGE_KEY = 'finflow.cloudConflictReviews.v2_40' as const;

export type CloudSyncQueueAction = 'save_day' | 'load_preview' | 'apply_cloud_preview' | 'rollback_apply' | 'resolve_conflict';
export type CloudSyncQueueStatus = 'queued' | 'previewed' | 'applied' | 'conflict' | 'rolled_back' | 'blocked';
export type CloudSyncQueueRisk = 'safe' | 'watch' | 'danger';

export type CloudSyncQueueItem = {
  schemaVersion: typeof CLOUD_SYNC_QUEUE_MODEL_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  localDate: string;
  action: CloudSyncQueueAction;
  status: CloudSyncQueueStatus;
  risk: CloudSyncQueueRisk;
  title: string;
  summary: string;
  expectedRevision: number | null;
  cloudRevision: number | null;
  dedupeKey: string;
  requiresBackup: boolean;
  requiresTelegram: boolean;
  rollbackAvailable: boolean;
  payloadPreview: {
    records: number;
    customTemplates: number;
    bankDecisions: number;
    updatedAt: string;
  };
};

export type CloudConflictReview = {
  schemaVersion: typeof CLOUD_SYNC_QUEUE_MODEL_VERSION;
  id: string;
  createdAt: string;
  localDate: string;
  status: 'open' | 'resolved_local' | 'resolved_cloud' | 'resolved_merge' | 'dismissed';
  localRevision: number | null;
  cloudRevision: number | null;
  headline: string;
  message: string;
  recommendedAction: string;
  diffSummary: {
    total: number;
    warnings: number;
    watches: number;
  };
};

export type CloudSyncQueueSnapshot = {
  version: typeof CLOUD_SYNC_QUEUE_MODEL_VERSION;
  generatedAt: string;
  mode: 'local_queue' | 'telegram_ready' | 'conflict_review' | 'cloud_safe_off';
  queue: CloudSyncQueueItem[];
  conflicts: CloudConflictReview[];
  summary: {
    total: number;
    queued: number;
    applied: number;
    conflicts: number;
    rollbackAvailable: number;
    blocked: number;
  };
  nextAction: string;
  safetyRules: string[];
};

export function createCloudSyncQueueItem(input: {
  action: CloudSyncQueueAction;
  status?: CloudSyncQueueStatus;
  risk?: CloudSyncQueueRisk;
  document: FinflowCloudDayDocument;
  expectedRevision?: number | null;
  cloudRevision?: number | null;
  title?: string;
  summary?: string;
  rollbackAvailable?: boolean;
  now?: string;
}): CloudSyncQueueItem {
  const now = input.now ?? new Date().toISOString();
  const status = input.status ?? (input.action === 'load_preview' ? 'previewed' : 'queued');
  const cloudRevision = input.cloudRevision ?? null;
  const expectedRevision = input.expectedRevision ?? null;
  const dedupeRevision = cloudRevision ?? expectedRevision ?? 'none';

  return {
    schemaVersion: CLOUD_SYNC_QUEUE_MODEL_VERSION,
    id: `cloud_queue_${input.action}_${input.document.dayInput.localDate}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    updatedAt: now,
    localDate: input.document.dayInput.localDate,
    action: input.action,
    status,
    risk: input.risk ?? inferRisk(input.action, status),
    title: input.title ?? titleForAction(input.action),
    summary: input.summary ?? summaryForAction(input.action, input.document, cloudRevision),
    expectedRevision,
    cloudRevision,
    dedupeKey: `${input.action}:${input.document.dayInput.localDate}:${dedupeRevision}`,
    requiresBackup: input.action === 'save_day' || input.action === 'apply_cloud_preview',
    requiresTelegram: input.action === 'save_day' || input.action === 'load_preview' || input.action === 'resolve_conflict',
    rollbackAvailable: input.rollbackAvailable ?? false,
    payloadPreview: summarizeDocument(input.document)
  };
}

export function createCloudConflictReview(input: {
  localDate: string;
  localRevision?: number | null;
  cloudRevision?: number | null;
  diff?: CloudRestorePreviewDiff | null;
  now?: string;
}): CloudConflictReview {
  const now = input.now ?? new Date().toISOString();
  const diffSummary = input.diff?.summary ?? { total: 0, warnings: 0, watches: 0 };
  const hasWarnings = diffSummary.warnings > 0;

  return {
    schemaVersion: CLOUD_SYNC_QUEUE_MODEL_VERSION,
    id: `cloud_conflict_${input.localDate}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    localDate: input.localDate,
    status: 'open',
    localRevision: input.localRevision ?? null,
    cloudRevision: input.cloudRevision ?? null,
    headline: hasWarnings ? 'Конфликт с важными отличиями' : 'Конфликт ревизий',
    message: `Локальная версия и cloud revision ${input.cloudRevision ?? '—'} не совпали. FINFlow не перезаписал данные автоматически.`,
    recommendedAction: hasWarnings
      ? 'Сначала загрузить cloud preview, сравнить отличия и вручную выбрать источник.'
      : 'Загрузить cloud preview, проверить отличия и применить только после backup.',
    diffSummary
  };
}

export function parseCloudSyncQueue(value: unknown): CloudSyncQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isQueueItem).slice(0, 50);
}

export function parseCloudConflictReviews(value: unknown): CloudConflictReview[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isConflictReview).slice(0, 50);
}

export function buildCloudSyncQueueSnapshot(input: {
  queue: CloudSyncQueueItem[];
  conflicts: CloudConflictReview[];
  hasTelegramInitData: boolean;
  writesEnabled: boolean;
}): CloudSyncQueueSnapshot {
  const openConflicts = input.conflicts.filter(conflict => conflict.status === 'open');
  const summary = {
    total: input.queue.length,
    queued: input.queue.filter(item => item.status === 'queued' || item.status === 'previewed').length,
    applied: input.queue.filter(item => item.status === 'applied').length,
    conflicts: openConflicts.length,
    rollbackAvailable: input.queue.filter(item => item.rollbackAvailable).length,
    blocked: input.queue.filter(item => item.status === 'blocked').length
  };
  const mode: CloudSyncQueueSnapshot['mode'] = openConflicts.length > 0
    ? 'conflict_review'
    : !input.hasTelegramInitData
      ? 'local_queue'
      : input.writesEnabled
        ? 'telegram_ready'
        : 'cloud_safe_off';

  return {
    version: CLOUD_SYNC_QUEUE_MODEL_VERSION,
    generatedAt: new Date().toISOString(),
    mode,
    queue: [...input.queue].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12),
    conflicts: [...openConflicts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    summary,
    nextAction: buildNextAction({ mode, summary }),
    safetyRules: [
      'Никакой cloud apply/save без preview и ручного подтверждения.',
      'Конфликт ревизий не решается автоматически: сначала review cards.',
      'Перед save/apply нужен backup или rollback snapshot.',
      'Очередь хранит только безопасное краткое preview, не секреты и не private raw data.'
    ]
  };
}

export function upsertCloudSyncQueueItem(queue: CloudSyncQueueItem[], item: CloudSyncQueueItem): CloudSyncQueueItem[] {
  const filtered = queue.filter(existing => existing.dedupeKey !== item.dedupeKey && existing.id !== item.id);
  return [item, ...filtered].slice(0, 50);
}

export function upsertCloudConflictReview(conflicts: CloudConflictReview[], review: CloudConflictReview): CloudConflictReview[] {
  const filtered = conflicts.filter(existing => !(existing.localDate === review.localDate && existing.status === 'open'));
  return [review, ...filtered].slice(0, 50);
}

export function resolveCloudConflict(conflicts: CloudConflictReview[], id: string, status: CloudConflictReview['status']): CloudConflictReview[] {
  return conflicts.map(conflict => conflict.id === id ? { ...conflict, status } : conflict);
}

function summarizeDocument(document: FinflowCloudDayDocument) {
  return {
    records: document.records.length,
    customTemplates: document.customTemplates.length,
    bankDecisions: document.bankDecisions.length,
    updatedAt: document.updatedAt
  };
}

function titleForAction(action: CloudSyncQueueAction) {
  if (action === 'save_day') return 'Сохранить день в cloud';
  if (action === 'load_preview') return 'Загрузить cloud preview';
  if (action === 'apply_cloud_preview') return 'Применить cloud preview';
  if (action === 'rollback_apply') return 'Откатить cloud apply';
  return 'Разобрать cloud conflict';
}

function summaryForAction(action: CloudSyncQueueAction, document: FinflowCloudDayDocument, revision: number | null) {
  const records = document.records.length;
  if (action === 'save_day') return `День ${document.dayInput.localDate}: ${records} записей готовятся к save. Expected revision: ${revision ?? '—'}.`;
  if (action === 'load_preview') return `День ${document.dayInput.localDate}: cloud preview получен, revision ${revision ?? '—'}.`;
  if (action === 'apply_cloud_preview') return `День ${document.dayInput.localDate}: cloud preview можно применить локально после backup.`;
  if (action === 'rollback_apply') return `День ${document.dayInput.localDate}: локальный rollback доступен.`;
  return `День ${document.dayInput.localDate}: требуется ручной conflict review.`;
}

function inferRisk(action: CloudSyncQueueAction, status: CloudSyncQueueStatus): CloudSyncQueueRisk {
  if (status === 'conflict' || action === 'resolve_conflict') return 'danger';
  if (action === 'save_day' || action === 'apply_cloud_preview') return 'watch';
  return 'safe';
}

function buildNextAction(input: { mode: CloudSyncQueueSnapshot['mode']; summary: CloudSyncQueueSnapshot['summary'] }) {
  if (input.mode === 'conflict_review') return 'Сначала разобрать conflict cards: загрузить preview, сравнить, выбрать local/cloud/merge.';
  if (input.mode === 'local_queue') return 'Очередь готова локально. Для cloud save/load открой mini app через Telegram.';
  if (input.mode === 'telegram_ready') return 'Можно проводить staging save/load/conflict тест после backup.';
  if (input.summary.queued > 0) return 'Cloud safe-off: можно готовить preview и backup, но не включать blind writes.';
  return 'Очередь чистая. Следующий шаг — реальный Telegram staging smoke test.';
}

function isQueueItem(value: unknown): value is CloudSyncQueueItem {
  if (!isObject(value)) return false;
  return value.schemaVersion === CLOUD_SYNC_QUEUE_MODEL_VERSION
    && typeof value.id === 'string'
    && typeof value.localDate === 'string'
    && ['save_day', 'load_preview', 'apply_cloud_preview', 'rollback_apply', 'resolve_conflict'].includes(String(value.action))
    && ['queued', 'previewed', 'applied', 'conflict', 'rolled_back', 'blocked'].includes(String(value.status))
    && ['safe', 'watch', 'danger'].includes(String(value.risk))
    && typeof value.dedupeKey === 'string';
}

function isConflictReview(value: unknown): value is CloudConflictReview {
  if (!isObject(value)) return false;
  return value.schemaVersion === CLOUD_SYNC_QUEUE_MODEL_VERSION
    && typeof value.id === 'string'
    && typeof value.localDate === 'string'
    && ['open', 'resolved_local', 'resolved_cloud', 'resolved_merge', 'dismissed'].includes(String(value.status))
    && typeof value.headline === 'string';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
