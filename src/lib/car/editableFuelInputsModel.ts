import { finflowCarReality } from '@/lib/project/finflowRealityContext';

export const EDITABLE_FUEL_INPUTS_MODEL_VERSION = 'editable_fuel_inputs_model_v1_66' as const;

export type EditableFuelInputState = {
  previousOdometerKm: number;
  currentOdometerKm: number;
  fuelPriceRubPerLiter: number;
  consumptionLitersPer100Km: number;
};

export type EditableFuelCalculation = {
  version: typeof EDITABLE_FUEL_INPUTS_MODEL_VERSION;
  kmDriven: number;
  litersNeeded: number;
  fuelCostRub: number;
  costPerKmRub: number;
  isValid: boolean;
  warning?: string;
  recommendation: string;
};

export function createDefaultEditableFuelInputState(): EditableFuelInputState {
  return {
    previousOdometerKm: finflowCarReality.lastOilServiceOdometerKm,
    currentOdometerKm: finflowCarReality.currentKnownOdometerKm,
    fuelPriceRubPerLiter: finflowCarReality.fuelPriceRubPerLiter,
    consumptionLitersPer100Km: 12
  };
}

export function calculateEditableFuelBudget(input: EditableFuelInputState): EditableFuelCalculation {
  const kmDriven = input.currentOdometerKm - input.previousOdometerKm;

  if (!Number.isFinite(kmDriven) || kmDriven < 0) {
    return {
      version: EDITABLE_FUEL_INPUTS_MODEL_VERSION,
      kmDriven,
      litersNeeded: 0,
      fuelCostRub: 0,
      costPerKmRub: 0,
      isValid: false,
      warning: 'Текущий пробег меньше предыдущего. Проверь ввод.',
      recommendation: 'Исправь пробег, чтобы FINFlow мог посчитать бензин.'
    };
  }

  if (input.fuelPriceRubPerLiter <= 0 || input.consumptionLitersPer100Km <= 0) {
    return {
      version: EDITABLE_FUEL_INPUTS_MODEL_VERSION,
      kmDriven,
      litersNeeded: 0,
      fuelCostRub: 0,
      costPerKmRub: 0,
      isValid: false,
      warning: 'Цена топлива или расход должны быть больше нуля.',
      recommendation: 'Проверь цену АИ-92 и расход л/100 км.'
    };
  }

  const litersNeeded = kmDriven * input.consumptionLitersPer100Km / 100;
  const fuelCostRub = litersNeeded * input.fuelPriceRubPerLiter;
  const costPerKmRub = kmDriven > 0 ? fuelCostRub / kmDriven : 0;

  return {
    version: EDITABLE_FUEL_INPUTS_MODEL_VERSION,
    kmDriven,
    litersNeeded,
    fuelCostRub,
    costPerKmRub,
    isValid: true,
    recommendation: buildFuelInputRecommendation(kmDriven, fuelCostRub)
  };
}

function buildFuelInputRecommendation(kmDriven: number, fuelCostRub: number) {
  if (kmDriven === 0) return 'Введи текущий пробег после смены/дня, чтобы увидеть реальный бензин.';
  if (fuelCostRub >= 2000) return 'Топливная нагрузка высокая. Проверь, окупилась ли смена по чистым после Drivee и бензина.';
  if (fuelCostRub >= 1500) return 'Топливная нагрузка рабочая для активного дня. Учитывай её до свободных денег.';
  return 'Топливная нагрузка умеренная. Всё равно вычитай бензин как рабочую издержку.';
}

export function parseFuelNumber(value: string, fallback: number) {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}
