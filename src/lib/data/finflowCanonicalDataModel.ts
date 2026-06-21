import type { FinflowDataKey } from '@/lib/data/finflowDataRegistry';

export const FINFLOW_CANONICAL_DATA_MODEL_VERSION = 'finflow_canonical_data_model_v2_37' as const;

export type FinflowCanonicalSection = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system';
export type FinflowCanonicalEntityKind =
  | 'day_session'
  | 'money_record'
  | 'work_shift'
  | 'taxi_order'
  | 'fuel_event'
  | 'fund'
  | 'obligation'
  | 'sleep_record'
  | 'task'
  | 'template'
  | 'ai_context'
  | 'import_batch'
  | 'sync_event'
  | 'automation_event';

export type FinflowCanonicalEntity = {
  kind: FinflowCanonicalEntityKind;
  section: FinflowCanonicalSection;
  label: string;
  localStatus: 'active' | 'partial' | 'planned';
  cloudTable: string;
  sourceKeys: string[];
  requiredForStrongMiniApp: boolean;
};

export type FinflowLegacyAdapter = {
  sourceKey: string;
  label: string;
  section: FinflowCanonicalSection;
  entityKinds: FinflowCanonicalEntityKind[];
  readMode: 'direct_json' | 'collection_json' | 'derived_snapshot' | 'legacy_raw';
  writeMode: 'active' | 'read_only_until_migration' | 'planned';
  keepKeyLocked?: boolean;
};

export const FINFLOW_CANONICAL_ENTITIES: FinflowCanonicalEntity[] = [
  { kind: 'day_session', section: 'day', label: 'День / активная сессия', localStatus: 'active', cloudTable: 'finflow_day_sessions', sourceKeys: ['finflow.dailyQuickInput.v1_47', 'finflow.activeDaySession.v2_01'], requiredForStrongMiniApp: true },
  { kind: 'money_record', section: 'money', label: 'Доходы и расходы', localStatus: 'active', cloudTable: 'finflow_money_records', sourceKeys: ['finflow.dailyRecords.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'work_shift', section: 'work', label: 'Рабочие смены', localStatus: 'partial', cloudTable: 'finflow_work_shifts', sourceKeys: ['finflow.dailyQuickInput.v1_47', 'finflow.dailyRecords.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'taxi_order', section: 'work', label: 'Заказы такси', localStatus: 'partial', cloudTable: 'finflow_taxi_orders', sourceKeys: ['finflow.dailyRecords.v1_47', 'finflow.importReviewQueue.v1_28'], requiredForStrongMiniApp: true },
  { kind: 'fuel_event', section: 'work', label: 'Топливо / пробег / машина', localStatus: 'active', cloudTable: 'finflow_fuel_events', sourceKeys: ['finflow.editableFuelInputs.v1_64', 'finflow.fuelOdometerHistory.v1_68'], requiredForStrongMiniApp: true },
  { kind: 'fund', section: 'funds', label: 'Фонды', localStatus: 'partial', cloudTable: 'finflow_funds', sourceKeys: ['finflow.dailyQuickInput.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'obligation', section: 'funds', label: 'Обязательства', localStatus: 'partial', cloudTable: 'finflow_obligations', sourceKeys: ['finflow.dailyQuickInput.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'sleep_record', section: 'sleep', label: 'Сон', localStatus: 'active', cloudTable: 'finflow_sleep_records', sourceKeys: ['finflow_sleep_records_v2_17', 'finflow_sleep_live_session_v2_17'], requiredForStrongMiniApp: true },
  { kind: 'task', section: 'day', label: 'Дела / ежедневник', localStatus: 'partial', cloudTable: 'finflow_tasks', sourceKeys: ['finflow.dailyQuickInput.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'template', section: 'system', label: 'Шаблоны', localStatus: 'partial', cloudTable: 'finflow_templates', sourceKeys: ['finflow.customRecordTemplates.v1_47'], requiredForStrongMiniApp: true },
  { kind: 'ai_context', section: 'ai', label: 'AI context / выводы', localStatus: 'planned', cloudTable: 'finflow_ai_context_events', sourceKeys: ['finflow.dailyHistory.v1_47', 'finflow_sleep_records_v2_17'], requiredForStrongMiniApp: false },
  { kind: 'import_batch', section: 'system', label: 'Исторические импорты', localStatus: 'partial', cloudTable: 'finflow_import_batches', sourceKeys: ['finflow.importReviewQueue.v1_28'], requiredForStrongMiniApp: true },
  { kind: 'sync_event', section: 'system', label: 'Sync/audit события', localStatus: 'partial', cloudTable: 'finflow_sync_events', sourceKeys: ['finflow.lastResetBackup.v2_28'], requiredForStrongMiniApp: true },
  { kind: 'automation_event', section: 'system', label: 'n8n automation события', localStatus: 'planned', cloudTable: 'finflow_automation_events', sourceKeys: ['finflow.n8nAutomationEvents.v2_32'], requiredForStrongMiniApp: false }
];

export const FINFLOW_LEGACY_ADAPTERS: FinflowLegacyAdapter[] = [
  { sourceKey: 'finflow.dailyQuickInput.v1_47', label: 'Day Core live state', section: 'day', entityKinds: ['day_session', 'work_shift', 'fund', 'obligation', 'task'], readMode: 'direct_json', writeMode: 'active' },
  { sourceKey: 'finflow.dailyRecords.v1_47', label: 'Daily records', section: 'money', entityKinds: ['money_record', 'taxi_order', 'fuel_event'], readMode: 'collection_json', writeMode: 'active' },
  { sourceKey: 'finflow.customRecordTemplates.v1_47', label: 'Record templates', section: 'system', entityKinds: ['template'], readMode: 'collection_json', writeMode: 'active' },
  { sourceKey: 'finflow_sleep_records_v2_17', label: 'Sleep records locked key', section: 'sleep', entityKinds: ['sleep_record'], readMode: 'collection_json', writeMode: 'active', keepKeyLocked: true },
  { sourceKey: 'finflow_sleep_live_session_v2_17', label: 'Sleep live session locked key', section: 'sleep', entityKinds: ['sleep_record'], readMode: 'direct_json', writeMode: 'active', keepKeyLocked: true },
  { sourceKey: 'finflow.dailyHistory.v1_47', label: 'Day snapshots legacy', section: 'day', entityKinds: ['day_session', 'ai_context'], readMode: 'derived_snapshot', writeMode: 'read_only_until_migration' },
  { sourceKey: 'finflow.fuelOdometerHistory.v1_68', label: 'Fuel odometer history', section: 'work', entityKinds: ['fuel_event'], readMode: 'collection_json', writeMode: 'active' },
  { sourceKey: 'finflow.importReviewQueue.v1_28', label: 'Import review queue', section: 'system', entityKinds: ['import_batch'], readMode: 'collection_json', writeMode: 'read_only_until_migration' }
];

export function buildCanonicalBackboneSummary(storageKeys: FinflowDataKey[]) {
  const registeredKeys = new Set(storageKeys.map(item => item.key));
  const entities = FINFLOW_CANONICAL_ENTITIES.map(entity => ({
    ...entity,
    registeredSourceKeys: entity.sourceKeys.filter(key => registeredKeys.has(key)),
    missingSourceKeys: entity.sourceKeys.filter(key => !registeredKeys.has(key))
  }));
  const activeCount = entities.filter(item => item.localStatus === 'active').length;
  const partialCount = entities.filter(item => item.localStatus === 'partial').length;
  const plannedCount = entities.filter(item => item.localStatus === 'planned').length;
  const strongRequired = entities.filter(item => item.requiredForStrongMiniApp);
  const strongReadyCount = strongRequired.filter(item => item.localStatus === 'active').length;
  const strongPartialCount = strongRequired.filter(item => item.localStatus === 'partial').length;
  const readiness = Math.round(((strongReadyCount + strongPartialCount * 0.55) / strongRequired.length) * 100);

  return {
    version: FINFLOW_CANONICAL_DATA_MODEL_VERSION,
    entities,
    adapters: FINFLOW_LEGACY_ADAPTERS,
    activeCount,
    partialCount,
    plannedCount,
    strongRequiredCount: strongRequired.length,
    readiness
  };
}
