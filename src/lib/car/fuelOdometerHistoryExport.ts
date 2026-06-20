import type { FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';

export const FUEL_ODOMETER_HISTORY_EXPORT_VERSION = 'fuel_odometer_history_export_v1_69' as const;

export function exportFuelOdometerHistoryAsJson(state: FuelOdometerHistoryState) {
  return JSON.stringify({
    schemaVersion: FUEL_ODOMETER_HISTORY_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    source: 'FINFlow fuel/odometer history',
    entries: state.entries
  }, null, 2);
}

export function exportFuelOdometerHistoryAsCsv(state: FuelOdometerHistoryState) {
  const headers = [
    'date',
    'previousOdometerKm',
    'currentOdometerKm',
    'kmDriven',
    'fuelPriceRubPerLiter',
    'consumptionLitersPer100Km',
    'litersNeeded',
    'fuelCostRub',
    'costPerKmRub',
    'note'
  ];

  const rows = state.entries.map(entry => [
    entry.date,
    entry.previousOdometerKm,
    entry.currentOdometerKm,
    entry.kmDriven,
    entry.fuelPriceRubPerLiter,
    entry.consumptionLitersPer100Km,
    entry.litersNeeded,
    entry.fuelCostRub,
    entry.costPerKmRub,
    entry.note ?? ''
  ]);

  return [headers, ...rows]
    .map(row => row.map(formatCsvCell).join(','))
    .join('\n');
}

function formatCsvCell(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
