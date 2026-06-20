import type { VerificationStage, VerificationStageId } from '@/lib/deployment/telegramSupabaseVerificationChecklist';

export const VERIFICATION_CHECKLIST_PROGRESS_VERSION = 'verification_checklist_progress_v1_83' as const;
export const VERIFICATION_CHECKLIST_PROGRESS_STORAGE_KEY = 'finflow.verificationChecklistProgress.v1_83';

export type VerificationStageUserStatus = 'not_started' | 'in_progress' | 'done' | 'blocked';

export type VerificationStageProgress = {
  stageId: VerificationStageId;
  status: VerificationStageUserStatus;
  note: string;
  updatedAt: string;
};

export type VerificationChecklistProgressState = {
  schemaVersion: typeof VERIFICATION_CHECKLIST_PROGRESS_VERSION;
  stages: VerificationStageProgress[];
  updatedAt: string;
};

export type VerificationChecklistProgressSummary = {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  percentDone: number;
  productionGateReady: boolean;
  nextManualStage: VerificationStage | null;
};

export function createInitialVerificationChecklistProgressState(now: string = new Date().toISOString()): VerificationChecklistProgressState {
  return {
    schemaVersion: VERIFICATION_CHECKLIST_PROGRESS_VERSION,
    stages: [],
    updatedAt: now
  };
}

export function parseVerificationChecklistProgressState(raw: string | null): VerificationChecklistProgressState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as VerificationChecklistProgressState;
    if (parsed.schemaVersion !== VERIFICATION_CHECKLIST_PROGRESS_VERSION) return null;
    if (!Array.isArray(parsed.stages)) return null;

    return {
      schemaVersion: VERIFICATION_CHECKLIST_PROGRESS_VERSION,
      stages: parsed.stages
        .filter(isProgressEntry)
        .map(entry => ({
          stageId: entry.stageId,
          status: entry.status,
          note: String(entry.note ?? '').slice(0, 500),
          updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString()
        })),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function setVerificationStageStatus(input: {
  state: VerificationChecklistProgressState;
  stageId: VerificationStageId;
  status: VerificationStageUserStatus;
  note?: string;
  now?: string;
}): VerificationChecklistProgressState {
  const now = input.now ?? new Date().toISOString();
  const existing = input.state.stages.find(stage => stage.stageId === input.stageId);
  const nextStage: VerificationStageProgress = {
    stageId: input.stageId,
    status: input.status,
    note: input.note ?? existing?.note ?? '',
    updatedAt: now
  };

  return {
    schemaVersion: VERIFICATION_CHECKLIST_PROGRESS_VERSION,
    stages: [
      ...input.state.stages.filter(stage => stage.stageId !== input.stageId),
      nextStage
    ],
    updatedAt: now
  };
}

export function setVerificationStageNote(input: {
  state: VerificationChecklistProgressState;
  stageId: VerificationStageId;
  note: string;
  now?: string;
}): VerificationChecklistProgressState {
  const currentStatus = getVerificationStageProgress(input.state, input.stageId)?.status ?? 'not_started';
  return setVerificationStageStatus({
    state: input.state,
    stageId: input.stageId,
    status: currentStatus,
    note: input.note.slice(0, 500),
    now: input.now
  });
}

export function resetVerificationChecklistProgress(now: string = new Date().toISOString()): VerificationChecklistProgressState {
  return createInitialVerificationChecklistProgressState(now);
}

export function getVerificationStageProgress(state: VerificationChecklistProgressState, stageId: VerificationStageId) {
  return state.stages.find(stage => stage.stageId === stageId) ?? null;
}

export function summarizeVerificationChecklistProgress(
  stages: VerificationStage[],
  state: VerificationChecklistProgressState
): VerificationChecklistProgressSummary {
  const statusByStage = new Map(state.stages.map(stage => [stage.stageId, stage.status]));
  const total = stages.length;
  const done = stages.filter(stage => statusByStage.get(stage.id) === 'done' || (!statusByStage.has(stage.id) && stage.status === 'done')).length;
  const inProgress = stages.filter(stage => statusByStage.get(stage.id) === 'in_progress').length;
  const blocked = stages.filter(stage => statusByStage.get(stage.id) === 'blocked' || (!statusByStage.has(stage.id) && stage.status === 'blocked')).length;
  const notStarted = Math.max(0, total - done - inProgress - blocked);
  const percentDone = total > 0 ? Math.round((done / total) * 100) : 0;
  const nextManualStage = stages.find(stage => {
    const status = statusByStage.get(stage.id) ?? defaultUserStatusFromStage(stage);
    return status !== 'done';
  }) ?? null;

  return {
    total,
    done,
    inProgress,
    blocked,
    notStarted,
    percentDone,
    productionGateReady: done >= total - 1,
    nextManualStage
  };
}

export function defaultUserStatusFromStage(stage: VerificationStage): VerificationStageUserStatus {
  if (stage.status === 'done') return 'done';
  if (stage.status === 'blocked') return 'blocked';
  return 'not_started';
}

function isProgressEntry(value: unknown): value is VerificationStageProgress {
  if (!value || typeof value !== 'object') return false;
  const entry = value as VerificationStageProgress;
  return typeof entry.stageId === 'string'
    && ['not_started', 'in_progress', 'done', 'blocked'].includes(entry.status);
}
