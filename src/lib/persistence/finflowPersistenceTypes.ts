import type { DailyRecord, CustomDailyRecordTemplate } from '@/lib/day-core/dailyRecordsModel';
import type { DayCoreFundInput, DayCoreObligationInput } from '@/lib/day-core/dayCoreInputModel';
import type { BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';

export type FinflowPersistenceMode = 'local_storage' | 'supabase_draft';

export type FinflowPersistenceContext = {
  mode: FinflowPersistenceMode;
  profileId?: string;
  localDate: string;
};

export type FinflowPersistenceSnapshot = {
  records: DailyRecord[];
  templates: CustomDailyRecordTemplate[];
  funds: DayCoreFundInput[];
  obligations: DayCoreObligationInput[];
  bankDecisions: BankCandidateDecision[];
};

export type FinflowPersistenceAdapter = {
  mode: FinflowPersistenceMode;
  loadDay(context: FinflowPersistenceContext): Promise<Partial<FinflowPersistenceSnapshot>>;
  saveDay(context: FinflowPersistenceContext, snapshot: Partial<FinflowPersistenceSnapshot>): Promise<{ ok: boolean; warning?: string }>;
};

export const FINFLOW_PERSISTENCE_CONTRACT_VERSION = 'finflow_persistence_contract_v1_49' as const;
