import { createDailyRecord, type DailyRecord, type DailyRecordType } from '@/lib/day-core/dailyRecordsModel';
import type { FinflowTemplateCadence, FinflowTemplateDefinition } from '@/lib/templates/finflowTemplatesEngine';

export const TEMPLATE_APPLY_ENGINE_VERSION = 'template_apply_engine_v2_38' as const;

export type TemplateApplySafety = 'ready_after_confirm' | 'needs_review' | 'planned_only';
export type TemplateApplyStatus = 'preview' | 'approved' | 'applied' | 'blocked';
export type TemplateApplyTarget = 'daily_record' | 'recurring_obligation' | 'fund_goal' | 'task' | 'import_rule' | 'not_supported_yet';

export type TemplateApplyDraft = {
  id: string;
  version: typeof TEMPLATE_APPLY_ENGINE_VERSION;
  templateId: string;
  templateLabel: string;
  target: TemplateApplyTarget;
  status: TemplateApplyStatus;
  safety: TemplateApplySafety;
  section: FinflowTemplateDefinition['section'];
  cadence: FinflowTemplateCadence;
  recordType: DailyRecordType | null;
  title: string;
  amount: number | null;
  category: string;
  scheduledForIso: string;
  duplicateKey: string;
  duplicateRecordIds: string[];
  reviewReasons: string[];
  nextAction: string;
};

export type TemplateRecurringOccurrence = {
  id: string;
  templateId: string;
  templateLabel: string;
  dueDateIso: string;
  dueLabel: string;
  amount: number | null;
  section: FinflowTemplateDefinition['section'];
  cadence: FinflowTemplateCadence;
  priority: FinflowTemplateDefinition['priority'];
  canCreateRecord: boolean;
  reviewReason: string;
};

export type TemplateApplyPreview = {
  version: typeof TEMPLATE_APPLY_ENGINE_VERSION;
  createdAtIso: string;
  totalDrafts: number;
  readyAfterConfirm: number;
  needsReview: number;
  plannedOnly: number;
  duplicateHints: number;
  dailyRecordDrafts: number;
  recurringOccurrences: TemplateRecurringOccurrence[];
  drafts: TemplateApplyDraft[];
  nextAction: string;
};

export type TemplateApplyAuditEvent = {
  id: string;
  version: 'template_apply_audit_v2_38';
  createdAtIso: string;
  draftId: string;
  templateId: string;
  targetLocalKey: 'finflow.dailyRecords.v1_47';
  action: 'apply_template_to_daily_record';
  rollbackRecordId: string;
  sensitiveDataIncluded: false;
};

export type TemplateApplyResult = {
  version: typeof TEMPLATE_APPLY_ENGINE_VERSION;
  appliedCount: number;
  skippedCount: number;
  nextRecords: DailyRecord[];
  auditEvents: TemplateApplyAuditEvent[];
  skippedReasons: { draftId: string; reason: string }[];
  rollbackSnapshot: {
    createdAtIso: string;
    recordIdsToRemove: string[];
    note: string;
  };
};

export function buildTemplateApplyPreview(
  templates: FinflowTemplateDefinition[],
  records: DailyRecord[],
  nowIso = new Date().toISOString()
): TemplateApplyPreview {
  const drafts = addDuplicateHints(templates.map(template => toTemplateApplyDraft(template, records, nowIso)));
  const recurringOccurrences = buildRecurringOccurrences(templates, nowIso);
  const readyAfterConfirm = drafts.filter(draft => draft.safety === 'ready_after_confirm').length;
  const needsReview = drafts.filter(draft => draft.safety === 'needs_review').length;
  const plannedOnly = drafts.filter(draft => draft.safety === 'planned_only').length;
  const duplicateHints = drafts.filter(draft => draft.duplicateRecordIds.length > 0).length;
  const dailyRecordDrafts = drafts.filter(draft => draft.target === 'daily_record').length;

  return {
    version: TEMPLATE_APPLY_ENGINE_VERSION,
    createdAtIso: nowIso,
    totalDrafts: drafts.length,
    readyAfterConfirm,
    needsReview,
    plannedOnly,
    duplicateHints,
    dailyRecordDrafts,
    recurringOccurrences,
    drafts,
    nextAction: 'Шаблон больше не просто кнопка: сначала preview, затем confirm/apply, затем rollback при ошибке или дубле.'
  };
}

export function applyApprovedTemplateDraftsToDailyRecords(
  drafts: TemplateApplyDraft[],
  records: DailyRecord[],
  approvedDraftIds: string[],
  nowIso = new Date().toISOString()
): TemplateApplyResult {
  const approved = new Set(approvedDraftIds);
  let nextRecords = [...records];
  const auditEvents: TemplateApplyAuditEvent[] = [];
  const skippedReasons: { draftId: string; reason: string }[] = [];

  for (const draft of drafts) {
    if (!approved.has(draft.id)) {
      skippedReasons.push({ draftId: draft.id, reason: 'шаблон не выбран для применения' });
      continue;
    }
    if (draft.target !== 'daily_record' || !draft.recordType) {
      skippedReasons.push({ draftId: draft.id, reason: 'этот шаблон пока не пишет Daily Record' });
      continue;
    }
    if (draft.safety !== 'ready_after_confirm') {
      skippedReasons.push({ draftId: draft.id, reason: 'нужна ручная проверка перед записью' });
      continue;
    }
    if (!draft.amount || draft.amount <= 0) {
      skippedReasons.push({ draftId: draft.id, reason: 'нет положительной суммы' });
      continue;
    }
    if (hasRecordDuplicate(nextRecords, draft)) {
      skippedReasons.push({ draftId: draft.id, reason: 'похожая запись уже есть' });
      continue;
    }

    const record = createDailyRecord({
      type: draft.recordType,
      title: draft.title,
      amount: draft.amount,
      category: draft.category,
      note: `Templates Engine v2.38 · ${draft.templateLabel}`,
      source: 'quick_button',
      now: draft.scheduledForIso || nowIso
    });
    nextRecords = [...nextRecords, record];
    auditEvents.push({
      id: `tpl-apply-${stableHash(`${draft.id}:${record.id}`)}`,
      version: 'template_apply_audit_v2_38',
      createdAtIso: nowIso,
      draftId: draft.id,
      templateId: draft.templateId,
      targetLocalKey: 'finflow.dailyRecords.v1_47',
      action: 'apply_template_to_daily_record',
      rollbackRecordId: record.id,
      sensitiveDataIncluded: false
    });
  }

  const recordIdsToRemove = auditEvents.map(event => event.rollbackRecordId);
  return {
    version: TEMPLATE_APPLY_ENGINE_VERSION,
    appliedCount: auditEvents.length,
    skippedCount: skippedReasons.length,
    nextRecords,
    auditEvents,
    skippedReasons,
    rollbackSnapshot: {
      createdAtIso: nowIso,
      recordIdsToRemove,
      note: 'Rollback удаляет только записи, созданные текущим применением шаблонов, и не трогает старые данные.'
    }
  };
}

export function rollbackTemplateApplyResult(result: TemplateApplyResult): DailyRecord[] {
  const removeIds = new Set(result.rollbackSnapshot.recordIdsToRemove);
  return result.nextRecords.filter(record => !removeIds.has(record.id));
}

function toTemplateApplyDraft(template: FinflowTemplateDefinition, records: DailyRecord[], nowIso: string): TemplateApplyDraft {
  const recordType = mapTemplateToDailyRecordType(template);
  const target = mapTemplateTarget(template, recordType);
  const amount = template.defaultAmount ?? null;
  const title = template.defaultTitle ?? template.label;
  const category = template.category ?? defaultCategoryForTemplate(template, recordType);
  const duplicateKey = buildTemplateDuplicateKey(recordType, title, amount, category, nowIso);
  const duplicateRecordIds = records.filter(record => recordMatchesDraft(record, { recordType, title, amount, category })).map(record => record.id);
  const reviewReasons = buildReviewReasons(template, target, recordType, amount, duplicateRecordIds);
  const safety = inferSafety(template, target, amount, duplicateRecordIds, reviewReasons);

  return {
    id: `template-draft-${template.id}-${stableHash(`${template.id}:${title}:${amount ?? 'x'}:${nowIso.slice(0, 10)}`)}`,
    version: TEMPLATE_APPLY_ENGINE_VERSION,
    templateId: template.id,
    templateLabel: template.label,
    target,
    status: safety === 'ready_after_confirm' ? 'preview' : 'blocked',
    safety,
    section: template.section,
    cadence: template.cadence,
    recordType,
    title,
    amount,
    category,
    scheduledForIso: nowIso,
    duplicateKey,
    duplicateRecordIds,
    reviewReasons,
    nextAction: safety === 'ready_after_confirm'
      ? 'Можно показать пользователю preview и записать после подтверждения.'
      : 'Оставить в preview и запросить уточнение/настройку перед записью.'
  };
}

function buildRecurringOccurrences(templates: FinflowTemplateDefinition[], nowIso: string): TemplateRecurringOccurrence[] {
  const now = new Date(nowIso);
  return templates
    .filter(template => template.cadence !== 'manual' && (template.dueDayOfMonth || template.cadence === 'daily' || template.cadence === 'weekly'))
    .slice(0, 12)
    .map(template => {
      const dueDate = nextDueDate(template, now);
      const canCreateRecord = mapTemplateToDailyRecordType(template) !== null && template.defaultAmount !== undefined;
      return {
        id: `recurring-${template.id}-${dueDate.toISOString().slice(0, 10)}`,
        templateId: template.id,
        templateLabel: template.label,
        dueDateIso: dueDate.toISOString(),
        dueLabel: dueDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        amount: template.defaultAmount ?? null,
        section: template.section,
        cadence: template.cadence,
        priority: template.priority,
        canCreateRecord,
        reviewReason: canCreateRecord
          ? 'можно создать запись через preview/confirm'
          : 'нужно отдельное действие фонда/обязательства, без прямой записи в Daily Records'
      };
    });
}

function nextDueDate(template: FinflowTemplateDefinition, now: Date) {
  const due = new Date(now);
  due.setHours(12, 0, 0, 0);
  if (template.cadence === 'daily') return due;
  if (template.cadence === 'weekly') {
    due.setDate(due.getDate() + ((8 - due.getDay()) % 7 || 7));
    return due;
  }
  if (template.dueDayOfMonth) {
    due.setDate(Math.min(template.dueDayOfMonth, 28));
    if (due.getTime() < now.getTime()) due.setMonth(due.getMonth() + 1);
    return due;
  }
  if (template.cadence === 'deadline') {
    due.setDate(due.getDate() + 7);
    return due;
  }
  return due;
}

function mapTemplateTarget(template: FinflowTemplateDefinition, recordType: DailyRecordType | null): TemplateApplyTarget {
  if (recordType) return 'daily_record';
  if (template.kind === 'obligation' || template.cadence === 'monthly') return 'recurring_obligation';
  if (template.kind === 'fund') return 'fund_goal';
  if (template.kind === 'task') return 'task';
  if (template.kind === 'import_rule') return 'import_rule';
  return 'not_supported_yet';
}

function mapTemplateToDailyRecordType(template: FinflowTemplateDefinition): DailyRecordType | null {
  if (template.recordType === 'taxi_order') return 'taxi_order';
  if (template.recordType === 'fuel') return 'fuel';
  if (template.recordType === 'drivee_topup') return 'drivee_topup';
  if (template.recordType === 'income') return 'income';
  if (template.recordType === 'expense') return 'expense';
  if (template.kind === 'income') return 'income';
  if (template.kind === 'expense' && template.direction === 'work_cost' && /drivee|комисс/i.test(template.label)) return 'drivee_topup';
  if (template.kind === 'expense' && template.direction === 'work_cost') return template.category === 'fuel' ? 'fuel' : 'expense';
  if (template.kind === 'expense') return 'expense';
  return null;
}

function inferSafety(
  template: FinflowTemplateDefinition,
  target: TemplateApplyTarget,
  amount: number | null,
  duplicateRecordIds: string[],
  reviewReasons: string[]
): TemplateApplySafety {
  if (template.readiness === 'planned' || target === 'not_supported_yet') return 'planned_only';
  if (target !== 'daily_record') return 'needs_review';
  if (!amount || amount <= 0) return 'needs_review';
  if (duplicateRecordIds.length > 0 || reviewReasons.length > 0) return 'needs_review';
  return 'ready_after_confirm';
}

function buildReviewReasons(
  template: FinflowTemplateDefinition,
  target: TemplateApplyTarget,
  recordType: DailyRecordType | null,
  amount: number | null,
  duplicateRecordIds: string[]
) {
  const reasons: string[] = [];
  if (target !== 'daily_record') reasons.push('не Daily Record: нужен отдельный adapter для раздела/повторения');
  if (!recordType && target === 'daily_record') reasons.push('не определён тип записи');
  if (!amount || amount <= 0) reasons.push('нет суммы по умолчанию');
  if (duplicateRecordIds.length > 0) reasons.push('похожая запись уже есть сегодня');
  if (template.readiness === 'needs_confirmation') reasons.push('шаблон требует подтверждения настроек');
  if (template.readiness === 'planned') reasons.push('шаблон пока запланирован, не включён для записи');
  return reasons;
}

function addDuplicateHints(drafts: TemplateApplyDraft[]) {
  const byKey = new Map<string, TemplateApplyDraft[]>();
  for (const draft of drafts) {
    if (!draft.amount || draft.safety === 'planned_only') continue;
    byKey.set(draft.duplicateKey, [...(byKey.get(draft.duplicateKey) ?? []), draft]);
  }
  return drafts.map(draft => {
    const localDuplicates = (byKey.get(draft.duplicateKey) ?? []).filter(item => item.id !== draft.id);
    if (!localDuplicates.length) return draft;
    return {
      ...draft,
      safety: draft.safety === 'planned_only' ? draft.safety : 'needs_review' as const,
      status: 'blocked' as const,
      reviewReasons: [...draft.reviewReasons, 'возможный дубль среди шаблонов на сегодня'],
      duplicateRecordIds: [...draft.duplicateRecordIds, ...localDuplicates.map(item => item.id)]
    };
  });
}

function defaultCategoryForTemplate(template: FinflowTemplateDefinition, recordType: DailyRecordType | null) {
  if (template.category) return template.category;
  if (recordType === 'taxi_order') return 'taxi';
  if (recordType === 'fuel') return 'fuel';
  if (recordType === 'drivee_topup') return 'drivee_topup';
  if (recordType === 'income') return 'other_income';
  if (/продукт|еда|кофе|обед/i.test(template.label)) return 'products';
  if (/машин|ремонт/i.test(template.label)) return 'car';
  if (/встреч/i.test(template.label)) return 'meeting';
  return 'other';
}

function buildTemplateDuplicateKey(recordType: DailyRecordType | null, title: string, amount: number | null, category: string, nowIso: string) {
  return [nowIso.slice(0, 10), recordType ?? 'none', normalize(title), amount ?? 'none', category].join('|');
}

function recordMatchesDraft(record: DailyRecord, draft: { recordType: DailyRecordType | null; title: string; amount: number | null; category: string }) {
  if (!draft.recordType || !draft.amount) return false;
  return record.enabled
    && record.type === draft.recordType
    && record.category === draft.category
    && Math.abs(record.amount - draft.amount) <= 1
    && normalize(record.title) === normalize(draft.title);
}

function hasRecordDuplicate(records: DailyRecord[], draft: TemplateApplyDraft) {
  return records.some(record => recordMatchesDraft(record, { recordType: draft.recordType, title: draft.title, amount: draft.amount, category: draft.category }));
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
