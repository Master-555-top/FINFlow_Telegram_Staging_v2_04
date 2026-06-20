import { defaultOilServicePlan, estimateFuelFromMileage } from '@/lib/car/carMaintenanceModel';
import { finflowCarReality } from '@/lib/project/finflowRealityContext';

export const DAILY_FUEL_BUDGET_MODEL_VERSION = 'daily_fuel_budget_model_v1_65' as const;

export type DailyFuelBudgetScenario = {
  id: string;
  title: string;
  km: number;
  litersLow: number;
  litersBase: number;
  litersHigh: number;
  costLowRub: number;
  costBaseRub: number;
  costHighRub: number;
  note: string;
};

export type DailyFuelBudgetReport = {
  version: typeof DAILY_FUEL_BUDGET_MODEL_VERSION;
  fuelPriceRubPerLiter: number;
  consumptionRangeLitersPer100Km: readonly [number, number];
  baseConsumptionLitersPer100Km: number;
  currentFreshAverageKmPerDay: number;
  scenarios: DailyFuelBudgetScenario[];
  recommendedWorkFuelReserveRub: number;
  recommendation: string;
};

export function buildDailyFuelBudgetReport(): DailyFuelBudgetReport {
  const fuelPriceRubPerLiter = finflowCarReality.fuelPriceRubPerLiter;
  const [lowConsumption, highConsumption] = finflowCarReality.consumptionLitersPer100KmRange;
  const baseConsumption = 12;
  const currentFreshAverageKmPerDay = calculateFreshAverageKmPerDay();

  const scenarioInputs = [
    {
      id: 'light',
      title: 'Лёгкий день',
      km: 80,
      note: 'Минимальная рабочая активность / короткие дела.'
    },
    {
      id: 'normal',
      title: 'Обычный день',
      km: 150,
      note: 'Ближе к твоей обычной рабочей зоне.'
    },
    {
      id: 'fresh_average',
      title: 'Свежий темп после замены',
      km: currentFreshAverageKmPerDay,
      note: 'Фактический короткий показатель 16–18.06.2026, не вечная норма.'
    },
    {
      id: 'heavy',
      title: 'Тяжёлый день',
      km: 220,
      note: 'Длинная смена / много поездок / высокий износ.'
    }
  ];

  const scenarios = scenarioInputs.map(scenario => {
    const low = estimateFuelFromMileage({
      km: scenario.km,
      litersPer100Km: lowConsumption,
      fuelPriceRubPerLiter
    });
    const base = estimateFuelFromMileage({
      km: scenario.km,
      litersPer100Km: baseConsumption,
      fuelPriceRubPerLiter
    });
    const high = estimateFuelFromMileage({
      km: scenario.km,
      litersPer100Km: highConsumption,
      fuelPriceRubPerLiter
    });

    return {
      id: scenario.id,
      title: scenario.title,
      km: scenario.km,
      litersLow: low.liters,
      litersBase: base.liters,
      litersHigh: high.liters,
      costLowRub: low.costRub,
      costBaseRub: base.costRub,
      costHighRub: high.costRub,
      note: scenario.note
    };
  });

  const freshScenario = scenarios.find(scenario => scenario.id === 'fresh_average');
  const recommendedWorkFuelReserveRub = freshScenario
    ? Math.ceil(freshScenario.costHighRub / 100) * 100
    : 1900;

  return {
    version: DAILY_FUEL_BUDGET_MODEL_VERSION,
    fuelPriceRubPerLiter,
    consumptionRangeLitersPer100Km: finflowCarReality.consumptionLitersPer100KmRange,
    baseConsumptionLitersPer100Km: baseConsumption,
    currentFreshAverageKmPerDay,
    scenarios,
    recommendedWorkFuelReserveRub,
    recommendation: `На свежем темпе после замены держи рабочий топливный резерв около ${recommendedWorkFuelReserveRub.toLocaleString('ru-RU')} ₽/день, пока не накопится больше дней пробега.`
  };
}

function calculateFreshAverageKmPerDay() {
  const km = defaultOilServicePlan.currentOdometerKm - defaultOilServicePlan.lastServiceOdometerKm;
  const start = new Date(`${defaultOilServicePlan.lastServiceDate}T00:00:00Z`).getTime();
  const end = new Date(`${defaultOilServicePlan.currentDate}T00:00:00Z`).getTime();
  const days = Math.max(1, Math.round((end - start) / 86_400_000));
  return km / days;
}

export function formatFuelRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

export function formatFuelLiters(value: number) {
  return `${value.toFixed(1)} л`;
}
