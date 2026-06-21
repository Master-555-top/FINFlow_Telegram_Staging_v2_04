import { createDailyRecord, type DailyRecord, type DailyRecordType } from '@/lib/day-core/dailyRecordsModel';
import type { ImportCandidate, ImportCandidateEntity, ImportReviewQueue } from '@/lib/import-review/importReviewQueueModel';
import type { TemplateApplyDraft, TemplateApplyPreview } from '@/lib/templates/templateApplyEngine';

export const LOCAL_APPLY_ENGINE_VERSION = 'local_apply_engine_v2_42' as const;

export type LocalApplySource = 'template' | 'historical_import';
export type LocalApplySection = 'money' | 'work' | 'funds' | 'day' | 'system';
export type LocalApplyDraftStatus = 'ready_after_confirm' | 'blocked' | 'duplicate' | 'review_needed';
export type LocalApplyRecordSource = 'quick_button' | 'import_review_queue';

export type LocalApplyDraft = {
  id: string;
  version: typeof LOCAL_APPLY_ENGINE_VERSION;
  source: LocalApplySource;
  sourceId: string;
  section: LocalApplySection;
  status: LocalApplyDraftStatus;
  recordType: DailyRecordType | null;
  title: string;
  amount: number | null;
  category: string;
  scheduledForIso: string;
  duplicateKey: string;
  duplicateRecordIds: string[];
  reviewReasons: string[];
  note: string;
  recordSource: LocalApplyRecordSource;
  sensitiveDataIncluded: false;
};

export type LocalApplyPreview = {
  version: typeof LOCAL_APPLY_ENGINE_VERSION;
  createdAtIso: string;
  totalDrafts: number;
  readyAfterConfirm: number;
  blocked: number;
  duplicates: number;
  reviewNeeded: number;
  templateDrafts: number;
  importDrafts: number;
  moneyDrafts: number;
  workDrafts: number;
  drafts: LocalApplyDraft[];
  nextAction: string;
};

export type LocalApplyAuditEvent = {
  id: string;
  version: 'local_apply_audit_v2_42';
  createdAtIso: string;
  action: 'apply_local_drafts' | 'rollback_local_apply';
  sourceDraftIds: string[];
  recordIds: string[];
  note: string;
  sensitiveDataIncluded: false;
};

export type LocalApplyBatch = {
  id: string;
  version: 'local_apply_batch_v2_42';
  createdAtIso: string;
  appliedBy: 'user_confirm';
  sourceDraftIds: string[];
  recordIds: string[];
  recordsSnapshot: DailyRecord[];
  rolledBackAtIso?: string;
  note: string;
  sensitiveDataIncluded: false;
};

export type LocalApplyResult = {
  version: typeof LOCAL_APPLY_ENGINE_VERSION;
  appliedCount: number;
  skippedCount: number;
  nextRecords: DailyRecord[];
  batch: LocalApplyBatch;
  auditEvent: LocalApplyAuditEvent;
  skippedReasons: { draftId: string; reason: string }[];
};

export function buildLocalApplyPreview(input: {
  templatePreview: TemplateApplyPreview;
  importQueue: ImportReviewQueue;
  records: DailyRecord[];
  nowIso?: string;
}): LocalApplyPreview {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const templateDrafts = input.templatePreview.drafts.map(draft => fromTemplateDraft(draft, input.records, nowIso));
  const importDrafts = input.importQueue.candidates.map(candidate => fromImportCandidate(candidate, input.records, nowIso));
  const drafts = addCrossDraftDuplicates([...templateDrafts, ...importDrafts]);

  const readyAfterConfirm = drafts.filter(draft => draft.status === 'ready_after_confirm').length;
  const blocked = drafts.filter(draft => draft.status === 'blocked').length;
  const duplicates = drafts.filter(draft => draft.status === 'duplicate' || draft.duplicateRecordIds.length > 0).length;
  const reviewNeeded = drafts.filter(draft => draft.status === 'review_needed').length;

  return {
    version: LOCAL_APPLY_ENGINE_VERSION,
    createdAtIso: nowIso,
    totalDrafts: drafts.length,
    readyAfterConfirm,
    blocked,
    duplicates,
    reviewNeeded,
    templateDrafts: templateDrafts.length,
    importDrafts: importDrafts.length,
    moneyDrafts: drafts.filter(draft => draft.section === 'money').length,
    workDrafts: drafts.filter(draft => draft.section === 'work').length,
    drafts,
    nextAction: readyAfterConfirm > 0
      ? 'Можно выбрать готовые draft-записи, подтвердить, записать в локальные Daily Records и при необходимости откатить batch.'
      : 'Сначала нужно подтвердить/исправить импорт или шаблоны: blocked/review-needed не пишутся автоматически.'
  };
}

export function applyLocalDraftsToDailyRecords(input: {
  drafts: LocalApplyDraft[];
  records: DailyRecord[];
  selectedDraftIds: string[];
  nowIso?: string;
}): LocalApplyResult {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const selected = new Set(input.selectedDraftIds);
  let nextRecords = [...input.records];
  const skippedReasons: { draftId: string; reason: string }[] = [];
  const createdRecords: DailyRecord[] = [];
  const appliedDraftIds: string[] = [];

  for (const draft of input.drafts) {
    if (!selected.has(draft.id)) continue;
    if (draft.status !== 'ready_after_confirm') {
      skippedReasons.push({ draftId: draft.id, reason: `draft не готов к записи: ${draft.status}` });
      continue;
    }
    if (!draft.recordType) {
      skippedReasons.push({ draftId: draft.id, reason: 'нет типа Daily Record' });
      continue;
    }
    if (!draft.amount || draft.amount <= 0) {
      skippedReasons.push({ draftId: draft.id, reason: 'нет положительной суммы' });
      continue;
    }
    if (hasDuplicate(nextRecords, draft)) {
      skippedReasons.push({ draftId: draft.id, reason: 'похожая запись уже существует' });
      continue;
    }

    const record = createDailyRecord({
      type: draft.recordType,
      title: draft.title,
      amount: draft.amount,
      category: draft.category,
      note: draft.note,
      source: draft.recordSource,
      now: draft.scheduledForIso || nowIso
    });
    nextRecords = [...nextRecords, record];
    createdRecords.push(record);
    appliedDraftIds.push(draft.id);
  }

  const batch: LocalApplyBatch = {
    id: `local-apply-batch-${stableHash(`${nowIso}:${appliedDraftIds.join('|')}:${createdRecords.length}`)}`,
    version: 'local_apply_batch_v2_42',
    createdAtIso: nowIso,
    appliedBy: 'user_confirm',
    sourceDraftIds: appliedDraftIds,
    recordIds: createdRecords.map(record => record.id),
    recordsSnapshot: input.records,
    note: 'Batch применяет только выбранные ready_after_confirm draft-записи. Rollback возвращает recordsSnapshot до batch.',
    sensitiveDataIncluded: false
  };

  const auditEvent: LocalApplyAuditEvent = {
    id: `local-apply-audit-${stableHash(`${batch.id}:apply`)}`,
    version: 'local_apply_audit_v2_42',
    createdAtIso: nowIso,
    action: 'apply_local_drafts',
    sourceDraftIds: appliedDraftIds,
    recordIds: batch.recordIds,
    note: `Применено ${createdRecords.length} записей через Local Apply Center v2.42.`,
    sensitiveDataIncluded: false
  };

  return {
    version: LOCAL_APPLY_ENGINE_VERSION,
    appliedCount: createdRecords.length,
    skippedCount: skippedReasons.length,
    nextRecords,
    batch,
    auditEvent,
    skippedReasons
  };
}

export function rollbackLocalApplyBatch(records: DailyRecord[], batch: LocalApplyBatch, nowIso = new Date().toISOString()) {
  const removeIds = new Set(batch.recordIds);
  const nextRecords = records.filter(record => !removeIds.has(record.id));
  const rolledBackBatch: LocalApplyBatch = { ...batch, rolledBackAtIso: nowIso };
  const auditEvent: LocalApplyAuditEvent = {
    id: `local-apply-audit-${stableHash(`${batch.id}:rollback:${nowIso}`)}`,
    version: 'local_apply_audit_v2_42',
    createdAtIso: nowIso,
    action: 'rollback_local_apply',
    sourceDraftIds: batch.sourceDraftIds,
    recordIds: batch.recordIds,
    note: `Rollback удалил ${batch.recordIds.length} записей batch ${batch.id}.`,
    sensitiveDataIncluded: false
  };

  return { nextRecords, rolledBackBatch, auditEvent };
}

function fromTemplateDraft(draft: TemplateApplyDraft, records: DailyRecord[], nowIso: string): LocalApplyDraft {
  const baseReasons = [...draft.reviewReasons];
  const duplicateRecordIds = findDuplicateRecordIds(records, draft.recordType, draft.title, draft.amount, draft.category);
  const isReady = draft.safety === 'ready_after_confirm' && draft.target === 'daily_record' && Boolean(draft.recordType) && Boolean(draft.amount && draft.amount > 0);
  const status: LocalApplyDraftStatus = duplicateRecordIds.length > 0 ? 'duplicate' : isReady ? 'ready_after_confirm' : draft.safety === 'needs_review' ? 'review_needed' : 'blocked';

  if (duplicateRecordIds.length > 0) baseReasons.push('похожая запись уже есть в Daily Records');
  if (!draft.recordType) baseReasons.push('шаблон пока не сопоставлен с Daily Record');

  return {
    id: `local-template-${draft.id}`,
    version: LOCAL_APPLY_ENGINE_VERSION,
    source: 'template',
    sourceId: draft.templateId,
    section: mapTemplateSection(draft.section),
    status,
    recordType: draft.recordType,
    title: draft.title,
    amount: draft.amount,
    category: draft.category,
    scheduledForIso: draft.scheduledForIso || nowIso,
    duplicateKey: buildDuplicateKey(draft.recordType, draft.title, draft.amount, draft.category),
    duplicateRecordIds,
    reviewReasons: baseReasons,
    note: `Local Apply v2.42 · шаблон: ${draft.templateLabel}`,
    recordSource: 'quick_button',
    sensitiveDataIncluded: false
  };
}

function fromImportCandidate(candidate: ImportCandidate, records: DailyRecord[], nowIso: string): LocalApplyDraft {
  const recordType = mapImportEntityToDailyRecordType(candidate.entityType);
  const amount = candidate.amount ?? null;
  const category = normalizeImportCategory(candidate);
  const scheduledForIso = parseCandidateDate(candidate.date, nowIso);
  const duplicateRecordIds = findDuplicateRecordIds(records, recordType, candidate.title, amount, category);
  const reviewReasons = buildImportReviewReasons(candidate, recordType, amount, duplicateRecordIds);
  const ready = candidate.status === 'approved' && candidate.targetAction === 'create' && candidate.risk !== 'sensitive' && candidate.risk !== 'high' && recordType !== null && Boolean(amount && amount > 0);
  const status: LocalApplyDraftStatus = duplicateRecordIds.length > 0 ? 'duplicate' : ready ? 'ready_after_confirm' : candidate.status === 'rejected' || candidate.status === 'merged' ? 'blocked' : 'review_needed';

  return {
    id: `local-import-${candidate.id}`,
    version: LOCAL_APPLY_ENGINE_VERSION,
    source: 'historical_import',
    sourceId: candidate.id,
    section: mapImportEntityToSection(candidate.entityType),
    status,
    recordType,
    title: candidate.title,
    amount,
    category,
    scheduledForIso,
    duplicateKey: buildDuplicateKey(recordType, candidate.title, amount, category),
    duplicateRecordIds,
    reviewReasons,
    note: `Local Apply v2.42 · import ${candidate.sourceType} · ${candidate.rawExcerptRedacted}`,
    recordSource: 'import_review_queue',
    sensitiveDataIncluded: false
  };
}

function buildImportReviewReasons(candidate: ImportCandidate, recordType: DailyRecordType | null, amount: number | null, duplicateRecordIds: string[]) {
  const reasons = [candidate.reviewReason];
  if (candidate.status !== 'approved') reasons.push('кандидат ещё не approved в import review');
  if (candidate.targetAction !== 'create') reasons.push(`targetAction=${candidate.targetAction}, поэтому без ручной записи`);
  if (candidate.risk === 'sensitive' || candidate.risk === 'high') reasons.push('risk высокий/чувствительный — auto apply заблокирован');
  if (!recordType) reasons.push('тип кандидата пока не пишется в Daily Records');
  if (!amount || amount <= 0) reasons.push('нет подтверждённой положительной суммы');
  if (duplicateRecordIds.length > 0) reasons.push('похожая запись уже есть');
  return reasons.slice(0, 6);
}

function addCrossDraftDuplicates(drafts: LocalApplyDraft[]) {
  const seen = new Map<string, string>();
  return drafts.map(draft => {
    const prevId = seen.get(draft.duplicateKey);
    if (!prevId) {
      seen.set(draft.duplicateKey, draft.id);
      return draft;
    }
    return {
      ...draft,
      status: draft.status === 'ready_after_confirm' ? 'duplicate' as const : draft.status,
      duplicateRecordIds: [...draft.duplicateRecordIds, prevId],
      reviewReasons: [...draft.reviewReasons, 'похожий draft уже есть в текущем preview'].slice(0, 6)
    };
  });
}

function findDuplicateRecordIds(records: DailyRecord[], type: DailyRecordType | null, title: string, amount: number | null, category: string) {
  if (!type || !amount) return [];
  const key = buildDuplicateKey(type, title, amount, category);
  return records.filter(record => buildDuplicateKey(record.type, record.title, record.amount, record.category) === key).map(record => record.id);
}

function hasDuplicate(records: DailyRecord[], draft: LocalApplyDraft) {
  return findDuplicateRecordIds(records, draft.recordType, draft.title, draft.amount, draft.category).length > 0;
}

function mapTemplateSection(section: TemplateApplyDraft['section']): LocalApplySection {
  if (section === 'work') return 'work';
  if (section === 'funds') return 'funds';
  if (section === 'day') return 'day';
  if (section === 'system') return 'system';
  return 'money';
}

function mapImportEntityToSection(entity: ImportCandidateEntity): LocalApplySection {
  if (entity === 'taxi_order' || entity === 'taxi_shift') return 'work';
  if (entity === 'fund' || entity === 'obligation') return 'funds';
  if (entity === 'day_note') return 'day';
  return 'money';
}

function mapImportEntityToDailyRecordType(entity: ImportCandidateEntity): DailyRecordType | null {
  if (entity === 'expense') return 'expense';
  if (entity === 'income') return 'income';
  if (entity === 'taxi_order') return 'taxi_order';
  return null;
}

function normalizeImportCategory(candidate: ImportCandidate) {
  const category = (candidate.proposedCategory ?? '').toLowerCase();
  if (category.includes('заправ') || category.includes('топлив')) return 'fuel';
  if (category.includes('такси')) return 'taxi';
  if (category.includes('маш')) return 'car';
  if (category.includes('продукт') || category.includes('еда')) return 'products';
  if (candidate.entityType === 'income') return 'other_income';
  return candidate.proposedCategory ?? 'other';
}

function parseCandidateDate(date: string | undefined, fallbackIso: string) {
  if (!date) return fallbackIso;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? fallbackIso : parsed.toISOString();
}

function buildDuplicateKey(type: DailyRecordType | null, title: string, amount: number | null, category: string) {
  return [type ?? 'none', title.trim().toLowerCase(), Math.round(amount ?? 0), category.trim().toLowerCase()].join('::');
}

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}
