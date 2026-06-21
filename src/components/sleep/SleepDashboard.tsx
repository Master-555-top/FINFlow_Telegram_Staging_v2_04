'use client';

import { useMemo, useState } from 'react';

type SleepRecord = {
  id: string;
  label: string;
  start: string;
  end: string;
  minutes: number;
};

const SLEEP_RECORDS: SleepRecord[] = [
  { id: '2026-06-13', label: '12→13 июн', start: '5:10', end: '16:00', minutes: 650 },
  { id: '2026-06-14', label: '13→14 июн', start: '11:00', end: '15:00', minutes: 240 },
  { id: '2026-06-15', label: '14→15 июн', start: '4:30', end: '7:45', minutes: 195 },
  { id: '2026-06-16', label: '15→16 июн', start: '4:30', end: '14:00', minutes: 570 },
  { id: '2026-06-17', label: '16→17 июн', start: '5:00', end: '13:00', minutes: 480 },
  { id: '2026-06-18', label: '17→18 июн', start: '4:30', end: '8:30', minutes: 240 },
  { id: '2026-06-19', label: '18→19 июн', start: '5:00', end: '10:00', minutes: 300 },
  { id: '2026-06-20', label: '19→20 июн', start: '4:20', end: '14:20', minutes: 600 }
];

type SleepView = 'overview' | 'sleep' | 'history';

export function SleepDashboard() {
  const [activeView, setActiveView] = useState<SleepView>('sleep');
  const stats = useMemo(() => buildSleepStats(), []);

  return (
    <section className="sleep-screen premium-screen">
      <div className="premium-screen-head">
        <h1>{activeView === 'history' ? 'История сна' : 'Сон'}</h1>
        <span>v2.15</span>
      </div>

      <div className="premium-segmented" role="tablist" aria-label="Sleep tabs">
        {[
          ['overview', 'Обзор'],
          ['sleep', 'Сон'],
          ['history', 'История']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeView === id}
            className={activeView === id ? 'active' : ''}
            onClick={() => setActiveView(id as SleepView)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView !== 'history' ? (
        <>
          <div className="sleep-recommendation-card">
            <div className="sleep-moon" aria-hidden="true">☾</div>
            <div>
              <b>Рекомендация на ночь</b>
              <p>Старайся ложиться и вставать в одно и то же время. После сна меньше 5 часов не ставь сильный рабочий день.</p>
            </div>
          </div>

          <div className="sleep-stat-grid">
            <SleepStat icon="◴" label="Среднее" value={formatMinutes(stats.averageMinutes)} />
            <SleepStat icon="♕" label="Макс" value={formatMinutes(stats.maxMinutes)} />
            <SleepStat icon="✓" label="Норма" value={`${stats.normalDays}/8`} sub="дней ≥ 8ч" />
            <SleepStat icon="☾" label="Последний" value={formatMinutes(stats.lastMinutes)} />
          </div>

          <div className="sleep-chart-card">
            <div className="sleep-card-title">Сон за последние 8 дней</div>
            <div className="sleep-chart" aria-label="Sleep duration chart">
              {SLEEP_RECORDS.map(record => (
                <div className="sleep-bar-wrap" key={record.id}>
                  <span>{Math.round(record.minutes / 60)}ч</span>
                  <div className="sleep-bar-track">
                    <i style={{ height: `${Math.max(14, Math.min(100, (record.minutes / 720) * 100))}%` }} />
                  </div>
                  <small>{record.label.split('→')[1]}</small>
                </div>
              ))}
              <div className="sleep-target-line" />
            </div>
          </div>

          <div className="sleep-day-pills" aria-label="Sleep dates">
            {SLEEP_RECORDS.map(record => (
              <button key={record.id} type="button" className={record.id === '2026-06-20' ? 'active' : ''}>
                {record.label.split('→')[1]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="sleep-history-list">
          {SLEEP_RECORDS.map(record => (
            <article className="sleep-history-row" key={record.id}>
              <b>{record.label}</b>
              <span><small>Уснул</small>{record.start}</span>
              <span><small>Встал</small>{record.end}</span>
              <strong>☾ {formatMinutes(record.minutes)}</strong>
              <em className={sleepTag(record.minutes).className}>{sleepTag(record.minutes).label}</em>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SleepStat(props: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="sleep-stat-card">
      <i>{props.icon}</i>
      <span>{props.label}</span>
      <b>{props.value}</b>
      {props.sub ? <small>{props.sub}</small> : null}
    </div>
  );
}

function buildSleepStats() {
  const total = SLEEP_RECORDS.reduce((sum, record) => sum + record.minutes, 0);
  return {
    averageMinutes: Math.round(total / SLEEP_RECORDS.length),
    maxMinutes: Math.max(...SLEEP_RECORDS.map(record => record.minutes)),
    normalDays: SLEEP_RECORDS.filter(record => record.minutes >= 480).length,
    lastMinutes: SLEEP_RECORDS[SLEEP_RECORDS.length - 1]?.minutes ?? 0
  };
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}ч ${mins}м` : `${hours}ч`;
}

function sleepTag(minutes: number) {
  if (minutes < 300) return { label: 'Мало', className: 'low' };
  if (minutes < 420) return { label: 'Ниже', className: 'warn' };
  if (minutes <= 510) return { label: 'Норма', className: 'ok' };
  if (minutes <= 600) return { label: 'Восст.', className: 'ok' };
  return { label: 'Долгий', className: 'long' };
}
