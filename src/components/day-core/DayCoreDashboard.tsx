import { dayCoreMock, formatPercent, formatRub, getModeExplanation, getModeLabel, type MoneyBucket } from '@/lib/day-core/dayCoreModel';
import { dayCoreInputMock, type DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';

export function DayCoreDashboard(props: { dayInput?: DayCoreInputModel }) {
  const dayInput = props.dayInput ?? dayCoreInputMock;
  const net = calculateDayNet(dayInput);
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
  const day = {
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
  const progress = Math.min(100, Math.round((day.shift.grossDone / day.goals.targetGrossToday) * 100));

  return (
    <div className="grid">
      <section className="card card-hero">
        <div className="section-kicker">{day.statusLabel}</div>
        <h1 className="hero-number">{formatRub(day.shift.remainingGross)} осталось грязными</h1>
        <p className="card-description">
          Цель дня: {formatRub(day.goals.targetGrossToday)} • уже сделано: {formatRub(day.shift.grossDone)} • заказов: {day.shift.ordersDone}
        </p>
        <ProgressBar value={progress} />
        <div className="hero-mini-grid">
          <MiniMetric label="Режим" value={getModeLabel(day.mode)} />
          <MiniMetric label="Реально добить" value={`${formatRub(day.goals.realisticRemainingGrossMin)}–${formatRub(day.goals.realisticRemainingGrossMax)}`} />
          <MiniMetric label="Drivee" value={formatPercent(day.shift.driveeRate)} />
        </div>
      </section>

      <section className="card card-alert">
        <h2 className="card-heading">🧠 Решение сейчас</h2>
        <p className="card-description">{getModeExplanation(day.mode)}</p>
        <p className="card-description strong-note">{day.recommendation.message}</p>
      </section>

      <section className="card">
        <h2 className="card-heading">Сегодня: факт и прогноз</h2>
        <div className="stats-grid two">
          <StatBox label="Деньги сейчас" value={formatRub(day.currentMoney.freeNow)} period={`нал ${formatRub(day.currentMoney.cash)} • карта ${formatRub(day.currentMoney.card)}`} />
          <StatBox label="Прогноз к вечеру" value={formatRub(day.shift.expectedGrossByEvening)} period="грязными" />
          <StatBox label="Drivee уже" value={formatRub(day.shift.driveeAlreadyUsed)} period="оценка по заказам" />
          <StatBox label="Drivee день" value={formatRub(day.shift.driveeEstimatedFullDay)} period="если прогноз сбудется" />
        </div>
      </section>

      <section className="card">
        <h2 className="card-heading">❤️ Встречи</h2>
        <div className="fund-row">
          <div>
            <div className="fund-title">Фонд встреч</div>
            <div className="fund-subtitle">Средняя частота: {day.meetings.averagePerWeek} раз в неделю</div>
          </div>
          <div className="fund-value">{formatRub(day.meetings.fundCurrent)} / {formatRub(day.meetings.fundTarget)}</div>
        </div>
        <ProgressBar value={Math.round((day.meetings.fundCurrent / day.meetings.fundTarget) * 100)} />
        <p className="card-description">
          Сегодня встреча: {day.meetings.todayPlanned ? 'да' : 'нет'} • рекомендация заложить {formatRub(day.meetings.recommendation)}.
        </p>
      </section>

      <section className="card">
        <h2 className="card-heading">Куда заложить деньги</h2>
        <div className="allocation-list">
          {day.recommendation.buckets.map(bucket => <AllocationRow bucket={bucket} key={bucket.id} />)}
        </div>
      </section>

      <section className="card">
        <h2 className="card-heading">Что учтено в расчёте</h2>
        <div className="chip-grid">
          <span className="chip">Заказы сегодня: {day.shift.ordersDone}</span>
          <span className="chip">Актив: {day.shift.activeHours} ч</span>
          <span className="chip">Смена: {day.shift.fullShiftHours} ч</span>
          <span className="chip">Бензин: {formatRub(day.requiredToday.fuel)}</span>
          <span className="chip">Еда: {formatRub(day.requiredToday.food)}</span>
          <span className="chip">Банкротство: {formatRub(day.requiredToday.bankruptcy)}</span>
          <span className="chip">Продукты: перенести</span>
          <span className="chip">Подушка: не сегодня</span>
        </div>
      </section>
    </div>
  );
}

function ProgressBar(props: { value: number }) {
  return (
    <div className="progress-track" aria-label={`Прогресс ${props.value}%`}>
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, props.value))}%` }} />
    </div>
  );
}

function MiniMetric(props: { label: string; value: string }) {
  return (
    <div className="mini-metric">
      <span>{props.label}</span>
      <b>{props.value}</b>
    </div>
  );
}

function StatBox(props: { label: string; value: string; period: string }) {
  return (
    <div className="stat-box">
      <div className="stat-label">{props.label}</div>
      <div className="stat-value">{props.value}</div>
      <div className="stat-period">{props.period}</div>
    </div>
  );
}

function AllocationRow(props: { bucket: MoneyBucket }) {
  return (
    <article className={`allocation-row ${props.bucket.priority}`}>
      <div>
        <div className="allocation-title">{props.bucket.title}</div>
        <div className="allocation-note">{props.bucket.note}</div>
      </div>
      <div className="allocation-amount">{formatRub(props.bucket.amount)}</div>
    </article>
  );
}
