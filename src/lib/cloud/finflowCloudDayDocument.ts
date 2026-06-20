import type { EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import type { FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';
import type { BankCandidateDecision } from '@/lib/day-core/bankCandidateReviewModel';
import type { DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import type { CustomDailyRecordTemplate, DailyRecord } from '@/lib/day-core/dailyRecordsModel';

export const FINFLOW_CLOUD_DAY_DOCUMENT_VERSION = 'finflow_cloud_day_v1_73' as const;

export type FinflowCloudDayDocument = {
  schemaVersion: typeof FINFLOW_CLOUD_DAY_DOCUMENT_VERSION;
  dayInput: DayCoreInputModel;
  records: DailyRecord[];
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  fuelInputState: EditableFuelInputState;
  fuelHistoryState: FuelOdometerHistoryState;
  updatedAt: string;
};

export function createFinflowCloudDayDocument(input: Omit<FinflowCloudDayDocument, 'schemaVersion' | 'updatedAt'>): FinflowCloudDayDocument {
  return {
    schemaVersion: FINFLOW_CLOUD_DAY_DOCUMENT_VERSION,
    ...input,
    updatedAt: new Date().toISOString()
  };
}

export function parseFinflowCloudDayDocument(value: unknown): FinflowCloudDayDocument | null {
  if (!isObject(value)) return null;
  if (value.schemaVersion !== FINFLOW_CLOUD_DAY_DOCUMENT_VERSION) return null;
  if (!isDayCoreInput(value.dayInput)) return null;
  if (!Array.isArray(value.records) || value.records.length > 2_000 || !value.records.every(isDailyRecord)) return null;
  if (!Array.isArray(value.customTemplates) || value.customTemplates.length > 200 || !value.customTemplates.every(isCustomTemplate)) return null;
  if (!Array.isArray(value.bankDecisions) || value.bankDecisions.length > 10_000 || !value.bankDecisions.every(isBankDecision)) return null;
  if (!isEditableFuelInput(value.fuelInputState)) return null;
  if (!isFuelHistoryState(value.fuelHistoryState)) return null;
  if (!isTimestamp(value.updatedAt)) return null;

  return value as FinflowCloudDayDocument;
}

function isDayCoreInput(value: unknown): value is DayCoreInputModel {
  if (!isObject(value)) return false;
  if (value.schemaVersion !== 'day_core_input_v1_24') return false;
  if (typeof value.dayId !== 'string' || value.dayId.length > 160) return false;
  if (!isLocalDate(value.localDate)) return false;
  if (!isShortString(value.localTime, 20)) return false;
  if (!['manual', 'import_review_queue', 'bank_statement', 'taxi_log', 'ai_suggestion', 'system_default'].includes(String(value.source))) return false;
  if (!['draft', 'review_needed', 'confirmed', 'rejected', 'archived'].includes(String(value.status))) return false;
  if (!isMoneyInput(value.money) || !isTaxiInput(value.taxi)) return false;
  if (!Array.isArray(value.obligations) || value.obligations.length > 500 || !value.obligations.every(isObligation)) return false;
  if (!Array.isArray(value.funds) || value.funds.length > 500 || !value.funds.every(isFund)) return false;
  if (!Array.isArray(value.tasks) || value.tasks.length > 2_000 || !value.tasks.every(isTask)) return false;
  if (!Array.isArray(value.reviewNotes) || value.reviewNotes.length > 500 || !value.reviewNotes.every(note => isShortString(note, 2_000))) return false;
  return true;
}

function isEditableFuelInput(value: unknown): value is EditableFuelInputState {
  if (!isObject(value)) return false;
  return ['previousOdometerKm', 'currentOdometerKm', 'fuelPriceRubPerLiter', 'consumptionLitersPer100Km']
    .every(key => typeof value[key] === 'number' && Number.isFinite(value[key]));
}

function isMoneyInput(value: unknown) {
  if (!isObject(value)) return false;
  return ['cash', 'card', 'driveeBalance', 'reservedNotFree'].every(key => isFiniteNumber(value[key]))
    && isShortString(value.note, 4_000);
}

function isTaxiInput(value: unknown) {
  if (!isObject(value)) return false;
  return [
    'ordersDone', 'grossDone', 'activeHours', 'fullShiftHours', 'expectedGrossByEvening',
    'targetGrossToday', 'targetNetToday', 'driveeRate', 'fuelPlanned', 'fuelAlreadyPaid',
    'distanceKmPlannedMin', 'distanceKmPlannedMax'
  ].every(key => isFiniteNumber(value[key]));
}

function isObligation(value: unknown) {
  if (!isObject(value)) return false;
  return isShortString(value.id, 200)
    && isShortString(value.title, 500)
    && ['amountDue', 'dueDayOfMonth', 'currentSaved'].every(key => isFiniteNumber(value[key]))
    && isPriority(value.priority)
    && ['manual', 'import_review_queue', 'bank_statement', 'taxi_log', 'ai_suggestion', 'system_default'].includes(String(value.source));
}

function isFund(value: unknown) {
  if (!isObject(value)) return false;
  return isShortString(value.id, 200)
    && isShortString(value.title, 500)
    && isFiniteNumber(value.targetAmount)
    && isFiniteNumber(value.currentAmount)
    && (value.deadline === undefined || isShortString(value.deadline, 40))
    && isPriority(value.priority)
    && typeof value.canReceiveToday === 'boolean';
}

function isTask(value: unknown) {
  if (!isObject(value)) return false;
  return isShortString(value.id, 200)
    && isShortString(value.title, 500)
    && ['work', 'food', 'sleep', 'meeting', 'car', 'admin', 'project', 'rest'].includes(String(value.type))
    && typeof value.plannedToday === 'boolean'
    && isFiniteNumber(value.timeCostMinutes)
    && isFiniteNumber(value.moneyCost)
    && isPriority(value.priority);
}

function isDailyRecord(value: unknown) {
  if (!isObject(value)) return false;
  return value.schemaVersion === 'daily_records_v1_47'
    && isShortString(value.id, 240)
    && isRecordType(value.type)
    && isShortString(value.title, 1_000)
    && isFiniteNumber(value.amount)
    && isShortString(value.category, 240)
    && isShortString(value.note, 4_000)
    && typeof value.enabled === 'boolean'
    && isTimestamp(value.createdAt)
    && ['quick_button', 'manual_record', 'derived_from_demo', 'import_review_queue'].includes(String(value.source))
    && value.sensitiveDataIncluded === false;
}

function isCustomTemplate(value: unknown) {
  if (!isObject(value)) return false;
  return isShortString(value.id, 240)
    && isShortString(value.label, 500)
    && isRecordType(value.type)
    && isShortString(value.category, 240)
    && isShortString(value.defaultTitle, 1_000)
    && isFiniteNumber(value.defaultAmount)
    && isPriority(value.priority)
    && value.isCustom === true
    && isTimestamp(value.createdAt);
}

function isBankDecision(value: unknown) {
  if (!isObject(value)) return false;
  return isShortString(value.transactionId, 240)
    && ['needs_review', 'approved', 'rejected', 'postponed'].includes(String(value.status))
    && isRecordType(value.recordType)
    && isShortString(value.recordTitle, 1_000)
    && isShortString(value.recordCategory, 240)
    && isFiniteNumber(value.amount)
    && isShortString(value.note, 4_000)
    && isTimestamp(value.decidedAt);
}

function isFuelHistoryState(value: unknown) {
  if (!isObject(value) || value.schemaVersion !== 'fuel_odometer_history_v1_68') return false;
  if (!Array.isArray(value.entries) || value.entries.length > 500) return false;
  return value.entries.every(entry => {
    if (!isObject(entry)) return false;
    return isShortString(entry.id, 240)
      && isLocalDate(entry.date)
      && [
        'previousOdometerKm', 'currentOdometerKm', 'kmDriven', 'fuelPriceRubPerLiter',
        'consumptionLitersPer100Km', 'litersNeeded', 'fuelCostRub', 'costPerKmRub'
      ].every(key => isFiniteNumber(entry[key]))
      && (entry.note === undefined || isShortString(entry.note, 2_000));
  });
}

function isRecordType(value: unknown) {
  return ['taxi_order', 'fuel', 'drivee_topup', 'expense', 'income'].includes(String(value));
}

function isPriority(value: unknown) {
  return ['critical', 'high', 'normal', 'flexible'].includes(String(value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 80 && !Number.isNaN(Date.parse(value));
}

function isLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
