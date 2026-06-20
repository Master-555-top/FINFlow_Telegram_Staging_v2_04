import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';

export const LOCAL_BACKUP_DIFF_MODEL_VERSION = 'local_backup_diff_model_v1_89' as const;

export type LocalBackupDiffSeverity = 'info' | 'watch' | 'warning';

export type LocalBackupDiffItem = {
  id: string;
  severity: LocalBackupDiffSeverity;
  title: string;
  currentValue: string;
  backupValue: string;
  message: string;
};

export type LocalBackupRestorePreview = {
  version: typeof LOCAL_BACKUP_DIFF_MODEL_VERSION;
  hasDifferences: boolean;
  items: LocalBackupDiffItem[];
  summary: {
    total: number;
    warnings: number;
    watches: number;
    infos: number;
  };
};

export function buildLocalBackupRestorePreview(input: {
  current: FinflowCloudDayDocument;
  backup: FinflowCloudDayDocument;
}): LocalBackupRestorePreview {
  const items: LocalBackupDiffItem[] = [];

  addDiff(items, {
    id: 'local_date',
    title: 'Дата дня',
    currentValue: input.current.dayInput.localDate,
    backupValue: input.backup.dayInput.localDate,
    severity: input.current.dayInput.localDate === input.backup.dayInput.localDate ? 'info' : 'warning',
    message: 'Restore заменит дату активного Day Core на дату из backup.'
  });

  addDiff(items, {
    id: 'money_cash',
    title: 'Наличные',
    currentValue: formatRub(input.current.dayInput.money.cash),
    backupValue: formatRub(input.backup.dayInput.money.cash),
    severity: 'watch',
    message: 'Restore заменит текущие деньги на значения из backup.'
  });

  addDiff(items, {
    id: 'money_card',
    title: 'Карта',
    currentValue: formatRub(input.current.dayInput.money.card),
    backupValue: formatRub(input.backup.dayInput.money.card),
    severity: 'watch',
    message: 'Restore заменит текущие деньги на значения из backup.'
  });

  addDiff(items, {
    id: 'gross_done',
    title: 'Грязный доход сейчас',
    currentValue: formatRub(input.current.dayInput.taxi.grossDone),
    backupValue: formatRub(input.backup.dayInput.taxi.grossDone),
    severity: 'watch',
    message: 'Restore изменит текущий прогресс по грязному доходу.'
  });

  addDiff(items, {
    id: 'orders_count',
    title: 'Количество заказов',
    currentValue: String(input.current.dayInput.taxi.ordersDone),
    backupValue: String(input.backup.dayInput.taxi.ordersDone),
    severity: 'watch',
    message: 'Restore изменит количество заказов в Day Core.'
  });

  addDiff(items, {
    id: 'records_count',
    title: 'Records',
    currentValue: String(input.current.records.length),
    backupValue: String(input.backup.records.length),
    severity: 'warning',
    message: 'Restore заменит список income/expense records.'
  });

  addDiff(items, {
    id: 'templates_count',
    title: 'Custom templates',
    currentValue: String(input.current.customTemplates.length),
    backupValue: String(input.backup.customTemplates.length),
    severity: 'info',
    message: 'Restore заменит пользовательские шаблоны записей.'
  });

  addDiff(items, {
    id: 'bank_decisions_count',
    title: 'Bank review decisions',
    currentValue: String(input.current.bankDecisions.length),
    backupValue: String(input.backup.bankDecisions.length),
    severity: 'warning',
    message: 'Restore заменит решения по банковским кандидатам.'
  });

  addDiff(items, {
    id: 'fuel_previous_odometer',
    title: 'Previous odometer',
    currentValue: formatNumber(input.current.fuelInputState.previousOdometerKm),
    backupValue: formatNumber(input.backup.fuelInputState.previousOdometerKm),
    severity: 'watch',
    message: 'Restore изменит исходный пробег.'
  });

  addDiff(items, {
    id: 'fuel_current_odometer',
    title: 'Current odometer',
    currentValue: formatNumber(input.current.fuelInputState.currentOdometerKm),
    backupValue: formatNumber(input.backup.fuelInputState.currentOdometerKm),
    severity: 'watch',
    message: 'Restore изменит текущий пробег.'
  });

  addDiff(items, {
    id: 'fuel_history_count',
    title: 'Fuel history entries',
    currentValue: String(input.current.fuelHistoryState.entries.length),
    backupValue: String(input.backup.fuelHistoryState.entries.length),
    severity: 'info',
    message: 'Restore заменит локальную историю топлива/одометра.'
  });

  const filtered = items.filter(item => item.currentValue !== item.backupValue);
  const warnings = filtered.filter(item => item.severity === 'warning').length;
  const watches = filtered.filter(item => item.severity === 'watch').length;
  const infos = filtered.filter(item => item.severity === 'info').length;

  return {
    version: LOCAL_BACKUP_DIFF_MODEL_VERSION,
    hasDifferences: filtered.length > 0,
    items: filtered,
    summary: {
      total: filtered.length,
      warnings,
      watches,
      infos
    }
  };
}

function addDiff(items: LocalBackupDiffItem[], item: LocalBackupDiffItem) {
  items.push(item);
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString('ru-RU');
}
