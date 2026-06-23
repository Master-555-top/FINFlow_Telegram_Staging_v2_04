import { buildMiniAppDeliveryPlan } from '@/lib/project/miniAppDeliveryPlan';

export const ECOSYSTEM_READINESS_AUDIT_VERSION = 'ecosystem_readiness_audit_v2_60' as const;

export type EcosystemReadinessArea = {
  id: string;
  title: string;
  previousPercent: number;
  percent: number;
  status: 'done' | 'usable' | 'needs_real_test' | 'in_progress' | 'not_started';
  summary: string;
  done: string[];
  remaining: string[];
};

export type EcosystemReadinessAudit = {
  version: typeof ECOSYSTEM_READINESS_AUDIT_VERSION;
  previousOverallProductionPercent: number;
  overallProductionPercent: number;
  previousLocalDailyUsePercent: number;
  localDailyUsePercent: number;
  previousSafeLaunchPercent: number;
  safeLaunchPercent: number;
  areas: EcosystemReadinessArea[];
  topRisks: string[];
  nextActions: string[];
};

export function buildEcosystemReadinessAudit(): EcosystemReadinessAudit {
  const delivery = buildMiniAppDeliveryPlan();
  const areas: EcosystemReadinessArea[] = delivery.areas.map(area => ({
    id: area.id,
    title: area.title,
    previousPercent: area.previousPercent ?? area.percent,
    percent: area.percent,
    status: area.status === 'ready'
      ? 'done'
      : area.status === 'usable_local'
        ? 'usable'
        : area.status === 'blocked'
          ? 'needs_real_test'
          : area.status === 'planned'
            ? 'not_started'
            : 'in_progress',
    summary: area.summary,
    done: area.done,
    remaining: area.remaining
  }));

  return {
    version: ECOSYSTEM_READINESS_AUDIT_VERSION,
    previousOverallProductionPercent: 91,
    overallProductionPercent: delivery.overallStrongMiniAppPercent,
    previousLocalDailyUsePercent: 95,
    localDailyUsePercent: 95,
    previousSafeLaunchPercent: 94,
    safeLaunchPercent: 95,
    areas,
    topRisks: [
      `До сильного полностью рабочего mini app осталось примерно ${delivery.remainingPercent}%. Следующий риск — считать local-first слой готовым без реального Telegram phone acceptance, 2–3 дней данных, fresh backup, финальную проверку дизайна и screenshot bug log.`,
      'Исторические данные и daily apply нельзя заливать напрямую: нужен preview, dedupe, подтверждение, локальная запись и rollback.',
      'Supabase writes остаются safe-off до миграций, RLS/cross-user/security review, backup и conflict test.',
      'Автоматизации пока работают только как безопасная проверка; внешние вызовы остаются выключены до private staging/auth/redaction.'
    ],
    nextActions: delivery.criticalPath
  };
}
