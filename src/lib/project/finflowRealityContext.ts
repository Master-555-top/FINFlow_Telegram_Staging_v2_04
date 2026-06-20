export const FINFLOW_REALITY_CONTEXT_VERSION = 'finflow_reality_context_v1_60' as const;

export const finflowCarReality = {
  car: 'Toyota Premio 2007',
  engine: '1.8L',
  fuelType: 'AI-92',
  fuelPriceRubPerLiter: 75.51,
  consumptionLitersPer100KmRange: [11, 13],
  typicalDailyKmRange: [80, 150],
  driveeRateApprox: 0.13,
  oilOverdueKm: 12000,
  desiredOilIntervalKmRange: [5000, 6000],
  cheapOilChangeRubRange: [6000, 7000],
  oilBurn: 'about 1 liter/week',
  repairFundTargetRub: 50000,
  lastOilServiceDate: '2026-06-16',
  lastOilServiceOdometerKm: 280041,
  currentKnownOdometerDate: '2026-06-18',
  currentKnownOdometerKm: 280420,
  kmSinceOilServiceAsOfCurrentKnownDate: 379,
  plannedOilChangeIntervalKm: 7000,
  oilReminderIntervalKm: 5000,
  nextOilReminderOdometerKm: 285041,
  nextOilChangeOdometerKm: 287041,
  lastServiceItems: ['engine oil', 'spark plugs', 'oil filter', 'air filter'],
  knownRepairNeeds: [
    'stabilizer links',
    'front brake pads',
    'rear struts',
    'possibly ball joints',
    'alignment',
    'ideally summer tires'
  ]
} as const;

export const finflowBankReality = {
  source: 'T-Bank statement',
  period: '01.12.2025–06.06.2026',
  pages: 105,
  candidateRows: 2766,
  expenseCandidates: 1631,
  incomeOrReplenishmentCandidates: 1135,
  status: 'review_candidates_only',
  rule: 'Do not blindly count replenishments/internal transfers as income.'
} as const;

export const finflowAiPartnerReality = {
  role: 'long_term_ai_partner_and_system_architect',
  mustConnect: [
    'money',
    'taxi work',
    'car maintenance',
    'learning',
    'projects',
    'habits',
    'relationships',
    'health',
    'security',
    'long-term transition away from taxi'
  ],
  mustPreserve: [
    'context',
    'protocols',
    'anti-regression',
    'security-first',
    'project memory',
    'transcript ledger'
  ]
} as const;

export function estimateFuelCostRub(km: number, litersPer100Km: number, fuelPriceRubPerLiter = finflowCarReality.fuelPriceRubPerLiter) {
  return (km * litersPer100Km / 100) * fuelPriceRubPerLiter;
}

export function estimateTaxiNetFromGross(input: {
  grossRub: number;
  km: number;
  litersPer100Km?: number;
  driveeRate?: number;
}) {
  const litersPer100Km = input.litersPer100Km ?? 12;
  const driveeRate = input.driveeRate ?? finflowCarReality.driveeRateApprox;
  const fuelRub = estimateFuelCostRub(input.km, litersPer100Km);
  const driveeRub = input.grossRub * driveeRate;

  return {
    grossRub: input.grossRub,
    km: input.km,
    litersPer100Km,
    fuelRub,
    driveeRub,
    netBeforePersonalPlanRub: input.grossRub - fuelRub - driveeRub
  };
}
