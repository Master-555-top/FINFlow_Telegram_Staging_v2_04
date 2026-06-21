'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { APP_UI_VERSION } from '@/lib/appVersion';
import { dayCoreMock, formatPercent, formatRub, getModeLabel, type MoneyBucket } from '@/lib/day-core/dayCoreModel';
import { AllocationRow, FinanceTile, MetricTile, ProgressBar, ShiftBar } from '@/components/ui/CockpitCards';
import { dayCoreInputMock, type DayCoreInputModel, type DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import { buildMorningPlanner, type MorningPlannerSummary, type MorningWorkPlan } from '@/lib/day-core/morningPlanModel';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';
import {
  addMinutesToClock,
  analyzeSleepRecords,
  buildSleepStats,
  buildWakeDecision,
  formatSleepMinutes,
  getLocalTimeInput,
  getSleepStatus,
  isRecoveryWindowAllowed,
  seedSleepRecords,
  type LiveSleepSession,
  type SleepRecord,
  type SleepRecordAnalysis,
  type WakeDecisionOption
} from '@/lib/sleep/sleepModel';
import { readLiveSleepSessionFromLocalStorage, readSleepRecordsFromLocalStorage } from '@/lib/sleep/sleepStorage';

type DayView = 'plan' | 'shift' | 'tasks';

const DAY_UI_VERSION = APP_UI_VERSION;
const DAY_WAKE_OPTION_IDS: WakeDecisionOption['id'][] = ['now', 'plus30', 'plus60', 'plus90'];

export function DayCoreDashboard(props: { dayInput?: DayCoreInputModel }) {
  const dayInput = props.dayInput ?? dayCoreInputMock;
  const [activeView, setActiveView] = useState<DayView>('plan');
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>(seedSleepRecords);
  const [liveSession, setLiveSession] = useState<LiveSleepSession | null>(null);
  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    setSleepRecords(readSleepRecordsFromLocalStorage());
    setLiveSession(readLiveSleepSessionFromLocalStorage());

    const refreshFromStorage = () => {
      setSleepRecords(readSleepRecordsFromLocalStorage());
      setLiveSession(readLiveSleepSessionFromLocalStorage());
      setLiveNow(new Date());
    };

    window.addEventListener('storage', refreshFromStorage);
    window.addEventListener('focus', refreshFromStorage);
    const timer = window.setInterval(refreshFromStorage, 60_000);
    return () => {
      window.removeEventListener('storage', refreshFromStorage);
      window.removeEventListener('focus', refreshFromStorage);
      window.clearInterval(timer);
    };
  }, []);

  const net = calculateDayNet(dayInput);
  const sleepAnalyses = useMemo(() => analyzeSleepRecords(sleepRecords), [sleepRecords]);
  const sleepStats = useMemo(() => buildSleepStats(sleepRecords), [sleepRecords]);
  const lastSleep = sleepStats.lastAnalysis;
  const wakeDecision = useMemo(() => buildWakeDecision({
    session: liveSession,
    records: sleepRecords,
    now: liveNow,
    taxiShiftHours: dayInput.taxi.fullShiftHours,
    taxiActiveHours: dayInput.taxi.activeHours
  }), [liveSession, sleepRecords, liveNow, dayInput.taxi.fullShiftHours, dayInput.taxi.activeHours]);
  const dayWakeOptions = useMemo(
    () => wakeDecision?.options ?? buildDayWakeOptionsFromLastSleep(lastSleep, sleepRecords, liveNow, dayInput),
    [wakeDecision, lastSleep, sleepRecords, liveNow, dayInput]
  );
  const morningPlanner = useMemo(() => buildMorningPlanner({ dayInput, options: dayWakeOptions }), [dayInput, dayWakeOptions]);
  const selectedPlan = morningPlanner?.primary ?? null;
  const day = buildLiveDay(dayInput, net);
  const progress = Math.min(100, Math.round((day.shift.grossDone / Math.max(1, day.goals.targetGrossToday)) * 100));
  const activeTasks = dayInput.tasks.filter(task => task.plannedToday);
  const sleepStatus = liveSession && wakeDecision ? wakeDecision.status : lastSleep?.status ?? getSleepStatus(0, false);

  return (
    <section className="day-cockpit-v220 premium-screen">
      <div className="premium-screen-head day-cockpit-head">
        <div>
          <h1>День</h1>
          <small>сон → работа → деньги → дела</small>
        </div>
        <span>{DAY_UI_VERSION}</span>
      </div>

      <div className="premium-segmented day-cockpit-segmented" role="tablist" aria-label="День">
        {[
          ['plan', 'План'],
          ['shift', 'Смена'],
          ['tasks', 'Дела']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeView === id}
            className={activeView === id ? 'active' : ''}
            onClick={() => setActiveView(id as DayView)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className={`day-cockpit-hero tone-${sleepStatus.tone}`}>
        <div className="day-cockpit-orb" aria-hidden="true" />
        <div className="day-cockpit-hero-copy">
          <span>{liveSession ? 'Live sleep' : 'Сегодня'}</span>
          <h2>{selectedPlan?.headline ?? 'Собираю план дня'}</h2>
          <p>{selectedPlan?.recommendation ?? sleepStats.recommendation}</p>
        </div>
        <div className="day-cockpit-ring" style={{ '--day-progress': `${progress * 3.6}deg` } as CSSProperties}>
          <b>{progress}%</b>
          <small>план</small>
        </div>
      </section>

      <div className="day-quick-metrics">
        <MetricTile label="Сон" value={liveSession ? formatSleepMinutes(wakeDecision?.minutesAsleep ?? 0) : formatSleepMinutes(sleepStats.lastMinutes)} sub={sleepStatus.shortLabel} tone={sleepStatus.tone} />
        <MetricTile label="Старт" value={selectedPlan?.startTime ?? addMinutesToClock(getLocalTimeInput(liveNow), 60)} sub="после сборов" tone="blue" />
        <MetricTile label="Работа" value={selectedPlan ? `${selectedPlan.recommendedWorkHours.toFixed(1)}ч` : `${day.shift.fullShiftHours}ч`} sub={selectedPlan?.safetyLabel ?? getModeLabel(day.mode)} tone={selectedPlan?.safety === 'blocked' ? 'red' : selectedPlan?.safety === 'caution' ? 'orange' : 'green'} />
        <MetricTile label="Потенциал" value={formatRub(selectedPlan?.potentialGross ?? day.shift.remainingGross)} sub="грязными" tone="cyan" />
      </div>

      {morningPlanner ? <MorningPlannerCards summary={morningPlanner} /> : null}

      {activeView === 'plan' ? (
        <DayPlanView day={day} netRecommendation={net.recommendation} sleepStatsText={sleepStats.recommendation} selectedPlan={selectedPlan} />
      ) : null}

      {activeView === 'shift' ? (
        <DayShiftView day={day} selectedPlan={selectedPlan} />
      ) : null}

      {activeView === 'tasks' ? (
        <DayTasksView tasks={activeTasks} selectedPlan={selectedPlan} />
      ) : null}
    </section>
  );
}

function buildLiveDay(dayInput: DayCoreInputModel, net: ReturnType<typeof calculateDayNet>) {
  const foodCost = dayInput.tasks
    .filter(task => task.type === 'food' && task.plannedToday)
    .reduce((sum, task) => sum + task.moneyCost, 0);
  const meetingCost = dayInput.tasks
    .filter(task => task.type === 'meeting' && task.plannedToday)
    .reduce((sum, task) => sum + task.moneyCost, 0);
  const meetingFund = dayInput.funds.find(fund => fund.id === 'meetings');
  const liveBuckets: MoneyBucket[] = dayCoreMock.recommendation.buckets.map(bucket => {
    if (bucket.id === 'drivee') return { ...bucket, amount: net.driveeExpected };
    if (bucket.id === 'fuel') return { ...bucket, amount: dayInput.taxi.fuelPlanned };
    if (bucket.id === 'food') return { ...bucket, amount: foodCost };
    if (bucket.id === 'meeting') return { ...bucket, amount: meetingCost };
    return bucket;
  });

  return {
    ...dayCoreMock,
    statusLabel: 'Day Core • живой план дня',
    mode: net.mode,
    goals: {
      ...dayCoreMock.goals,
      targetGrossToday: dayInput.taxi.targetGrossToday,
      baselineDailyNet: dayInput.taxi.targetNetToday,
      realisticRemainingGrossMin: Math.max(0, net.remainingGrossToTarget - 2_000),
      realisticRemainingGrossMax: net.remainingGrossToTarget
    },
    currentMoney: {
      cash: dayInput.money.cash,
      card: dayInput.money.card,
      driveeBalance: dayInput.money.driveeBalance,
      freeNow: Math.max(0, dayInput.money.cash + dayInput.money.card - dayInput.money.reservedNotFree)
    },
    shift: {
      ordersDone: dayInput.taxi.ordersDone,
      grossDone: net.grossDone,
      activeHours: dayInput.taxi.activeHours,
      fullShiftHours: dayInput.taxi.fullShiftHours,
      remainingGross: net.remainingGrossToTarget,
      expectedGrossByEvening: dayInput.taxi.expectedGrossByEvening,
      driveeRate: dayInput.taxi.driveeRate,
      driveeEstimatedFullDay: net.driveeExpected,
      driveeAlreadyUsed: net.driveeDone
    },
    requiredToday: {
      ...dayCoreMock.requiredToday,
      fuel: dayInput.taxi.fuelPlanned,
      food: foodCost,
      meeting: meetingCost
    },
    meetings: {
      ...dayCoreMock.meetings,
      fundCurrent: meetingFund?.currentAmount ?? 0,
      fundTarget: meetingFund?.targetAmount ?? 0,
      todayPlanned: meetingCost > 0,
      recommendation: meetingCost
    },
    recommendation: {
      ...dayCoreMock.recommendation,
      message: net.recommendation,
      buckets: liveBuckets
    }
  };
}

function buildDayWakeOptionsFromLastSleep(
  lastSleep: SleepRecordAnalysis | null,
  sleepRecords: SleepRecord[],
  now: Date,
  dayInput: DayCoreInputModel
): WakeDecisionOption[] {
  const recoveryAllowed = isRecoveryWindowAllowed(sleepRecords);
  const baseMinutes = lastSleep?.record.minutes ?? 420;
  return [0, 30, 60, 90].map((extra, index) => {
    const projectedMinutes = baseMinutes + extra;
    const status = getSleepStatus(projectedMinutes, recoveryAllowed);
    const wakeTime = addMinutesToClock(getLocalTimeInput(now), extra);
    const projectedStartTime = addMinutesToClock(wakeTime, 60);
    const activeDayHours = Math.max(0, (24 * 60 - (now.getHours() * 60 + now.getMinutes() + extra + 60)) / 60);
    const workHoursEstimate = Math.max(0, Math.min(10, activeDayHours - 2, getWorkCap(status.id)));
    const canChoose = projectedMinutes <= 600 && !(projectedMinutes > 480 && !recoveryAllowed && extra > 0);
    return {
      id: DAY_WAKE_OPTION_IDS[index],
      label: index === 0 ? 'Сейчас' : `+${extra}м`,
      extraMinutes: extra,
      projectedMinutes,
      status,
      canChoose,
      headline: index === 0 ? 'План от текущего момента' : `Если отложить на ${extra}м`,
      sleepAdvice: status.recommendation,
      workAdvice: buildStaticWorkAdvice(status.id, workHoursEstimate),
      dayWindowAdvice: `Старт около ${projectedStartTime}; активного окна останется примерно ${activeDayHours.toFixed(1)}ч.`,
      workHoursEstimate,
      activeDayHours,
      projectedStartTime
    } satisfies WakeDecisionOption;
  });
}

function getWorkCap(statusId: string) {
  if (statusId === 'critical_short') return 2.5;
  if (statusId === 'low') return 4.5;
  if (statusId === 'overslept') return 4;
  if (statusId === 'recovery') return 6.5;
  if (statusId === 'long') return 5;
  return 8.5;
}

function buildStaticWorkAdvice(statusId: string, hours: number) {
  if (statusId === 'overslept') return 'Пересып: лучше мягкий день, короткая смена и ранний следующий сон.';
  if (statusId === 'critical_short') return 'Критический недосып: сильную смену не ставить.';
  if (statusId === 'low') return 'Недосып: работа только без ночного добивания.';
  if (hours >= 6) return 'Окно дня позволяет нормальный рабочий блок.';
  return 'Окно короткое: выбрать минимум дел и компактную смену.';
}

function MorningPlannerCards(props: { summary: MorningPlannerSummary }) {
  return (
    <section className="morning-bridge-card">
      <div className="day-card-title-row">
        <div>
          <span>Morning bridge</span>
          <b>Варианты подъёма</b>
        </div>
        <em>без баллов</em>
      </div>
      <div className="morning-options-grid">
        {props.summary.options.map(option => (
          <article className={`morning-option-card safety-${option.safety}`} key={option.optionId}>
            <span>{option.label}</span>
            <b>{formatRub(option.potentialGross)}</b>
            <small>{option.recommendedWorkHours.toFixed(1)}ч работы</small>
            <em>{option.safetyLabel}</em>
          </article>
        ))}
      </div>
      <p>{props.summary.note}</p>
    </section>
  );
}

function DayPlanView(props: {
  day: ReturnType<typeof buildLiveDay>;
  netRecommendation: string;
  sleepStatsText: string;
  selectedPlan: MorningWorkPlan | null;
}) {
  const meetingProgress = Math.round((props.day.meetings.fundCurrent / Math.max(1, props.day.meetings.fundTarget)) * 100);
  return (
    <div className="day-view-stack">
      <section className="day-decision-card">
        <span>Решение сейчас</span>
        <b>{props.selectedPlan?.safetyLabel ?? getModeLabel(props.day.mode)}</b>
        <p>{props.selectedPlan?.recommendation ?? props.netRecommendation}</p>
        <p>{props.sleepStatsText}</p>
      </section>

      <div className="day-money-grid">
        <FinanceTile label="Деньги сейчас" value={formatRub(props.day.currentMoney.freeNow)} sub={`нал ${formatRub(props.day.currentMoney.cash)} • карта ${formatRub(props.day.currentMoney.card)}`} />
        <FinanceTile label="Осталось" value={formatRub(props.day.shift.remainingGross)} sub="до gross-плана" />
        <FinanceTile label="Прогноз" value={formatRub(props.day.shift.expectedGrossByEvening)} sub="к вечеру" />
        <FinanceTile label="Drivee" value={formatRub(props.day.shift.driveeEstimatedFullDay)} sub={formatPercent(props.day.shift.driveeRate)} />
      </div>

      <section className="day-fund-card">
        <div className="day-card-title-row">
          <div>
            <span>Фонд встреч</span>
            <b>{formatRub(props.day.meetings.fundCurrent)} / {formatRub(props.day.meetings.fundTarget)}</b>
          </div>
          <em>{meetingProgress}%</em>
        </div>
        <ProgressBar value={meetingProgress} />
        <p>Сегодня встреча: {props.day.meetings.todayPlanned ? 'да' : 'нет'} • заложить {formatRub(props.day.meetings.recommendation)}.</p>
      </section>
    </div>
  );
}

function DayShiftView(props: { day: ReturnType<typeof buildLiveDay>; selectedPlan: MorningWorkPlan | null }) {
  return (
    <div className="day-view-stack">
      <section className="day-shift-card">
        <div className="day-card-title-row">
          <div>
            <span>Смена</span>
            <b>{props.day.shift.ordersDone} заказов • {formatRub(props.day.shift.grossDone)}</b>
          </div>
          <em>{props.day.shift.activeHours}ч актив</em>
        </div>
        <div className="day-shift-bars">
          <ShiftBar label="Gross" value={props.day.shift.grossDone} max={props.day.goals.targetGrossToday} />
          <ShiftBar label="Drivee" value={props.day.shift.driveeAlreadyUsed} max={props.day.shift.driveeEstimatedFullDay || 1} />
          <ShiftBar label="Топливо" value={props.day.requiredToday.fuel} max={props.day.goals.targetGrossToday} />
        </div>
      </section>

      <section className="day-decision-card compact">
        <span>Если стартовать по плану</span>
        <b>{props.selectedPlan?.startTime ?? '—'}</b>
        <p>{props.selectedPlan ? `Реалистично ${props.selectedPlan.recommendedWorkHours.toFixed(1)}ч работы и около ${formatRub(props.selectedPlan.potentialGross)} грязными.` : 'План появится после записи сна или live-сессии.'}</p>
      </section>

      <section className="card day-allocation-card">
        <h2 className="card-heading">Куда заложить деньги</h2>
        <div className="allocation-list">
          {props.day.recommendation.buckets.map(bucket => <AllocationRow bucket={bucket} key={bucket.id} />)}
        </div>
      </section>
    </div>
  );
}

function DayTasksView(props: { tasks: DayCoreTaskInput[]; selectedPlan: MorningWorkPlan | null }) {
  const fits = props.selectedPlan?.canFitTasks ?? props.tasks.map(task => ({ task, fits: true }));
  return (
    <div className="day-view-stack">
      <section className="day-task-summary-card">
        <span>Дела сегодня</span>
        <b>{props.tasks.length} задач</b>
        <p>{props.selectedPlan ? `Влезает примерно ${props.selectedPlan.taskMinutes} минут дел после сна и работы.` : 'Дела будут связаны с рабочим окном после выбора подъёма.'}</p>
      </section>
      <div className="day-task-list">
        {fits.map(item => (
          <article className={`day-task-row ${item.fits ? 'fits' : 'miss'}`} key={item.task.id}>
            <div>
              <b>{item.task.title}</b>
              <span>{item.task.timeCostMinutes}м • {formatRub(item.task.moneyCost)}</span>
            </div>
            <em>{item.fits ? 'влезает' : 'перенести'}</em>
          </article>
        ))}
      </div>
    </div>
  );
}
