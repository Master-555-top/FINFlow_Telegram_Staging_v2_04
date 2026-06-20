import type { EditableFuelCalculation } from '@/lib/car/editableFuelInputsModel';
import type { NetCalculationResult } from '@/lib/day-core/netCalculationModel';

export const FUEL_NET_INTEGRATION_VERSION = 'fuel_net_integration_v1_71' as const;

export type FuelNetIntegrationReport = {
  version: typeof FUEL_NET_INTEGRATION_VERSION;
  plannedFuelRub: number;
  alreadyPaidFuelRub: number;
  currentFuelStillNeededRub: number;
  odometerFuelRub: number;
  fuelDeltaVsPlanRub: number;
  odometerFuelStillNeededRub: number;
  shiftCleanUsingOdometerFuelRub: number;
  freeMoneyUsingOdometerFuelRub: number;
  grossNeededForTargetNetUsingOdometerFuelRub: number;
  mode: 'ok' | 'watch' | 'warning';
  summary: string;
  warnings: string[];
};

export function buildFuelNetIntegrationReport(input: {
  net: NetCalculationResult;
  fuel: EditableFuelCalculation;
  plannedNonFuelDayCostsRub?: number;
}): FuelNetIntegrationReport {
  const plannedFuelRub = input.net.fuelPlanned;
  const alreadyPaidFuelRub = input.net.fuelAlreadyPaid;
  const currentFuelStillNeededRub = input.net.fuelStillNeeded;
  const odometerFuelRub = Math.max(0, Math.round(input.fuel.fuelCostRub));
  const fuelDeltaVsPlanRub = odometerFuelRub - plannedFuelRub;
  const odometerFuelStillNeededRub = Math.max(0, odometerFuelRub - alreadyPaidFuelRub);
  const shiftCleanUsingOdometerFuelRub = Math.max(0, input.net.netExpectedAfterDrivee - odometerFuelStillNeededRub);
  const plannedNonFuelDayCostsRub = input.plannedNonFuelDayCostsRub ?? Math.max(0, input.net.shiftCleanExpected - input.net.realFreeExpectedAfterDayPlan);
  const freeMoneyUsingOdometerFuelRub = Math.max(0, shiftCleanUsingOdometerFuelRub - plannedNonFuelDayCostsRub);
  const grossNeededForTargetNetUsingOdometerFuelRub = calculateGrossNeededForNetWithFuel(
    input.net.targetNet,
    input.net.driveeRate,
    odometerFuelRub
  );

  const warnings: string[] = [];
  if (!input.fuel.isValid) warnings.push(input.fuel.warning ?? 'Некорректный расчёт бензина по пробегу.');
  if (fuelDeltaVsPlanRub > 500) warnings.push(`Бензин по пробегу выше плана на ${formatRub(fuelDeltaVsPlanRub)}.`);
  if (shiftCleanUsingOdometerFuelRub < input.net.targetNet) warnings.push('С учётом бензина по пробегу чистая цель дня под риском.');
  if (odometerFuelRub >= 2000) warnings.push('Топливная издержка высокая — проверь окупаемость смены.');

  const mode: FuelNetIntegrationReport['mode'] = warnings.some(item => item.includes('выше плана') || item.includes('под риском'))
    ? 'warning'
    : warnings.length > 0
      ? 'watch'
      : 'ok';

  return {
    version: FUEL_NET_INTEGRATION_VERSION,
    plannedFuelRub,
    alreadyPaidFuelRub,
    currentFuelStillNeededRub,
    odometerFuelRub,
    fuelDeltaVsPlanRub,
    odometerFuelStillNeededRub,
    shiftCleanUsingOdometerFuelRub,
    freeMoneyUsingOdometerFuelRub,
    grossNeededForTargetNetUsingOdometerFuelRub,
    mode,
    summary: buildSummary(mode, fuelDeltaVsPlanRub, shiftCleanUsingOdometerFuelRub),
    warnings
  };
}

export function calculateGrossNeededForNetWithFuel(targetNet: number, driveeRate: number, fuelRub: number) {
  const safeRate = Math.min(0.5, Math.max(0, driveeRate));
  return Math.ceil((Math.max(0, targetNet) + Math.max(0, fuelRub)) / Math.max(0.01, 1 - safeRate));
}

function buildSummary(mode: FuelNetIntegrationReport['mode'], delta: number, clean: number) {
  if (mode === 'warning') {
    return `Бензин по пробегу меняет расчёт дня. Скорректированные чистые: ${formatRub(clean)}.`;
  }
  if (delta < -300) {
    return `По пробегу бензин ниже плана на ${formatRub(Math.abs(delta))}. Можно осторожно уточнить план, но лучше не занижать резерв.`;
  }
  return `Бензин по пробегу примерно совпадает с планом. Скорректированные чистые: ${formatRub(clean)}.`;
}

function formatRub(value: number) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}
