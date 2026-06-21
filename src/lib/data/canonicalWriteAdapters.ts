import { createDailyRecord, type DailyRecord, type DailyRecordType } from '@/lib/day-core/dailyRecordsModel';
import type { HistoricalImportDraft, HistoricalImportDraftItem, HistoricalImportTargetSection } from '@/lib/data/historicalImportDraft';
import type { FinflowCanonicalEntityKind, FinflowCanonicalSection } from '@/lib/data/finflowCanonicalDataModel';

export const CANONICAL_WRITE_ADAPTERS_VERSION = 'canonical_write_adapters_v2_37' as const;

export type CanonicalWriteApprovalStatus = 'preview' | 'approved' | 'blocked' | 'applied';
export type CanonicalWriteSafety = 'preview_only' | 'ready_after_confirm' | 'blocked_needs_manual_review';

export type CanonicalWriteCandidate = {
  id: string;
  schemaVersion: typeof CANONICAL_WRITE_ADAPTERS_VERSION;
  sourceDraftItemId: string;
  sourceLineNumber: number;
  section: FinflowCanonicalSection;
  entityKind: FinflowCanonicalEntityKind;
  dateIso: string | null;
  occurredAtIso?: string | null;
  title: string;
  amount: number | null;
  category: string;
  rawExcerptRedacted: string;
  confidenceScore: number;
  approvalStatus: CanonicalWriteApprovalStatus;
  safety: CanonicalWriteSafety;
  duplicateKey: string;
  duplicateCandidateIds: string[];
  reviewReasons: string[];
  writeAdapter: 'daily_records_money_work_v2_37' | 'not_supported_yet';
  sensitiveDataIncluded: false;
};

export type CanonicalWritePreview = {
  schemaVersion: typeof CANONICAL_WRITE_ADAPTERS_VERSION;
  createdAtIso: string;
  sourceDraftVersion: HistoricalImportDraft['version'];
  totalCandidates: number;
  readyAfterConfirm: number;
  blocked: number;
  duplicateHints: number;
  supportedMoneyWorkCount: number;
  unsupportedCount: number;
  candidates: CanonicalWriteCandidate[];
  nextAction: string;
};

export type CanonicalWriteApplyAuditEvent = {
  id: string;
  schemaVersion: 'canonical_write_apply_audit_v2_37';
  createdAtIso: string;
  candidateId: string;
  targetLocalKey: 'finflow.dailyRecords.v1_47';
  action: 'create_daily_record_preview_apply';
  rollbackHint: string;
  sensitiveDataIncluded: false;
};

export type CanonicalDailyRecordsApplyResult = {
  schemaVersion: typeof CANONICAL_WRITE_ADAPTERS_VERSION;
  appliedCount: number;
  skippedCount: number;
  nextRecords: DailyRecord[];
  auditEvents: CanonicalWriteApplyAuditEvent[];
  skippedReasons: { candidateId: string; reason: string }[];
};

export function buildCanonicalWritePreview(draft: HistoricalImportDraft, now = new Date().toISOString()): CanonicalWritePreview {
  const candidates = addDuplicateHints(draft.items.map(toCanonicalWriteCandidate));
  const readyAfterConfirm = candidates.filter(item => item.safety === 'ready_after_confirm').length;
  const blocked = candidates.filter(item => item.safety === 'blocked_needs_manual_review').length;
  const supportedMoneyWorkCount = candidates.filter(item => item.writeAdapter === 'daily_records_money_work_v2_37').length;
  const unsupportedCount = candidates.length - supportedMoneyWorkCount;
  const duplicateHints = candidates.filter(item => item.duplicateCandidateIds.length > 0).length;

  return {
    schemaVersion: CANONICAL_WRITE_ADAPTERS_VERSION,
    createdAtIso: now,
    sourceDraftVersion: draft.version,
    totalCandidates: candidates.length,
    readyAfterConfirm,
    blocked,
    duplicateHints,
    supportedMoneyWorkCount,
    unsupportedCount,
    candidates,
    nextAction: 'Проверить preview, убрать дубли, затем разрешить запись только подтверждённых money/work кандидатов в local daily records.'
  };
}

export function applyApprovedMoneyWorkCandidatesToDailyRecords(
  candidates: CanonicalWriteCandidate[],
  records: DailyRecord[],
  now = new Date().toISOString()
): CanonicalDailyRecordsApplyResult {
  let nextRecords = [...records];
  const auditEvents: CanonicalWriteApplyAuditEvent[] = [];
  const skippedReasons: { candidateId: string; reason: string }[] = [];

  for (const candidate of candidates) {
    if (candidate.approvalStatus !== 'approved') {
      skippedReasons.push({ candidateId: candidate.id, reason: 'кандидат не подтверждён пользователем' });
      continue;
    }
    if (candidate.writeAdapter !== 'daily_records_money_work_v2_37') {
      skippedReasons.push({ candidateId: candidate.id, reason: 'для этого раздела пока нет безопасного write-adapter' });
      continue;
    }
    if (candidate.safety !== 'ready_after_confirm') {
      skippedReasons.push({ candidateId: candidate.id, reason: 'кандидат заблокирован для прямой записи' });
      continue;
    }
    if (candidate.amount === null || candidate.amount <= 0) {
      skippedReasons.push({ candidateId: candidate.id, reason: 'нет корректной суммы' });
      continue;
    }
    if (hasDailyRecordDuplicate(nextRecords, candidate)) {
      skippedReasons.push({ candidateId: candidate.id, reason: 'похожая запись уже есть в daily records' });
      continue;
    }

    const record = createDailyRecord({
      type: mapCandidateToDailyRecordType(candidate),
      title: candidate.title,
      amount: candidate.amount,
      category: candidate.category,
      note: buildCandidateNote(candidate),
      source: 'import_review_queue',
      now: candidate.occurredAtIso ?? (candidate.dateIso ? `${candidate.dateIso}T12:00:00.000+12:00` : now)
    });
    nextRecords = [...nextRecords, record];
    auditEvents.push({
      id: `canonical-apply-${candidate.id}-${stableHash(candidate.duplicateKey)}`,
      schemaVersion: 'canonical_write_apply_audit_v2_37',
      createdAtIso: now,
      candidateId: candidate.id,
      targetLocalKey: 'finflow.dailyRecords.v1_47',
      action: 'create_daily_record_preview_apply',
      rollbackHint: `Удалить daily record ${record.id}, созданный из кандидата ${candidate.id}.`,
      sensitiveDataIncluded: false
    });
  }

  return {
    schemaVersion: CANONICAL_WRITE_ADAPTERS_VERSION,
    appliedCount: auditEvents.length,
    skippedCount: skippedReasons.length,
    nextRecords,
    auditEvents,
    skippedReasons
  };
}

function toCanonicalWriteCandidate(item: HistoricalImportDraftItem): CanonicalWriteCandidate {
  const section = mapTargetSection(item.targetSection);
  const entityKind = mapEntityKind(item);
  const category = inferCategory(item.raw, item.targetSection);
  const title = inferTitle(item.raw, item.targetSection, category);
  const writeAdapter = isMoneyWorkSupported(section, entityKind) ? 'daily_records_money_work_v2_37' : 'not_supported_yet';
  const reviewReasons = [...item.reviewReasons];
  if (writeAdapter === 'not_supported_yet') reviewReasons.push('write-adapter для раздела будет добавлен позже');
  const confidenceScore = confidenceToScore(item.confidence) - (writeAdapter === 'not_supported_yet' ? 0.12 : 0);
  const safety: CanonicalWriteSafety = reviewReasons.length > 1
    ? 'blocked_needs_manual_review'
    : writeAdapter === 'daily_records_money_work_v2_37' && item.dateIso && item.amount !== null
      ? 'ready_after_confirm'
      : 'preview_only';

  return {
    id: `canonical-candidate-${item.lineNumber}-${stableHash(`${item.raw}:${item.dateIso ?? ''}`)}`,
    schemaVersion: CANONICAL_WRITE_ADAPTERS_VERSION,
    sourceDraftItemId: item.id,
    sourceLineNumber: item.lineNumber,
    section,
    entityKind,
    dateIso: item.dateIso,
    occurredAtIso: item.occurredAtIso ?? null,
    title,
    amount: item.amount,
    category,
    rawExcerptRedacted: redactRawExcerpt(item.raw),
    confidenceScore: Math.max(0, Math.min(1, Number(confidenceScore.toFixed(2)))),
    approvalStatus: safety === 'blocked_needs_manual_review' ? 'blocked' : 'preview',
    safety,
    duplicateKey: buildDuplicateKey(item.dateIso, section, entityKind, item.amount, title),
    duplicateCandidateIds: [],
    reviewReasons,
    writeAdapter,
    sensitiveDataIncluded: false
  };
}

function addDuplicateHints(candidates: CanonicalWriteCandidate[]) {
  const byKey = new Map<string, CanonicalWriteCandidate[]>();
  for (const candidate of candidates) {
    if (!candidate.dateIso || candidate.amount === null) continue;
    byKey.set(candidate.duplicateKey, [...(byKey.get(candidate.duplicateKey) ?? []), candidate]);
  }
  return candidates.map(candidate => {
    const duplicates = (byKey.get(candidate.duplicateKey) ?? []).filter(item => item.id !== candidate.id).map(item => item.id);
    if (!duplicates.length) return candidate;
    return {
      ...candidate,
      duplicateCandidateIds: duplicates,
      reviewReasons: [...candidate.reviewReasons, 'возможный дубль в текущем импорте'],
      safety: 'blocked_needs_manual_review' as const,
      approvalStatus: 'blocked' as const
    };
  });
}

function mapTargetSection(section: HistoricalImportTargetSection): FinflowCanonicalSection {
  if (section === 'unknown') return 'system';
  return section;
}

function mapEntityKind(item: HistoricalImportDraftItem): FinflowCanonicalEntityKind {
  const raw = item.raw.toLowerCase();
  if (item.targetSection === 'sleep') return 'sleep_record';
  if (item.metadata?.importKind === 'manual_taxi_order') return 'taxi_order';
  if (item.metadata?.importKind === 'manual_taxi_shift') return 'work_shift';
  if (item.targetSection === 'work' && /заказ/.test(raw)) return 'taxi_order';
  if (item.targetSection === 'work') return 'work_shift';
  if (/бензин|топлив|азс|заправ/.test(raw)) return 'fuel_event';
  if (item.targetSection === 'funds' && /банкрот|машин|плат[её]ж|обяз/.test(raw)) return 'obligation';
  if (item.targetSection === 'funds') return 'fund';
  if (item.targetSection === 'day') return 'task';
  if (/доход|такси|смен|заказ/.test(raw)) return 'money_record';
  return 'money_record';
}

function inferCategory(raw: string, targetSection: HistoricalImportTargetSection) {
  const value = raw.toLowerCase();
  if (targetSection === 'work' && /Заказ такси №/i.test(raw)) return 'taxi';
  if (/бензин|топлив|азс|заправ/.test(value)) return 'fuel';
  if (/drivee|комисс/.test(value)) return 'drivee_topup';
  if (/еда|продукт|кофе|обед|ужин|завтрак/.test(value)) return 'food';
  if (/машин|ремонт|масло|запчаст/.test(value)) return 'car';
  if (/такси|смен|заказ|работ/.test(value)) return 'taxi';
  if (/доход|перевод|фриланс/.test(value)) return 'other_income';
  if (targetSection === 'work') return 'taxi';
  if (targetSection === 'money') return 'other';
  return 'uncategorized';
}

function inferTitle(raw: string, targetSection: HistoricalImportTargetSection, category: string) {
  const taxiOrderTitle = raw.match(/Заказ такси №(\d+)\s+(\d{1,2}:\d{2})[–-](\d{1,2}:\d{2})/i);
  if (taxiOrderTitle) return `Заказ #${taxiOrderTitle[1]} · ${taxiOrderTitle[2]}–${taxiOrderTitle[3]}`;
  if (/Смена такси/i.test(raw)) return 'Смена такси · агрегат без записи дохода';
  if (category === 'fuel') return 'Заправка';
  if (category === 'drivee_topup') return 'Drivee / комиссия';
  if (category === 'food') return 'Еда / продукты';
  if (category === 'car') return 'Машина';
  if (category === 'taxi' && /заказ/i.test(raw)) return 'Заказ такси';
  if (category === 'taxi') return 'Смена такси';
  if (category === 'other_income') return 'Доход';
  if (targetSection === 'funds') return 'Фонд / обязательство';
  if (targetSection === 'sleep') return 'Сон';
  return raw.slice(0, 48) || 'Историческая запись';
}

function isMoneyWorkSupported(section: FinflowCanonicalSection, entityKind: FinflowCanonicalEntityKind) {
  return (section === 'money' || section === 'work')
    && ['money_record', 'work_shift', 'taxi_order', 'fuel_event'].includes(entityKind);
}

function mapCandidateToDailyRecordType(candidate: CanonicalWriteCandidate): DailyRecordType {
  if (candidate.entityKind === 'taxi_order' || candidate.entityKind === 'work_shift' || candidate.category === 'taxi') return 'taxi_order';
  if (candidate.entityKind === 'fuel_event' || candidate.category === 'fuel') return 'fuel';
  if (candidate.category === 'drivee_topup') return 'drivee_topup';
  if (candidate.category === 'other_income') return 'income';
  return 'expense';
}

function buildCandidateNote(candidate: CanonicalWriteCandidate) {
  const parts = [`Исторический импорт v2.37`, candidate.dateIso ?? 'дата не определена'];
  if (candidate.occurredAtIso) parts.push(`время ${candidate.occurredAtIso.slice(11, 16)}`);
  if (candidate.entityKind === 'taxi_order') parts.push('ручной журнал заказов');
  return parts.join(' · ');
}

function hasDailyRecordDuplicate(records: DailyRecord[], candidate: CanonicalWriteCandidate) {
  return records.some(record => {
    const sameAmount = candidate.amount !== null && Math.abs(record.amount - candidate.amount) <= 1;
    const sameCategory = record.category === candidate.category || record.title.toLowerCase() === candidate.title.toLowerCase();
    const sameDay = candidate.dateIso ? record.createdAt.slice(0, 10) === candidate.dateIso : true;
    return sameAmount && sameCategory && sameDay;
  });
}

function confidenceToScore(confidence: HistoricalImportDraftItem['confidence']) {
  if (confidence === 'high') return 0.92;
  if (confidence === 'medium') return 0.68;
  return 0.36;
}

function redactRawExcerpt(raw: string) {
  return raw.replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone-redacted]').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email-redacted]').slice(0, 180);
}

function buildDuplicateKey(dateIso: string | null, section: FinflowCanonicalSection, entityKind: FinflowCanonicalEntityKind, amount: number | null, title: string) {
  return [dateIso ?? 'no-date', section, entityKind, amount ?? 'no-amount', normalizeText(title)].join('|');
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim();
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(16);
}
