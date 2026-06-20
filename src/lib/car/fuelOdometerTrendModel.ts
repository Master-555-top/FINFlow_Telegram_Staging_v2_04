import type { FuelOdometerHistoryState } from '@/lib/car/fuelOdometerHistoryModel';

export const FUEL_ODOMETER_TREND_MODEL_VERSION = 'fuel_odometer_trend_model_v1_70' as const;

export type FuelTrendSignal = {
  id: string;
  level: 'good' | 'watch' | 'warning' | 'info';
  title: string;
  message: string;
};

export type FuelTrendPoint = {
  label: string;
  kmDriven: number;
  fuelCostRub: number;
  costPerKmRub: number;
  barPercent: number;
};

export type FuelTrendReport = {
  version: typeof FUEL_ODOMETER_TREND_MODEL_VERSION;
  points: FuelTrendPoint[];
  signals: FuelTrendSignal[];
  latestCostPerKmRub: number;
  previousCostPerKmRub: number | null;
  latestKmDriven: number;
  averageCostPerKmRub: number;
  averageConsumptionLitersPer100Km: number;
  ready: boolean;
};

export function buildFuelOdometerTrendReport(state: FuelOdometerHistoryState): FuelTrendReport {
  const entries = [...state.entries].slice(0, 7).reverse();
  const maxFuelCost = Math.max(1, ...entries.map(entry => entry.fuelCostRub));

  const points = entries.map(entry => ({
    label: entry.date.slice(5),
    kmDriven: entry.kmDriven,
    fuelCostRub: entry.fuelCostRub,
    costPerKmRub: entry.costPerKmRub,
    barPercent: Math.max(3, Math.round(entry.fuelCostRub / maxFuelCost * 100))
  }));

  const latest = state.entries[0];
  const previous = state.entries[1];
  const totalKm = state.entries.reduce((sum, entry) => sum + entry.kmDriven, 0);
  const totalCost = state.entries.reduce((sum, entry) => sum + entry.fuelCostRub, 0);
  const totalLiters = state.entries.reduce((sum, entry) => sum + entry.litersNeeded, 0);
  const averageCostPerKmRub = totalKm > 0 ? totalCost / totalKm : 0;
  const averageConsumptionLitersPer100Km = totalKm > 0 ? totalLiters / totalKm * 100 : 0;

  return {
    version: FUEL_ODOMETER_TREND_MODEL_VERSION,
    points,
    signals: buildFuelTrendSignals(state),
    latestCostPerKmRub: latest?.costPerKmRub ?? 0,
    previousCostPerKmRub: previous?.costPerKmRub ?? null,
    latestKmDriven: latest?.kmDriven ?? 0,
    averageCostPerKmRub,
    averageConsumptionLitersPer100Km,
    ready: state.entries.length > 0
  };
}

function buildFuelTrendSignals(state: FuelOdometerHistoryState): FuelTrendSignal[] {
  if (state.entries.length === 0) {
    return [{
      id: 'no_history',
      level: 'info',
      title: 'Нет истории',
      message: 'Сохрани хотя бы одну запись пробега/бензина, чтобы появились тренды.'
    }];
  }

  const latest = state.entries[0];
  const previous = state.entries[1];
  const signals: FuelTrendSignal[] = [];

  if (latest.costPerKmRub >= 11) {
    signals.push({
      id: 'high_cost_per_km',
      level: 'warning',
      title: 'Дорогой километр',
      message: `Последняя стоимость км: ${latest.costPerKmRub.toFixed(1)} ₽/км. Проверь расход, пробки, стиль езды и реальную окупаемость смены.`
    });
  } else if (latest.costPerKmRub >= 9) {
    signals.push({
      id: 'watch_cost_per_km',
      level: 'watch',
      title: 'Стоимость км в зоне внимания',
      message: `Последняя стоимость км: ${latest.costPerKmRub.toFixed(1)} ₽/км. Для такси это нужно вычитать до свободных денег.`
    });
  } else {
    signals.push({
      id: 'cost_ok',
      level: 'good',
      title: 'Стоимость км умеренная',
      message: `Последняя стоимость км: ${latest.costPerKmRub.toFixed(1)} ₽/км. Продолжай копить историю для точности.`
    });
  }

  if (previous) {
    const diff = latest.costPerKmRub - previous.costPerKmRub;
    if (diff > 1) {
      signals.push({
        id: 'cost_rising',
        level: 'warning',
        title: 'Цена километра выросла',
        message: `Рост к прошлой записи: +${diff.toFixed(1)} ₽/км. Нужно проверить расход и маршрутность.`
      });
    } else if (diff < -1) {
      signals.push({
        id: 'cost_falling',
        level: 'good',
        title: 'Цена километра снизилась',
        message: `Снижение к прошлой записи: ${diff.toFixed(1)} ₽/км. Это хороший сигнал по издержкам.`
      });
    }
  }

  if (latest.kmDriven >= 220) {
    signals.push({
      id: 'heavy_mileage_day',
      level: 'watch',
      title: 'Большой пробег',
      message: `Последняя запись: ${Math.round(latest.kmDriven)} км. Учитывай износ, усталость, масло и подвеску.`
    });
  }

  return signals.slice(0, 4);
}
