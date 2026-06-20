import type { ImportCandidate, ImportCandidateEntity } from '@/lib/import-review/importReviewQueueModel';

export type ImportReviewActionType =
  | 'approve'
  | 'reject'
  | 'edit_before_apply'
  | 'merge_duplicate'
  | 'attach_to_day'
  | 'create_audit_log_event';

export type ImportReviewActionActor = 'user' | 'ai_assistant' | 'system';

export type ImportReviewActionPayload = {
  title?: string;
  amount?: number;
  proposedCategory?: string;
  proposedDayId?: string;
  mergeIntoCandidateId?: string;
  rejectionReason?: string;
  auditNote?: string;
};

export type ImportReviewAuditEvent = {
  id: string;
  candidateId: string;
  action: ImportReviewActionType;
  actor: ImportReviewActionActor;
  createdAt: string;
  note: string;
  beforeStatus: ImportCandidate['status'];
  afterStatus: ImportCandidate['status'];
  sensitiveDataIncluded: false;
};

export type ImportReviewActionResult = {
  candidate: ImportCandidate;
  auditEvent: ImportReviewAuditEvent;
  canApplyToDayCore: boolean;
};

export type CandidateActionAvailability = {
  approve: boolean;
  reject: boolean;
  editBeforeApply: boolean;
  mergeDuplicate: boolean;
  attachToDay: boolean;
};

const terminalStatuses: ImportCandidate['status'][] = ['approved', 'rejected', 'merged', 'archived'];

export function getCandidateActionAvailability(candidate: ImportCandidate): CandidateActionAvailability {
  const terminal = terminalStatuses.includes(candidate.status);
  return {
    approve: !terminal && candidate.risk !== 'sensitive' && candidate.confidence >= 0.75,
    reject: candidate.status !== 'rejected' && candidate.status !== 'archived',
    editBeforeApply: candidate.status !== 'approved' && candidate.status !== 'rejected' && candidate.status !== 'archived',
    mergeDuplicate: !terminal && candidate.duplicateCandidateIds.length > 0,
    attachToDay: !terminal && candidate.entityType !== 'unknown'
  };
}

export function applyImportReviewAction(
  candidate: ImportCandidate,
  action: ImportReviewActionType,
  payload: ImportReviewActionPayload = {},
  actor: ImportReviewActionActor = 'user',
  now: string = new Date().toISOString()
): ImportReviewActionResult {
  const beforeStatus = candidate.status;
  let nextCandidate: ImportCandidate = { ...candidate };
  let note = '';

  switch (action) {
    case 'approve': {
      if (candidate.risk === 'sensitive') {
        nextCandidate = { ...candidate, status: 'needs_review', targetAction: 'needs_manual_decision' };
        note = 'Approval blocked: sensitive candidates require manual verification and redacted source review.';
      } else {
        nextCandidate = { ...candidate, status: 'approved' };
        note = payload.auditNote ?? 'Candidate approved after review.';
      }
      break;
    }
    case 'reject': {
      nextCandidate = { ...candidate, status: 'rejected', targetAction: 'ignore' };
      note = payload.rejectionReason ?? payload.auditNote ?? 'Candidate rejected and will not affect calculations.';
      break;
    }
    case 'edit_before_apply': {
      nextCandidate = {
        ...candidate,
        title: payload.title ?? candidate.title,
        amount: payload.amount ?? candidate.amount,
        proposedCategory: payload.proposedCategory ?? candidate.proposedCategory,
        proposedDayId: payload.proposedDayId ?? candidate.proposedDayId,
        status: candidate.status === 'new' ? 'needs_review' : candidate.status,
        targetAction: 'needs_manual_decision'
      };
      note = payload.auditNote ?? 'Candidate edited before apply; still requires review.';
      break;
    }
    case 'merge_duplicate': {
      nextCandidate = {
        ...candidate,
        status: 'merged',
        targetAction: 'merge',
        duplicateCandidateIds: payload.mergeIntoCandidateId
          ? Array.from(new Set([...candidate.duplicateCandidateIds, payload.mergeIntoCandidateId]))
          : candidate.duplicateCandidateIds
      };
      note = payload.auditNote ?? 'Candidate marked as duplicate and merged into another candidate.';
      break;
    }
    case 'attach_to_day': {
      nextCandidate = {
        ...candidate,
        proposedDayId: payload.proposedDayId ?? candidate.proposedDayId,
        status: candidate.status === 'new' ? 'needs_review' : candidate.status
      };
      note = payload.auditNote ?? 'Candidate attached to a Day Core day for later application.';
      break;
    }
    case 'create_audit_log_event': {
      nextCandidate = { ...candidate };
      note = payload.auditNote ?? 'Audit log event created without changing the candidate.';
      break;
    }
    default: {
      const exhaustive: never = action;
      throw new Error(`Unsupported import review action: ${exhaustive}`);
    }
  }

  const auditEvent: ImportReviewAuditEvent = {
    id: `audit-${candidate.id}-${action}-${Math.abs(hashString(`${candidate.id}-${action}-${now}`))}`,
    candidateId: candidate.id,
    action,
    actor,
    createdAt: now,
    note,
    beforeStatus,
    afterStatus: nextCandidate.status,
    sensitiveDataIncluded: false
  };

  return {
    candidate: nextCandidate,
    auditEvent,
    canApplyToDayCore: canCandidateAffectDayCore(nextCandidate)
  };
}

export function canCandidateAffectDayCore(candidate: ImportCandidate): boolean {
  if (candidate.status !== 'approved') return false;
  if (candidate.risk === 'sensitive' || candidate.risk === 'high') return false;
  if (!candidate.proposedDayId) return false;
  return candidate.entityType !== 'unknown';
}

export function getEntityApplyTarget(entityType: ImportCandidateEntity): string {
  const targets: Record<ImportCandidateEntity, string> = {
    expense: 'Day Core → расходы',
    income: 'Day Core → доходы',
    taxi_shift: 'Day Core → смена',
    taxi_order: 'Day Core → заказы',
    fund: 'Фонды',
    obligation: 'Обязательства',
    day_note: 'Day Core → заметки',
    unknown: 'review queue only'
  };
  return targets[entityType];
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}
