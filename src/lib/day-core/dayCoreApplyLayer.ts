import type { DayCoreInputModel, DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import type { ImportCandidate, ImportCandidateEntity } from '@/lib/import-review/importReviewQueueModel';
import type { ImportReviewAuditEvent } from '@/lib/import-review/importReviewActions';

export type DayCorePatchOperation = 'increment' | 'set' | 'append' | 'upsert' | 'note_only';

export type DayCorePatch = {
  id: string;
  candidateId: string;
  dayId: string;
  entityType: ImportCandidateEntity;
  operation: DayCorePatchOperation;
  targetPath: string;
  amountDelta?: number;
  description: string;
  rollbackHint: string;
};

export type DayCoreApplyPreview = {
  schemaVersion: 'day_core_apply_preview_v1_27';
  candidateId: string;
  dayId?: string;
  canApply: boolean;
  blockedReasons: string[];
  patches: DayCorePatch[];
  safetyNotes: string[];
};

export type DayCoreApplyHistoryEvent = {
  id: string;
  schemaVersion: 'day_core_apply_history_v1_27';
  candidateId: string;
  dayId: string;
  createdAt: string;
  patches: DayCorePatch[];
  auditNote: string;
  rollbackReady: true;
  sensitiveDataIncluded: false;
};

export type DayCoreApplyResult = {
  preview: DayCoreApplyPreview;
  dayCore: DayCoreInputModel;
  historyEvent?: DayCoreApplyHistoryEvent;
  auditEvent?: ImportReviewAuditEvent;
};

const supportedEntities: ImportCandidateEntity[] = ['expense', 'income', 'taxi_shift', 'taxi_order', 'fund', 'obligation', 'day_note'];

export function buildDayCoreApplyPreview(candidate: ImportCandidate, dayCore: DayCoreInputModel): DayCoreApplyPreview {
  const blockedReasons: string[] = [];
  const safetyNotes: string[] = [
    'Dry-run preview: candidate is not applied until explicit Apply action.',
    'Raw excerpts and private source data are never copied into Day Core.',
    'Every applied patch must have an audit event and rollback hint.'
  ];

  if (candidate.status !== 'approved') blockedReasons.push('Candidate must be approved before it can affect Day Core.');
  if (candidate.risk === 'sensitive') blockedReasons.push('Sensitive candidates are blocked from direct Day Core application.');
  if (candidate.risk === 'high') blockedReasons.push('High-risk candidates need manual review and cannot be applied directly.');
  if (!candidate.proposedDayId) blockedReasons.push('Candidate has no proposedDayId. Attach it to a day first.');
  if (candidate.proposedDayId && candidate.proposedDayId !== dayCore.dayId) blockedReasons.push('Candidate is attached to another day.');
  if (!supportedEntities.includes(candidate.entityType)) blockedReasons.push('Candidate entity type is not supported by v1.27 apply layer.');
  if (candidate.amount !== undefined && Number.isNaN(candidate.amount)) blockedReasons.push('Candidate amount is not a valid number.');

  const canApplyBase = blockedReasons.length === 0;
  const patches = canApplyBase ? buildPatches(candidate, dayCore) : [];
  if (canApplyBase && patches.length === 0) blockedReasons.push('No safe patch could be built for this candidate.');

  return {
    schemaVersion: 'day_core_apply_preview_v1_27',
    candidateId: candidate.id,
    dayId: candidate.proposedDayId,
    canApply: blockedReasons.length === 0 && patches.length > 0,
    blockedReasons,
    patches,
    safetyNotes
  };
}

export function applyCandidateToDayCore(
  candidate: ImportCandidate,
  dayCore: DayCoreInputModel,
  actor: 'user' | 'ai_assistant' | 'system' = 'user',
  now: string = new Date().toISOString()
): DayCoreApplyResult {
  const preview = buildDayCoreApplyPreview(candidate, dayCore);
  if (!preview.canApply) {
    return { preview, dayCore };
  }

  const nextDayCore = applyPatches(preview.patches, candidate, dayCore);
  const historyEvent: DayCoreApplyHistoryEvent = {
    id: `day-apply-${candidate.id}-${Math.abs(hashString(candidate.id + now))}`,
    schemaVersion: 'day_core_apply_history_v1_27',
    candidateId: candidate.id,
    dayId: candidate.proposedDayId ?? dayCore.dayId,
    createdAt: now,
    patches: preview.patches,
    auditNote: `Applied ${candidate.entityType} candidate to Day Core via v1.27 apply layer by ${actor}.`,
    rollbackReady: true,
    sensitiveDataIncluded: false
  };

  const auditEvent: ImportReviewAuditEvent = {
    id: `audit-${candidate.id}-apply_to_day_core-${Math.abs(hashString(candidate.id + now + 'apply'))}`,
    candidateId: candidate.id,
    action: 'create_audit_log_event',
    actor,
    createdAt: now,
    note: `Applied to Day Core with ${preview.patches.length} rollback-ready patch(es).`,
    beforeStatus: candidate.status,
    afterStatus: candidate.status,
    sensitiveDataIncluded: false
  };

  return { preview, dayCore: nextDayCore, historyEvent, auditEvent };
}

export function summarizeApplyPreview(preview: DayCoreApplyPreview): string {
  if (!preview.canApply) {
    return preview.blockedReasons[0] ?? 'Candidate cannot be applied.';
  }
  return `${preview.patches.length} patch(es) ready for Day Core.`;
}

function buildPatches(candidate: ImportCandidate, dayCore: DayCoreInputModel): DayCorePatch[] {
  const amount = candidate.amount ?? 0;
  const dayId = candidate.proposedDayId ?? dayCore.dayId;
  const patchId = (suffix: string) => `patch-${candidate.id}-${suffix}`;

  if (candidate.entityType === 'expense') {
    const isFuel = (candidate.proposedCategory ?? candidate.title).toLowerCase().includes('заправ')
      || (candidate.proposedCategory ?? candidate.title).toLowerCase().includes('топлив')
      || (candidate.proposedCategory ?? candidate.title).toLowerCase().includes('азс');

    if (isFuel) {
      return [{
        id: patchId('fuel-paid'),
        candidateId: candidate.id,
        dayId,
        entityType: candidate.entityType,
        operation: 'increment',
        targetPath: 'taxi.fuelAlreadyPaid',
        amountDelta: amount,
        description: `Mark ${amount} ₽ as already paid for fuel today.`,
        rollbackHint: `Subtract ${amount} from taxi.fuelAlreadyPaid.`
      }];
    }

    return [{
      id: patchId('task-expense'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'append',
      targetPath: 'tasks',
      amountDelta: amount,
      description: `Append reviewed expense task: ${candidate.title}.`,
      rollbackHint: `Remove task imported from candidate ${candidate.id}.`
    }];
  }

  if (candidate.entityType === 'income') {
    return [{
      id: patchId('gross-done'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'increment',
      targetPath: 'taxi.grossDone',
      amountDelta: amount,
      description: `Increase today gross done by reviewed income ${amount} ₽.`,
      rollbackHint: `Subtract ${amount} from taxi.grossDone.`
    }];
  }

  if (candidate.entityType === 'taxi_order') {
    return [
      {
        id: patchId('order-gross'),
        candidateId: candidate.id,
        dayId,
        entityType: candidate.entityType,
        operation: 'increment',
        targetPath: 'taxi.grossDone',
        amountDelta: amount,
        description: `Add reviewed taxi order gross ${amount} ₽.`,
        rollbackHint: `Subtract ${amount} from taxi.grossDone.`
      },
      {
        id: patchId('orders-count'),
        candidateId: candidate.id,
        dayId,
        entityType: candidate.entityType,
        operation: 'increment',
        targetPath: 'taxi.ordersDone',
        amountDelta: 1,
        description: 'Increment reviewed taxi orders count by 1.',
        rollbackHint: 'Subtract 1 from taxi.ordersDone.'
      }
    ];
  }

  if (candidate.entityType === 'taxi_shift') {
    return [{
      id: patchId('expected-gross'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'set',
      targetPath: 'taxi.expectedGrossByEvening',
      amountDelta: amount,
      description: `Set expected gross by evening to reviewed value ${amount} ₽.`,
      rollbackHint: `Restore previous taxi.expectedGrossByEvening value ${dayCore.taxi.expectedGrossByEvening} ₽.`
    }];
  }

  if (candidate.entityType === 'fund') {
    return [{
      id: patchId('fund-upsert'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'upsert',
      targetPath: 'funds',
      amountDelta: amount,
      description: `Upsert fund target/current context for ${candidate.title}.`,
      rollbackHint: `Remove or restore fund changes imported from candidate ${candidate.id}.`
    }];
  }

  if (candidate.entityType === 'obligation') {
    return [{
      id: patchId('obligation-upsert'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'upsert',
      targetPath: 'obligations',
      amountDelta: amount,
      description: `Upsert obligation ${candidate.title}.`,
      rollbackHint: `Remove or restore obligation changes imported from candidate ${candidate.id}.`
    }];
  }

  if (candidate.entityType === 'day_note') {
    return [{
      id: patchId('note'),
      candidateId: candidate.id,
      dayId,
      entityType: candidate.entityType,
      operation: 'note_only',
      targetPath: 'reviewNotes',
      description: `Append reviewed day note from candidate ${candidate.id}.`,
      rollbackHint: `Remove review note imported from candidate ${candidate.id}.`
    }];
  }

  return [];
}

function applyPatches(patches: DayCorePatch[], candidate: ImportCandidate, dayCore: DayCoreInputModel): DayCoreInputModel {
  let next: DayCoreInputModel = {
    ...dayCore,
    taxi: { ...dayCore.taxi },
    money: { ...dayCore.money },
    obligations: [...dayCore.obligations],
    funds: [...dayCore.funds],
    tasks: [...dayCore.tasks],
    reviewNotes: [...dayCore.reviewNotes]
  };

  for (const patch of patches) {
    if (patch.targetPath === 'taxi.fuelAlreadyPaid') {
      next = { ...next, taxi: { ...next.taxi, fuelAlreadyPaid: next.taxi.fuelAlreadyPaid + (patch.amountDelta ?? 0) } };
    }
    if (patch.targetPath === 'taxi.grossDone') {
      next = { ...next, taxi: { ...next.taxi, grossDone: next.taxi.grossDone + (patch.amountDelta ?? 0) } };
    }
    if (patch.targetPath === 'taxi.ordersDone') {
      next = { ...next, taxi: { ...next.taxi, ordersDone: next.taxi.ordersDone + (patch.amountDelta ?? 0) } };
    }
    if (patch.targetPath === 'taxi.expectedGrossByEvening') {
      next = { ...next, taxi: { ...next.taxi, expectedGrossByEvening: patch.amountDelta ?? next.taxi.expectedGrossByEvening } };
    }
    if (patch.targetPath === 'tasks') {
      const task: DayCoreTaskInput = {
        id: `imported-${candidate.id}`,
        title: candidate.title,
        type: 'admin',
        plannedToday: true,
        timeCostMinutes: 0,
        moneyCost: candidate.amount ?? 0,
        priority: 'normal'
      };
      next = { ...next, tasks: [...next.tasks, task] };
    }
    if (patch.targetPath === 'funds') {
      const existing = next.funds.find(item => item.title === candidate.title || item.id === candidate.id);
      const fund = {
        id: existing?.id ?? `imported-${candidate.id}`,
        title: existing?.title ?? candidate.title,
        targetAmount: candidate.amount ?? existing?.targetAmount ?? 0,
        currentAmount: existing?.currentAmount ?? 0,
        priority: existing?.priority ?? 'normal' as const,
        canReceiveToday: true
      };
      next = { ...next, funds: existing ? next.funds.map(item => item.id === existing.id ? fund : item) : [...next.funds, fund] };
    }
    if (patch.targetPath === 'obligations') {
      const existing = next.obligations.find(item => item.title === candidate.title || item.id === candidate.id);
      const obligation = {
        id: existing?.id ?? `imported-${candidate.id}`,
        title: existing?.title ?? candidate.title,
        amountDue: candidate.amount ?? existing?.amountDue ?? 0,
        dueDayOfMonth: existing?.dueDayOfMonth ?? 1,
        currentSaved: existing?.currentSaved ?? 0,
        priority: existing?.priority ?? 'critical' as const,
        source: existing?.source ?? 'import_review_queue' as const
      };
      next = { ...next, obligations: existing ? next.obligations.map(item => item.id === existing.id ? obligation : item) : [...next.obligations, obligation] };
    }
    if (patch.targetPath === 'reviewNotes') {
      next = { ...next, reviewNotes: [...next.reviewNotes, `Imported reviewed note from ${candidate.id}: ${candidate.title}`] };
    }
  }

  return { ...next, source: 'import_review_queue', status: 'review_needed' };
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash;
}
