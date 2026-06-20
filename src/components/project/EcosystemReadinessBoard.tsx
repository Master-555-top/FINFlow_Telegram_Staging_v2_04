'use client';

import { useMemo, useState } from 'react';
import { buildEcosystemReadinessAudit } from '@/lib/project/ecosystemReadinessAudit';

export function EcosystemReadinessBoard() {
  const [expanded, setExpanded] = useState(false);
  const audit = useMemo(() => buildEcosystemReadinessAudit(), []);

  return (
    <section className="ecosystem-readiness-board">
      <div className="ecosystem-readiness-head">
        <span>v2.04 • Full audit / readiness board</span>
        <b>Готовность FINFlow mini app</b>
        <p>Единый экран: что уже готово, что ещё нужно доделать, и где риск перед полноценным запуском.</p>
      </div>

      <div className="ecosystem-readiness-grid">
        <div><span>Локально каждый день</span><b>{audit.previousLocalDailyUsePercent}% → {audit.localDailyUsePercent}%</b></div>
        <div><span>Safe launch</span><b>{audit.previousSafeLaunchPercent}% → {audit.safeLaunchPercent}%</b></div>
        <div><span>Production ecosystem</span><b>{audit.previousOverallProductionPercent}% → {audit.overallProductionPercent}%</b></div>
      </div>

      <div className="ecosystem-risk-list">
        {audit.topRisks.slice(0, expanded ? audit.topRisks.length : 2).map(risk => <p key={risk}>{risk}</p>)}
      </div>

      <button type="button" className="ecosystem-toggle" onClick={() => setExpanded(value => !value)}>
        {expanded ? 'свернуть аудит' : 'показать полный аудит'}
      </button>

      {expanded ? (
        <div className="ecosystem-area-list">
          {audit.areas.map(area => (
            <article className={`ecosystem-area ${area.status}`} key={area.id}>
              <div>
                <b>{area.title}</b>
                <span>{area.previousPercent}% → {area.percent}% • {area.status}</span>
              </div>
              <p>{area.summary}</p>
              <div className="ecosystem-area-columns">
                <div>
                  <strong>Готово</strong>
                  {area.done.map(item => <small key={item}>✓ {item}</small>)}
                </div>
                <div>
                  <strong>Осталось</strong>
                  {area.remaining.map(item => <small key={item}>→ {item}</small>)}
                </div>
              </div>
            </article>
          ))}

          <div className="ecosystem-next-actions">
            <b>Следующие действия</b>
            {audit.nextActions.map(action => <p key={action}>{action}</p>)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
