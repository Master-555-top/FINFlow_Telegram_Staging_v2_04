import { dayCoreInputMock, type DayCoreInputModel } from '@/lib/day-core/dayCoreInputModel';
import { calculateDayNet, type NetCalculationLine } from '@/lib/day-core/netCalculationModel';
import { formatPercent, formatRub } from '@/lib/day-core/dayCoreModel';

export function NetCalculationPanel(props: { dayInput?: DayCoreInputModel }) {
  const net = calculateDayNet(props.dayInput ?? dayCoreInputMock);
  const netProgress = Math.min(100, Math.round((net.netExpectedAfterWorkCosts / net.targetNet) * 100));
  const grossForNetProgress = Math.min(100, Math.round((net.grossDone / Math.max(1, net.grossNeededForTargetNet)) * 100));

  return (
    <section className={`card net-card ${net.mode}`}>
      <div className="section-kicker">v1.30 • чистые со смены</div>
      <h2 className="card-heading">Чистые со смены и свободные деньги</h2>
      <p className="card-description">
        Главный рабочий расчёт: грязный оборот минус Drivee/комиссия и бензин. Это твои «чистые со смены». Отдельно FinFlow показывает, сколько останется свободными после еды, встречи, обязательств и задач.
      </p>

      <div className="net-hero">
        <div>
          <div className="net-label">Прогноз чистыми со смены</div>
          <div className="net-value">{formatRub(net.netExpectedAfterWorkCosts)}</div>
          <div className="net-subtitle">цель рабочих чистых: {formatRub(net.targetNet)} • режим {net.mode}</div>
        </div>
        <div className="net-badge">
          {net.remainingNetToTarget > 0 ? `не хватает ${formatRub(net.remainingNetToTarget)}` : 'цель чистыми закрывается'}
        </div>
      </div>

      <div className="net-definition-box">
        <div><b>Чистые со смены</b><span>{net.cleanMoneyDefinition}</span></div>
        <div><b>Свободные деньги</b><span>{net.freeMoneyDefinition}</span></div>
      </div>

      <ProgressBar value={netProgress} />

      <div className="stats-grid two net-stats">
        <StatBox label="Сделано грязными" value={formatRub(net.grossDone)} period={`до цели грязными: ${formatRub(net.remainingGrossToTarget)}`} />
        <StatBox label="Грязными для рабочих чистых" value={formatRub(net.grossNeededForTargetNet)} period={`ещё примерно: ${formatRub(net.grossNeededFromNowForTargetNet)}`} />
        <StatBox label="Drivee прогноз" value={formatRub(net.driveeExpected)} period={formatPercent(net.driveeRate)} />
        <StatBox label="Бензин ещё нужен" value={formatRub(net.fuelStillNeeded)} period={`план: ${formatRub(net.fuelPlanned)} • уже: ${formatRub(net.fuelAlreadyPaid)}`} />
      </div>

      <div className="net-progress-note">
        <span>Прогресс к обороту, нужному именно для чистой цели</span>
        <b>{grossForNetProgress}%</b>
      </div>
      <ProgressBar value={grossForNetProgress} />

      <div className="net-lines">
        {net.lines.map(line => <NetLine line={line} key={line.id} />)}
      </div>

      {net.warnings.length > 0 ? (
        <div className="net-warnings">
          {net.warnings.map(warning => <div key={warning}>⚠️ {warning}</div>)}
        </div>
      ) : null}

      <p className="card-description strong-note">{net.recommendation}</p>
    </section>
  );
}

function ProgressBar(props: { value: number }) {
  return (
    <div className="progress-track" aria-label={`Прогресс ${props.value}%`}>
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, props.value))}%` }} />
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

function NetLine(props: { line: NetCalculationLine }) {
  return (
    <article className={`net-line ${props.line.kind}`}>
      <div>
        <div className="net-line-title">{props.line.required ? '🔒 ' : '• '}{props.line.title}</div>
        <div className="net-line-note">{props.line.note}</div>
      </div>
      <div className="net-line-amount">{formatRub(props.line.amount)}</div>
    </article>
  );
}
