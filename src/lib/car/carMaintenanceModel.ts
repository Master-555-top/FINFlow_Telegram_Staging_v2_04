export const CAR_MAINTENANCE_MODEL_VERSION = 'car_maintenance_model_v1_61' as const;

export type CarServiceEvent = {
  id: string;
  date: string;
  odometerKm: number;
  title: string;
  items: string[];
  notes?: string;
};

export type OilServicePlan = {
  lastServiceDate: string;
  lastServiceOdometerKm: number;
  currentDate: string;
  currentOdometerKm: number;
  oilChangeIntervalKm: number;
  reminderIntervalKm: number;
};

export type OilServiceStatus = {
  kmSinceService: number;
  kmUntilReminder: number;
  kmUntilChange: number;
  reminderOdometerKm: number;
  nextChangeOdometerKm: number;
  averageKmPerDaySinceService: number;
  estimatedDaysUntilReminder: number | null;
  estimatedDaysUntilChange: number | null;
  status: 'fresh' | 'watch' | 'reminder_due' | 'change_due';
  recommendation: string;
};

export const latestKnownCarService: CarServiceEvent = {
  id: 'service_2026_06_16_oil_spark_filters',
  date: '2026-06-16',
  odometerKm: 280041,
  title: 'Замена масла, свечей и фильтров',
  items: [
    'engine oil',
    'spark plugs',
    'oil filter',
    'air filter'
  ],
  notes: 'User will later specify current oil brand/spec. User plans oil change every 7,000 km, with reminders every 5,000 km.'
};

export const currentKnownOdometer = {
  date: '2026-06-18',
  odometerKm: 280420
} as const;

export const defaultOilServicePlan: OilServicePlan = {
  lastServiceDate: latestKnownCarService.date,
  lastServiceOdometerKm: latestKnownCarService.odometerKm,
  currentDate: currentKnownOdometer.date,
  currentOdometerKm: currentKnownOdometer.odometerKm,
  oilChangeIntervalKm: 7000,
  reminderIntervalKm: 5000
};

export function calculateOilServiceStatus(plan: OilServicePlan = defaultOilServicePlan): OilServiceStatus {
  const kmSinceService = Math.max(0, plan.currentOdometerKm - plan.lastServiceOdometerKm);
  const reminderOdometerKm = plan.lastServiceOdometerKm + plan.reminderIntervalKm;
  const nextChangeOdometerKm = plan.lastServiceOdometerKm + plan.oilChangeIntervalKm;
  const kmUntilReminder = reminderOdometerKm - plan.currentOdometerKm;
  const kmUntilChange = nextChangeOdometerKm - plan.currentOdometerKm;

  const daysSinceService = Math.max(1, daysBetween(plan.lastServiceDate, plan.currentDate));
  const averageKmPerDaySinceService = kmSinceService / daysSinceService;

  const estimatedDaysUntilReminder = averageKmPerDaySinceService > 0
    ? Math.max(0, Math.ceil(kmUntilReminder / averageKmPerDaySinceService))
    : null;

  const estimatedDaysUntilChange = averageKmPerDaySinceService > 0
    ? Math.max(0, Math.ceil(kmUntilChange / averageKmPerDaySinceService))
    : null;

  let status: OilServiceStatus['status'] = 'fresh';
  if (kmUntilChange <= 0) status = 'change_due';
  else if (kmUntilReminder <= 0) status = 'reminder_due';
  else if (kmSinceService >= plan.reminderIntervalKm * 0.7) status = 'watch';

  return {
    kmSinceService,
    kmUntilReminder,
    kmUntilChange,
    reminderOdometerKm,
    nextChangeOdometerKm,
    averageKmPerDaySinceService,
    estimatedDaysUntilReminder,
    estimatedDaysUntilChange,
    status,
    recommendation: buildOilRecommendation(status, kmUntilReminder, kmUntilChange)
  };
}

function buildOilRecommendation(status: OilServiceStatus['status'], kmUntilReminder: number, kmUntilChange: number) {
  if (status === 'change_due') return 'Замена масла уже по плану наступила. Нужно менять масло и фильтры.';
  if (status === 'reminder_due') return `Пора готовиться к замене: напоминание уже наступило, до плановой замены осталось ${Math.max(0, kmUntilChange)} км.`;
  if (status === 'watch') return `Скоро зона внимания: до напоминания осталось ${Math.max(0, kmUntilReminder)} км.`;
  return `Масло свежее. Следи за пробегом, уровнем масла и расходом топлива.`;
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export function estimateFuelFromMileage(input: {
  km: number;
  fuelPriceRubPerLiter?: number;
  litersPer100Km?: number;
}) {
  const fuelPriceRubPerLiter = input.fuelPriceRubPerLiter ?? 75.51;
  const litersPer100Km = input.litersPer100Km ?? 12;
  const liters = input.km * litersPer100Km / 100;
  return {
    km: input.km,
    litersPer100Km,
    fuelPriceRubPerLiter,
    liters,
    costRub: liters * fuelPriceRubPerLiter
  };
}
