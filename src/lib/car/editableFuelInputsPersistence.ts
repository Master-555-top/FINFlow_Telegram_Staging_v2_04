import {
  createDefaultEditableFuelInputState,
  type EditableFuelInputState
} from '@/lib/car/editableFuelInputsModel';

export const EDITABLE_FUEL_INPUTS_STORAGE_VERSION = 'editable_fuel_inputs_storage_v1_67' as const;
export const EDITABLE_FUEL_INPUTS_STORAGE_KEY = 'finflow.editableFuelInputs.v1_67';

export type EditableFuelInputStoredState = {
  schemaVersion: typeof EDITABLE_FUEL_INPUTS_STORAGE_VERSION;
  updatedAt: string;
  state: EditableFuelInputState;
};

export function createEditableFuelInputStoredState(state: EditableFuelInputState): EditableFuelInputStoredState {
  return {
    schemaVersion: EDITABLE_FUEL_INPUTS_STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    state
  };
}

export function parseEditableFuelInputStoredState(raw: string | null): EditableFuelInputState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<EditableFuelInputStoredState>;

    if (!parsed?.state) return null;

    return normalizeEditableFuelInputState(parsed.state);
  } catch {
    return null;
  }
}

export function normalizeEditableFuelInputState(input: Partial<EditableFuelInputState>): EditableFuelInputState {
  const fallback = createDefaultEditableFuelInputState();

  return {
    previousOdometerKm: safeNumber(input.previousOdometerKm, fallback.previousOdometerKm),
    currentOdometerKm: safeNumber(input.currentOdometerKm, fallback.currentOdometerKm),
    fuelPriceRubPerLiter: safeNumber(input.fuelPriceRubPerLiter, fallback.fuelPriceRubPerLiter),
    consumptionLitersPer100Km: safeNumber(input.consumptionLitersPer100Km, fallback.consumptionLitersPer100Km)
  };
}

function safeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
