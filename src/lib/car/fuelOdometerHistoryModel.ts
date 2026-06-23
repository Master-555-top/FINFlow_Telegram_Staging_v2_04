import type { EditableFuelCalculation, EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import { formatLocalIsoDate } from '@/lib/time/localDate';

export const FUEL_ODOMETER_HISTORY_VERSION = 'fuel_odometer_history_v1_68' as const;
export const FUEL_ODOMETER_HISTORY_STORAGE_KEY = 'finflow.fuelOdometerHistory.v1_68';

export type FuelOdometerHistoryEntry = {
  id: string;
  date: string;
  previousOdometerKm: number;
  currentOdometerKm: number;
  kmDriven: number;
  fuelPriceRubPerLiter: number;
  consumptionLitersPer100Km: number;
  litersNeeded: number;
  fuelCostRub: number;
  costPerKmRub: number;
  note?: string;
};

export type FuelOdometerHistoryState = {
  schemaVersion: typeof FUEL_ODOMETER_HISTORY_VERSION;
  entries: FuelOdometerHistoryEntry[];
};

export type FuelOdometerHistorySummary = {
  entriesCount: number;
  totalKm: number;
  totalLiters: number;
  totalFuelCostRub: number;
  averageCostPerKmRub: number;
  averageConsumptionLitersPer100Km: number;
};

export function createInitialFuelOdometerHistoryState(): FuelOdometerHistoryState {
  return {
    schemaVersion: FUEL_ODOMETER_HISTORY_VERSION,
    entries: []
  };
}

export function createFuelOdometerHistoryEntry(input: {
  state: EditableFuelInputState;
  calculation: EditableFuelCalculation;
  note?: string;
}): FuelOdometerHistoryEntry {
  return {
    id: `fuel_history_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    date: formatLocalIsoDate(),
    previousOdometerKm: input.state.previousOdometerKm,
    currentOdometerKm: input.state.currentOdometerKm,
    kmDriven: input.calculation.kmDriven,
    fuelPriceRubPerLiter: input.state.fuelPriceRubPerLiter,
    consumptionLitersPer100Km: input.state.consumptionLitersPer100Km,
    litersNeeded: input.calculation.litersNeeded,
    fuelCostRub: input.calculation.fuelCostRub,
    costPerKmRub: input.calculation.costPerKmRub,
    note: input.note
  };
}

export function addFuelOdometerHistoryEntry(
  state: FuelOdometerHistoryState,
  entry: FuelOdometerHistoryEntry
): FuelOdometerHistoryState {
  return {
    ...state,
    entries: [entry, ...state.entries].slice(0, 100)
  };
}

export function deleteFuelOdometerHistoryEntry(
  state: FuelOdometerHistoryState,
  entryId: string
): FuelOdometerHistoryState {
  return {
    ...state,
    entries: state.entries.filter(entry => entry.id !== entryId)
  };
}

export function summarizeFuelOdometerHistory(state: FuelOdometerHistoryState): FuelOdometerHistorySummary {
  const totalKm = state.entries.reduce((sum, entry) => sum + entry.kmDriven, 0);
  const totalLiters = state.entries.reduce((sum, entry) => sum + entry.litersNeeded, 0);
  const totalFuelCostRub = state.entries.reduce((sum, entry) => sum + entry.fuelCostRub, 0);

  return {
    entriesCount: state.entries.length,
    totalKm,
    totalLiters,
    totalFuelCostRub,
    averageCostPerKmRub: totalKm > 0 ? totalFuelCostRub / totalKm : 0,
    averageConsumptionLitersPer100Km: totalKm > 0 ? totalLiters / totalKm * 100 : 0
  };
}

export function parseFuelOdometerHistoryState(raw: string | null): FuelOdometerHistoryState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<FuelOdometerHistoryState>;

    if (!Array.isArray(parsed.entries)) return null;

    return {
      schemaVersion: FUEL_ODOMETER_HISTORY_VERSION,
      entries: parsed.entries
        .map(normalizeHistoryEntry)
        .filter((entry): entry is FuelOdometerHistoryEntry => Boolean(entry))
        .slice(0, 100)
    };
  } catch {
    return null;
  }
}

function normalizeHistoryEntry(entry: Partial<FuelOdometerHistoryEntry>): FuelOdometerHistoryEntry | null {
  if (!entry.id || !entry.date) return null;

  return {
    id: String(entry.id),
    date: String(entry.date),
    previousOdometerKm: safeNumber(entry.previousOdometerKm),
    currentOdometerKm: safeNumber(entry.currentOdometerKm),
    kmDriven: safeNumber(entry.kmDriven),
    fuelPriceRubPerLiter: safeNumber(entry.fuelPriceRubPerLiter),
    consumptionLitersPer100Km: safeNumber(entry.consumptionLitersPer100Km),
    litersNeeded: safeNumber(entry.litersNeeded),
    fuelCostRub: safeNumber(entry.fuelCostRub),
    costPerKmRub: safeNumber(entry.costPerKmRub),
    note: entry.note ? String(entry.note) : undefined
  };
}

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
